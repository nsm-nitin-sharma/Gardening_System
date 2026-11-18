package com.gardening.community.service;

import com.gardening.community.model.DiscussionComment;
import com.gardening.community.model.DiscussionTopic;
import com.gardening.community.model.TipStatus;
import com.gardening.community.model.User;
import com.gardening.community.model.Role;
import com.gardening.community.repository.DiscussionCommentRepository;
import com.gardening.community.repository.DiscussionTopicRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Unit tests for DiscussionService covering topic creation, comment posting,
 * category filtering, and comment retrieval.
 */
@ExtendWith(MockitoExtension.class)
class DiscussionServiceTest {

    @Mock
    private DiscussionTopicRepository topicRepository;

    @Mock
    private DiscussionCommentRepository commentRepository;

    @Mock
    private ActivityLogService activityLogService;

    @InjectMocks
    private DiscussionService discussionService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User("Forum User", "forum@example.com", "pass", Role.ROLE_GARDENER);
        testUser.setId(1L);
    }

    @Test
    @DisplayName("Should create a new discussion topic with APPROVED status")
    void shouldCreateDiscussionTopic() {
        when(topicRepository.save(any(DiscussionTopic.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        DiscussionTopic topic = discussionService.createTopic(
                "Best Indoor Plants", "Indoor Gardening", "What are the best plants for indoors?", testUser);

        assertNotNull(topic, "Created topic should not be null");
        assertEquals("Best Indoor Plants", topic.getTitle());
        assertEquals("Indoor Gardening", topic.getCategory());
        assertEquals(TipStatus.APPROVED, topic.getStatus());
        verify(activityLogService).logActivity(eq("forum@example.com"), eq("CREATE_DISCUSSION"), anyString());
    }

    @Test
    @DisplayName("Should add a comment to an existing discussion topic")
    void shouldAddCommentToTopic() {
        DiscussionTopic topic = new DiscussionTopic("Test Topic", "General", "Content", testUser, TipStatus.APPROVED);
        topic.setId(1L);

        when(topicRepository.findById(1L)).thenReturn(Optional.of(topic));
        when(commentRepository.save(any(DiscussionComment.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        DiscussionComment comment = discussionService.addComment(1L, "Great topic, thanks!", testUser);

        assertNotNull(comment, "Comment should not be null");
        assertEquals("Great topic, thanks!", comment.getContent());
        assertEquals(testUser, comment.getAuthor());
        verify(activityLogService).logActivity(eq("forum@example.com"), eq("ADD_COMMENT"), anyString());
    }

    @Test
    @DisplayName("Should retrieve comments for a topic in chronological order")
    void shouldGetCommentsForTopic() {
        DiscussionTopic topic = new DiscussionTopic("Test Topic", "General", "Content", testUser, TipStatus.APPROVED);
        DiscussionComment comment1 = new DiscussionComment(topic, testUser, "First reply");
        DiscussionComment comment2 = new DiscussionComment(topic, testUser, "Second reply");

        when(commentRepository.findByTopicOrderByCreatedAtAsc(topic))
                .thenReturn(Arrays.asList(comment1, comment2));

        List<DiscussionComment> comments = discussionService.getCommentsForTopic(topic);

        assertEquals(2, comments.size(), "Should return 2 comments");
        assertEquals("First reply", comments.get(0).getContent());
        assertEquals("Second reply", comments.get(1).getContent());
    }

    @Test
    @DisplayName("Should filter discussion topics by category")
    void shouldFilterTopicsByCategory() {
        DiscussionTopic topic1 = new DiscussionTopic("Herbs Guide", "Herbs", "Content", testUser, TipStatus.APPROVED);

        when(topicRepository.findByCategoryAndStatusOrderByCreatedAtDesc("Herbs", TipStatus.APPROVED))
                .thenReturn(List.of(topic1));

        List<DiscussionTopic> filtered = discussionService.getTopicsByCategory("Herbs");

        assertEquals(1, filtered.size());
        assertEquals("Herbs", filtered.get(0).getCategory());
    }

    @Test
    @DisplayName("Should throw exception when adding comment to non-existent topic")
    void shouldThrowExceptionForInvalidTopicId() {
        when(topicRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class,
                () -> discussionService.addComment(999L, "Comment on missing topic", testUser));
    }
}
