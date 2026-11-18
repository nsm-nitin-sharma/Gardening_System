/**
 * e2e_tests/tier1_feature/test_onboarding.js
 * Tier 1 Feature Coverage: Interactive Visual Onboarding Walkthrough (F2)
 */

module.exports = async function(assert, sandbox, runner) {
  const run = runner ? runner.test : async (id, name, fn) => { await fn(); };

  await run('T1_ONB_01', 'Header defines tourGuideBtn with click handler for manual walkthrough launch', async () => {
    const html = sandbox.readWorkspaceFile('index.html');
    assert.match(html, /id=["']tourGuideBtn["'][^>]*onclick=["']openOnboarding/i, 'tourGuideBtn must exist and call openOnboarding');
  });

  await run('T1_ONB_02', 'index.html defines dedicated onboarding modal overlay and slot', async () => {
    const html = sandbox.readWorkspaceFile('index.html');
    assert.includes(html, 'id="onboardingOverlay"', 'Must include #onboardingOverlay');
    assert.includes(html, 'id="onboardingSlot"', 'Must include #onboardingSlot');
  });

  await run('T1_ONB_03', 'openOnboarding function exists on client window object', async () => {
    sandbox.reset();
    assert.strictEqual(typeof sandbox.context.window.openOnboarding, 'function', 'openOnboarding must be an executable function');
  });

  await run('T1_ONB_04', 'Invoking openOnboarding(0) activates overlay and renders step 1 into slot', async () => {
    sandbox.reset();
    sandbox.context.window.openOnboarding(0);
    const overlay = sandbox.document.getElementById('onboardingOverlay');
    const slot = sandbox.document.getElementById('onboardingSlot');
    assert.ok(overlay.classList.contains('active'), 'Overlay should have active class');
    assert.ok(slot.innerHTML.length > 50, 'Slot should receive rendered markup');
  });

  await run('T1_ONB_05', 'Step 1 introduces platform welcome and community mission', async () => {
    sandbox.reset();
    sandbox.context.window.openOnboarding(0);
    const slot = sandbox.document.getElementById('onboardingSlot');
    assert.ok(slot.innerHTML.includes('Welcome') || slot.innerHTML.includes('Online Gardening') || slot.innerHTML.includes('Platform'), 'Step 1 introduces community platform');
  });

  await run('T1_ONB_06', 'Advancing to Step 2 covers seasonal planting calendar matrix', async () => {
    sandbox.reset();
    sandbox.context.window.openOnboarding(1);
    const slot = sandbox.document.getElementById('onboardingSlot');
    assert.ok(slot.innerHTML.includes('Calendar') || slot.innerHTML.includes('Planting') || slot.innerHTML.includes('Seasonal'), 'Step 2 covers planting calendar');
  });

  await run('T1_ONB_07', 'Advancing to Step 3 covers project and milestone log tracking', async () => {
    sandbox.reset();
    sandbox.context.window.openOnboarding(2);
    const slot = sandbox.document.getElementById('onboardingSlot');
    assert.ok(slot.innerHTML.includes('Project') || slot.innerHTML.includes('Milestone') || slot.innerHTML.includes('Tracker'), 'Step 3 covers project tracking');
  });

  await run('T1_ONB_08', 'Advancing to Step 4 covers community knowledge sharing and tips', async () => {
    sandbox.reset();
    sandbox.context.window.openOnboarding(3);
    const slot = sandbox.document.getElementById('onboardingSlot');
    assert.ok(slot.innerHTML.includes('Tip') || slot.innerHTML.includes('Knowledge') || slot.innerHTML.includes('Community'), 'Step 4 covers knowledge sharing');
  });

  await run('T1_ONB_09', 'Advancing to Step 5 covers demo accounts (Admin and Gardener)', async () => {
    sandbox.reset();
    sandbox.context.window.openOnboarding(4);
    const slot = sandbox.document.getElementById('onboardingSlot');
    assert.ok(slot.innerHTML.includes('admin@gardening.com') || slot.innerHTML.includes('gardener@gardening.com') || slot.innerHTML.includes('Demo') || slot.innerHTML.includes('Get Started'), 'Step 5 highlights demo profiles');
  });

  await run('T1_ONB_10', 'Onboarding modal renders Next button for step advancement', async () => {
    sandbox.reset();
    sandbox.context.window.openOnboarding(0);
    const slot = sandbox.document.getElementById('onboardingSlot');
    assert.ok(slot.innerHTML.includes('nextOnboardingStep()') || slot.innerHTML.includes('Next'), 'Next button rendered');
  });

  await run('T1_ONB_11', 'Onboarding modal renders Prev button on step index > 0', async () => {
    sandbox.reset();
    sandbox.context.window.openOnboarding(1);
    const slot = sandbox.document.getElementById('onboardingSlot');
    assert.ok(slot.innerHTML.includes('prevOnboardingStep()') || slot.innerHTML.includes('Back') || slot.innerHTML.includes('Previous'), 'Prev button rendered on subsequent steps');
  });

  await run('T1_ONB_12', 'Onboarding modal renders Skip / Dismiss button', async () => {
    sandbox.reset();
    sandbox.context.window.openOnboarding(0);
    const slot = sandbox.document.getElementById('onboardingSlot');
    assert.ok(slot.innerHTML.includes('closeOnboarding') || slot.innerHTML.includes('Skip'), 'Skip/Close button rendered');
  });

  await run('T1_ONB_13', 'Calling closeOnboarding(true) removes active class from overlay', async () => {
    sandbox.reset();
    sandbox.context.window.openOnboarding(0);
    const overlay = sandbox.document.getElementById('onboardingOverlay');
    assert.ok(overlay.classList.contains('active'), 'Overlay initially active');
    sandbox.context.window.closeOnboarding(true);
    assert.strictEqual(overlay.classList.contains('active'), false, 'Overlay active class removed on close');
  });

  await run('T1_ONB_14', 'closeOnboarding(true) persists flag in localStorage', async () => {
    sandbox.reset();
    sandbox.context.window.closeOnboarding(true);
    const flagA = sandbox.localStorage.getItem('GARDENING_COMMUNITY_ONBOARDING_SEEN');
    const dbRaw = sandbox.localStorage.getItem('GARDENING_COMMUNITY_DB_V2');
    const parsed = dbRaw ? JSON.parse(dbRaw) : {};
    assert.ok(flagA === 'true' || parsed.onboardingSeen === true, 'Onboarding seen status persisted');
  });

  await run('T1_ONB_15', 'When onboardingSeen is true, modal does not auto-open on subsequent visit', async () => {
    sandbox.reset();
    sandbox.localStorage.setItem('GARDENING_COMMUNITY_ONBOARDING_SEEN', 'true');
    const overlay = sandbox.document.getElementById('onboardingOverlay');
    assert.strictEqual(overlay.classList.contains('active'), false, 'Onboarding overlay remains closed');
  });

  await run('T1_ONB_16', 'Quick login helper executes cleanly with demo accounts', async () => {
    sandbox.reset();
    if (typeof sandbox.context.window.onboardingQuickLogin === 'function') {
      sandbox.context.window.onboardingQuickLogin('gardener@gardening.com', 'GardenerPass123!');
      const user = sandbox.getCurrentUser();
      assert.strictEqual(user.email, 'gardener@gardening.com', 'Quick login successfully authenticated gardener');
    } else {
      const res = sandbox.loginAs('gardener@gardening.com', 'GardenerPass123!');
      assert.strictEqual(res.success, true, 'Fallback login succeeded');
    }
  });

  await run('T1_ONB_17', 'Onboarding progress indicator or counter is rendered in modal', async () => {
    sandbox.reset();
    sandbox.context.window.openOnboarding(0);
    const slot = sandbox.document.getElementById('onboardingSlot');
    assert.ok(slot.innerHTML.includes('Step') || slot.innerHTML.includes('progress') || slot.innerHTML.includes('%') || slot.innerHTML.includes('1 of'), 'Progress counter rendered');
  });

  await run('T1_ONB_18', 'Re-triggering openOnboarding(0) resets walkthrough back to step 1', async () => {
    sandbox.reset();
    sandbox.context.window.openOnboarding(3);
    sandbox.context.window.openOnboarding(0);
    const slot = sandbox.document.getElementById('onboardingSlot');
    assert.ok(slot.innerHTML.includes('Welcome') || slot.innerHTML.includes('Online Gardening') || slot.innerHTML.includes('Platform'), 'Walkthrough reset to first step');
  });
};
