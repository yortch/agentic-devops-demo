package com.threeriversbank.repository;

import com.threeriversbank.model.entity.FeeSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeeScheduleRepository extends JpaRepository<FeeSchedule, Long> {
    List<FeeSchedule> findByCreditCardId(Long cardId);
}
