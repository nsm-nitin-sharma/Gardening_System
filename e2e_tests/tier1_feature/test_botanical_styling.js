/**
 * e2e_tests/tier1_feature/test_botanical_styling.js
 * Tier 1 Feature Coverage: Botanical Styling, Tactile Depth & Dark Mode Parity (F4, F11)
 */

module.exports = async function(assert, sandbox, runner) {
  const run = runner ? runner.test : async (id, name, fn) => { await fn(); };

  await run('T1_STY_01', 'app.css declares lush botanical primary palette tokens', async () => {
    const css = sandbox.readWorkspaceFile('app.css');
    assert.includes(css, '--primary-50:', 'Primary 50 declared');
    assert.includes(css, '--primary-500:', 'Primary 500 declared');
    assert.includes(css, '--primary-900:', 'Primary 900 declared');
  });

  await run('T1_STY_02', 'app.css declares surface and canvas background tokens', async () => {
    const css = sandbox.readWorkspaceFile('app.css');
    assert.ok(css.includes('--bg-surface') || css.includes('--bg-card'), 'Surface token declared');
    assert.ok(css.includes('--bg-page') || css.includes('--bg-body'), 'Page background token declared');
  });

  await run('T1_STY_03', 'app.css declares tactile shadow elevation tokens', async () => {
    const css = sandbox.readWorkspaceFile('app.css');
    assert.ok(css.includes('--shadow-sm:') || css.includes('--shadow-card:'), 'Small shadow token declared');
    assert.ok(css.includes('--shadow-md:') || css.includes('--shadow-float:'), 'Medium shadow token declared');
  });

  await run('T1_STY_04', 'app.css declares smooth transition curve token', async () => {
    const css = sandbox.readWorkspaceFile('app.css');
    assert.ok(css.includes('--transition') || css.includes('transition:'), 'Transition token declared');
  });

  await run('T1_STY_05', 'app.css declares border radius tokens for organic styling', async () => {
    const css = sandbox.readWorkspaceFile('app.css');
    assert.ok(css.includes('--radius-') || css.includes('border-radius:'), 'Radius tokens declared');
  });

  await run('T1_STY_06', 'Dark mode selector [data-theme="dark"] is defined in app.css', async () => {
    const css = sandbox.readWorkspaceFile('app.css');
    assert.includes(css, '[data-theme="dark"]', 'Dark theme selector must be declared');
  });

  await run('T1_STY_07', 'Dark mode overrides canvas and surface background tokens', async () => {
    const css = sandbox.readWorkspaceFile('app.css');
    const darkBlock = css.match(/\[data-theme=["']?dark["']?\][\s\S]*?\{[\s\S]*?\}/i)?.[0] || '';
    assert.ok(darkBlock.length > 50, 'Dark mode token block must not be empty');
    assert.ok(darkBlock.includes('--bg-') || darkBlock.includes('background'), 'Dark mode overrides background colors');
  });

  await run('T1_STY_08', 'Dark mode maintains accessible text contrast tokens', async () => {
    const css = sandbox.readWorkspaceFile('app.css');
    const darkBlock = css.match(/\[data-theme=["']?dark["']?\][\s\S]*?\{[\s\S]*?\}/i)?.[0] || '';
    assert.ok(darkBlock.includes('--text-') || darkBlock.includes('color'), 'Dark mode overrides text colors for contrast');
  });

  await run('T1_STY_09', 'Card components define tactile depth and border styling', async () => {
    const css = sandbox.readWorkspaceFile('app.css');
    assert.match(css, /\.card[\s\S]*?border/i, '.card must define border styling');
    assert.match(css, /\.card[\s\S]*?box-shadow/i, '.card must define shadow elevation');
  });

  await run('T1_STY_10', 'Card hover lift transition is defined in app.css', async () => {
    const css = sandbox.readWorkspaceFile('app.css');
    assert.ok(css.includes('.card:hover') || css.includes('.stat-card:hover') || css.includes('translateY'), 'Hover lift transition defined');
  });

  await run('T1_STY_11', 'Button variants define distinct states in app.css', async () => {
    const css = sandbox.readWorkspaceFile('app.css');
    assert.match(css, /\.btn-primary/i, '.btn-primary must be defined');
    assert.ok(css.includes('.btn-secondary') || css.includes('.btn-outline') || css.includes('.btn-ghost'), 'Secondary button variant defined');
  });

  await run('T1_STY_12', 'Form control inputs define focus states in app.css', async () => {
    const css = sandbox.readWorkspaceFile('app.css');
    assert.match(css, /\.form-control:focus/i, '.form-control:focus state must be defined');
  });

  await run('T1_STY_13', 'Status badges style semantic color tiers in app.css', async () => {
    const css = sandbox.readWorkspaceFile('app.css');
    assert.includes(css, '.badge-success', 'badge-success defined');
    assert.includes(css, '.badge-warning', 'badge-warning defined');
  });

  await run('T1_STY_14', 'Stat metric cards define numeric visual hierarchy in app.css', async () => {
    const css = sandbox.readWorkspaceFile('app.css');
    assert.ok(css.includes('.stat-card') || css.includes('.metric-card'), 'Metric/stat card class defined');
  });

  await run('T1_STY_15', 'Responsive layout grid defined in app.css', async () => {
    const css = sandbox.readWorkspaceFile('app.css');
    assert.ok(css.includes('.layout-sidebar-grid') || css.includes('grid-template-columns'), 'Sidebar grid layout defined');
  });

  await run('T1_STY_16', 'Table responsive wrapper prevents layout blowout in app.css', async () => {
    const css = sandbox.readWorkspaceFile('app.css');
    assert.match(css, /\.table-responsive[\s\S]*?overflow-x:\s*auto/i, '.table-responsive must enable overflow-x: auto');
  });

  await run('T1_STY_17', 'Print stylesheet suppresses non-printable elements in app.css', async () => {
    const css = sandbox.readWorkspaceFile('app.css');
    assert.match(css, /@media\s+print[\s\S]*?display:\s*none/i, 'Print styles hide screen navigation elements');
  });

  await run('T1_STY_18', 'Dark mode toggle mutates documentElement data-theme attribute', async () => {
    sandbox.reset();
    assert.strictEqual(sandbox.getTheme(), 'light', 'Theme begins as light');
    sandbox.toggleTheme();
    assert.strictEqual(sandbox.getTheme(), 'dark', 'Theme toggled to dark');
    sandbox.toggleTheme();
    assert.strictEqual(sandbox.getTheme(), 'light', 'Theme toggled back to light');
  });
};
