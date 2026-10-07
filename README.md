# Online Gardening Community Platform

A full-stack, production-grade Java web application built strictly in **Java 21** using **Spring Boot 3**, **Spring Security**, **Spring Data JPA**, **H2 Persistent Database**, and **Thymeleaf HTML5/CSS3**.

The platform provides a collaborative digital space for gardening enthusiasts to share tips, participate in plant care discussions, and track personal gardening projects, while giving administrators full oversight over content moderation, user management, system settings, and audit logs.

[![GitHub Repository](https://img.shields.io/badge/GitHub-Gardening__System-181717?style=flat&logo=github)](https://github.com/nsm-nitin-sharma/Gardening_System)
[![Java Version](https://img.shields.io/badge/Java-21-007396?style=flat&logo=java)](https://jdk.java.net/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-6DB33F?style=flat&logo=springboot)](https://spring.io/projects/spring-boot)

---

## Key Modules & Features

### 1. Gardener Module
- **Dashboard Overview**: Metrics tracking active gardening projects, submitted community tips, and quick access links.
- **Profile Management**: Customize bio, gardening experience level (Beginner to Master Gardener), location, and climate growing zone.
- **Tip Sharing System**: Share tips with Title, Category, Description, and Photo URL. Real-time status tracking (`PENDING`, `APPROVED`, `REJECTED`).
- **Gardening Project Tracker**: Personal garden plot and container tracking board. Track plant varieties, set statuses (`PLANNING`, `IN_PROGRESS`, `HARVESTING`, `COMPLETED`), and record progress observation logs and milestones.
- **Community Forum**: Participate in topic discussions (Pest Management, Soil & Composting, Indoor Plants), ask questions, and reply to community threads.

### 2. Admin Module
- **Admin Dashboard**: System metric cards (Total Users, Pending Moderation Queue, Approved Tips) and quick moderation list.
- **User Management**: View registered accounts, toggle user active/disabled status, update roles (`ROLE_GARDENER` <-> `ROLE_ADMIN`), and perform account deletions.
- **Content Moderation Panel**: Review pending user-submitted tips before public publishing; approve or reject content with reason feedback logging.
- **System Settings Configuration**: Dynamic configuration for site title, user registration status, tip auto-approval toggles, max project limits, and global announcements.
- **Activity Audit Log**: Complete timestamped security log recording all user registrations, profile updates, and admin actions.

---

## Technology Stack

- **Backend Framework**: Java 21 + Spring Boot 3.2.5 (Spring MVC, Spring Data JPA)
- **Security**: Spring Security (Role-based access control, BCrypt password hashing)
- **Database**: H2 Persistent File Database (`jdbc:h2:file:./data/gardening_db`)
- **Frontend**: Thymeleaf HTML5 Templating + Modern Botanical CSS Design System (Glassmorphism UI, Responsive CSS Variables)
- **Build System**: Apache Maven Wrapper (`mvnw.cmd`) for zero-dependency execution

---

## Project Structure & Architecture

```
java_project/
├── pom.xml                                     # Maven build dependencies
├── mvnw.cmd                                    # Windows Maven wrapper launcher
├── .gitignore                                  # Git exclusion configuration
├── README.md                                   # Project documentation
├── src/
│   ├── main/
│   │   ├── java/com/gardening/community/
│   │   │   ├── GardeningApplication.java       # Spring Boot main application entry point
│   │   │   ├── config/                         # SecurityConfig, DataInitializer
│   │   │   ├── controller/                     # PublicController, GardenerController, AdminController
│   │   │   ├── dto/                            # UserRegistrationDto
│   │   │   ├── model/                          # User, Role, Tip, DiscussionTopic, GardeningProject, ProjectLog, SystemSetting, ActivityLog
│   │   │   ├── repository/                     # Spring Data JPA interfaces
│   │   │   ├── security/                       # CustomUserDetailsService & CustomAuthenticationSuccessHandler
│   │   │   └── service/                        # UserService, TipService, DiscussionService, ProjectService, SystemSettingService, ActivityLogService
│   │   └── resources/
│   │       ├── application.properties          # Server & database settings
│   │       ├── static/css/style.css            # Custom CSS stylesheet design system
│   │       └── templates/                      # Thymeleaf HTML layout & pages
│   └── test/java/com/gardening/community/      # Unit & Spring Context integration tests
```

---

## Database Schema Entities

- `User`: Primary user accounts (Full Name, Email, BCrypt Password, Role, Bio, Experience, Location, Status).
- `Tip`: Gardening tips (Title, Category, Description, Image URL, Author, Moderation Status, Moderation Note).
- `DiscussionTopic` & `DiscussionComment`: Community forum discussion threads and responses.
- `GardeningProject` & `ProjectLog`: Gardener plot tracking board, plant varieties, dates, and milestone progress logs.
- `SystemSetting`: Key-value pair platform settings (Site Title, Maintenance Notice, Limits).
- `ActivityLog`: Timestamped audit trail recording security events and administrative actions.

---

## How to Run the Project

### Prerequisites
- **Java 21** installed on system (`java -version`).
- No pre-installed Maven or database required (uses included Maven wrapper and embedded H2 database).

### Command to Start Application
Open PowerShell or Command Prompt in the project folder and run:
```powershell
.\mvnw.cmd spring-boot:run
```

Once started, open your web browser and navigate to:
👉 **`http://localhost:8080`**

---

## Demo Credentials for Evaluation

| User Type | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@gardening.com` | `AdminPass123!` | `ROLE_ADMIN` |
| **Gardener** | `gardener@gardening.com` | `GardenerPass123!` | `ROLE_GARDENER` |

---

## License & Academic Credits

Developed for college project evaluation adhering strictly to Java object-oriented principles, modular layered architecture, and clean coding standards.
