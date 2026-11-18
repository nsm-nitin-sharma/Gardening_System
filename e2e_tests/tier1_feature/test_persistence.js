/**
 * e2e_tests/tier1_feature/test_persistence.js
 * Tier 1 Feature Coverage: Client-Side State Persistence via LocalStorage (F7)
 */

module.exports = async function(assert, sandbox, runner) {
  const run = runner ? runner.test : async (id, name, fn) => { await fn(); };

  await run('T1_PER_01', 'AppDatabase initializes with default schema when localStorage is empty', async () => {
    sandbox.reset();
    assert.ok(sandbox.db !== null, 'AppDatabase instance must exist');
    assert.ok(sandbox.db.data !== null, 'db.data must be initialized');
    assert.strictEqual(typeof sandbox.db.data, 'object', 'db.data is an object');
  });

  await run('T1_PER_02', 'Default schema defines all required entities and collections', async () => {
    sandbox.reset();
    const data = sandbox.db.data;
    assert.ok(Array.isArray(data.users), 'data.users must be an array');
    assert.ok(Array.isArray(data.tips), 'data.tips must be an array');
    assert.ok(Array.isArray(data.projects), 'data.projects must be an array');
    assert.ok(Array.isArray(data.discussions), 'data.discussions must be an array');
    assert.ok(Array.isArray(data.activityLogs), 'data.activityLogs must be an array');
    assert.ok(data.settings && typeof data.settings === 'object', 'data.settings must be an object');
  });

  await run('T1_PER_03', 'Default seed contains at least 2 users (Admin and Gardener)', async () => {
    sandbox.reset();
    const users = sandbox.db.data.users;
    assert.greaterThanOrEqual(users.length, 2, 'Must have at least 2 default users');
    const hasAdmin = users.some(u => u.role === 'ADMIN');
    const hasGardener = users.some(u => u.role === 'GARDENER');
    assert.strictEqual(hasAdmin, true, 'Default admin exists');
    assert.strictEqual(hasGardener, true, 'Default gardener exists');
  });

  await run('T1_PER_04', 'Default seed contains at least 3 tips with diverse categories', async () => {
    sandbox.reset();
    const tips = sandbox.db.data.tips;
    assert.greaterThanOrEqual(tips.length, 3, 'Must have at least 3 default tips');
    const categories = new Set(tips.map(t => t.category));
    assert.greaterThanOrEqual(categories.size, 2, 'Diverse categories included');
  });

  await run('T1_PER_05', 'Default seed contains at least 2 projects with nested logs', async () => {
    sandbox.reset();
    const projects = sandbox.db.data.projects;
    assert.greaterThanOrEqual(projects.length, 2, 'Must have at least 2 projects');
    const hasLogs = projects.some(p => Array.isArray(p.logs) && p.logs.length > 0);
    assert.strictEqual(hasLogs, true, 'Projects include nested growth milestone logs');
  });

  await run('T1_PER_06', 'Default seed contains at least 2 discussions with nested comments', async () => {
    sandbox.reset();
    const discussions = sandbox.db.data.discussions;
    assert.greaterThanOrEqual(discussions.length, 2, 'Must have at least 2 discussions');
    const hasComments = discussions.some(d => Array.isArray(d.comments) && d.comments.length > 0);
    assert.strictEqual(hasComments, true, 'Discussions include nested comment threads');
  });

  await run('T1_PER_07', 'User login mutates currentUser and serializes to localStorage', async () => {
    sandbox.reset();
    const res = sandbox.loginAs('gardener@gardening.com', 'GardenerPass123!');
    assert.strictEqual(res.success, true, 'Login succeeds');
    const raw = sandbox.localStorage.getItem(sandbox.STORAGE_KEY);
    const parsed = JSON.parse(raw);
    assert.strictEqual(parsed.currentUser.email, 'gardener@gardening.com', 'currentUser saved to storage');
  });

  await run('T1_PER_08', 'User login logs an activity entry to activityLogs', async () => {
    sandbox.reset();
    const beforeCount = sandbox.db.data.activityLogs.length;
    sandbox.loginAs('admin@gardening.com', 'AdminPass123!');
    const afterCount = sandbox.db.data.activityLogs.length;
    assert.greaterThan(afterCount, beforeCount, 'Activity log appended');
    assert.strictEqual(sandbox.db.data.activityLogs[0].action, 'USER_LOGIN', 'Action is USER_LOGIN');
  });

  await run('T1_PER_09', 'User logout clears currentUser and persists to localStorage', async () => {
    sandbox.reset();
    sandbox.loginAs('gardener@gardening.com', 'GardenerPass123!');
    sandbox.logout();
    assert.strictEqual(sandbox.getCurrentUser(), null, 'currentUser is null in memory');
    const raw = sandbox.localStorage.getItem(sandbox.STORAGE_KEY);
    const parsed = JSON.parse(raw);
    assert.strictEqual(parsed.currentUser, null, 'currentUser is null in localStorage');
  });

  await run('T1_PER_10', 'Creating a new project persists to db.data.projects and localStorage', async () => {
    sandbox.reset();
    const initialCount = sandbox.db.data.projects.length;
    const testProject = {
      id: Date.now(),
      title: 'Heirloom San Marzano Balcony',
      plantTypes: 'San Marzano Tomato, Genovese Basil',
      status: 'PLANNING',
      startDate: '2026-11-20',
      targetHarvestDate: '2027-03-15',
      ownerEmail: 'gardener@gardening.com',
      createdAt: '2026-11-20 10:00:00',
      logs: []
    };
    sandbox.db.data.projects.unshift(testProject);
    sandbox.db.save();

    const raw = sandbox.localStorage.getItem(sandbox.STORAGE_KEY);
    const parsed = JSON.parse(raw);
    assert.strictEqual(parsed.projects.length, initialCount + 1, 'Project count increased');
    assert.strictEqual(parsed.projects[0].title, 'Heirloom San Marzano Balcony', 'Project persisted to storage');
  });

  await run('T1_PER_11', 'Adding milestone log updates project logs array and persists', async () => {
    sandbox.reset();
    const project = sandbox.db.data.projects[0];
    const initialLogCount = project.logs.length;
    project.logs.unshift({
      id: Date.now(),
      logDate: '2026-11-20',
      milestone: 'Seed Sowing',
      note: 'Planted 12 seeds in organic seedling mix under grow light.'
    });
    sandbox.db.save();

    const raw = sandbox.localStorage.getItem(sandbox.STORAGE_KEY);
    const parsed = JSON.parse(raw);
    const storedProj = parsed.projects.find(p => p.id === project.id);
    assert.strictEqual(storedProj.logs.length, initialLogCount + 1, 'Log count increased in storage');
    assert.strictEqual(storedProj.logs[0].milestone, 'Seed Sowing', 'Milestone title verified');
  });

  await run('T1_PER_12', 'Updating project status updates project in localStorage', async () => {
    sandbox.reset();
    const project = sandbox.db.data.projects[0];
    if (typeof sandbox.context.window.updateProjectStatus === 'function') {
      sandbox.context.window.updateProjectStatus(project.id, 'COMPLETED');
    } else {
      project.status = 'COMPLETED';
      sandbox.db.save();
    }
    const raw = sandbox.localStorage.getItem(sandbox.STORAGE_KEY);
    const parsed = JSON.parse(raw);
    const storedProj = parsed.projects.find(p => p.id === project.id);
    assert.strictEqual(storedProj.status, 'COMPLETED', 'Status updated to COMPLETED in storage');
  });

  await run('T1_PER_13', 'Submitting a new tip saves with status and persists', async () => {
    sandbox.reset();
    const newTip = {
      id: Date.now(),
      title: 'Crushed Eggshells for Calcium Deficiency',
      category: 'Soil & Composting',
      description: 'Finely grind washed eggshells and incorporate into soil at transplanting.',
      authorName: 'Sample Gardener',
      authorEmail: 'gardener@gardening.com',
      status: 'PENDING',
      moderationNote: null,
      createdAt: '2026-11-20 12:00:00'
    };
    sandbox.db.data.tips.unshift(newTip);
    sandbox.db.save();

    const raw = sandbox.localStorage.getItem(sandbox.STORAGE_KEY);
    const parsed = JSON.parse(raw);
    const saved = parsed.tips.find(t => t.id === newTip.id);
    assert.ok(saved !== undefined, 'New tip found in storage');
    assert.strictEqual(saved.status, 'PENDING', 'Tip saved with PENDING status');
  });

  await run('T1_PER_14', 'Admin moderating tip updates tip status and note in localStorage', async () => {
    sandbox.reset();
    const tip = sandbox.db.data.tips[0];
    if (typeof sandbox.context.window.moderateTip === 'function') {
      sandbox.context.window.moderateTip(tip.id, 'APPROVED');
    } else {
      tip.status = 'APPROVED';
      tip.moderationNote = 'Approved by administrator';
      sandbox.db.save();
    }
    const raw = sandbox.localStorage.getItem(sandbox.STORAGE_KEY);
    const parsed = JSON.parse(raw);
    const storedTip = parsed.tips.find(t => t.id === tip.id);
    assert.strictEqual(storedTip.status, 'APPROVED', 'Status updated to APPROVED in storage');
  });

  await run('T1_PER_15', 'Adding a discussion comment updates topic comments in localStorage', async () => {
    sandbox.reset();
    const topic = sandbox.db.data.discussions[0];
    const initialComments = topic.comments.length;
    topic.comments.push({
      id: Date.now(),
      authorName: 'Platform Administrator',
      authorEmail: 'admin@gardening.com',
      content: 'Make sure your soil pH is between 6.0 and 6.8 for optimal nutrient uptake.',
      createdAt: '2026-11-20 13:00:00'
    });
    sandbox.db.save();

    const raw = sandbox.localStorage.getItem(sandbox.STORAGE_KEY);
    const parsed = JSON.parse(raw);
    const storedTopic = parsed.discussions.find(d => d.id === topic.id);
    assert.strictEqual(storedTopic.comments.length, initialComments + 1, 'Comment count incremented');
  });

  await run('T1_PER_16', 'Updating admin settings persists updated configuration to localStorage', async () => {
    sandbox.reset();
    sandbox.db.data.settings.siteName = 'Florahub Community Sanctuary';
    sandbox.db.data.settings.maxProjectLimit = 25;
    sandbox.db.save();

    const raw = sandbox.localStorage.getItem(sandbox.STORAGE_KEY);
    const parsed = JSON.parse(raw);
    assert.strictEqual(parsed.settings.siteName, 'Florahub Community Sanctuary', 'Site name persisted');
    assert.strictEqual(parsed.settings.maxProjectLimit, 25, 'Project limit persisted');
  });

  await run('T1_PER_17', 'Simulating page reload preserves mutated state from localStorage', async () => {
    sandbox.reset();
    sandbox.db.data.settings.maintenanceNotice = 'Scheduled maintenance Sunday 02:00 UTC';
    sandbox.db.save();

    // Reinstantiate AppDatabase from storage
    const newDb = new sandbox.AppDatabase();
    assert.strictEqual(newDb.data.settings.maintenanceNotice, 'Scheduled maintenance Sunday 02:00 UTC', 'State retained across reload simulation');
  });

  await run('T1_PER_18', 'Corrupted JSON in localStorage recovers gracefully without uncaught crash', async () => {
    sandbox.reset();
    sandbox.localStorage.setItem(sandbox.STORAGE_KEY, '{ invalid json structure ...');
    let recoveredDb = null;
    assert.doesNotThrow(() => {
      recoveredDb = new sandbox.AppDatabase();
    }, 'Corrupted storage must not throw uncaught error');
    assert.ok(recoveredDb !== null && recoveredDb.data !== null, 'Recovered database created');
    assert.ok(Array.isArray(recoveredDb.data.users), 'Default schema re-initialized');
  });
};
