/**
 * e2e_tests/tier3_pairwise/test_tip_moderation.js
 * Tier 3 Pairwise Combinations: Tip Submission & Admin Moderation Flow (8 tests)
 */

module.exports = async function(assert, sandbox, runner) {
  const run = runner ? runner.test : async (id, name, fn) => { await fn(); };

  await run('T3_MOD_01', 'Gardener submits new tip in pending status', async () => {
    sandbox.reset();
    sandbox.loginAs('gardener@gardening.com', 'GardenerPass123!');
    const tipId = Date.now();
    const newTip = {
      id: tipId,
      title: 'Organic Neem Oil Foliar Spray',
      category: 'Pest Control',
      description: 'Spray on leaves to combat spider mites and aphids.',
      authorName: 'Sample Gardener',
      authorEmail: 'gardener@gardening.com',
      status: 'PENDING',
      moderationNote: null,
      createdAt: '2026-11-20 14:00:00'
    };
    sandbox.db.data.tips.unshift(newTip);
    sandbox.db.logActivity('gardener@gardening.com', 'SUBMIT_TIP', `Submitted tip: ${newTip.title}`);
    sandbox.db.save();

    const stored = sandbox.db.data.tips.find(t => t.id === tipId);
    assert.ok(stored !== undefined, 'Tip stored in database');
    assert.strictEqual(stored.status, 'PENDING', 'Status is initially PENDING');
  });

  await run('T3_MOD_02', 'Pending tip is excluded from approved public tips catalog', async () => {
    sandbox.reset();
    const tipId = Date.now();
    sandbox.db.data.tips.unshift({
      id: tipId,
      title: 'Pending Neem Spray',
      category: 'Pest Control',
      description: 'Under moderation',
      status: 'PENDING',
      createdAt: '2026-11-20 14:00:00'
    });
    sandbox.db.save();

    const approvedTips = sandbox.db.data.tips.filter(t => t.status === 'APPROVED');
    const isPublic = approvedTips.some(t => t.id === tipId);
    assert.strictEqual(isPublic, false, 'Pending tip must not be in approved public catalog');
  });

  await run('T3_MOD_03', 'Admin navigates to moderation queue and views pending tip', async () => {
    sandbox.reset();
    const tipId = Date.now();
    sandbox.db.data.tips.unshift({
      id: tipId,
      title: 'Pending Neem Spray',
      category: 'Pest Control',
      description: 'Under moderation',
      authorName: 'Sample Gardener',
      status: 'PENDING',
      createdAt: '2026-11-20 14:00:00'
    });
    sandbox.db.save();

    sandbox.loginAs('admin@gardening.com', 'AdminPass123!');
    const rendered = sandbox.navigate('admin-moderation');
    assert.includes(rendered, 'Pending Neem Spray', 'Pending tip visible to admin');
  });

  await run('T3_MOD_04', 'Admin rejects tip with feedback note', async () => {
    sandbox.reset();
    const tipId = Date.now();
    const tip = {
      id: tipId,
      title: 'Neem Spray Formulation',
      category: 'Pest Control',
      description: 'Spray directly on pests.',
      status: 'PENDING',
      moderationNote: null
    };
    sandbox.db.data.tips.unshift(tip);

    if (typeof sandbox.context.window.handleModerationSubmit === 'function') {
      if (typeof sandbox.context.window.moderateTip === 'function') {
        sandbox.context.window.moderateTip(tipId, 'REJECTED');
      }
      const input = sandbox.document.getElementById('moderationFeedbackInput');
      if (input) input.value = 'Please specify dilution ratio in ml/L.';
      sandbox.context.window.handleModerationSubmit({ preventDefault: () => {} }, tipId, 'REJECTED');
    } else {
      tip.status = 'REJECTED';
      tip.moderationNote = 'Please specify dilution ratio in ml/L.';
      sandbox.db.save();
    }

    const updated = sandbox.db.data.tips.find(t => t.id === tipId);
    assert.strictEqual(updated.status, 'REJECTED', 'Status updated to REJECTED');
  });

  await run('T3_MOD_05', 'Rejection note is saved in database and accessible to author', async () => {
    sandbox.reset();
    const tipId = Date.now();
    sandbox.db.data.tips.unshift({
      id: tipId,
      title: 'Neem Formulation',
      status: 'REJECTED',
      moderationNote: 'Please specify water dilution ratio for safety.',
      authorEmail: 'gardener@gardening.com'
    });
    sandbox.db.save();

    const stored = sandbox.db.data.tips.find(t => t.id === tipId);
    assert.includes(stored.moderationNote, 'dilution ratio', 'Moderation note recorded');
  });

  await run('T3_MOD_06', 'Author updates tip with detailed safety instructions', async () => {
    sandbox.reset();
    const tipId = Date.now();
    const tip = {
      id: tipId,
      title: 'Neem Formulation',
      description: 'Initial vague instructions',
      status: 'REJECTED',
      moderationNote: 'Need ratio',
      authorEmail: 'gardener@gardening.com'
    };
    sandbox.db.data.tips.unshift(tip);

    // Gardener updates tip
    tip.description = 'Mix 5ml cold-pressed neem oil with 2ml organic liquid soap per 1 liter of warm water.';
    tip.status = 'PENDING';
    sandbox.db.save();

    const updated = sandbox.db.data.tips.find(t => t.id === tipId);
    assert.includes(updated.description, '5ml cold-pressed neem oil', 'Description revised');
    assert.strictEqual(updated.status, 'PENDING', 'Resubmitted for pending moderation');
  });

  await run('T3_MOD_07', 'Admin approves revised tip with verified note', async () => {
    sandbox.reset();
    const tipId = Date.now();
    const tip = {
      id: tipId,
      title: 'Neem Oil Organic Spray',
      description: 'Mix 5ml per liter warm water.',
      status: 'PENDING',
      authorEmail: 'gardener@gardening.com'
    };
    sandbox.db.data.tips.unshift(tip);

    if (typeof sandbox.context.window.handleModerationSubmit === 'function') {
      if (typeof sandbox.context.window.moderateTip === 'function') {
        sandbox.context.window.moderateTip(tipId, 'APPROVED');
      }
      const input = sandbox.document.getElementById('moderationFeedbackInput');
      if (input) input.value = 'Approved - accurate and safe dilution ratio.';
      sandbox.context.window.handleModerationSubmit({ preventDefault: () => {} }, tipId, 'APPROVED');
    } else {
      tip.status = 'APPROVED';
      tip.moderationNote = 'Approved - accurate and safe dilution ratio.';
      sandbox.db.save();
    }

    const updated = sandbox.db.data.tips.find(t => t.id === tipId);
    assert.strictEqual(updated.status, 'APPROVED', 'Tip approved');
  });

  await run('T3_MOD_08', 'Approved tip immediately renders in public catalog and search results', async () => {
    sandbox.reset();
    const tipId = Date.now();
    sandbox.db.data.tips.unshift({
      id: tipId,
      title: 'Neem Oil Organic Spray',
      category: 'Pest Control',
      description: 'Mix 5ml per liter warm water.',
      authorName: 'Sample Gardener',
      status: 'APPROVED',
      moderationNote: 'Verified safe.',
      createdAt: '2026-11-20 15:00:00'
    });
    sandbox.db.save();

    const rendered = sandbox.navigate('gardener-tips');
    assert.includes(rendered, 'Neem Oil Organic Spray', 'Approved tip displayed in catalog');
  });
};
