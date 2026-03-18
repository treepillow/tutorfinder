package com.esd.payment.service;

import com.esd.payment.config.AppConfig;
import com.esd.payment.model.Payment;
import com.esd.payment.repository.PaymentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.model.Transfer;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import com.stripe.param.TransferCreateParams;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${stripe.api.key:}")
    private String stripeApiKey;

    public PaymentService(PaymentRepository paymentRepository, RabbitTemplate rabbitTemplate) {
        this.paymentRepository = paymentRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    private boolean stripeEnabled() {
        return stripeApiKey != null && !stripeApiKey.isBlank();
    }

    /**
     * Create a Stripe PaymentIntent (deposit hold) and save a PENDING payment record.
     * Returns client_secret so the frontend can confirm the payment.
     */
    public Map<String, Object> createPaymentIntent(
            Integer bookingId, Integer tuteeId, Integer tutorId,
            BigDecimal amount, String currency) throws StripeException {

        // Idempotency: return existing if already created
        Optional<Payment> existing = paymentRepository.findByBookingId(bookingId);
        if (existing.isPresent()) {
            Payment p = existing.get();
            Map<String, Object> resp = new HashMap<>();
            resp.put("payment_id", p.getPaymentId());
            resp.put("stripe_payment_intent_id", p.getStripePaymentIntentId());
            resp.put("status", p.getStatus().name());
            resp.put("client_secret", null); // already created
            return resp;
        }

        Payment payment = new Payment();
        payment.setBookingId(bookingId);
        payment.setTuteeId(tuteeId);
        payment.setTutorId(tutorId);
        payment.setAmount(amount);
        payment.setTuteeCurrency(currency);
        payment.setStatus(Payment.PaymentStatus.PENDING);

        String intentId = null;
        String clientSecret = null;

        if (stripeEnabled()) {
            long amountCents = amount.multiply(BigDecimal.valueOf(100)).longValue();
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountCents)
                    .setCurrency(currency)
                    .setCaptureMethod(PaymentIntentCreateParams.CaptureMethod.MANUAL)
                    .putMetadata("booking_id", String.valueOf(bookingId))
                    .putMetadata("tutee_id", String.valueOf(tuteeId))
                    .putMetadata("tutor_id", String.valueOf(tutorId))
                    .build();
            PaymentIntent intent = PaymentIntent.create(params);
            intentId = intent.getId();
            clientSecret = intent.getClientSecret();
        } else {
            // Mock mode
            intentId = "mock_pi_" + bookingId + "_" + System.currentTimeMillis();
            clientSecret = "mock_secret_" + intentId;
            System.out.printf("[PAYMENT MOCK] Created PaymentIntent %s for booking %d%n", intentId, bookingId);
        }

        payment.setStripePaymentIntentId(intentId);
        paymentRepository.save(payment);

        Map<String, Object> resp = new HashMap<>();
        resp.put("payment_id", payment.getPaymentId());
        resp.put("stripe_payment_intent_id", intentId);
        resp.put("client_secret", clientSecret);
        resp.put("status", payment.getStatus().name());
        return resp;
    }

    /**
     * Capture a previously authorised PaymentIntent (funds now held).
     * Called by webhook or OutSystems after frontend confirms payment.
     */
    public Payment capturePayment(String stripePaymentIntentId,
                                  String tuteePhonenumber) throws StripeException {
        Payment payment = paymentRepository.findByStripePaymentIntentId(stripePaymentIntentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + stripePaymentIntentId));

        if (stripeEnabled()) {
            PaymentIntent intent = PaymentIntent.retrieve(stripePaymentIntentId);
            intent.capture();
        } else {
            System.out.printf("[PAYMENT MOCK] Captured %s%n", stripePaymentIntentId);
        }

        payment.setStatus(Payment.PaymentStatus.HELD);
        paymentRepository.save(payment);

        // Notify tutee that payment was received
        publishEvent("payment.success", Map.of(
                "booking_id",   payment.getBookingId(),
                "tutee_id",     payment.getTuteeId(),
                "tutee_phone",  tuteePhonenumber != null ? tuteePhonenumber : "",
                "amount",       payment.getAmount().toPlainString()
        ));

        return payment;
    }

    /**
     * Release deposit to tutor after lesson is completed.
     */
    public Payment releaseToTutor(Long paymentId,
                                   String tutorStripeAccountId,
                                   String tutorPhone) throws StripeException {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + paymentId));

        if (payment.getStatus() != Payment.PaymentStatus.HELD) {
            throw new IllegalStateException("Payment is not in HELD state: " + payment.getStatus());
        }

        String transferId;
        if (stripeEnabled() && tutorStripeAccountId != null && !tutorStripeAccountId.isBlank()) {
            long amountCents = payment.getAmount().multiply(BigDecimal.valueOf(100)).longValue();
            TransferCreateParams params = TransferCreateParams.builder()
                    .setAmount(amountCents)
                    .setCurrency(payment.getTuteeCurrency())
                    .setDestination(tutorStripeAccountId)
                    .putMetadata("booking_id", String.valueOf(payment.getBookingId()))
                    .build();
            Transfer transfer = Transfer.create(params);
            transferId = transfer.getId();
        } else {
            transferId = "mock_tr_" + paymentId + "_" + System.currentTimeMillis();
            System.out.printf("[PAYMENT MOCK] Released %s to tutor %d%n",
                    payment.getAmount(), payment.getTutorId());
        }

        payment.setStripeTransferId(transferId);
        payment.setStatus(Payment.PaymentStatus.RELEASED);
        paymentRepository.save(payment);

        publishEvent("deposit.released", Map.of(
                "booking_id",  payment.getBookingId(),
                "tutor_id",    payment.getTutorId(),
                "tutor_phone", tutorPhone != null ? tutorPhone : "",
                "amount",      payment.getAmount().toPlainString()
        ));

        return payment;
    }

    /**
     * Refund deposit back to tutee (e.g. tutor cancelled or dispute resolved).
     */
    public Payment refundToTutee(Long paymentId, String tuteePhone) throws StripeException {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + paymentId));

        if (payment.getStatus() != Payment.PaymentStatus.HELD) {
            throw new IllegalStateException("Payment is not in HELD state: " + payment.getStatus());
        }

        if (stripeEnabled()) {
            RefundCreateParams params = RefundCreateParams.builder()
                    .setPaymentIntent(payment.getStripePaymentIntentId())
                    .build();
            Refund.create(params);
        } else {
            System.out.printf("[PAYMENT MOCK] Refunded %s to tutee %d%n",
                    payment.getAmount(), payment.getTuteeId());
        }

        payment.setStatus(Payment.PaymentStatus.REFUNDED);
        paymentRepository.save(payment);

        publishEvent("deposit.refunded", Map.of(
                "booking_id",  payment.getBookingId(),
                "tutee_id",    payment.getTuteeId(),
                "tutee_phone", tuteePhone != null ? tuteePhone : "",
                "amount",      payment.getAmount().toPlainString()
        ));

        return payment;
    }

    public Optional<Payment> getByBookingId(Integer bookingId) {
        return paymentRepository.findByBookingId(bookingId);
    }

    public Optional<Payment> getById(Long paymentId) {
        return paymentRepository.findById(paymentId);
    }

    private void publishEvent(String routingKey, Map<String, Object> body) {
        try {
            String json = objectMapper.writeValueAsString(body);
            rabbitTemplate.convertAndSend(AppConfig.EXCHANGE, routingKey, json);
            System.out.printf("[PAYMENT] Published %s%n", routingKey);
        } catch (Exception e) {
            System.err.printf("[PAYMENT] RabbitMQ publish error (%s): %s%n", routingKey, e.getMessage());
        }
    }
}
