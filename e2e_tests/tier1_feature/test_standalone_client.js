/**
 * e2e_tests/tier1_feature/test_standalone_client.js
 * Tier 1 Feature Coverage: Standalone Client & Zero-Dependency Execution (F1, F5, F6)
 */

module.exports = async function(assert, sandbox, runner) {
  const run = runner ? runner.test : async (id, name, fn) => { await fn(); };

  await run('T1_FILE_01', 'Relative link for stylesheet in index.html (./app.css)', async () => {
    const html = sandbox.readWorkspaceFile('index.html');
    assert.match(html, /<link[^>]+rel=["']stylesheet["'][^>]+href=["']\.\/app\.css["']/i, 'Stylesheet link must be relative ./app.css');
  });

  await run('T1_FILE_02', 'Relative script source in index.html (./app.js)', async () => {
    const html = sandbox.readWorkspaceFile('index.html');
    assert.match(html, /<script[^>]+src=["']\.\/app\.js["']/i, 'Script src must be relative ./app.js');
  });

  await run('T1_FILE_03', 'Zero remote protocol references in index.html script and link tags', async () => {
    const html = sandbox.readWorkspaceFile('index.html');
    const remoteTags = html.match(/<(script|link)[^>]+(src|href)=["'](https?:|\/\/)[^"']*["']/gi);
    assert.strictEqual(remoteTags, null, 'No remote script or stylesheet link tags permitted in index.html');
  });

  await run('T1_FILE_04', 'Zero external framework dependencies - app.css self-contained token system', async () => {
    const css = sandbox.readWorkspaceFile('app.css');
    assert.ok(css.includes(':root') && css.includes('--primary-500'), 'app.css defines self-contained botanical token system');
    assert.doesNotMatch(css, /@import\s+url\s*\(\s*["']?https?:\/\/[^"']*(bootstrap|tailwind|fontawesome)/i, 'app.css must not import external heavyweight CSS frameworks');
  });

  await run('T1_FILE_05', 'Immediate pre-paint script exists in index.html head for theme flash prevention', async () => {
    const html = sandbox.readWorkspaceFile('index.html');
    const headContent = html.match(/<head[\s\S]*?<\/head>/i)?.[0] || '';
    assert.match(headContent, /<script[\s\S]*?<\/script>/i, '<head> must contain inline theme script');
    assert.match(headContent, /setAttribute\(['"]data-theme['"]/i, 'Pre-paint script sets data-theme attribute');
  });

  await run('T1_FILE_06', 'Pre-paint script checks localStorage key GARDENING_COMMUNITY_DB_V2', async () => {
    const html = sandbox.readWorkspaceFile('index.html');
    assert.includes(html, 'GARDENING_COMMUNITY_DB_V2', 'Script must query standard storage key');
  });

  await run('T1_FILE_07', 'Standalone client executes zero remote fetch() calls at startup and navigation', async () => {
    sandbox.reset();
    const initialFetchCount = sandbox.window.fetchCount;
    sandbox.navigate('home');
    sandbox.navigate('gardener-tips');
    sandbox.navigate('gardener-calendar');
    assert.strictEqual(sandbox.window.fetchCount, initialFetchCount, 'Zero network fetch() calls should be made');
  });

  await run('T1_FILE_08', 'Standalone client executes zero XMLHttpRequest calls', async () => {
    sandbox.reset();
    const initialXhrCount = sandbox.window.xhrCount;
    sandbox.navigate('home');
    sandbox.navigate('gardener-dashboard');
    assert.strictEqual(sandbox.window.xhrCount, initialXhrCount, 'Zero XMLHttpRequest calls should be made');
  });

  await run('T1_FILE_09', 'In-memory client router navigates without mutating window.location protocol (file: preserved)', async () => {
    sandbox.reset();
    assert.strictEqual(sandbox.window.location.protocol, 'file:', 'Location protocol starts as file:');
    sandbox.navigate('gardener-projects');
    assert.strictEqual(sandbox.window.location.protocol, 'file:', 'Location protocol remains file: after navigation');
  });

  await run('T1_FILE_10', 'index.html defines core shell slots: appRoot, navbarLinksSlot, navbarAuthSlot, themeToggleBtn', async () => {
    const html = sandbox.readWorkspaceFile('index.html');
    assert.includes(html, 'id="appRoot"', 'Must include appRoot container');
    assert.includes(html, 'id="navbarLinksSlot"', 'Must include navbarLinksSlot');
    assert.includes(html, 'id="navbarAuthSlot"', 'Must include navbarAuthSlot');
    assert.includes(html, 'id="themeToggleBtn"', 'Must include themeToggleBtn');
  });

  await run('T1_FILE_11', 'index.html defines modal containers: modalOverlay and modalSlot', async () => {
    const html = sandbox.readWorkspaceFile('index.html');
    assert.includes(html, 'id="modalOverlay"', 'Must include modalOverlay');
    assert.includes(html, 'id="modalSlot"', 'Must include modalSlot');
  });

  await run('T1_FILE_12', 'index.html defines dedicated toast container (toastContainer)', async () => {
    const html = sandbox.readWorkspaceFile('index.html');
    assert.includes(html, 'id="toastContainer"', 'Must include toastContainer');
  });

  await run('T1_FILE_13', 'Navigation bar header has sticky positioning and styling in app.css', async () => {
    const css = sandbox.readWorkspaceFile('app.css');
    assert.match(css, /\.site-header[\s\S]*?position:\s*sticky/i, '.site-header must specify sticky positioning');
  });

  await run('T1_FILE_14', 'Mobile responsive breakpoint declared in app.css for header/nav', async () => {
    const css = sandbox.readWorkspaceFile('app.css');
    assert.match(css, /@media[^{]*max-width:\s*(768|900|960)px/i, 'app.css must define mobile/tablet responsive breakpoints');
  });

  await run('T1_FILE_15', 'Toast notification container element present in DOM shell', async () => {
    sandbox.reset();
    const toastEl = sandbox.document.getElementById('toastContainer');
    assert.ok(toastEl !== null, '#toastContainer must exist in DOM');
    assert.strictEqual(toastEl.id, 'toastContainer', 'Toast element ID confirmed');
  });

  await run('T1_FILE_16', 'Smooth CSS transitions declared for UI interactions in app.css', async () => {
    const css = sandbox.readWorkspaceFile('app.css');
    assert.ok(css.includes('--transition') || css.includes('transition:'), 'CSS must specify transitions for interactive elements');
  });

  await run('T1_FILE_17', 'Client navigation renders expected landing hero structure into appRoot', async () => {
    sandbox.reset();
    const rendered = sandbox.navigate('home');
    assert.ok(rendered.length > 50, 'Home view must render non-empty markup');
    assert.ok(rendered.includes('hero') || rendered.includes('Gardening') || rendered.includes('Platform'), 'Home view renders gardening hero content');
  });

  await run('T1_FILE_18', 'Offline resilience — client successfully initializes when window.navigator.onLine is false', async () => {
    sandbox.reset();
    sandbox.window.navigator.onLine = false;
    assert.doesNotThrow(() => {
      sandbox.navigate('home');
    }, 'Client navigation must not fail when offline');
    assert.ok(sandbox.document.getElementById('appRoot').innerHTML.length > 0, 'Content successfully rendered while offline');
  });
};
