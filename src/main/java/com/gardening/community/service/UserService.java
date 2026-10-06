package com.gardening.community.service;

import com.gardening.community.dto.UserRegistrationDto;
import com.gardening.community.model.Role;
import com.gardening.community.model.User;
import com.gardening.community.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service managing user accounts, profiles, registration, and administrative account actions.
 */
@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ActivityLogService activityLogService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, ActivityLogService activityLogService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.activityLogService = activityLogService;
    }

    public User registerGardener(UserRegistrationDto dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("An account with email address " + dto.getEmail() + " already exists.");
        }

        User user = new User();
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(Role.ROLE_GARDENER);
        user.setBio(dto.getBio());
        user.setGardeningExperience(dto.getGardeningExperience());
        user.setLocation(dto.getLocation());
        user.setActive(true);

        User savedUser = userRepository.save(user);
        activityLogService.logActivity(dto.getEmail(), "REGISTER", "New Gardener account created successfully.");
        return savedUser;
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    public User updateProfile(String email, String fullName, String bio, String gardeningExperience, String location) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));

        user.setFullName(fullName);
        user.setBio(bio);
        user.setGardeningExperience(gardeningExperience);
        user.setLocation(location);

        User updated = userRepository.save(user);
        activityLogService.logActivity(email, "UPDATE_PROFILE", "Gardener profile updated.");
        return updated;
    }

    public User toggleUserActiveStatus(Long userId, String adminEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User ID not found: " + userId));

        user.setActive(!user.isActive());
        User updated = userRepository.save(user);
        activityLogService.logActivity(adminEmail, "TOGGLE_USER_STATUS",
                "User " + user.getEmail() + " active status set to: " + user.isActive());
        return updated;
    }

    public User updateUserRole(Long userId, Role role, String adminEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User ID not found: " + userId));

        user.setRole(role);
        User updated = userRepository.save(user);
        activityLogService.logActivity(adminEmail, "UPDATE_USER_ROLE",
                "User " + user.getEmail() + " role updated to: " + role.name());
        return updated;
    }

    public void deleteUser(Long userId, String adminEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User ID not found: " + userId));

        String targetEmail = user.getEmail();
        userRepository.delete(user);
        activityLogService.logActivity(adminEmail, "DELETE_USER", "Deleted user account: " + targetEmail);
    }

    public long getTotalUserCount() {
        return userRepository.count();
    }
}
