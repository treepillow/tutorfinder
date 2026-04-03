package com.esd.payment.controller;

import com.esd.payment.model.Payment;
import com.esd.payment.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "healthy", "service", "payment-service"));
    }

    /**
     * POST /payment/create-intent
     * Called by OutSystems Booking Process after tutor confirms booking.
     * Body: { booking_id, tutee_id, tutor_id, amount, currency? }
     */
    @PostMapping("/payment/create-intent")
    public ResponseEntity<?> createIntent(@RequestBody Map<String, Object> body) {
        try {
            Integer bookingId = intVal(body, "booking_id");
            Integer tuteeId   = intVal(body, "tutee_id");
            Integer tutorId   = intVal(body, "tutor_id");
            BigDecimal amount = new BigDecimal(body.get("amount").toString());
            String currency   = body.getOrDefault("currency", "sgd").toString();

            if (bookingId == null || tuteeId == null || tutorId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "booking_id, tutee_id, tutor_id are required"));
            }

            Map<String, Object> result = paymentService.createPaymentIntent(
                    bookingId, tuteeId, tutorId, amount, currency);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /payment/checkout
     * Creates a Stripe Checkout Session and returns the redirect URL.
     * Body: { booking_id, tutee_id, tutor_id, amount, currency? }
     */
    @PostMapping("/payment/checkout")
    public ResponseEntity<?> checkout(@RequestBody Map<String, Object> body) {
        try {
            Integer bookingId = intVal(body, "booking_id");
            Integer tuteeId   = intVal(body, "tutee_id");
            Integer tutorId   = intVal(body, "tutor_id");
            BigDecimal amount = new BigDecimal(body.get("amount").toString());
            String currency   = body.getOrDefault("currency", "sgd").toString();

            if (bookingId == null || tuteeId == null || tutorId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "booking_id, tutee_id, tutor_id are required"));
            }

            Map<String, Object> result = paymentService.createCheckoutSession(
                    bookingId, tuteeId, tutorId, amount, currency);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /payment/complete-checkout
     * Called by the frontend after Stripe Checkout redirects back.
     * Retrieves the session, captures the PaymentIntent, updates DB.
     * Body: { booking_id }
     */
    @PostMapping("/payment/complete-checkout")
    public ResponseEntity<?> completeCheckout(@RequestBody Map<String, Object> body) {
        try {
            Integer bookingId = intVal(body, "booking_id");
            if (bookingId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "booking_id is required"));
            }
            Payment payment = paymentService.completeCheckout(bookingId);
            return ResponseEntity.ok(toMap(payment));
        } catch (IllegalArgumentException e) {
            System.err.printf("[PAYMENT] IllegalArgumentException in completeCheckout: %s%n", e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.printf("[PAYMENT] Exception in completeCheckout: %s%n", e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", e.getClass().getSimpleName() + ": " + e.getMessage()));
        }
    }

    /**
     * POST /payment/capture
     * Called after the tutee's frontend confirms the Stripe payment.
     * Body: { stripe_payment_intent_id, tutee_email? }
     */
    @PostMapping("/payment/capture")
    public ResponseEntity<?> capture(@RequestBody Map<String, Object> body) {
        try {
            String intentId  = (String) body.get("stripe_payment_intent_id");
            String tuteeEmail = (String) body.getOrDefault("tutee_email", "");
            if (intentId == null || intentId.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "stripe_payment_intent_id is required"));
            }
            Payment payment = paymentService.capturePayment(intentId, tuteeEmail);
            return ResponseEntity.ok(toMap(payment));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /payment/{paymentId}/release
     * Called by OutSystems Booking Process when lesson is marked complete.
     * Body: { tutor_stripe_account_id?, tutor_email? }
     */
    @PostMapping("/payment/{paymentId}/release")
    public ResponseEntity<?> release(@PathVariable Long paymentId,
                                     @RequestBody(required = false) Map<String, Object> body) {
        if (body == null) body = new HashMap<>();
        try {
            String tutorAccountId = (String) body.getOrDefault("tutor_stripe_account_id", "");
            String tutorEmail     = (String) body.getOrDefault("tutor_email", "");
            Payment payment = paymentService.releaseToTutor(paymentId, tutorAccountId, tutorEmail);
            return ResponseEntity.ok(toMap(payment));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /payment/{paymentId}/refund
     * Called by OutSystems Booking Process when booking is cancelled post-payment.
     * Body: { tutee_email? }
     */
    @PostMapping("/payment/{paymentId}/refund")
    public ResponseEntity<?> refund(@PathVariable Long paymentId,
                                    @RequestBody(required = false) Map<String, Object> body) {
        if (body == null) body = new HashMap<>();
        try {
            String tuteeEmail = (String) body.getOrDefault("tutee_email", "");
            Payment payment = paymentService.refundToTutee(paymentId, tuteeEmail);
            return ResponseEntity.ok(toMap(payment));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /payment/booking/{bookingId}
     * Get payment record for a booking.
     */
    @GetMapping("/payment/booking/{bookingId}")
    public ResponseEntity<?> getByBooking(@PathVariable Integer bookingId) {
        Optional<Payment> payment = paymentService.getByBookingId(bookingId);
        return payment.map(p -> ResponseEntity.ok(toMap(p)))
                .orElse(ResponseEntity.status(404).body(null));
    }

    /**
     * GET /payment/{paymentId}
     * Get payment by ID.
     */
    @GetMapping("/payment/{paymentId}")
    public ResponseEntity<?> getById(@PathVariable Long paymentId) {
        Optional<Payment> payment = paymentService.getById(paymentId);
        return payment.map(p -> ResponseEntity.ok(toMap(p)))
                .orElse(ResponseEntity.status(404).body(null));
    }

    // ---- helpers ----

    private Integer intVal(Map<String, Object> body, String key) {
        Object v = body.get(key);
        if (v == null) return null;
        return Integer.parseInt(v.toString());
    }

    private Map<String, Object> toMap(Payment p) {
        Map<String, Object> m = new HashMap<>();
        m.put("payment_id",               p.getPaymentId());
        m.put("booking_id",               p.getBookingId());
        m.put("tutee_id",                 p.getTuteeId());
        m.put("tutor_id",                 p.getTutorId());
        m.put("amount",                   p.getAmount());
        m.put("status",                   p.getStatus().name());
        m.put("stripe_payment_intent_id", p.getStripePaymentIntentId());
        m.put("stripe_transfer_id",       p.getStripeTransferId());
        m.put("created_at",               p.getCreatedAt() != null ? p.getCreatedAt().toString() : null);
        m.put("updated_at",               p.getUpdatedAt() != null ? p.getUpdatedAt().toString() : null);
        return m;
    }
}
