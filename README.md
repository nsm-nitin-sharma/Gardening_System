# FloraHub - Online Gardening Community Platform

A modern, full-stack horticultural community platform built for academic evaluation, featuring a live **Firebase Cloud Firestore** real-time data engine, a **serverless client-side architecture**, and a preserved **Java 21 / Spring Boot 3 enterprise core** with 27 automated unit tests.

[![GitHub Repository](https://img.shields.io/badge/GitHub-Gardening__System-181717?style=flat&logo=github)](https://github.com/nsm-nitin-sharma/Gardening_System)
[![Cloud Database](https://img.shields.io/badge/Database-Firebase%20Firestore-FFA611?style=flat&logo=firebase)](https://firebase.google.com/)
[![Java Version](https://img.shields.io/badge/Java-21-007396?style=flat&logo=java)](https://jdk.java.net/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-6DB33F?style=flat&logo=springboot)](https://spring.io/projects/spring-boot)

---

## Project Evolution: Phase 1 vs. Phase 2

### Phase 1 Foundation (Java Enterprise Core)
- **Traditional Server Architecture**: Developed using Java 21, Spring Boot 3.2.5 (Spring MVC, Spring Data JPA, Spring Security), and Thymeleaf HTML5 templates.
- **Background Service Dependency**: Required running internal background server processes (Tomcat, Spring Boot runtime) and an embedded file-based H2 database (`jdbc:h2:file:./data/gardening_db`) to access and run the platform.
- **Enterprise Test Suite**: 27 unit tests developed with JUnit 5 and Mockito covering service business logic, data validation, and moderation workflows.

---

### Phase 2 Architecture & Feature Enhancements
- **Seamless Zero-Background-Service Execution**: Before, our system required turning on Spring Boot or background server processes to run the application; now our website is fully functional directly in the browser (`index.html`) without turning on anything in the background, making it completely seamless and instant for users. *(The complete Java 21 Spring Boot core & 27 unit tests remain preserved for enterprise evaluation).*
- **Real-Time Core Database (Firebase Cloud Firestore)**: Migrated core data management to Google Firebase Cloud Firestore (`florahub-6a9ea`). The system updates live in real time whenever any new data is written—tips, projects, discussions, and users synchronize instantly across all open browser windows and devices without page refreshes.
- **Premium UI/UX Redesign**: Revamped the entire interface into a bespoke, minimal, and fully responsive botanical aesthetic with refined typography, tactile micro-interactions, non-blocking toast alerts, and strictly enforced single-line navigation layouts.
- **Theme Support (Dark & Light Mode)**: Implemented dynamic Dark and Light theme toggles with local storage persistence and zero-flicker pre-paint script execution.
- **Firebase Authentication**: Integrated secure Email/Password registration and login workflows, accompanied by automated 1-Click evaluation demo access for Gardener and Admin accounts.

---

## Key Modules & Platform Features

### 1. Gardener Module
- **Dashboard Overview**: Metrics tracking active gardening projects, submitted community tips, and quick access links.
- **Profile Management**: Customize bio, gardening experience level (Beginner to Master Gardener), location, and climate growing zone.
- **Tip Sharing System**: Share tips with Title, Category, Description, and Photo URL. Real-time status tracking (`PENDING`, `APPROVED`, `REJECTED`).
- **Gardening Project Tracker**: Personal garden plot and container tracking board. Track plant varieties, set statuses (`PLANNING`, `IN_PROGRESS`, `COMPLETED`), and record progress observation logs and milestones.
- **Community Forum**: Participate in topic discussions (Pest Management, Soil & Composting, Indoor Plants), ask questions, and reply to community threads with live synchronization.
- **Seasonal Planting Calendar**: Interactive 12-month cultivation matrix covering 15 plant varieties with color-coded indoor sowing, outdoor transplanting, and peak harvest windows.

### 2. Admin Module
- **Admin Dashboard**: System metric cards (Total Users, Pending Moderation Queue, Approved Tips) and quick moderation list.
- **User Management**: View registered accounts, toggle user active/disabled status, update roles, and manage platform permissions.
- **Content Moderation Panel**: Review pending user-submitted tips before public publishing; approve or reject content with reason feedback logging.
- **System Settings Configuration**: Dynamic configuration for site title, user registration status, tip auto-approval toggles, max project limits, and global announcements.
- **Activity Audit Log**: Complete timestamped security log recording all user registrations, profile updates, and admin actions.

---

## Technology Stack

| Layer | Phase 1 (Enterprise Backend) | Phase 2 (Live Cloud & Frontend) |
| :--- | :--- | :--- |
| **Runtime / Platform** | Java 21 (OpenJDK), Spring Boot 3.2.5 | Modern Browser (Zero-Server Standalone) |
| **Database** | Persistent H2 File Database | Google Firebase Cloud Firestore (Live Real-Time Sync) |
| **Authentication** | Spring Security (BCrypt) | Firebase Email/Password Auth + 1-Click Evaluation Access |
| **UI & Styling** | Thymeleaf Templates | Bespoke Botanical CSS System, Dark/Light Themes, Single-Line Navbar |
| **Testing** | 27 JUnit 5 & Mockito Unit Tests | 249 Automated Verification & Boundary Specs |

---

## How to Run the Project

### Option A: Modern Standalone Client (Recommended for Quick Testing)
Simply double-click **`index.html`** or open it in any modern browser:
```
file:///path/to/java_project/index.html
```
- Operates immediately without launching any background processes or local servers.
- Automatically connects to live Firebase Cloud Firestore for real-time synchronization.

### Option B: Java 21 Spring Boot Enterprise Core
If evaluating the traditional Java backend and H2 database:
```cmd
start-app.bat
```
or via Maven:
```powershell
.\mvnw.cmd spring-boot:run
```
Then navigate to: **`http://localhost:8080`**

### Running the Automated Unit Test Suite
To execute all 27 Java unit tests and verify 100% pass rate:
```powershell
.\mvnw.cmd test
```

---

## Demo Credentials for Evaluation

The platform features instant 1-Click access buttons on the Sign In page for rapid evaluation:

| User Type | Email | Password | Role | Access Type |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin@gardening.com` | `AdminPass123!` | `ROLE_ADMIN` | 1-Click Demo / Direct Login |
| **Gardener** | `gardener@gardening.com` | `GardenerPass123!` | `ROLE_GARDENER` | 1-Click Demo / Direct Login |

---

## Teamwork & Collaboration

The project reflects multi-author collaborative development across all 4 teammates. Full roles, responsibilities, and code ownership are documented in [`CONTRIBUTORS.md`](CONTRIBUTORS.md):
- **Nitin Sharma**: Team Lead, Project Architecture, Security Module, Database Design
- **LAV Chaudhary**: Gardener Dashboard, Profile Management, Project Tracker
- **Bhavya Jha**: Admin Portal, User Management, Content Moderation
- **Yatin Chaudhary**: Community Features, Tips System, Discussion Forum

---

## Academic Credits & Submission
Developed for academic college project evaluation adhering strictly to object-oriented software engineering principles, modular layered design, and modern real-time cloud patterns.
