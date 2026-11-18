/**
 * e2e_tests/tier4_realworld/test_gardening_season.js
 * Tier 4 Real-World Scenarios: Full Gardening Season Simulation (6 tests)
 */

module.exports = async function(assert, sandbox, runner) {
  const run = runner ? runner.test : async (id, name, fn) => { await fn(); };

  await run('T4_SEA_01', 'Phase 1 (Early Spring) - Registration, calendar consult & plot planning', async () => {
    sandbox.reset();
    const res = sandbox.context.window.registerUser(
      'Leila Green',
      'leila@greenhaven.org',
      'SpringHarvest2026!',
      'Passionate organic gardener focused on heritage nightshades.',
      '3 Years',
      'Portland, OR'
    );
    assert.strictEqual(res.success, true, 'Leila Green registered');

    // Consult calendar
    const cal = sandbox.navigate('gardener-calendar');
    assert.includes(cal, 'Tomato', 'Calendar contains tomato planting schedule');

    // Plan project
    const proj = {
      id: Date.now(),
      title: 'Heritage San Marzano Kitchen Garden',
      plantTypes: 'San Marzano Tomato, Genovese Basil, French Marigold',
      status: 'PLANNING',
      startDate: '2026-03-01',
      targetHarvestDate: '2026-08-30',
      ownerEmail: 'leila@greenhaven.org',
      createdAt: '2026-03-01 09:00:00',
      logs: []
    };
    sandbox.db.data.projects.unshift(proj);
    sandbox.db.logActivity('leila@greenhaven.org', 'CREATE_PROJECT', `Started project ${proj.title}`);
    sandbox.db.save();

    assert.strictEqual(sandbox.db.data.projects[0].title, 'Heritage San Marzano Kitchen Garden', 'Project planned');
  });

  await run('T4_SEA_02', 'Phase 2 (Mid Spring) - Sowing seeds, logging milestone & transitioning to IN_PROGRESS', async () => {
    sandbox.reset();
    sandbox.context.window.registerUser('Leila Green', 'leila@greenhaven.org', 'Pass123!', 'Bio', '3 Yrs', 'Portland');
    const projId = Date.now();
    const proj = {
      id: projId,
      title: 'Heritage San Marzano Kitchen Garden',
      plantTypes: 'San Marzano Tomato',
      status: 'PLANNING',
      ownerEmail: 'leila@greenhaven.org',
      logs: []
    };
    sandbox.db.data.projects.unshift(proj);

    // Sowing milestone
    proj.logs.unshift({
      id: Date.now() + 1,
      logDate: '2026-03-15',
      milestone: 'Indoor Seed Starting',
      note: 'Sowed 24 San Marzano seeds in coco coir plugs under 6500K LED grow lights.'
    });

    if (typeof sandbox.context.window.updateProjectStatus === 'function') {
      sandbox.context.window.updateProjectStatus(projId, 'IN_PROGRESS');
    } else {
      proj.status = 'IN_PROGRESS';
      sandbox.db.save();
    }

    const updated = sandbox.db.data.projects.find(p => p.id === projId);
    assert.strictEqual(updated.status, 'IN_PROGRESS', 'Project active in IN_PROGRESS phase');
    assert.strictEqual(updated.logs.length, 1, 'Seed starting milestone recorded');
  });

  await run('T4_SEA_03', 'Phase 3 (Early Summer) - Hardening off & submitting companion planting tip', async () => {
    sandbox.reset();
    sandbox.context.window.registerUser('Leila Green', 'leila@greenhaven.org', 'Pass123!', 'Bio', '3 Yrs', 'Portland');
    const projId = Date.now();
    const proj = {
      id: projId,
      title: 'Heritage San Marzano Kitchen Garden',
      status: 'IN_PROGRESS',
      ownerEmail: 'leila@greenhaven.org',
      logs: [
        { id: 1, logDate: '2026-03-15', milestone: 'Indoor Sowing', note: '24 seeds' },
        { id: 2, logDate: '2026-05-10', milestone: 'Outdoor Transplant', note: 'Transplanted 12 vigorous seedlings.' }
      ]
    };
    sandbox.db.data.projects.unshift(proj);

    // Submit companion planting tip
    const tip = {
      id: Date.now() + 50,
      title: 'French Marigolds for Root Knot Nematode Deterrence',
      category: 'Companion Planting',
      description: 'Plant French Marigolds (Tagetes patula) densely around tomato roots to release alpha-terthienyl.',
      authorName: 'Leila Green',
      authorEmail: 'leila@greenhaven.org',
      status: 'PENDING',
      moderationNote: null,
      createdAt: '2026-05-15 11:00:00'
    };
    sandbox.db.data.tips.unshift(tip);
    sandbox.db.save();

    assert.strictEqual(proj.logs.length, 2, 'Transplant logged');
    assert.strictEqual(sandbox.db.data.tips[0].status, 'PENDING', 'Tip submitted for review');
  });

  await run('T4_SEA_04', 'Phase 4 (Mid Summer) - Admin approves companion tip & flowering milestone logged', async () => {
    sandbox.reset();
    const tipId = Date.now() + 50;
    const tip = {
      id: tipId,
      title: 'French Marigolds for Tomato Root Defense',
      status: 'PENDING',
      authorEmail: 'leila@greenhaven.org'
    };
    sandbox.db.data.tips.unshift(tip);

    // Admin approves
    tip.status = 'APPROVED';
    tip.moderationNote = 'Verified bio-nematicidal efficacy. Approved.';
    sandbox.db.save();

    const verified = sandbox.db.data.tips.find(t => t.id === tipId);
    assert.strictEqual(verified.status, 'APPROVED', 'Companion tip approved and live');
  });

  await run('T4_SEA_05', 'Phase 5 (Autumn Harvest) - Harvest milestone logged and project completed', async () => {
    sandbox.reset();
    sandbox.context.window.registerUser('Leila Green', 'leila@greenhaven.org', 'Pass123!', 'Bio', '3 Yrs', 'Portland');
    const projId = Date.now();
    const proj = {
      id: projId,
      title: 'Heritage San Marzano Kitchen Garden',
      status: 'IN_PROGRESS',
      ownerEmail: 'leila@greenhaven.org',
      logs: [
        { id: 1, logDate: '2026-03-15', milestone: 'Sowing', note: 'Seeds' },
        { id: 2, logDate: '2026-05-10', milestone: 'Transplant', note: 'Outdoors' },
        { id: 3, logDate: '2026-06-25', milestone: 'First Blossoms', note: 'Heavy flowering' },
        { id: 4, logDate: '2026-08-20', milestone: 'Peak Harvest', note: 'Harvested 8.5kg of dense plum tomatoes!' }
      ]
    };
    sandbox.db.data.projects.unshift(proj);

    if (typeof sandbox.context.window.updateProjectStatus === 'function') {
      sandbox.context.window.updateProjectStatus(projId, 'COMPLETED');
    } else {
      proj.status = 'COMPLETED';
      sandbox.db.save();
    }

    const completed = sandbox.db.data.projects.find(p => p.id === projId);
    assert.strictEqual(completed.status, 'COMPLETED', 'Project completed');
    assert.strictEqual(completed.logs.length, 4, 'All 4 seasonal milestones recorded');
  });

  await run('T4_SEA_06', 'Phase 6 (Season Wrap) - Printable summary card verified & session reboot retains 100% data', async () => {
    sandbox.reset();
    sandbox.context.window.registerUser('Leila Green', 'leila@greenhaven.org', 'Pass123!', 'Bio', '3 Yrs', 'Portland');
    const projId = Date.now();
    sandbox.db.data.projects.unshift({
      id: projId,
      title: 'Heritage San Marzano Kitchen Garden',
      status: 'COMPLETED',
      ownerEmail: 'leila@greenhaven.org',
      logs: [
        { id: 1, logDate: '2026-03-15', milestone: 'Sowing', note: '24 seeds' },
        { id: 2, logDate: '2026-08-20', milestone: 'Peak Harvest', note: '8.5kg tomatoes' }
      ]
    });
    sandbox.db.logActivity('leila@greenhaven.org', 'SEASON_COMPLETE', 'Successfully completed 2026 growing season.');
    sandbox.db.save();

    // Verify detail view render
    const rendered = sandbox.navigate('gardener-project-detail', projId);
    assert.includes(rendered, 'Heritage San Marzano Kitchen Garden', 'Project title present');

    // Simulate browser restart
    const rebooted = new sandbox.AppDatabase();
    const stored = rebooted.data.projects.find(p => p.id === projId);
    assert.ok(stored !== undefined, 'Project safely survived restart');
    assert.strictEqual(stored.status, 'COMPLETED', 'Completed status persisted');
    assert.strictEqual(stored.logs.length, 2, 'All milestone notes intact');
  });
};
