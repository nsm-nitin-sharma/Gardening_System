package com.gardening.community.service;

import com.gardening.community.dto.UserRegistrationDto;
import com.gardening.community.model.Role;
import com.gardening.community.model.User;
import com.gardening.community.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Unit tests for UserService covering registration, profile updates,
 * account toggling, and role management operations.
 */
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private ActivityLogService activityLogService;

    @InjectMocks
    private UserService userService;

    private UserRegistrationDto registrationDto;
    private User existingUser;

    @BeforeEach
    void setUp() {
        registrationDto = new UserRegistrationDto();
        registrationDto.setFullName("Test Gardener");
        registrationDto.setEmail("test@example.com");
        registrationDto.setPassword("password123");
        registrationDto.setConfirmPassword("password123");
        registrationDto.setBio("Passionate gardener");
        registrationDto.setGardeningExperience("3 years");
        registrationDto.setLocation("Delhi");

        existingUser = new User("Existing User", "existing@example.com", "encodedPass", Role.ROLE_GARDENER);
        existingUser.setId(1L);
        existingUser.setActive(true);
    }

    @Test
    @DisplayName("Should register a new gardener with valid details")
    void shouldRegisterNewGardener() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User result = userService.registerGardener(registrationDto);

        assertNotNull(result, "Registered user should not be null");
        assertEquals("Test Gardener", result.getFullName());
        assertEquals("test@example.com", result.getEmail());
        assertEquals(Role.ROLE_GARDENER, result.getRole());
        assertTrue(result.isActive(), "New user should be active by default");
        verify(userRepository).save(any(User.class));
        verify(activityLogService).logActivity(eq("test@example.com"), eq("REGISTER"), anyString());
    }

    @Test
    @DisplayName("Should throw exception when registering with duplicate email")
    void shouldThrowExceptionOnDuplicateEmail() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.registerGardener(registrationDto)
        );

        assertTrue(exception.getMessage().contains("already exists"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should update user profile fields correctly")
    void shouldUpdateProfileSuccessfully() {
        when(userRepository.findByEmail("existing@example.com")).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User updated = userService.updateProfile("existing@example.com", "Updated Name",
                "New bio", "5 years", "Mumbai");

        assertEquals("Updated Name", updated.getFullName());
        assertEquals("New bio", updated.getBio());
        assertEquals("5 years", updated.getGardeningExperience());
        assertEquals("Mumbai", updated.getLocation());
        verify(activityLogService).logActivity(eq("existing@example.com"), eq("UPDATE_PROFILE"), anyString());
    }

    @Test
    @DisplayName("Should toggle user active status from active to disabled")
    void shouldToggleUserActiveStatus() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertTrue(existingUser.isActive(), "User should start as active");

        User toggled = userService.toggleUserActiveStatus(1L, "admin@example.com");

        assertFalse(toggled.isActive(), "User should be disabled after toggle");
        verify(activityLogService).logActivity(eq("admin@example.com"), eq("TOGGLE_USER_STATUS"), anyString());
    }

    @Test
    @DisplayName("Should update user role from GARDENER to ADMIN")
    void shouldUpdateUserRole() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertEquals(Role.ROLE_GARDENER, existingUser.getRole());

        User updated = userService.updateUserRole(1L, Role.ROLE_ADMIN, "admin@example.com");

        assertEquals(Role.ROLE_ADMIN, updated.getRole());
        verify(activityLogService).logActivity(eq("admin@example.com"), eq("UPDATE_USER_ROLE"), anyString());
    }

    @Test
    @DisplayName("Should find user by email address")
    void shouldFindUserByEmail() {
        when(userRepository.findByEmail("existing@example.com")).thenReturn(Optional.of(existingUser));

        Optional<User> found = userService.findByEmail("existing@example.com");

        assertTrue(found.isPresent(), "User should be found");
        assertEquals("Existing User", found.get().getFullName());
    }
}
