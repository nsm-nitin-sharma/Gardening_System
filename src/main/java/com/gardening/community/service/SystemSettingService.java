package com.gardening.community.service;

import com.gardening.community.model.SystemSetting;
import com.gardening.community.repository.SystemSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service managing platform-wide system settings and configuration parameters.
 */
@Service
@Transactional
public class SystemSettingService {

    private final SystemSettingRepository systemSettingRepository;
    private final ActivityLogService activityLogService;

    public SystemSettingService(SystemSettingRepository systemSettingRepository, ActivityLogService activityLogService) {
        this.systemSettingRepository = systemSettingRepository;
        this.activityLogService = activityLogService;
    }

    public List<SystemSetting> getAllSettings() {
        return systemSettingRepository.findAll();
    }

    public String getSettingValue(String key, String defaultValue) {
        Optional<SystemSetting> setting = systemSettingRepository.findBySettingKey(key);
        return setting.map(SystemSetting::getSettingValue).orElse(defaultValue);
    }

    public boolean getBooleanSetting(String key, boolean defaultValue) {
        String val = getSettingValue(key, String.valueOf(defaultValue));
        return Boolean.parseBoolean(val) || "TRUE".equalsIgnoreCase(val);
    }

    public SystemSetting updateSetting(String key, String value, String adminEmail) {
        SystemSetting setting = systemSettingRepository.findBySettingKey(key)
                .orElseGet(() -> new SystemSetting(key, value, "System Setting"));

        setting.setSettingValue(value);
        SystemSetting updated = systemSettingRepository.save(setting);
        activityLogService.logActivity(adminEmail, "UPDATE_SETTING", "Updated setting " + key + " = " + value);
        return updated;
    }
}
