package com.gardening.community.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity representing a milestone or log entry for a Gardening Project.
 */
@Entity
@Table(name = "project_logs")
public class ProjectLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private GardeningProject project;

    private LocalDate logDate;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String note;

    private String milestone;

    private LocalDateTime createdAt;

    public ProjectLog() {
    }

    public ProjectLog(GardeningProject project, LocalDate logDate, String note, String milestone) {
        this.project = project;
        this.logDate = logDate;
        this.note = note;
        this.milestone = milestone;
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

    public GardeningProject getProject() {
        return project;
    }

    public void setProject(GardeningProject project) {
        this.project = project;
    }

    public LocalDate getLogDate() {
        return logDate;
    }

    public void setLogDate(LocalDate logDate) {
        this.logDate = logDate;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getMilestone() {
        return milestone;
    }

    public void setMilestone(String milestone) {
        this.milestone = milestone;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
