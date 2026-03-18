package com.esd.payment.config;

import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import org.springframework.amqp.core.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    @Value("${stripe.api.key:}")
    private String stripeApiKey;

    public static final String EXCHANGE = "esd_exchange";
    public static final String QUEUE    = "payment_queue";

    @PostConstruct
    public void initStripe() {
        if (stripeApiKey != null && !stripeApiKey.isBlank()) {
            Stripe.apiKey = stripeApiKey;
        }
    }

    @Bean
    public TopicExchange esdExchange() {
        return new TopicExchange(EXCHANGE, true, false);
    }

    @Bean
    public Queue paymentQueue() {
        return QueueBuilder.durable(QUEUE).build();
    }

    @Bean
    public Binding paymentBinding(Queue paymentQueue, TopicExchange esdExchange) {
        // Payment service listens to booking.confirmed to know when to expect payment
        return BindingBuilder.bind(paymentQueue).to(esdExchange).with("booking.confirmed");
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
