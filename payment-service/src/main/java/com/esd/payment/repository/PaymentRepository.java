package com.esd.payment.repository;

import com.esd.payment.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByTuteeIdOrderByCreatedAtDesc(Integer tuteeId);
    List<Payment> findByTutorIdOrderByCreatedAtDesc(Integer tutorId);
    Optional<Payment> findByBookingId(Integer bookingId);
    Optional<Payment> findByStripePaymentIntentId(String intentId);
}
