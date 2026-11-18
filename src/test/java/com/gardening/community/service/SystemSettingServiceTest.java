package com.gardening.community.service;

import com.gardening.community.model.SystemSetting;
import com.gardening.community.repository.SystemSettingRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Unit tests for SystemSettingService covering setting retrieval,
 * boolean parsing, and setting update operations.
 */
@ExtendWith(MockitoExtension.class)
class SystemSettingServiceTest {

    @Mock
    private SystemSettingRepository systemSettingRepository;

    @Mock
    private ActivityLogService activityLogService;

    @InjectMocks
    private SystemSettingService systemSettingService;

    @Test
    @DisplayName("Should retrieve existing setting value by key")
    void shouldRetrieveSettingByKey() {
        SystemSetting setting = new SystemSetting("SITE_NAME", "Gardening Hub", "Platform name");
        when(systemSettingRepository.findBySettingKey("SITE_NAME")).thenReturn(Optional.of(setting));

        String value = systemSettingService.getSettingValue("SITE_NAME", "Default");

        assertEquals("Gardening Hub", value, "Should return the stored setting value");
    }

    @Test
    @DisplayName("Should return default value when setting key does not exist")
    void shouldReturnDefaultWhenKeyNotFound() {
        when(systemSettingRepository.findBySettingKey("MISSING_KEY")).thenReturn(Optional.empty());

        String value = systemSettingService.getSettingValue("MISSING_KEY", "FallbackValue");

        assertEquals("FallbackValue", value, "Should return the default fallback value");
    }

    @Test
    @DisplayName("Should correctly parse boolean TRUE setting value")
    void shouldParseBooleanTrueSetting() {
        SystemSetting setting = new SystemSetting("AUTO_APPROVE_TIPS", "TRUE", "Auto-approve toggle");
        when(systemSettingRepository.findBySettingKey("AUTO_APPROVE_TIPS")).thenReturn(Optional.of(setting));

        boolean result = systemSettingService.getBooleanSetting("AUTO_APPROVE_TIPS", false);

        assertTrue(result, "Should parse 'TRUE' string as boolean true");
    }

    @Test
    @DisplayName("Should update existing setting value and log activity")
    void shouldUpdateSettingValue() {
        SystemSetting existing = new SystemSetting("MAX_UPLOAD_SIZE", "5MB", "File upload limit");
        when(systemSettingRepository.findBySettingKey("MAX_UPLOAD_SIZE")).thenReturn(Optional.of(existing));
        when(systemSettingRepository.save(any(SystemSetting.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        SystemSetting updated = systemSettingService.updateSetting("MAX_UPLOAD_SIZE", "10MB", "admin@example.com");

        assertEquals("10MB", updated.getSettingValue());
        verify(activityLogService).logActivity(eq("admin@example.com"), eq("UPDATE_SETTING"), anyString());
    }
}
