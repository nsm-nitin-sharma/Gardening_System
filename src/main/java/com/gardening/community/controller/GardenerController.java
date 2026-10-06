package com.gardening.community.controller;

import com.gardening.community.model.*;
import com.gardening.community.service.*;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

/**
 * Controller managing Gardener actions including profile updates, tip submissions,
 * discussion creation, and personal gardening project tracking.
 */
@Controller
@RequestMapping("/gardener")
public class GardenerController {

    private final UserService userService;
    private final TipService tipService;
    private final DiscussionService discussionService;
    private final ProjectService projectService;

    public GardenerController(UserService userService, TipService tipService, DiscussionService discussionService, ProjectService projectService) {
        this.userService = userService;
        this.tipService = tipService;
        this.discussionService = discussionService;
        this.projectService = projectService;
    }

    @GetMapping("/dashboard")
    public String dashboard(Principal principal, Model model) {
        User user = userService.findByEmail(principal.getName()).orElseThrow();
        List<GardeningProject> projects = projectService.getProjectsByUser(user);
        List<Tip> myTips = tipService.getTipsByAuthor(user);

        model.addAttribute("user", user);
        model.addAttribute("projectsCount", projects.size());
        model.addAttribute("tipsCount", myTips.size());
        model.addAttribute("recentProjects", projects.stream().limit(3).toList());
        model.addAttribute("recentTips", myTips.stream().limit(3).toList());
        return "gardener/dashboard";
    }

    @GetMapping("/profile")
    public String profilePage(Principal principal, Model model) {
        User user = userService.findByEmail(principal.getName()).orElseThrow();
        model.addAttribute("user", user);
        return "gardener/profile";
    }

    @PostMapping("/profile/update")
    public String updateProfile(@RequestParam("fullName") String fullName,
                                @RequestParam("bio") String bio,
                                @RequestParam("gardeningExperience") String gardeningExperience,
                                @RequestParam("location") String location,
                                Principal principal,
                                RedirectAttributes redirectAttributes) {
        userService.updateProfile(principal.getName(), fullName, bio, gardeningExperience, location);
        redirectAttributes.addFlashAttribute("successMessage", "Profile details updated successfully.");
        return "redirect:/gardener/profile";
    }

    @GetMapping("/tips/submit")
    public String submitTipPage(Model model) {
        model.addAttribute("tip", new Tip());
        return "gardener/submit-tip";
    }

    @PostMapping("/tips/save")
    public String saveTip(@RequestParam("title") String title,
                          @RequestParam("category") String category,
                          @RequestParam("description") String description,
                          @RequestParam(value = "imageUrl", required = false) String imageUrl,
                          Principal principal,
                          RedirectAttributes redirectAttributes) {
        User user = userService.findByEmail(principal.getName()).orElseThrow();
        tipService.submitTip(title, category, description, imageUrl, user);
        redirectAttributes.addFlashAttribute("successMessage", "Gardening tip submitted successfully! Pending approval if moderation is active.");
        return "redirect:/gardener/tips/my-tips";
    }

    @GetMapping("/tips/my-tips")
    public String myTips(Principal principal, Model model) {
        User user = userService.findByEmail(principal.getName()).orElseThrow();
        model.addAttribute("tips", tipService.getTipsByAuthor(user));
        return "gardener/my-tips";
    }

    @GetMapping("/projects")
    public String projects(Principal principal, Model model) {
        User user = userService.findByEmail(principal.getName()).orElseThrow();
        model.addAttribute("projects", projectService.getProjectsByUser(user));
        return "gardener/projects-list";
    }

    @GetMapping("/projects/new")
    public String newProjectPage(Model model) {
        model.addAttribute("project", new GardeningProject());
        return "gardener/project-form";
    }

    @PostMapping("/projects/save")
    public String saveProject(@RequestParam("title") String title,
                              @RequestParam("description") String description,
                              @RequestParam("plantTypes") String plantTypes,
                              @RequestParam("status") ProjectStatus status,
                              @RequestParam(value = "startDate", required = false) String startDateStr,
                              @RequestParam(value = "targetHarvestDate", required = false) String harvestDateStr,
                              Principal principal,
                              RedirectAttributes redirectAttributes) {
        User user = userService.findByEmail(principal.getName()).orElseThrow();

        LocalDate startDate = (startDateStr != null && !startDateStr.isEmpty()) ? LocalDate.parse(startDateStr) : LocalDate.now();
        LocalDate harvestDate = (harvestDateStr != null && !harvestDateStr.isEmpty()) ? LocalDate.parse(harvestDateStr) : null;

        projectService.createProject(title, description, plantTypes, status, user, startDate, harvestDate);
        redirectAttributes.addFlashAttribute("successMessage", "New gardening project created!");
        return "redirect:/gardener/projects";
    }

    @GetMapping("/projects/view/{id}")
    public String viewProject(@PathVariable("id") Long id, Principal principal, Model model) {
        GardeningProject project = projectService.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid project ID: " + id));

        model.addAttribute("project", project);
        model.addAttribute("logs", projectService.getProjectLogs(project));
        return "gardener/project-detail";
    }

    @PostMapping("/projects/{id}/log")
    public String addProjectLog(@PathVariable("id") Long projectId,
                                @RequestParam("logDate") String logDateStr,
                                @RequestParam("note") String note,
                                @RequestParam(value = "milestone", required = false) String milestone,
                                Principal principal,
                                RedirectAttributes redirectAttributes) {
        LocalDate logDate = (logDateStr != null && !logDateStr.isEmpty()) ? LocalDate.parse(logDateStr) : LocalDate.now();
        projectService.addProjectLog(projectId, logDate, note, milestone, principal.getName());
        redirectAttributes.addFlashAttribute("successMessage", "Project progress log recorded!");
        return "redirect:/gardener/projects/view/" + projectId;
    }

    @PostMapping("/projects/{id}/status")
    public String updateProjectStatus(@PathVariable("id") Long projectId,
                                       @RequestParam("status") ProjectStatus status,
                                       Principal principal,
                                       RedirectAttributes redirectAttributes) {
        projectService.updateProjectStatus(projectId, status, principal.getName());
        redirectAttributes.addFlashAttribute("successMessage", "Project status updated to " + status.name());
        return "redirect:/gardener/projects/view/" + projectId;
    }

    @GetMapping("/discussions/new")
    public String newDiscussionPage(Model model) {
        model.addAttribute("topic", new DiscussionTopic());
        return "gardener/discussion-form";
    }

    @PostMapping("/discussions/save")
    public String saveDiscussion(@RequestParam("title") String title,
                                 @RequestParam("category") String category,
                                 @RequestParam("content") String content,
                                 Principal principal,
                                 RedirectAttributes redirectAttributes) {
        User user = userService.findByEmail(principal.getName()).orElseThrow();
        discussionService.createTopic(title, category, content, user);
        redirectAttributes.addFlashAttribute("successMessage", "Discussion topic posted to community forum!");
        return "redirect:/discussions";
    }
}
