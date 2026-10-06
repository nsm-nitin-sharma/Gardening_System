package com.gardening.community.controller;

import com.gardening.community.dto.UserRegistrationDto;
import com.gardening.community.model.*;
import com.gardening.community.service.*;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.security.Principal;
import java.util.List;

/**
 * Controller managing public access pages, registration, login, tip browsing, and community discussions.
 */
@Controller
public class PublicController {

    private final UserService userService;
    private final TipService tipService;
    private final DiscussionService discussionService;
    private final SystemSettingService systemSettingService;

    public PublicController(UserService userService, TipService tipService, DiscussionService discussionService, SystemSettingService systemSettingService) {
        this.userService = userService;
        this.tipService = tipService;
        this.discussionService = discussionService;
        this.systemSettingService = systemSettingService;
    }

    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("siteName", systemSettingService.getSettingValue("SITE_NAME", "Gardening Community Hub"));
        model.addAttribute("announcement", systemSettingService.getSettingValue("ANNOUNCEMENT_BANNER", ""));
        model.addAttribute("recentTips", tipService.getApprovedTips());
        model.addAttribute("recentDiscussions", discussionService.getApprovedTopics());
        return "index";
    }

    @GetMapping("/login")
    public String loginPage(@RequestParam(value = "error", required = false) String error,
                            @RequestParam(value = "logout", required = false) String logout,
                            Model model, Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            return "redirect:/";
        }
        if (error != null) {
            model.addAttribute("errorMessage", "Invalid email or password. Please try again.");
        }
        if (logout != null) {
            model.addAttribute("successMessage", "You have been logged out successfully.");
        }
        return "auth/login";
    }

    @GetMapping("/register")
    public String registerPage(Model model, Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            return "redirect:/";
        }
        boolean allowReg = systemSettingService.getBooleanSetting("ALLOW_REGISTRATION", true);
        if (!allowReg) {
            model.addAttribute("errorMessage", "User registration is currently disabled by administrator settings.");
            return "auth/login";
        }
        model.addAttribute("registrationDto", new UserRegistrationDto());
        return "auth/register";
    }

    @PostMapping("/register")
    public String registerUser(@Valid @ModelAttribute("registrationDto") UserRegistrationDto dto,
                               BindingResult bindingResult,
                               Model model,
                               RedirectAttributes redirectAttributes) {
        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            bindingResult.rejectValue("confirmPassword", "error.registrationDto", "Passwords do not match.");
        }

        if (bindingResult.hasErrors()) {
            return "auth/register";
        }

        try {
            userService.registerGardener(dto);
            redirectAttributes.addFlashAttribute("successMessage", "Registration successful! You may now sign in.");
            return "redirect:/login";
        } catch (IllegalArgumentException ex) {
            model.addAttribute("errorMessage", ex.getMessage());
            return "auth/register";
        }
    }

    @GetMapping("/tips")
    public String browseTips(@RequestParam(value = "category", required = false) String category,
                             @RequestParam(value = "q", required = false) String query,
                             Model model) {
        List<Tip> tips;
        if (query != null && !query.trim().isEmpty()) {
            tips = tipService.searchApprovedTips(query.trim());
        } else if (category != null && !category.trim().isEmpty()) {
            tips = tipService.getApprovedTipsByCategory(category.trim());
        } else {
            tips = tipService.getApprovedTips();
        }
        model.addAttribute("tips", tips);
        model.addAttribute("selectedCategory", category);
        model.addAttribute("searchQuery", query);
        return "public/tips-list";
    }

    @GetMapping("/tips/view/{id}")
    public String viewTip(@PathVariable("id") Long id, Model model) {
        Tip tip = tipService.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid tip ID: " + id));
        model.addAttribute("tip", tip);
        return "public/tip-detail";
    }

    @GetMapping("/discussions")
    public String browseDiscussions(@RequestParam(value = "category", required = false) String category, Model model) {
        List<DiscussionTopic> topics;
        if (category != null && !category.trim().isEmpty()) {
            topics = discussionService.getTopicsByCategory(category.trim());
        } else {
            topics = discussionService.getApprovedTopics();
        }
        model.addAttribute("topics", topics);
        model.addAttribute("selectedCategory", category);
        return "public/discussions-list";
    }

    @GetMapping("/discussions/view/{id}")
    public String viewDiscussion(@PathVariable("id") Long id, Model model) {
        DiscussionTopic topic = discussionService.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid discussion ID: " + id));
        model.addAttribute("topic", topic);
        model.addAttribute("comments", discussionService.getCommentsForTopic(topic));
        return "public/discussion-detail";
    }

    @PostMapping("/discussions/comment")
    public String addComment(@RequestParam("topicId") Long topicId,
                             @RequestParam("content") String content,
                             Principal principal,
                             RedirectAttributes redirectAttributes) {
        if (principal == null) {
            return "redirect:/login";
        }
        User user = userService.findByEmail(principal.getName()).orElseThrow();
        discussionService.addComment(topicId, content, user);
        redirectAttributes.addFlashAttribute("successMessage", "Comment posted successfully!");
        return "redirect:/discussions/view/" + topicId;
    }
}
