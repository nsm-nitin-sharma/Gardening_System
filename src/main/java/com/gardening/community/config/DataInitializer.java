package com.gardening.community.config;

import com.gardening.community.model.*;
import com.gardening.community.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Optional;

/**
 * Initializes default system data including default administrator, gardener, system settings,
 * and sample community content upon application startup.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TipRepository tipRepository;
    private final DiscussionTopicRepository discussionTopicRepository;
    private final DiscussionCommentRepository discussionCommentRepository;
    private final GardeningProjectRepository projectRepository;
    private final ProjectLogRepository projectLogRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final ActivityLogRepository activityLogRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           TipRepository tipRepository,
                           DiscussionTopicRepository discussionTopicRepository,
                           DiscussionCommentRepository discussionCommentRepository,
                           GardeningProjectRepository projectRepository,
                           ProjectLogRepository projectLogRepository,
                           SystemSettingRepository systemSettingRepository,
                           ActivityLogRepository activityLogRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tipRepository = tipRepository;
        this.discussionTopicRepository = discussionTopicRepository;
        this.discussionCommentRepository = discussionCommentRepository;
        this.projectRepository = projectRepository;
        this.projectLogRepository = projectLogRepository;
        this.systemSettingRepository = systemSettingRepository;
        this.activityLogRepository = activityLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        initializeSystemSettings();
        User admin = initializeUsers();
        User gardener = userRepository.findByEmail("gardener@gardening.com").orElse(null);

        if (gardener != null) {
            initializeSampleContent(admin, gardener);
        }
    }

    private void initializeSystemSettings() {
        createSettingIfAbsent("SITE_NAME", "Gardening Community Hub", "Official platform title displayed across headers");
        createSettingIfAbsent("ALLOW_REGISTRATION", "TRUE", "Controls whether new user registrations are permitted");
        createSettingIfAbsent("AUTO_APPROVE_TIPS", "FALSE", "Toggles automatic approval for submitted tips");
        createSettingIfAbsent("MAX_PROJECTS_PER_USER", "10", "Maximum active gardening projects allowed per gardener");
        createSettingIfAbsent("ANNOUNCEMENT_BANNER", "Welcome to the Gardening Community Platform! Share your garden progress and tips today.", "Global announcement notice text");
    }

    private void createSettingIfAbsent(String key, String value, String desc) {
        Optional<SystemSetting> existing = systemSettingRepository.findBySettingKey(key);
        if (existing.isEmpty()) {
            systemSettingRepository.save(new SystemSetting(key, value, desc));
        }
    }

    private User initializeUsers() {
        User admin = userRepository.findByEmail("admin@gardening.com").orElse(null);
        if (admin == null) {
            admin = new User();
            admin.setFullName("Platform Administrator");
            admin.setEmail("admin@gardening.com");
            admin.setPassword(passwordEncoder.encode("AdminPass123!"));
            admin.setRole(Role.ROLE_ADMIN);
            admin.setBio("System Administrator overseeing community safety, moderation, and user management.");
            admin.setGardeningExperience("Master Gardener");
            admin.setLocation("Central Hub");
            admin.setActive(true);
            admin = userRepository.save(admin);

            activityLogRepository.save(new ActivityLog("SYSTEM", "USER_SEED", "Default administrator account initialized."));
        }

        User gardener = userRepository.findByEmail("gardener@gardening.com").orElse(null);
        if (gardener == null) {
            gardener = new User();
            gardener.setFullName("Green Thumb User");
            gardener.setEmail("gardener@gardening.com");
            gardener.setPassword(passwordEncoder.encode("GardenerPass123!"));
            gardener.setRole(Role.ROLE_GARDENER);
            gardener.setBio("Passionate organic urban gardener specializing in heirloom tomatoes, culinary herbs, and microgreens.");
            gardener.setGardeningExperience("Intermediate (5 years)");
            gardener.setLocation("Pacific Northwest Zone 8b");
            gardener.setActive(true);
            userRepository.save(gardener);

            activityLogRepository.save(new ActivityLog("SYSTEM", "USER_SEED", "Default gardener demonstration account initialized."));
        }

        return admin;
    }

    private void initializeSampleContent(User admin, User gardener) {
        if (tipRepository.count() == 0) {
            Tip tip1 = new Tip(
                    "Companion Planting: Basil and Tomatoes",
                    "Vegetables & Herbs",
                    "Planting basil next to heirloom tomatoes improves crop yield and naturally deters pests such as hornworms and thrips. Ensure both receive at least 6 hours of full sunlight daily.",
                    "https://images.unsplash.com/photo-1592417817098-8f3d6eb19655?w=600",
                    gardener,
                    TipStatus.APPROVED
            );
            tipRepository.save(tip1);

            Tip tip2 = new Tip(
                    "Organic Soil Enrichment with Vermicomposting",
                    "Soil & Fertilization",
                    "Adding red wiggler worm castings to your potted plants provides balanced nitrogen, phosphorus, and microbial health without chemical fertilizer burn.",
                    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600",
                    gardener,
                    TipStatus.APPROVED
            );
            tipRepository.save(tip2);

            Tip tip3 = new Tip(
                    "Preventing Root Rot in Indoor Succulents",
                    "Indoor Gardening",
                    "Always use terra cotta pots with drainage holes and a well-draining cactus mix. Water thoroughly only when the top 2 inches of soil feel bone dry.",
                    "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600",
                    gardener,
                    TipStatus.PENDING
            );
            tipRepository.save(tip3);
        }

        if (discussionTopicRepository.count() == 0) {
            DiscussionTopic topic = new DiscussionTopic(
                    "Best natural methods to deter aphids on balcony peppers?",
                    "Pest Management",
                    "My Bell Pepper leaves are starting to curl and I noticed tiny green aphids on the undersides. I want to avoid synthetic pesticides. What neem oil or insecticidal soap sprays work best?",
                    gardener,
                    TipStatus.APPROVED
            );
            discussionTopicRepository.save(topic);

            DiscussionComment comment1 = new DiscussionComment(
                    topic,
                    admin,
                    "A mild solution of 1 teaspoon cold-pressed Neem oil + 1/2 teaspoon organic liquid soap diluted in 1 quart of warm water works wonders! Spray early morning or late evening."
            );
            discussionCommentRepository.save(comment1);
        }

        if (projectRepository.count() == 0) {
            GardeningProject project = new GardeningProject(
                    "Spring Raised Bed Organic Vegetable Patch",
                    "Building a 4x8 ft raised garden bed with custom soil blend for summer harvesting.",
                    "Cherokee Purple Tomatoes, Sweet Basil, French Radishes, Early Girl Carrots",
                    ProjectStatus.IN_PROGRESS,
                    gardener,
                    LocalDate.now().minusDays(14),
                    LocalDate.now().plusDays(45)
            );
            projectRepository.save(project);

            ProjectLog log1 = new ProjectLog(
                    project,
                    LocalDate.now().minusDays(14),
                    "Constructed cedar raised bed frames and filled with 50/50 compost and topsoil mixture.",
                    "Bed Construction Completed"
            );
            projectLogRepository.save(log1);

            ProjectLog log2 = new ProjectLog(
                    project,
                    LocalDate.now().minusDays(7),
                    "Transplanted tomato seedlings and sowed radish seeds directly into soil rows.",
                    "Seedlings Planted"
            );
            projectLogRepository.save(log2);
        }
    }
}
