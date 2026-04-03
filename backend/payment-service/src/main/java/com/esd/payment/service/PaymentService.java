package com.esd.payment.service;

import com.esd.payment.config.AppConfig;
import com.esd.payment.model.Payment;
import com.esd.payment.repository.PaymentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.model.Transfer;
import com.stripe.model.checkout.Session;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import com.stripe.param.TransferCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.transaction.Transactional;
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

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

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
    @Transactional
    public Map<String, Object> createPaymentIntent(
            Integer bookingId, Integer tuteeId, Integer tutorId,
            BigDecimal amount, String currency) throws StripeException {

        // If an existing payment record exists, handle it
        Optional<Payment> existing = paymentRepository.findByBookingId(bookingId);
        if (existing.isPresent()) {
            Payment p = existing.get();
            String oldIntentId = p.getStripePaymentIntentId();

            // Try to reuse a valid Stripe intent
            if (stripeEnabled() && oldIntentId != null && !oldIntentId.startsWith("mock_")) {
                try {
                    PaymentIntent intent = PaymentIntent.retrieve(oldIntentId);
                    String status = intent.getStatus();
                    if ("requires_capture".equals(status) || "requires_confirmation".equals(status)
                            || "requires_action".equals(status)) {
                        Map<String, Object> resp = new HashMap<>();
                        resp.put("payment_id", p.getPaymentId());
                        resp.put("stripe_payment_intent_id", oldIntentId);
                        resp.put("status", p.getStatus().name());
                        resp.put("client_secret", intent.getClientSecret());
                        return resp;
                    }
                    // Cancel stuck intent on Stripe (best effort)
                    if ("requires_payment_method".equals(status)) {
                        try { intent.cancel(); } catch (Exception ignored) {}
                    }
                } catch (Exception ignored) {}
            }

            // Delete stale DB record and flush so the new insert won't conflict
            paymentRepository.deleteById(p.getPaymentId());
            paymentRepository.flush();
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
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build())
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
     * Create a Stripe Checkout Session that redirects the user to Stripe's hosted page.
     */
    @Transactional
    public Map<String, Object> createCheckoutSession(
            Integer bookingId, Integer tuteeId, Integer tutorId,
            BigDecimal amount, String currency) throws StripeException {

        // Clean up any existing payment record for this booking
        Optional<Payment> existing = paymentRepository.findByBookingId(bookingId);
        if (existing.isPresent()) {
            Payment p = existing.get();
            // Cancel old Stripe intent if possible
            if (stripeEnabled() && p.getStripePaymentIntentId() != null
                    && !p.getStripePaymentIntentId().startsWith("mock_")) {
                try {
                    PaymentIntent intent = PaymentIntent.retrieve(p.getStripePaymentIntentId());
                    if ("requires_payment_method".equals(intent.getStatus())) {
                        intent.cancel();
                    }
                } catch (Exception ignored) {}
            }
            paymentRepository.deleteById(p.getPaymentId());
            paymentRepository.flush();
        }

        if (!stripeEnabled()) {
            // Mock mode — return mock data
            String mockId = "mock_pi_" + bookingId + "_" + System.currentTimeMillis();
            Payment payment = new Payment();
            payment.setBookingId(bookingId);
            payment.setTuteeId(tuteeId);
            payment.setTutorId(tutorId);
            payment.setAmount(amount);
            payment.setTuteeCurrency(currency);
            payment.setStatus(Payment.PaymentStatus.PENDING);
            payment.setStripePaymentIntentId(mockId);
            paymentRepository.save(payment);

            Map<String, Object> resp = new HashMap<>();
            resp.put("payment_id", payment.getPaymentId());
            resp.put("stripe_payment_intent_id", mockId);
            resp.put("checkout_url", null);
            resp.put("mock", true);
            return resp;
        }

        long amountCents = amount.multiply(BigDecimal.valueOf(100)).longValue();
        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setPaymentIntentData(
                        SessionCreateParams.PaymentIntentData.builder()
                                .setCaptureMethod(SessionCreateParams.PaymentIntentData.CaptureMethod.MANUAL)
                                .putMetadata("booking_id", String.valueOf(bookingId))
                                .putMetadata("tutee_id", String.valueOf(tuteeId))
                                .putMetadata("tutor_id", String.valueOf(tutorId))
                                .build())
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency(currency)
                                .setUnitAmount(amountCents)
                                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName("Tutoring Lesson (Booking #" + bookingId + ")")
                                        .build())
                                .build())
                        .build())
                .setSuccessUrl(frontendUrl + "/app/requests?payment=success&booking_id=" + bookingId)
                .setCancelUrl(frontendUrl + "/app/requests?payment=cancelled")
                .build();

        Session session = Session.create(params);

        // Save payment record — PaymentIntent ID is null until customer pays
        Payment payment = new Payment();
        payment.setBookingId(bookingId);
        payment.setTuteeId(tuteeId);
        payment.setTutorId(tutorId);
        payment.setAmount(amount);
        payment.setTuteeCurrency(currency);
        payment.setStatus(Payment.PaymentStatus.PENDING);
        payment.setStripeSessionId(session.getId());
        paymentRepository.save(payment);

        Map<String, Object> resp = new HashMap<>();
        resp.put("payment_id", payment.getPaymentId());
        resp.put("checkout_url", session.getUrl());
        resp.put("session_id", session.getId());
        return resp;
    }

    /**
     * Complete a Checkout Session: retrieve the PaymentIntent, capture it, update DB.
     * Called by the frontend after Stripe redirects back on success.
     */
    public Payment completeCheckout(Integer bookingId) throws StripeException {
        try {
            System.out.printf("[PAYMENT] completeCheckout called for booking %d%n", bookingId);

            // Get payment record (without transaction)
            Payment payment = paymentRepository.findByBookingId(bookingId)
                    .orElseThrow(() -> new IllegalArgumentException("Payment not found for booking: " + bookingId));
            System.out.printf("[PAYMENT] Found payment record: %s%n", payment.getPaymentId());

            if (payment.getStatus() != Payment.PaymentStatus.PENDING) {
                System.out.printf("[PAYMENT] Payment already completed, status: %s%n", payment.getStatus());
                return payment;
            }

            String sessionId = payment.getStripeSessionId();
            System.out.printf("[PAYMENT] Session ID: %s%n", sessionId);
            if (sessionId == null || sessionId.isBlank()) {
                throw new IllegalStateException("No checkout session for this payment");
            }

            String intentId = null;
            if (stripeEnabled()) {
                System.out.printf("[PAYMENT] Retrieving Stripe session: %s%n", sessionId);
                Session session = Session.retrieve(sessionId);
                intentId = session.getPaymentIntent();
                System.out.printf("[PAYMENT] Payment Intent ID from session: %s%n", intentId);
                if (intentId == null) {
                    throw new IllegalStateException("Checkout session has no PaymentIntent — payment may not be complete");
                }

                // Capture the payment (manual capture mode)
                System.out.printf("[PAYMENT] Retrieving PaymentIntent: %s%n", intentId);
                PaymentIntent intent = PaymentIntent.retrieve(intentId);
                System.out.printf("[PAYMENT] PaymentIntent status: %s%n", intent.getStatus());
                if ("requires_capture".equals(intent.getStatus())) {
                    System.out.printf("[PAYMENT] Capturing PaymentIntent: %s%n", intentId);
                    intent.capture();
                }
            } else {
                System.out.printf("[PAYMENT MOCK] Mock mode for booking %d%n", bookingId);
                intentId = "mock_pi_" + bookingId;
            }

            // Now save to database in a separate transaction
            return savePaymentAsHeld(payment.getPaymentId(), intentId);
        } catch (Exception e) {
            System.err.printf("[PAYMENT] Error in completeCheckout: %s%n", e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Save payment as HELD status in a separate transaction.
     */
    @Transactional
    private Payment savePaymentAsHeld(Long paymentId, String intentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + paymentId));
        payment.setStripePaymentIntentId(intentId);
        payment.setStatus(Payment.PaymentStatus.HELD);
        paymentRepository.save(payment);
        System.out.printf("[PAYMENT] Payment %d updated to HELD status%n", paymentId);
        return payment;
    }

    /**
     * Capture a previously authorised PaymentIntent (funds now held).
     * Called by webhook or OutSystems after frontend confirms payment.
     */
    public Payment capturePayment(String stripePaymentIntentId,
                                  String tuteeEmail) throws StripeException {
        try {
            System.out.printf("[PAYMENT] capturePayment called with intentId=%s%n", stripePaymentIntentId);
            Payment payment = paymentRepository.findByStripePaymentIntentId(stripePaymentIntentId)
                    .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + stripePaymentIntentId));
            System.out.printf("[PAYMENT] Found payment: %d%n", payment.getPaymentId());

            if (stripeEnabled()) {
                System.out.printf("[PAYMENT] Retrieving intent to capture: %s%n", stripePaymentIntentId);
                PaymentIntent intent = PaymentIntent.retrieve(stripePaymentIntentId);
                System.out.printf("[PAYMENT] Intent status: %s%n", intent.getStatus());
                intent.capture();
                System.out.printf("[PAYMENT] Intent captured%n");
            } else {
                System.out.printf("[PAYMENT MOCK] Captured %s%n", stripePaymentIntentId);
            }

            payment.setStatus(Payment.PaymentStatus.HELD);
            paymentRepository.save(payment);
            System.out.printf("[PAYMENT] Payment status set to HELD%n");

            // Notify tutee that payment was received
            publishEvent("payment.success", Map.of(
                    "booking_id",  payment.getBookingId(),
                    "tutee_id",    payment.getTuteeId(),
                    "tutee_email", tuteeEmail != null ? tuteeEmail : "",
                    "amount",      payment.getAmount().toPlainString()
            ));
            System.out.printf("[PAYMENT] Published payment.success event%n");

            return payment;
        } catch (Exception e) {
            System.err.printf("[PAYMENT] Error in capturePayment: %s%n", e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Release deposit to tutor after lesson is completed.
     */
    public Payment releaseToTutor(Long paymentId,
                                   String tutorStripeAccountId,
                                   String tutorEmail) throws StripeException {
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
                "tutor_email", tutorEmail != null ? tutorEmail : "",
                "amount",      payment.getAmount().toPlainString()
        ));

        return payment;
    }

    /**
     * Refund deposit back to tutee (e.g. tutor cancelled or dispute resolved).
     */
    public Payment refundToTutee(Long paymentId, String tuteeEmail) throws StripeException {
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
                "tutee_email", tuteeEmail != null ? tuteeEmail : "",
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
