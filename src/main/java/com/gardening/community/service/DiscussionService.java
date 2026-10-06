package com.gardening.community.service;

import com.gardening.community.model.DiscussionComment;
import com.gardening.community.model.DiscussionTopic;
import com.gardening.community.model.TipStatus;
import com.gardening.community.model.User;
import com.gardening.community.repository.DiscussionCommentRepository;
import com.gardening.community.repository.DiscussionTopicRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service managing community discussion threads, comments, and moderation.
 */
@Service
@Transactional
public class DiscussionService {

    private final DiscussionTopicRepository topicRepository;
    private final DiscussionCommentRepository commentRepository;
    private final ActivityLogService activityLogService;

    public DiscussionService(DiscussionTopicRepository topicRepository,
                             DiscussionCommentRepository commentRepository,
                             ActivityLogService activityLogService) {
        this.topicRepository = topicRepository;
        this.commentRepository = commentRepository;
        this.activityLogService = activityLogService;
    }

    public DiscussionTopic createTopic(String title, String category, String content, User author) {
        DiscussionTopic topic = new DiscussionTopic(title, category, content, author, TipStatus.APPROVED);
        DiscussionTopic saved = topicRepository.save(topic);

        activityLogService.logActivity(author.getEmail(), "CREATE_DISCUSSION",
                "Created discussion topic: '" + title + "'");

        return saved;
    }

    public List<DiscussionTopic> getApprovedTopics() {
        return topicRepository.findByStatusOrderByCreatedAtDesc(TipStatus.APPROVED);
    }

    public List<DiscussionTopic> getTopicsByCategory(String category) {
        return topicRepository.findByCategoryAndStatusOrderByCreatedAtDesc(category, TipStatus.APPROVED);
    }

    public Optional<DiscussionTopic> findById(Long id) {
        return topicRepository.findById(id);
    }

    public DiscussionComment addComment(Long topicId, String content, User author) {
        DiscussionTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new IllegalArgumentException("Discussion topic ID not found: " + topicId));

        DiscussionComment comment = new DiscussionComment(topic, author, content);
        DiscussionComment savedComment = commentRepository.save(comment);

        activityLogService.logActivity(author.getEmail(), "ADD_COMMENT",
                "Added comment on discussion topic ID: " + topicId);

        return savedComment;
    }

    public List<DiscussionComment> getCommentsForTopic(DiscussionTopic topic) {
        return commentRepository.findByTopicOrderByCreatedAtAsc(topic);
    }

    public void deleteTopic(Long topicId, String userEmail) {
        topicRepository.deleteById(topicId);
        activityLogService.logActivity(userEmail, "DELETE_DISCUSSION", "Deleted discussion topic ID: " + topicId);
    }
}
