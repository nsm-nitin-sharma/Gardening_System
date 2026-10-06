package com.gardening.community.service;

import com.gardening.community.model.ActivityLog;
import com.gardening.community.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service managing audit activity logs for user actions and system events.
 */
@Service
@Transactional
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    public ActivityLogService(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    public ActivityLog logActivity(String userEmail, String action, String details) {
        ActivityLog log = new ActivityLog(userEmail, action, details);
        return activityLogRepository.save(log);
    }

    public List<ActivityLog> getRecentActivities() {
        return activityLogRepository.findTop50ByOrderByTimestampDesc();
    }
}
