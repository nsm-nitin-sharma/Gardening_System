package com.gardening.community.repository;

import com.gardening.community.model.GardeningProject;
import com.gardening.community.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GardeningProjectRepository extends JpaRepository<GardeningProject, Long> {
    List<GardeningProject> findByUserOrderByCreatedAtDesc(User user);
    long countByUser(User user);
}
