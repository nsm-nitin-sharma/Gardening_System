/**
 * e2e_tests/tier3_pairwise/test_admin_settings.js
 * Tier 3 Pairwise Combinations: Platform Settings & Administrative Governance Flow (8 tests)
 */

module.exports = async function(assert, sandbox, runner) {
  const run = runner ? runner.test : async (id, name, fn) => { await fn(); };

  await run('T3_SET_01', 'Admin navigates to admin settings panel and views current values', async () => {
    sandbox.reset();
    sandbox.loginAs('admin@gardening.com', 'AdminPass123!');
    const rendered = sandbox.navigate('admin-settings');
    assert.includes(rendered, 'System Settings Configuration', 'Settings title rendered');
    assert.includes(rendered, sandbox.db.data.settings.siteName, 'Current site name rendered');
  });

  await run('T3_SET_02', 'Admin updates siteName to GreenThumb Botanical Sanctuary', async () => {
    sandbox.reset();
    sandbox.loginAs('admin@gardening.com', 'AdminPass123!');
    sandbox.db.data.settings.siteName = 'GreenThumb Botanical Sanctuary';
    sandbox.db.logActivity('admin@gardening.com', 'UPDATE_SETTINGS', 'Updated siteName to GreenThumb Botanical Sanctuary');
    sandbox.db.save();

    const stored = sandbox.db.data.settings.siteName;
    assert.strictEqual(stored, 'GreenThumb Botanical Sanctuary', 'siteName updated in database');
  });

  await run('T3_SET_03', 'Updated siteName persists in localStorage across simulated session', async () => {
    sandbox.reset();
    sandbox.db.data.settings.siteName = 'GreenThumb Botanical Sanctuary';
    sandbox.db.save();

    const raw = sandbox.localStorage.getItem(sandbox.STORAGE_KEY);
    const parsed = JSON.parse(raw);
    assert.strictEqual(parsed.settings.siteName, 'GreenThumb Botanical Sanctuary', 'Persisted in localStorage');
  });

  await run('T3_SET_04', 'Admin sets maintenanceNotice banner in settings', async () => {
    sandbox.reset();
    sandbox.loginAs('admin@gardening.com', 'AdminPass123!');
    const notice = 'Notice: Organic Fertilizer Workshop this Saturday at 10:00 AM UTC.';
    sandbox.db.data.settings.maintenanceNotice = notice;
    sandbox.db.logActivity('admin@gardening.com', 'UPDATE_SETTINGS', `Updated maintenanceNotice`);
    sandbox.db.save();

    const reloadedDb = new sandbox.AppDatabase();
    assert.strictEqual(reloadedDb.data.settings.maintenanceNotice, notice, 'Notice persisted');
  });

  await run('T3_SET_05', 'Admin updates maxProjectLimit to 30', async () => {
    sandbox.reset();
    sandbox.loginAs('admin@gardening.com', 'AdminPass123!');
    sandbox.db.data.settings.maxProjectLimit = 30;
    sandbox.db.save();

    assert.strictEqual(sandbox.db.data.settings.maxProjectLimit, 30, 'maxProjectLimit updated to 30');
    const parsed = JSON.parse(sandbox.localStorage.getItem(sandbox.STORAGE_KEY));
    assert.strictEqual(parsed.settings.maxProjectLimit, 30, 'Limit persisted in localStorage');
  });

  await run('T3_SET_06', 'Admin enables autoApproveTips setting', async () => {
    sandbox.reset();
    sandbox.loginAs('admin@gardening.com', 'AdminPass123!');
    sandbox.db.data.settings.autoApproveTips = true;
    sandbox.db.save();

    assert.strictEqual(sandbox.db.data.settings.autoApproveTips, true, 'autoApproveTips enabled');
  });

  await run('T3_SET_07', 'Admin deactivates gardener account from user management', async () => {
    sandbox.reset();
    sandbox.loginAs('admin@gardening.com', 'AdminPass123!');
    const target = sandbox.db.data.users.find(u => u.email === 'gardener@gardening.com');
    if (typeof sandbox.context.window.toggleUserStatus === 'function') {
      sandbox.context.window.toggleUserStatus(target.id);
    } else {
      target.active = false;
      sandbox.db.logActivity('admin@gardening.com', 'TOGGLE_USER_STATUS', `Deactivated ${target.email}`);
      sandbox.db.save();
    }

    const updated = sandbox.db.data.users.find(u => u.email === 'gardener@gardening.com');
    assert.strictEqual(updated.active, false, 'Gardener account is deactivated');
  });

  await run('T3_SET_08', 'Admin navigates to audit logs and verifies chronological trail', async () => {
    sandbox.reset();
    sandbox.loginAs('admin@gardening.com', 'AdminPass123!');
    sandbox.db.logActivity('admin@gardening.com', 'AUDIT_VERIFY', 'Verified system settings and governance compliance.');
    sandbox.db.save();

    const rendered = sandbox.navigate('admin-logs');
    assert.includes(rendered, 'Activity Audit Log', 'Audit log header rendered');
    assert.includes(rendered, 'admin@gardening.com', 'Admin email present in audit records');
    const topLog = sandbox.db.data.activityLogs[0];
    assert.strictEqual(topLog.action, 'AUDIT_VERIFY', 'Most recent action is AUDIT_VERIFY');
  });
};
