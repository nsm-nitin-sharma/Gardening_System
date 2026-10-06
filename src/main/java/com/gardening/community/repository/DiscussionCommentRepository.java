package com.gardening.community.repository;

import com.gardening.community.model.DiscussionComment;
import com.gardening.community.model.DiscussionTopic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiscussionCommentRepository extends JpaRepository<DiscussionComment, Long> {
    List<DiscussionComment> findByTopicOrderByCreatedAtAsc(DiscussionTopic topic);
}
