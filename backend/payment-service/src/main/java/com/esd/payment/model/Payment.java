package com.esd.payment.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    @Column(nullable = false)
    private Integer bookingId;

    @Column(nullable = false)
    private Integer tuteeId;

    @Column(nullable = false)
    private Integer tutorId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    // Stripe PaymentIntent ID
    @Column(length = 100)
    private String stripePaymentIntentId;

    // Stripe Checkout Session ID
    @Column(length = 200)
    private String stripeSessionId;

    // Stripe Transfer ID (when releasing to tutor)
    @Column(length = 100)
    private String stripeTransferId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(length = 20)
    private String tuteeCurrency = "sgd";

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum PaymentStatus {
        PENDING, HELD, RELEASED, REFUNDED, FAILED
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and setters

    public Long getPaymentId() { return paymentId; }

    public Integer getBookingId() { return bookingId; }
    public void setBookingId(Integer bookingId) { this.bookingId = bookingId; }

    public Integer getTuteeId() { return tuteeId; }
    public void setTuteeId(Integer tuteeId) { this.tuteeId = tuteeId; }

    public Integer getTutorId() { return tutorId; }
    public void setTutorId(Integer tutorId) { this.tutorId = tutorId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getStripePaymentIntentId() { return stripePaymentIntentId; }
    public void setStripePaymentIntentId(String id) { this.stripePaymentIntentId = id; }

    public String getStripeSessionId() { return stripeSessionId; }
    public void setStripeSessionId(String id) { this.stripeSessionId = id; }

    public String getStripeTransferId() { return stripeTransferId; }
    public void setStripeTransferId(String id) { this.stripeTransferId = id; }

    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }

    public String getTuteeCurrency() { return tuteeCurrency; }
    public void setTuteeCurrency(String currency) { this.tuteeCurrency = currency; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
