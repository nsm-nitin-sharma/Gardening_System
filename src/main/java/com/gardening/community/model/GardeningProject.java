package com.gardening.community.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing a personal gardening project managed by a Gardener.
 */
@Entity
@Table(name = "gardening_projects")
public class GardeningProject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    private String plantTypes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectStatus status = ProjectStatus.PLANNING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private LocalDate startDate;

    private LocalDate targetHarvestDate;

    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProjectLog> logs = new ArrayList<>();

    public GardeningProject() {
    }

    public GardeningProject(String title, String description, String plantTypes, ProjectStatus status, User user, LocalDate startDate, LocalDate targetHarvestDate) {
        this.title = title;
        this.description = description;
        this.plantTypes = plantTypes;
        this.status = status;
        this.user = user;
        this.startDate = startDate;
        this.targetHarvestDate = targetHarvestDate;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPlantTypes() {
        return plantTypes;
    }

    public void setPlantTypes(String plantTypes) {
        this.plantTypes = plantTypes;
    }

    public ProjectStatus getStatus() {
        return status;
    }

    public void setStatus(ProjectStatus status) {
        this.status = status;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getTargetHarvestDate() {
        return targetHarvestDate;
    }

    public void setTargetHarvestDate(LocalDate targetHarvestDate) {
        this.targetHarvestDate = targetHarvestDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<ProjectLog> getLogs() {
        return logs;
    }

    public void setLogs(List<ProjectLog> logs) {
        this.logs = logs;
    }
}
