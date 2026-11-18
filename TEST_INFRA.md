# E2E Test Infra: Online Gardening Community Platform

## Test Philosophy
- **Requirement-Driven & Opaque-Box**: All test cases are derived strictly from user requirements in `ORIGINAL_REQUEST.md` and acceptance criteria across client UI/UX, authenticated gardener/admin panels, and backend persistence. Verification treats system modules as opaque boxes exercising external interfaces (DOM, localStorage, file:// assets, HTTP routes, and physical database files).
- **Methodology**: Systematic 4-tier design utilizing Category-Partition testing, Boundary Value Analysis (BVA), Pairwise Combinatorial testing, and Real-World Workload simulations.
- **Progressive Testability**: Verification does not rely on complex external dependencies; tests run offline via standard Node.js and Maven test harnesses.
- **Deterministic & Repeatable**: Test execution produces zero side-effects on development data and yields consistent exit code 0 when all tests pass.

---

## Feature Inventory Coverage Matrix
| # | Feature | Source (Requirement) | Tier 1 (Coverage) | Tier 2 (Boundary) | Tier 3 (Pairwise) | Tier 4 (Workloads) |
|---|---------|----------------------|:-----------------:|:-----------------:|:-----------------:|:------------------:|
| 1 | Standalone file:// Zero-Dependency Execution | ORIGINAL_REQUEST §R1 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 2 | Interactive Visual Onboarding Walkthrough | ORIGINAL_REQUEST §R1 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 3 | Professional SVG Vector Iconography | ORIGINAL_REQUEST §R1 | ≥5 tests | ≥5 tests | ✓ | — |
| 4 | Bespoke Botanical Client Styling & Tactile Depth | ORIGINAL_REQUEST §R1 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 5 | Mobile Responsive Navigation Header | ORIGINAL_REQUEST §R1 | ≥5 tests | ≥5 tests | ✓ | — |
| 6 | Non-Blocking Botanical Toast Notifications | ORIGINAL_REQUEST §R1 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 7 | Client-Side State Persistence (localStorage) | ORIGINAL_REQUEST §R3 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 8 | Thymeleaf Layout & Botanical Design System | ORIGINAL_REQUEST §R2 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 9 | Corrupted SVG Path Correction | Survey 2 & PROJECT.md | ≥5 tests | ≥5 tests | — | — |
| 10 | Strict Emoji & Character Entity Cleanliness | ORIGINAL_REQUEST §R1 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 11 | Dark Mode Contrast & Inline Style Removal | ORIGINAL_REQUEST §R2 | ≥5 tests | ≥5 tests | ✓ | — |
| 12 | Premium Gardener Dashboard (Thymeleaf) | ORIGINAL_REQUEST §R2 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 13 | Premium Admin Management Portal (Thymeleaf) | ORIGINAL_REQUEST §R2 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 14 | Public Index Onboarding Section (Thymeleaf) | ORIGINAL_REQUEST §R1 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 15 | H2 Database Concurrency Configuration | ORIGINAL_REQUEST §R3 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 16 | Defensive Deletion Referential Integrity | ORIGINAL_REQUEST §R3 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 17 | Working Directory Anchoring (`start-app.bat`) | ORIGINAL_REQUEST §R3 | ≥5 tests | ≥5 tests | — | ✓ |
| 18 | Persistent Retention Across Restarts | ORIGINAL_REQUEST §R3 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 19 | E2E Test Suite Infrastructure & Automation | PROJECT.md §19 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 20 | Implementation Final Verification & Hardening | PROJECT.md §20 | ≥5 tests | ≥5 tests | ✓ | ✓ |

---

## Test Architecture

### Test Runner & Invocation
- **Canonical Execution Command**: `node e2e_tests/runner.js`
- **Alternative / CI Invocations**:
  - `node e2e_tests/runner.js --tier=1` (Run Tier 1 only)
  - `node e2e_tests/runner.js --tier=2` (Run Tier 2 only)
  - `node e2e_tests/runner.js --tier=3` (Run Tier 3 only)
  - `node e2e_tests/runner.js --tier=4` (Run Tier 4 only)
- **Exit Code Semantics**:
  - Code `0`: 100% tests passed across all tiers.
  - Code `1`: One or more assertion failures, syntax errors, or timeouts.

### Directory Layout
```
c:\Users\nitin\OneDrive\Documents\java_project\
├── e2e_tests/
│   ├── runner.js                       # Master CLI test runner & reporter
│   ├── harness/
│   │   ├── client_sandbox.js           # Headless DOM & localStorage mock environment
│   │   └── assertion_library.js        # Assertion primitives & reporting formatters
│   ├── tier1_feature/
│   │   ├── test_standalone_client.js   # file://, DOM structure, scripts, styles
│   │   ├── test_onboarding.js          # Onboarding guide steps, triggers, persistence
│   │   ├── test_iconography.js         # SVG icon paths, no character entities
│   │   ├── test_botanical_styling.js   # CSS variables, themes, transitions
│   │   ├── test_persistence.js         # Client localStorage CRUD & recovery
│   │   └── test_backend_integrity.js   # Template validation, H2 config, no-emoji
│   ├── tier2_boundary/
│   │   ├── test_boundary_inputs.js     # Empty inputs, long strings, unicode extremes
│   │   ├── test_boundary_state.js      # Zero items, missing IDs, invalid status
│   │   └── test_security_limits.js     # Role boundaries, deactivated users, limits
│   ├── tier3_pairwise/
│   │   ├── test_gardener_lifecycle.js  # Registration -> Login -> Project -> Log -> Export
│   │   ├── test_tip_moderation.js      # Tip submission -> Admin moderation -> Public view
│   │   └── test_admin_settings.js      # System settings update -> Registration/Public impact
│   └── tier4_realworld/
│       ├── test_gardening_season.js    # Spring-to-Harvest seasonal progression
│       └── test_community_discussions.js # Multi-gardener discussion & audit trail
├── TEST_INFRA.md                       # This specification document
└── TEST_READY.md                       # Test completion certificate
```

---

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Description | Complexity |
|---|----------|--------------------|-------------|------------|
| 1 | Full Gardening Season Lifecycle | F1, F2, F4, F7, F12, F18 | Gardener registers, tours platform, starts "Heritage Tomato Plot", logs 4 seasonal milestones (Seed Sowing, Germination, Flowering, Harvest), verifies progress metrics, and exports project summary. | High |
| 2 | Community Knowledge Sharing & Moderation | F1, F3, F6, F7, F12, F13 | Gardener submits "Compost Tea Brewing" tip; tip is held in pending status; Admin reviews tip in moderation portal, adds moderation feedback, and approves it; tip becomes instantly visible in public catalog with SVG category icon. | High |
| 3 | Platform Maintenance & Access Governance | F7, F13, F15, F16, F18 | Admin disables public registration in System Settings; unregistered visitor attempts registration and is safely blocked; Admin reviews audit log trail verifying every administrative action is captured. | Medium |
| 4 | Offline / Zero-Network Resilience | F1, F3, F4, F5, F7, F10 | Standalone client loads with disconnected network simulation (zero HTTP/CDN calls), tests theme switching, planting calendar navigation, and localStorage persistence across simulated tab restarts. | Medium |
| 5 | Cascade Deletion & Referential Integrity | F7, F13, F15, F16, F18 | Safe deletion of a user account with authored projects and tips without causing orphan crashes or referential integrity constraint violations. | High |

---

## Coverage Thresholds
- **Tier 1 (Feature Coverage)**: ≥5 tests per feature area across all 20 features (≥100 tests).
- **Tier 2 (Boundary & Corner Cases)**: ≥5 boundary/edge tests per feature area (≥100 tests).
- **Tier 3 (Cross-Feature Combinations)**: ≥20 pairwise cross-module integration tests.
- **Tier 4 (Real-World Scenarios)**: ≥5 complete multi-stage user workflows.
- **Total Minimum Target**: ≥225 passing tests with 100% pass rate.
