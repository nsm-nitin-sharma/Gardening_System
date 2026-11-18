/**
 * e2e_tests/tier1_feature/test_backend_integrity.js
 * Tier 1 Feature Coverage: Spring Boot Backend & Template Integrity (F8, F9, F12, F13, F14, F15, F16, F17, F18)
 */

module.exports = async function(assert, sandbox, runner) {
  const run = runner ? runner.test : async (id, name, fn) => { await fn(); };

  await run('T1_BE_01', 'application.properties specifies H2 file-based storage path ./data/gardening_db', async () => {
    const props = sandbox.readWorkspaceFile('src/main/resources/application.properties');
    assert.includes(props, 'jdbc:h2:file:./data/gardening_db', 'Datasource must point to ./data/gardening_db');
  });

  await run('T1_BE_02', 'application.properties specifies DB_CLOSE_ON_EXIT=FALSE for persistence retention', async () => {
    const props = sandbox.readWorkspaceFile('src/main/resources/application.properties');
    assert.includes(props, 'DB_CLOSE_ON_EXIT=FALSE', 'Must retain database on exit');
  });

  await run('T1_BE_03', 'application.properties specifies org.h2.Driver and H2Dialect', async () => {
    const props = sandbox.readWorkspaceFile('src/main/resources/application.properties');
    assert.includes(props, 'org.h2.Driver', 'Driver must be H2');
    assert.includes(props, 'org.hibernate.dialect.H2Dialect', 'Dialect must be H2');
  });

  await run('T1_BE_04', 'application.properties specifies ddl-auto=update for schema retention', async () => {
    const props = sandbox.readWorkspaceFile('src/main/resources/application.properties');
    assert.includes(props, 'spring.jpa.hibernate.ddl-auto=update', 'ddl-auto must be update to preserve data');
  });

  await run('T1_BE_05', 'application.properties datasource configuration format validity', async () => {
    const props = sandbox.readWorkspaceFile('src/main/resources/application.properties');
    assert.match(props, /spring\.datasource\.url=jdbc:h2:file:/, 'Valid H2 URL structure');
  });

  await run('T1_BE_06', 'All 22 Thymeleaf template files exist in src/main/resources/templates/', async () => {
    const expectedTemplates = [
      'index.html',
      'fragments/layout.html',
      'auth/login.html',
      'auth/register.html',
      'admin/activity-logs.html',
      'admin/dashboard.html',
      'admin/moderation-panel.html',
      'admin/settings-panel.html',
      'admin/users-list.html',
      'gardener/dashboard.html',
      'gardener/discussion-form.html',
      'gardener/my-tips.html',
      'gardener/planting-calendar.html',
      'gardener/profile.html',
      'gardener/project-detail.html',
      'gardener/project-form.html',
      'gardener/projects-list.html',
      'gardener/submit-tip.html',
      'public/discussion-detail.html',
      'public/discussions-list.html',
      'public/tip-detail.html',
      'public/tips-list.html'
    ];

    expectedTemplates.forEach(t => {
      const content = sandbox.readWorkspaceFile(`src/main/resources/templates/${t}`);
      assert.ok(content.length > 50, `Template ${t} must exist and have content`);
    });
  });

  await run('T1_BE_07', 'fragments/layout.html defines required Thymeleaf layout fragments', async () => {
    const layout = sandbox.readWorkspaceFile('src/main/resources/templates/fragments/layout.html');
    assert.includes(layout, 'th:fragment="header-head(title)"', 'header-head fragment defined');
    assert.includes(layout, 'th:fragment="navbar"', 'navbar fragment defined');
    assert.includes(layout, 'th:fragment="footer"', 'footer fragment defined');
    assert.includes(layout, 'th:fragment="theme-script"', 'theme-script fragment defined');
  });

  await run('T1_BE_08', 'admin/dashboard.html defines metric icon warning with SVG vector markup', async () => {
    const tpl = sandbox.readWorkspaceFile('src/main/resources/templates/admin/dashboard.html');
    assert.match(tpl, /class=["']metric-icon warning["'][\s\S]*?<svg[\s\S]*?<\/svg>/i, 'Metric icon warning contains SVG element');
  });

  await run('T1_BE_09', 'admin/dashboard.html defines all 3 administrative metric cards', async () => {
    const tpl = sandbox.readWorkspaceFile('src/main/resources/templates/admin/dashboard.html');
    assert.includes(tpl, 'th:text="${totalUsers}"', 'Total Users metric present');
    assert.includes(tpl, 'th:text="${pendingTips}"', 'Pending Moderation metric present');
    assert.includes(tpl, 'th:text="${approvedTips}"', 'Approved Tips metric present');
  });

  await run('T1_BE_10', 'admin/users-list.html defines user accounts table and actions', async () => {
    const tpl = sandbox.readWorkspaceFile('src/main/resources/templates/admin/users-list.html');
    assert.includes(tpl, 'th:each="user', 'User accounts iteration present');
    assert.includes(tpl, 'update-role', 'Role update action present');
    assert.includes(tpl, 'toggle-status', 'Status toggle action present');
  });

  await run('T1_BE_11', 'admin/moderation-panel.html defines moderation queue and note form', async () => {
    const tpl = sandbox.readWorkspaceFile('src/main/resources/templates/admin/moderation-panel.html');
    assert.includes(tpl, 'th:each="tip', 'Tips moderation iteration present');
    assert.includes(tpl, 'moderationNote', 'Moderation note input field present');
  });

  await run('T1_BE_12', 'admin/settings-panel.html defines system configuration inputs', async () => {
    const tpl = sandbox.readWorkspaceFile('src/main/resources/templates/admin/settings-panel.html');
    assert.includes(tpl, 'th:action="@{/admin/settings/update}"', 'Settings update action present');
  });

  await run('T1_BE_13', 'gardener/dashboard.html defines gardener summary metrics and tables', async () => {
    const tpl = sandbox.readWorkspaceFile('src/main/resources/templates/gardener/dashboard.html');
    assert.includes(tpl, 'th:text="${projectsCount}"', 'Active projects count metric present');
    assert.includes(tpl, 'th:text="${tipsCount}"', 'Tips count metric present');
  });

  await run('T1_BE_14', 'gardener/planting-calendar.html defines 12-month matrix and legend', async () => {
    const tpl = sandbox.readWorkspaceFile('src/main/resources/templates/gardener/planting-calendar.html');
    assert.ok(tpl.includes('calendar-table') || tpl.includes('matrix-table'), 'Calendar matrix table present');
    assert.includes(tpl, 'legend', 'Calendar legend present');
  });

  await run('T1_BE_15', 'public/tips-list.html and public/tip-detail.html exist with clean template structure', async () => {
    const list = sandbox.readWorkspaceFile('src/main/resources/templates/public/tips-list.html');
    const detail = sandbox.readWorkspaceFile('src/main/resources/templates/public/tip-detail.html');
    assert.includes(list, 'th:each="tip', 'Tips list template iterates tips');
    assert.includes(detail, 'th:text="${tip.title}"', 'Tip detail displays title');
  });

  await run('T1_BE_16', 'start-app.bat references %~dp0 to anchor script directory', async () => {
    const bat = sandbox.readWorkspaceFile('start-app.bat');
    assert.includes(bat, '%~dp0', 'Launcher references %~dp0 to anchor relative paths');
  });

  await run('T1_BE_17', 'start-app.bat checks Java availability and verifies build %ERRORLEVEL%', async () => {
    const bat = sandbox.readWorkspaceFile('start-app.bat');
    assert.includes(bat, 'java -version', 'Checks Java installation');
    assert.includes(bat, '%ERRORLEVEL%', 'Checks process errorlevel');
  });

  await run('T1_BE_18', 'UserService.java contains deleteUser method with administrative audit logging', async () => {
    const java = sandbox.readWorkspaceFile('src/main/java/com/gardening/community/service/UserService.java');
    assert.includes(java, 'deleteUser', 'UserService defines deleteUser method');
    assert.includes(java, 'activityLogService.logActivity', 'UserService logs activity on user deletion');
  });
};
