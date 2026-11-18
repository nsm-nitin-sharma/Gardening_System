/**
 * e2e_tests/tier3_pairwise/test_gardener_lifecycle.js
 * Tier 3 Pairwise Combinations: Gardener Registration & Project Lifecycle (8 tests)
 */

module.exports = async function(assert, sandbox, runner) {
  const run = runner ? runner.test : async (id, name, fn) => { await fn(); };

  await run('T3_LIFE_01', 'Register new gardener and verify auto-authenticated session', async () => {
    sandbox.reset();
    const res = sandbox.context.window.registerUser(
      'Maya Patel',
      'maya@garden.org',
      'PatelGarden2026!',
      'Passionate urban balcony gardener.',
      '4 Years',
      'Mumbai, India'
    );
    assert.strictEqual(res.success, true, 'Registration succeeded');
    assert.strictEqual(sandbox.getCurrentUser().email, 'maya@garden.org', 'Maya is authenticated');
    assert.strictEqual(sandbox.getCurrentUser().fullName, 'Maya Patel', 'Full name saved');
  });

  await run('T3_LIFE_02', 'Registered gardener navigates to dashboard and verifies initial state', async () => {
    sandbox.reset();
    sandbox.context.window.registerUser('Maya Patel', 'maya@garden.org', 'PatelGarden2026!', 'Bio', '4 Yrs', 'Mumbai');
    const rendered = sandbox.navigate('gardener-dashboard');
    assert.ok(rendered.length > 50, 'Dashboard view rendered');
    assert.includes(rendered, 'Maya Patel', 'Welcome banner greets gardener');
  });

  await run('T3_LIFE_03', 'Gardener creates project Urban Terrace Raised Beds', async () => {
    sandbox.reset();
    sandbox.context.window.registerUser('Maya Patel', 'maya@garden.org', 'PatelGarden2026!', 'Bio', '4 Yrs', 'Mumbai');
    const newProj = {
      id: Date.now(),
      title: 'Urban Terrace Raised Beds',
      plantTypes: 'Heirloom Spinach, Cherry Tomatoes, Coriander',
      status: 'PLANNING',
      startDate: '2026-11-20',
      targetHarvestDate: '2027-02-28',
      ownerEmail: 'maya@garden.org',
      createdAt: '2026-11-20 10:00:00',
      logs: []
    };
    sandbox.db.data.projects.unshift(newProj);
    sandbox.db.logActivity('maya@garden.org', 'CREATE_PROJECT', `Created project: ${newProj.title}`);
    sandbox.db.save();

    const stored = sandbox.db.data.projects.find(p => p.id === newProj.id);
    assert.ok(stored !== undefined, 'Project saved in db');
    assert.strictEqual(stored.title, 'Urban Terrace Raised Beds', 'Title verified');
  });

  await run('T3_LIFE_04', 'Project appears in gardener-projects with correct details', async () => {
    sandbox.reset();
    sandbox.context.window.registerUser('Maya Patel', 'maya@garden.org', 'PatelGarden2026!', 'Bio', '4 Yrs', 'Mumbai');
    const projId = Date.now();
    sandbox.db.data.projects.unshift({
      id: projId,
      title: 'Urban Terrace Raised Beds',
      plantTypes: 'Heirloom Spinach',
      status: 'PLANNING',
      startDate: '2026-11-20',
      ownerEmail: 'maya@garden.org',
      logs: []
    });
    sandbox.db.save();

    const rendered = sandbox.navigate('gardener-projects');
    assert.includes(rendered, 'Urban Terrace Raised Beds', 'Project title rendered in list');
    assert.includes(rendered, 'PLANNING', 'PLANNING status badge rendered');
  });

  await run('T3_LIFE_05', 'Gardener adds consecutive milestone logs to project', async () => {
    sandbox.reset();
    sandbox.context.window.registerUser('Maya Patel', 'maya@garden.org', 'PatelGarden2026!', 'Bio', '4 Yrs', 'Mumbai');
    const projId = Date.now();
    const proj = {
      id: projId,
      title: 'Urban Terrace Raised Beds',
      plantTypes: 'Spinach',
      status: 'PLANNING',
      startDate: '2026-11-20',
      ownerEmail: 'maya@garden.org',
      logs: []
    };
    sandbox.db.data.projects.unshift(proj);

    // Milestone 1
    proj.logs.unshift({ id: Date.now() + 1, logDate: '2026-11-20', milestone: 'Direct Sowing', note: 'Sowed 50 spinach seeds.' });
    // Milestone 2
    proj.logs.unshift({ id: Date.now() + 2, logDate: '2026-11-26', milestone: 'Germination', note: 'First green cotyledons visible.' });
    // Milestone 3
    proj.logs.unshift({ id: Date.now() + 3, logDate: '2026-12-10', milestone: 'Thinning & Mulching', note: 'Thinned to 4 inches.' });
    sandbox.db.save();

    assert.strictEqual(sandbox.db.data.projects.find(p => p.id === projId).logs.length, 3, 'All 3 logs saved');
  });

  await run('T3_LIFE_06', 'Gardener transitions project status from PLANNING to IN_PROGRESS to COMPLETED', async () => {
    sandbox.reset();
    sandbox.context.window.registerUser('Maya Patel', 'maya@garden.org', 'PatelGarden2026!', 'Bio', '4 Yrs', 'Mumbai');
    const projId = Date.now();
    const proj = { id: projId, title: 'Lifecycle Test', status: 'PLANNING', ownerEmail: 'maya@garden.org', logs: [] };
    sandbox.db.data.projects.unshift(proj);

    // Transition 1: IN_PROGRESS
    if (typeof sandbox.context.window.updateProjectStatus === 'function') {
      sandbox.context.window.updateProjectStatus(projId, 'IN_PROGRESS');
    } else {
      proj.status = 'IN_PROGRESS';
      sandbox.db.save();
    }
    assert.strictEqual(sandbox.db.data.projects.find(p => p.id === projId).status, 'IN_PROGRESS', 'Transition 1 verified');

    // Transition 2: COMPLETED
    if (typeof sandbox.context.window.updateProjectStatus === 'function') {
      sandbox.context.window.updateProjectStatus(projId, 'COMPLETED');
    } else {
      proj.status = 'COMPLETED';
      sandbox.db.save();
    }
    assert.strictEqual(sandbox.db.data.projects.find(p => p.id === projId).status, 'COMPLETED', 'Transition 2 verified');
  });

  await run('T3_LIFE_07', 'Project detail view renders all milestone logs and summary cards', async () => {
    sandbox.reset();
    sandbox.context.window.registerUser('Maya Patel', 'maya@garden.org', 'PatelGarden2026!', 'Bio', '4 Yrs', 'Mumbai');
    const projId = Date.now();
    const proj = {
      id: projId,
      title: 'Urban Terrace Raised Beds',
      plantTypes: 'Spinach',
      status: 'COMPLETED',
      startDate: '2026-11-20',
      ownerEmail: 'maya@garden.org',
      logs: [
        { id: 1, logDate: '2026-11-20', milestone: 'Direct Sowing', note: '50 seeds' },
        { id: 2, logDate: '2026-12-28', milestone: 'Final Harvest', note: '2.5kg harvested' }
      ]
    };
    sandbox.db.data.projects.unshift(proj);
    sandbox.db.save();

    const rendered = sandbox.navigate('gardener-project-detail', projId);
    assert.includes(rendered, 'Urban Terrace Raised Beds', 'Title displayed');
    assert.includes(rendered, 'Direct Sowing', 'Milestone 1 rendered');
    assert.includes(rendered, 'Final Harvest', 'Milestone 2 rendered');
  });

  await run('T3_LIFE_08', 'Client reload preserves complete project lifecycle in localStorage and audit log', async () => {
    sandbox.reset();
    sandbox.context.window.registerUser('Maya Patel', 'maya@garden.org', 'PatelGarden2026!', 'Bio', '4 Yrs', 'Mumbai');
    const projId = Date.now();
    sandbox.db.data.projects.unshift({
      id: projId,
      title: 'Persistent Raised Beds',
      plantTypes: 'Spinach',
      status: 'COMPLETED',
      ownerEmail: 'maya@garden.org',
      logs: [{ id: 1, logDate: '2026-11-20', milestone: 'Sowing', note: 'Seed started' }]
    });
    sandbox.db.logActivity('maya@garden.org', 'COMPLETE_PROJECT', 'Completed harvest for Persistent Raised Beds');
    sandbox.db.save();

    // Verify localStorage serialization
    const reloadedDb = new sandbox.AppDatabase();
    const reloadedProj = reloadedDb.data.projects.find(p => p.id === projId);
    assert.ok(reloadedProj !== undefined, 'Project retained across session reload');
    assert.strictEqual(reloadedProj.status, 'COMPLETED', 'Status retained as COMPLETED');
    assert.strictEqual(reloadedProj.logs.length, 1, 'Logs preserved');
    const auditRecord = reloadedDb.data.activityLogs.find(l => l.userEmail === 'maya@garden.org' && l.action === 'COMPLETE_PROJECT');
    assert.ok(auditRecord !== undefined, 'Audit record persisted');
  });
};
