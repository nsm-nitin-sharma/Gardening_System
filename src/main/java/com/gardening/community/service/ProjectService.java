package com.gardening.community.service;

import com.gardening.community.model.GardeningProject;
import com.gardening.community.model.ProjectLog;
import com.gardening.community.model.ProjectStatus;
import com.gardening.community.model.User;
import com.gardening.community.repository.GardeningProjectRepository;
import com.gardening.community.repository.ProjectLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Service managing gardener personal project tracking, milestones, and progress updates.
 */
@Service
@Transactional
public class ProjectService {

    private final GardeningProjectRepository projectRepository;
    private final ProjectLogRepository projectLogRepository;
    private final ActivityLogService activityLogService;

    public ProjectService(GardeningProjectRepository projectRepository,
                          ProjectLogRepository projectLogRepository,
                          ActivityLogService activityLogService) {
        this.projectRepository = projectRepository;
        this.projectLogRepository = projectLogRepository;
        this.activityLogService = activityLogService;
    }

    public GardeningProject createProject(String title, String description, String plantTypes,
                                         ProjectStatus status, User user,
                                         LocalDate startDate, LocalDate targetHarvestDate) {
        GardeningProject project = new GardeningProject(title, description, plantTypes, status, user, startDate, targetHarvestDate);
        GardeningProject saved = projectRepository.save(project);

        activityLogService.logActivity(user.getEmail(), "CREATE_PROJECT",
                "Created gardening project: '" + title + "'");

        return saved;
    }

    public List<GardeningProject> getProjectsByUser(User user) {
        return projectRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public Optional<GardeningProject> findById(Long id) {
        return projectRepository.findById(id);
    }

    public GardeningProject updateProjectStatus(Long projectId, ProjectStatus status, String userEmail) {
        GardeningProject project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project ID not found: " + projectId));

        project.setStatus(status);
        GardeningProject updated = projectRepository.save(project);

        activityLogService.logActivity(userEmail, "UPDATE_PROJECT_STATUS",
                "Project '" + project.getTitle() + "' status updated to " + status);

        return updated;
    }

    public ProjectLog addProjectLog(Long projectId, LocalDate logDate, String note, String milestone, String userEmail) {
        GardeningProject project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project ID not found: " + projectId));

        ProjectLog log = new ProjectLog(project, logDate, note, milestone);
        ProjectLog savedLog = projectLogRepository.save(log);

        activityLogService.logActivity(userEmail, "ADD_PROJECT_LOG",
                "Added progress log to project: '" + project.getTitle() + "'");

        return savedLog;
    }

    public List<ProjectLog> getProjectLogs(GardeningProject project) {
        return projectLogRepository.findByProjectOrderByLogDateDesc(project);
    }

    public void deleteProject(Long projectId, String userEmail) {
        projectRepository.deleteById(projectId);
        activityLogService.logActivity(userEmail, "DELETE_PROJECT", "Deleted gardening project ID: " + projectId);
    }
}
