package com.threeriversbank.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "card_application")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CardApplication {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String applicantName;
    
    @Column(nullable = false, length = 100)
    private String email;
    
    @Column(nullable = false, length = 20)
    private String phone;
    
    @Column(nullable = false, length = 200)
    private String businessName;
    
    @Column(nullable = false, length = 50)
    private String businessTaxId;
    
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal annualRevenue;
    
    @Column(nullable = false)
    private Long cardId;
    
    @Column(nullable = false, length = 50)
    private String status;
    
    @Column(nullable = false)
    private LocalDateTime submittedAt;
    
    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
        if (status == null) {
            status = "PENDING";
        }
    }
}
