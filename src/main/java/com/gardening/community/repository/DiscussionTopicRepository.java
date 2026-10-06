package com.gardening.community.repository;

import com.gardening.community.model.DiscussionTopic;
import com.gardening.community.model.TipStatus;
import com.gardening.community.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiscussionTopicRepository extends JpaRepository<DiscussionTopic, Long> {
    List<DiscussionTopic> findByStatusOrderByCreatedAtDesc(TipStatus status);
    List<DiscussionTopic> findByAuthorOrderByCreatedAtDesc(User author);
    List<DiscussionTopic> findByCategoryAndStatusOrderByCreatedAtDesc(String category, TipStatus status);
    long countByStatus(TipStatus status);
}
