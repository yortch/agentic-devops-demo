package com.threeriversbank.repository;

import com.threeriversbank.model.entity.CardFeature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CardFeatureRepository extends JpaRepository<CardFeature, Long> {
    List<CardFeature> findByCreditCardId(Long cardId);
}
