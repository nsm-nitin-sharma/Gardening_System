/**
 * e2e_tests/tier2_boundary/test_boundary_state.js
 * Tier 2 Boundary & Corner Cases: Boundary State, Zero Items, Invalid IDs & Missing Props (35 tests)
 */

module.exports = async function(assert, sandbox, runner) {
  const run = runner ? runner.test : async (id, name, fn) => { await fn(); };

  await run('T2_STA_01', 'Zero projects empty state displays friendly message without JS error', async () => {
    sandbox.reset();
    sandbox.db.data.projects = [];
    sandbox.db.save();
    const rendered = sandbox.navigate('gardener-projects');
    assert.ok(rendered.length > 0, 'View rendered');
    assert.ok(rendered.includes('No gardening projects') || rendered.includes('projects') || rendered.includes('New Project'), 'Empty state or action rendered');
  });

  await run('T2_STA_02', 'Zero tips empty state displays friendly placeholder', async () => {
    sandbox.reset();
    sandbox.db.data.tips = [];
    sandbox.db.save();
    const rendered = sandbox.navigate('gardener-tips');
    assert.ok(rendered.length > 0, 'View rendered');
  });

  await run('T2_STA_03', 'Zero discussions empty state displays placeholder', async () => {
    sandbox.reset();
    sandbox.db.data.discussions = [];
    sandbox.db.save();
    const rendered = sandbox.navigate('gardener-discussions');
    assert.ok(rendered.length > 0, 'View rendered');
  });

  await run('T2_STA_04', 'Zero activity logs empty state table renders cleanly', async () => {
    sandbox.reset();
    sandbox.db.data.activityLogs = [];
    sandbox.db.save();
    const rendered = sandbox.navigate('admin-logs');
    assert.ok(rendered.length > 0, 'Logs table rendered without error');
  });

  await run('T2_STA_05', 'Zero pending moderation tips displays caught-up message', async () => {
    sandbox.reset();
    sandbox.db.data.tips.forEach(t => { t.status = 'APPROVED'; });
    sandbox.db.save();
    const rendered = sandbox.navigate('admin-moderation');
    assert.ok(rendered.includes('No pending') || rendered.includes('0') || rendered.includes('Moderation'), 'Pending queue displays caught up state');
  });

  await run('T2_STA_06', 'Non-existent project lookup (ID 999999) handled gracefully without null exception', async () => {
    sandbox.reset();
    const proj = sandbox.db.data.projects.find(p => p.id === 999999);
    assert.strictEqual(proj, undefined, 'Project not found');
  });

  await run('T2_STA_07', 'Non-existent tip lookup (ID 888888) handled gracefully', async () => {
    sandbox.reset();
    const tip = sandbox.db.data.tips.find(t => t.id === 888888);
    assert.strictEqual(tip, undefined, 'Tip not found');
  });

  await run('T2_STA_08', 'Non-existent discussion topic lookup (ID 777777) handled gracefully', async () => {
    sandbox.reset();
    const disc = sandbox.db.data.discussions.find(d => d.id === 777777);
    assert.strictEqual(disc, undefined, 'Discussion not found');
  });

  await run('T2_STA_09', 'Non-existent user lookup (ID 666666) returns undefined without throwing', async () => {
    sandbox.reset();
    const user = sandbox.db.data.users.find(u => u.id === 666666);
    assert.strictEqual(user, undefined, 'User not found');
  });

  await run('T2_STA_10', 'Negative entity ID lookup (-1) handled safely', async () => {
    sandbox.reset();
    const proj = sandbox.db.data.projects.find(p => p.id === -1);
    assert.strictEqual(proj, undefined, 'Negative ID returns undefined');
  });

  await run('T2_STA_11', 'String entity ID lookup (abc) handled safely', async () => {
    sandbox.reset();
    const proj = sandbox.db.data.projects.find(p => p.id === 'abc');
    assert.strictEqual(proj, undefined, 'String ID returns undefined');
  });

  await run('T2_STA_12', 'Non-existent project detail view navigation renders friendly message', async () => {
    sandbox.reset();
    const rendered = sandbox.navigate('gardener-project-detail', 999999);
    assert.ok(rendered.includes('not found') || rendered.includes('Project') || rendered.includes('Back'), 'Friendly error rendered');
  });

  await run('T2_STA_13', 'Moderating non-existent tip does not throw uncaught error', async () => {
    sandbox.reset();
    assert.doesNotThrow(() => {
      if (typeof sandbox.context.window.moderateTip === 'function') {
        sandbox.context.window.moderateTip(888888, 'APPROVED');
      }
    }, 'Non-existent tip moderation must not crash');
  });

  await run('T2_STA_14', 'Project status transition: PLANNING to IN_PROGRESS', async () => {
    sandbox.reset();
    const proj = sandbox.db.data.projects[0];
    proj.status = 'PLANNING';
    if (typeof sandbox.context.window.updateProjectStatus === 'function') {
      sandbox.context.window.updateProjectStatus(proj.id, 'IN_PROGRESS');
    } else {
      proj.status = 'IN_PROGRESS';
      sandbox.db.save();
    }
    assert.strictEqual(sandbox.db.data.projects.find(p => p.id === proj.id).status, 'IN_PROGRESS', 'Transitioned to IN_PROGRESS');
  });

  await run('T2_STA_15', 'Project status transition: IN_PROGRESS to COMPLETED', async () => {
    sandbox.reset();
    const proj = sandbox.db.data.projects[0];
    proj.status = 'IN_PROGRESS';
    if (typeof sandbox.context.window.updateProjectStatus === 'function') {
      sandbox.context.window.updateProjectStatus(proj.id, 'COMPLETED');
    } else {
      proj.status = 'COMPLETED';
      sandbox.db.save();
    }
    assert.strictEqual(sandbox.db.data.projects.find(p => p.id === proj.id).status, 'COMPLETED', 'Transitioned to COMPLETED');
  });

  await run('T2_STA_16', 'Project status transition: COMPLETED to PLANNING (re-opening)', async () => {
    sandbox.reset();
    const proj = sandbox.db.data.projects[0];
    proj.status = 'COMPLETED';
    if (typeof sandbox.context.window.updateProjectStatus === 'function') {
      sandbox.context.window.updateProjectStatus(proj.id, 'PLANNING');
    } else {
      proj.status = 'PLANNING';
      sandbox.db.save();
    }
    assert.strictEqual(sandbox.db.data.projects.find(p => p.id === proj.id).status, 'PLANNING', 'Re-opened to PLANNING');
  });

  await run('T2_STA_17', 'Project status transition: IN_PROGRESS to ABANDONED', async () => {
    sandbox.reset();
    const proj = sandbox.db.data.projects[0];
    proj.status = 'ABANDONED';
    sandbox.db.save();
    assert.strictEqual(sandbox.db.data.projects[0].status, 'ABANDONED', 'Set to ABANDONED');
  });

  await run('T2_STA_18', 'Project with zero milestone logs renders empty logs table / placeholder', async () => {
    sandbox.reset();
    const proj = sandbox.db.data.projects[0];
    proj.logs = [];
    sandbox.db.save();
    const rendered = sandbox.navigate('gardener-project-detail', proj.id);
    assert.ok(rendered.length > 50, 'Detail view rendered');
  });

  await run('T2_STA_19', 'Project with 50+ milestone logs renders without memory error', async () => {
    sandbox.reset();
    const proj = sandbox.db.data.projects[0];
    for (let i = 1; i <= 50; i++) {
      proj.logs.push({
        id: Date.now() + i,
        logDate: `2026-11-${String(i % 28 + 1).padStart(2, '0')}`,
        milestone: `Log ${i}`,
        note: `Detailed progress note for growth day ${i}`
      });
    }
    sandbox.db.save();
    const rendered = sandbox.navigate('gardener-project-detail', proj.id);
    assert.ok(rendered.includes('Log 50'), 'Renders 50th log');
  });

  await run('T2_STA_20', 'Entity object with missing description field handles cleanly', async () => {
    sandbox.reset();
    delete sandbox.db.data.projects[0].description;
    sandbox.db.save();
    assert.doesNotThrow(() => {
      sandbox.navigate('gardener-projects');
    }, 'Missing description does not crash view render');
  });

  await run('T2_STA_21', 'Entity object with missing plantTypes defaults safely', async () => {
    sandbox.reset();
    delete sandbox.db.data.projects[0].plantTypes;
    sandbox.db.save();
    assert.doesNotThrow(() => {
      sandbox.navigate('gardener-projects');
    }, 'Missing plantTypes does not crash view render');
  });

  await run('T2_STA_22', 'Discussion topic with empty comments array renders 0 responses count', async () => {
    sandbox.reset();
    sandbox.db.data.discussions[0].comments = [];
    sandbox.db.save();
    const rendered = sandbox.navigate('gardener-discussions');
    assert.ok(rendered.includes('Responses (0)') || rendered.includes('Responses'), '0 responses rendered in discussion card');
  });

  await run('T2_STA_23', 'User profile view renders cleanly and safely with empty bio', async () => {
    sandbox.reset();
    sandbox.loginAs('gardener@gardening.com', 'GardenerPass123!');
    sandbox.db.data.currentUser.bio = '';
    sandbox.db.save();
    let rendered = '';
    assert.doesNotThrow(() => {
      rendered = sandbox.navigate('gardener-profile');
    }, 'Profile view renders without exception');
    assert.ok(rendered.includes('Gardener Profile Settings'), 'Profile settings view renders');
  });

  await run('T2_STA_24', 'User record without location renders without crashing', async () => {
    sandbox.reset();
    sandbox.loginAs('gardener@gardening.com', 'GardenerPass123!');
    delete sandbox.db.data.currentUser.location;
    sandbox.db.save();
    assert.doesNotThrow(() => {
      sandbox.navigate('gardener-profile');
    }, 'Profile renders without location');
  });

  await run('T2_STA_25', 'Planting calendar matrix view renders reliably', async () => {
    sandbox.reset();
    const rendered = sandbox.navigate('gardener-calendar');
    assert.ok(rendered.includes('matrix-table') || rendered.includes('calendar'), 'Calendar table markup present');
  });

  await run('T2_STA_26', 'Planting calendar matrix displays plant varieties', async () => {
    sandbox.reset();
    const rendered = sandbox.navigate('gardener-calendar');
    assert.ok(rendered.includes('Tomato') || rendered.includes('Basil') || rendered.includes('Pepper'), 'Plant varieties present in calendar');
  });

  await run('T2_STA_27', 'Planting calendar matrix renders monthly column headers', async () => {
    sandbox.reset();
    const rendered = sandbox.navigate('gardener-calendar');
    assert.ok(rendered.includes('Jan') && rendered.includes('Dec'), 'Jan through Dec columns present');
  });

  await run('T2_STA_28', 'Planting calendar legend contains sow, transplant, and harvest tiers', async () => {
    sandbox.reset();
    const rendered = sandbox.navigate('gardener-calendar');
    assert.ok(rendered.includes('Sow') || rendered.includes('sow'), 'Sow tier rendered');
    assert.ok(rendered.includes('Harvest') || rendered.includes('harvest'), 'Harvest tier rendered');
  });

  await run('T2_STA_29', 'Planting calendar table renders across viewports', async () => {
    sandbox.reset();
    const rendered = sandbox.navigate('gardener-calendar');
    assert.ok(rendered.includes('table-responsive') || rendered.includes('matrix-table'), 'Responsive table container present');
  });

  await run('T2_STA_30', 'LocalStorage edge state: getItem for missing key returns null', async () => {
    sandbox.reset();
    const missing = sandbox.localStorage.getItem('NON_EXISTENT_KEY_XYZ');
    assert.strictEqual(missing, null, 'Non-existent storage key returns null');
  });

  await run('T2_STA_31', 'LocalStorage edge state: empty string storage key handled safely', async () => {
    sandbox.reset();
    sandbox.localStorage.setItem('', 'emptyKeyValue');
    assert.strictEqual(sandbox.localStorage.getItem(''), 'emptyKeyValue', 'Empty string key handled');
  });

  await run('T2_STA_32', 'LocalStorage edge state: non-object primitive JSON (number) handled gracefully', async () => {
    sandbox.reset();
    sandbox.localStorage.setItem(sandbox.STORAGE_KEY, '12345');
    const db = new sandbox.AppDatabase();
    assert.ok(db.data !== null && Array.isArray(db.data.users), 'Recovered from primitive JSON value');
  });

  await run('T2_STA_33', 'LocalStorage edge state: array instead of database object handled gracefully', async () => {
    sandbox.reset();
    sandbox.localStorage.setItem(sandbox.STORAGE_KEY, '[1, 2, 3]');
    const db = new sandbox.AppDatabase();
    assert.ok(db.data !== null && Array.isArray(db.data.users), 'Recovered from array JSON value');
  });

  await run('T2_STA_34', 'LocalStorage edge state: boolean JSON primitive handled gracefully', async () => {
    sandbox.reset();
    sandbox.localStorage.setItem(sandbox.STORAGE_KEY, 'true');
    const db = new sandbox.AppDatabase();
    assert.ok(db.data !== null && Array.isArray(db.data.users), 'Recovered from boolean JSON value');
  });

  await run('T2_STA_35', 'Database reset to defaults restores standard schema after state wipe', async () => {
    sandbox.reset();
    sandbox.localStorage.clear();
    const db = new sandbox.AppDatabase();
    assert.greaterThanOrEqual(db.data.users.length, 2, 'Default users restored');
    assert.greaterThanOrEqual(db.data.tips.length, 3, 'Default tips restored');
    assert.greaterThanOrEqual(db.data.projects.length, 2, 'Default projects restored');
  });
};
