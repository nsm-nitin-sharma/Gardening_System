package com.gardening.community.service;

import com.gardening.community.model.Tip;
import com.gardening.community.model.TipStatus;
import com.gardening.community.model.User;
import com.gardening.community.repository.TipRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service managing gardening tip submission, categorization, search, and moderation workflows.
 */
@Service
@Transactional
public class TipService {

    private final TipRepository tipRepository;
    private final SystemSettingService systemSettingService;
    private final ActivityLogService activityLogService;

    public TipService(TipRepository tipRepository, SystemSettingService systemSettingService, ActivityLogService activityLogService) {
        this.tipRepository = tipRepository;
        this.systemSettingService = systemSettingService;
        this.activityLogService = activityLogService;
    }

    public Tip submitTip(String title, String category, String description, String imageUrl, User author) {
        boolean autoApprove = systemSettingService.getBooleanSetting("AUTO_APPROVE_TIPS", false);
        TipStatus initialStatus = autoApprove ? TipStatus.APPROVED : TipStatus.PENDING;

        Tip tip = new Tip(title, category, description, imageUrl, author, initialStatus);
        Tip savedTip = tipRepository.save(tip);

        activityLogService.logActivity(author.getEmail(), "SUBMIT_TIP",
                "Submitted gardening tip: '" + title + "' (Status: " + initialStatus + ")");

        return savedTip;
    }

    public List<Tip> getApprovedTips() {
        return tipRepository.findByStatusOrderByCreatedAtDesc(TipStatus.APPROVED);
    }

    public List<Tip> getPendingTips() {
        return tipRepository.findByStatusOrderByCreatedAtDesc(TipStatus.PENDING);
    }

    public List<Tip> getTipsByAuthor(User author) {
        return tipRepository.findByAuthorOrderByCreatedAtDesc(author);
    }

    public List<Tip> getApprovedTipsByCategory(String category) {
        return tipRepository.findByCategoryAndStatusOrderByCreatedAtDesc(category, TipStatus.APPROVED);
    }

    public List<Tip> searchApprovedTips(String query) {
        return tipRepository.findByTitleContainingIgnoreCaseAndStatus(query, TipStatus.APPROVED);
    }

    public Optional<Tip> findById(Long id) {
        return tipRepository.findById(id);
    }

    public Tip moderateTip(Long tipId, TipStatus newStatus, String moderationNote, String adminEmail) {
        Tip tip = tipRepository.findById(tipId)
                .orElseThrow(() -> new IllegalArgumentException("Tip ID not found: " + tipId));

        tip.setStatus(newStatus);
        tip.setModerationNote(moderationNote);
        Tip updated = tipRepository.save(tip);

        activityLogService.logActivity(adminEmail, "MODERATE_TIP",
                "Moderated tip ID " + tipId + " status to " + newStatus + ". Note: " + moderationNote);

        return updated;
    }

    public void deleteTip(Long tipId, String userEmail) {
        Tip tip = tipRepository.findById(tipId)
                .orElseThrow(() -> new IllegalArgumentException("Tip ID not found: " + tipId));

        tipRepository.delete(tip);
        activityLogService.logActivity(userEmail, "DELETE_TIP", "Deleted tip ID: " + tipId);
    }

    public long getPendingCount() {
        return tipRepository.countByStatus(TipStatus.PENDING);
    }

    public long getApprovedCount() {
        return tipRepository.countByStatus(TipStatus.APPROVED);
    }
}
