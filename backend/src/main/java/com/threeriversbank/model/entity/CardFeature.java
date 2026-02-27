package com.threeriversbank.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "card_feature")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CardFeature {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id", nullable = false)
    private CreditCard creditCard;
    
    @Column(nullable = false, length = 100)
    private String featureName;
    
    @Column(length = 200)
    private String featureValue;
    
    @Column(length = 50)
    private String featureType;
}
