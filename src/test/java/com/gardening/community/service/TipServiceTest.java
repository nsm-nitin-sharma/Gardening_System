package com.gardening.community.service;

import com.gardening.community.model.Tip;
import com.gardening.community.model.TipStatus;
import com.gardening.community.model.User;
import com.gardening.community.model.Role;
import com.gardening.community.repository.TipRepository;
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
 * Unit tests for TipService covering tip submission, moderation workflow,
 * category filtering, and search operations.
 */
@ExtendWith(MockitoExtension.class)
class TipServiceTest {

    @Mock
    private TipRepository tipRepository;

    @Mock
    private SystemSettingService systemSettingService;

    @Mock
    private ActivityLogService activityLogService;

    @InjectMocks
    private TipService tipService;

    private User testAuthor;

    @BeforeEach
    void setUp() {
        testAuthor = new User("Test Author", "author@example.com", "pass", Role.ROLE_GARDENER);
        testAuthor.setId(1L);
    }

    @Test
    @DisplayName("Should create tip with PENDING status when auto-approve is disabled")
    void shouldCreatePendingTipWhenAutoApproveOff() {
        when(systemSettingService.getBooleanSetting("AUTO_APPROVE_TIPS", false)).thenReturn(false);
        when(tipRepository.save(any(Tip.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Tip result = tipService.submitTip("Composting Guide", "Soil", "How to compost", null, testAuthor);

        assertEquals(TipStatus.PENDING, result.getStatus(), "Tip should be PENDING when auto-approve is off");
        assertEquals("Composting Guide", result.getTitle());
        verify(tipRepository).save(any(Tip.class));
    }

    @Test
    @DisplayName("Should create tip with APPROVED status when auto-approve is enabled")
    void shouldCreateApprovedTipWhenAutoApproveOn() {
        when(systemSettingService.getBooleanSetting("AUTO_APPROVE_TIPS", false)).thenReturn(true);
        when(tipRepository.save(any(Tip.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Tip result = tipService.submitTip("Watering Tips", "Watering", "Best watering schedule", null, testAuthor);

        assertEquals(TipStatus.APPROVED, result.getStatus(), "Tip should be APPROVED when auto-approve is on");
    }

    @Test
    @DisplayName("Should approve a pending tip through moderation")
    void shouldApprovePendingTip() {
        Tip pendingTip = new Tip("Test Tip", "General", "Description", null, testAuthor, TipStatus.PENDING);
        pendingTip.setId(1L);

        when(tipRepository.findById(1L)).thenReturn(Optional.of(pendingTip));
        when(tipRepository.save(any(Tip.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Tip moderated = tipService.moderateTip(1L, TipStatus.APPROVED, "Good content", "admin@example.com");

        assertEquals(TipStatus.APPROVED, moderated.getStatus());
        assertEquals("Good content", moderated.getModerationNote());
        verify(activityLogService).logActivity(eq("admin@example.com"), eq("MODERATE_TIP"), anyString());
    }

    @Test
    @DisplayName("Should reject a tip with moderation note")
    void shouldRejectTipWithNote() {
        Tip pendingTip = new Tip("Bad Tip", "General", "Description", null, testAuthor, TipStatus.PENDING);
        pendingTip.setId(2L);

        when(tipRepository.findById(2L)).thenReturn(Optional.of(pendingTip));
        when(tipRepository.save(any(Tip.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Tip rejected = tipService.moderateTip(2L, TipStatus.REJECTED, "Inappropriate content", "admin@example.com");

        assertEquals(TipStatus.REJECTED, rejected.getStatus());
        assertEquals("Inappropriate content", rejected.getModerationNote());
    }

    @Test
    @DisplayName("Should return only approved tips from the repository")
    void shouldReturnOnlyApprovedTips() {
        Tip approved1 = new Tip("Tip A", "Soil", "Desc A", null, testAuthor, TipStatus.APPROVED);
        Tip approved2 = new Tip("Tip B", "Watering", "Desc B", null, testAuthor, TipStatus.APPROVED);

        when(tipRepository.findByStatusOrderByCreatedAtDesc(TipStatus.APPROVED))
                .thenReturn(Arrays.asList(approved1, approved2));

        List<Tip> tips = tipService.getApprovedTips();

        assertEquals(2, tips.size(), "Should return exactly 2 approved tips");
        verify(tipRepository).findByStatusOrderByCreatedAtDesc(TipStatus.APPROVED);
    }

    @Test
    @DisplayName("Should search approved tips by title keyword")
    void shouldSearchTipsByTitleKeyword() {
        Tip matchingTip = new Tip("Rose Pruning Guide", "Flowers", "How to prune", null, testAuthor, TipStatus.APPROVED);

        when(tipRepository.findByTitleContainingIgnoreCaseAndStatus("Rose", TipStatus.APPROVED))
                .thenReturn(List.of(matchingTip));

        List<Tip> results = tipService.searchApprovedTips("Rose");

        assertEquals(1, results.size());
        assertEquals("Rose Pruning Guide", results.get(0).getTitle());
    }
}
