package com.gardening.community.repository;

import com.gardening.community.model.Tip;
import com.gardening.community.model.TipStatus;
import com.gardening.community.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TipRepository extends JpaRepository<Tip, Long> {
    List<Tip> findByStatusOrderByCreatedAtDesc(TipStatus status);
    List<Tip> findByAuthorOrderByCreatedAtDesc(User author);
    List<Tip> findByCategoryAndStatusOrderByCreatedAtDesc(String category, TipStatus status);
    List<Tip> findByTitleContainingIgnoreCaseAndStatus(String title, TipStatus status);
    long countByStatus(TipStatus status);
}
