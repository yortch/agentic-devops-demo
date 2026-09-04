package com.threeriversbank.repository;

import com.threeriversbank.model.entity.CardApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CardApplicationRepository extends JpaRepository<CardApplication, Long> {
    List<CardApplication> findByCardId(Long cardId);
    List<CardApplication> findByEmail(String email);
}
