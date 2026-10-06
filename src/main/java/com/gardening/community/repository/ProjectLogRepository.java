package com.gardening.community.repository;

import com.gardening.community.model.GardeningProject;
import com.gardening.community.model.ProjectLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectLogRepository extends JpaRepository<ProjectLog, Long> {
    List<ProjectLog> findByProjectOrderByLogDateDesc(GardeningProject project);
}
