package com.gardening.community.service;

import com.gardening.community.model.*;
import com.gardening.community.repository.GardeningProjectRepository;
import com.gardening.community.repository.ProjectLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ProjectService covering project creation, status updates,
 * progress logging, and project retrieval operations.
 */
@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private GardeningProjectRepository projectRepository;

    @Mock
    private ProjectLogRepository projectLogRepository;

    @Mock
    private ActivityLogService activityLogService;

    @InjectMocks
    private ProjectService projectService;

    private User testUser;
    private GardeningProject testProject;

    @BeforeEach
    void setUp() {
        testUser = new User("Project Owner", "owner@example.com", "pass", Role.ROLE_GARDENER);
        testUser.setId(1L);

        testProject = new GardeningProject("My Tomato Garden", "Growing organic tomatoes",
                "Tomato, Basil", ProjectStatus.PLANNING, testUser, LocalDate.now(), LocalDate.now().plusMonths(3));
        testProject.setId(1L);
    }

    @Test
    @DisplayName("Should create a new gardening project")
    void shouldCreateProject() {
        when(projectRepository.save(any(GardeningProject.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        GardeningProject result = projectService.createProject(
                "Herb Garden", "Growing kitchen herbs", "Basil, Mint",
                ProjectStatus.PLANNING, testUser, LocalDate.now(), null);

        assertNotNull(result, "Created project should not be null");
        assertEquals("Herb Garden", result.getTitle());
        assertEquals(ProjectStatus.PLANNING, result.getStatus());
        verify(activityLogService).logActivity(eq("owner@example.com"), eq("CREATE_PROJECT"), anyString());
    }

    @Test
    @DisplayName("Should update project status from PLANNING to IN_PROGRESS")
    void shouldUpdateProjectStatus() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(testProject));
        when(projectRepository.save(any(GardeningProject.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        GardeningProject updated = projectService.updateProjectStatus(1L, ProjectStatus.IN_PROGRESS, "owner@example.com");

        assertEquals(ProjectStatus.IN_PROGRESS, updated.getStatus());
        verify(activityLogService).logActivity(eq("owner@example.com"), eq("UPDATE_PROJECT_STATUS"), anyString());
    }

    @Test
    @DisplayName("Should add progress log entry to a project")
    void shouldAddProjectLog() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(testProject));
        when(projectLogRepository.save(any(ProjectLog.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ProjectLog log = projectService.addProjectLog(1L, LocalDate.now(),
                "Seedlings sprouted after 7 days", "First Sprout", "owner@example.com");

        assertNotNull(log, "Created log should not be null");
        assertEquals("Seedlings sprouted after 7 days", log.getNote());
        assertEquals("First Sprout", log.getMilestone());
        verify(activityLogService).logActivity(eq("owner@example.com"), eq("ADD_PROJECT_LOG"), anyString());
    }

    @Test
    @DisplayName("Should retrieve all projects for a specific user")
    void shouldGetProjectsByUser() {
        GardeningProject project2 = new GardeningProject("Flower Bed", "Rose garden",
                "Rose, Lily", ProjectStatus.IN_PROGRESS, testUser, LocalDate.now(), null);

        when(projectRepository.findByUserOrderByCreatedAtDesc(testUser))
                .thenReturn(Arrays.asList(testProject, project2));

        List<GardeningProject> projects = projectService.getProjectsByUser(testUser);

        assertEquals(2, projects.size(), "Should return 2 projects for the user");
    }

    @Test
    @DisplayName("Should throw exception when updating status of non-existent project")
    void shouldThrowExceptionForInvalidProjectId() {
        when(projectRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class,
                () -> projectService.updateProjectStatus(999L, ProjectStatus.COMPLETED, "owner@example.com"));
    }
}
