package com.gardening.community.controller;

import com.gardening.community.model.Role;
import com.gardening.community.model.TipStatus;
import com.gardening.community.model.User;
import com.gardening.community.service.*;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.security.Principal;
import java.util.Map;

/**
 * Administrative controller overseeing user management, content moderation,
 * system settings configuration, and activity monitoring logs.
 */
@Controller
@RequestMapping("/admin")
public class AdminController {

    private final UserService userService;
    private final TipService tipService;
    private final DiscussionService discussionService;
    private final SystemSettingService systemSettingService;
    private final ActivityLogService activityLogService;

    public AdminController(UserService userService,
                           TipService tipService,
                           DiscussionService discussionService,
                           SystemSettingService systemSettingService,
                           ActivityLogService activityLogService) {
        this.userService = userService;
        this.tipService = tipService;
        this.discussionService = discussionService;
        this.systemSettingService = systemSettingService;
        this.activityLogService = activityLogService;
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        model.addAttribute("totalUsers", userService.getTotalUserCount());
        model.addAttribute("pendingTips", tipService.getPendingCount());
        model.addAttribute("approvedTips", tipService.getApprovedCount());
        model.addAttribute("recentActivities", activityLogService.getRecentActivities().stream().limit(5).toList());
        model.addAttribute("pendingContentList", tipService.getPendingTips());
        return "admin/dashboard";
    }

    @GetMapping("/users")
    public String usersList(Model model) {
        model.addAttribute("users", userService.findAllUsers());
        model.addAttribute("roles", Role.values());
        return "admin/users-list";
    }

    @PostMapping("/users/{id}/toggle-status")
    public String toggleUserStatus(@PathVariable("id") Long userId, Principal principal, RedirectAttributes redirectAttributes) {
        User updated = userService.toggleUserActiveStatus(userId, principal.getName());
        redirectAttributes.addFlashAttribute("successMessage",
                "Status for user " + updated.getEmail() + " updated to " + (updated.isActive() ? "Active" : "Deactivated"));
        return "redirect:/admin/users";
    }

    @PostMapping("/users/{id}/update-role")
    public String updateUserRole(@PathVariable("id") Long userId, @RequestParam("role") Role role, Principal principal, RedirectAttributes redirectAttributes) {
        User updated = userService.updateUserRole(userId, role, principal.getName());
        redirectAttributes.addFlashAttribute("successMessage",
                "Role for user " + updated.getEmail() + " updated to " + role.name());
        return "redirect:/admin/users";
    }

    @PostMapping("/users/{id}/delete")
    public String deleteUser(@PathVariable("id") Long userId, Principal principal, RedirectAttributes redirectAttributes) {
        userService.deleteUser(userId, principal.getName());
        redirectAttributes.addFlashAttribute("successMessage", "User account removed from database.");
        return "redirect:/admin/users";
    }

    @GetMapping("/moderation")
    public String moderationPanel(Model model) {
        model.addAttribute("pendingTips", tipService.getPendingTips());
        return "admin/moderation-panel";
    }

    @PostMapping("/moderation/tip/{id}")
    public String moderateTip(@PathVariable("id") Long tipId,
                             @RequestParam("status") TipStatus status,
                             @RequestParam(value = "moderationNote", required = false) String moderationNote,
                             Principal principal,
                             RedirectAttributes redirectAttributes) {
        tipService.moderateTip(tipId, status, moderationNote, principal.getName());
        redirectAttributes.addFlashAttribute("successMessage", "Content moderation status updated to " + status.name());
        return "redirect:/admin/moderation";
    }

    @GetMapping("/settings")
    public String systemSettings(Model model) {
        model.addAttribute("settings", systemSettingService.getAllSettings());
        return "admin/settings-panel";
    }

    @PostMapping("/settings/update")
    public String updateSettings(@RequestParam Map<String, String> formParams, Principal principal, RedirectAttributes redirectAttributes) {
        formParams.forEach((key, value) -> {
            if (!key.startsWith("_")) {
                systemSettingService.updateSetting(key, value, principal.getName());
            }
        });
        redirectAttributes.addFlashAttribute("successMessage", "System settings configuration saved.");
        return "redirect:/admin/settings";
    }

    @GetMapping("/activities")
    public String activityMonitoring(Model model) {
        model.addAttribute("activities", activityLogService.getRecentActivities());
        return "admin/activity-logs";
    }
}
