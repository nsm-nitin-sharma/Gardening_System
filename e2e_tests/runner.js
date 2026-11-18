#!/usr/bin/env node
/**
 * Master E2E Test Runner - Online Gardening Community Platform
 * Zero-dependency, requirement-driven, 4-tier automated test engine.
 */

const path = require('path');
const { performance } = require('perf_hooks');
const assert = require('./harness/assertion_library');
const sandbox = require('./harness/client_sandbox');

// Suite Registry mapping all 4 Tiers across 14 test files
const SUITE_REGISTRY = {
  1: {
    name: 'Tier 1: Feature Coverage (Isolated Specifications)',
    suites: [
      { file: 'tier1_feature/test_standalone_client.js', name: 'Standalone Client & Zero-Dependency' },
      { file: 'tier1_feature/test_onboarding.js', name: 'Interactive Visual Onboarding' },
      { file: 'tier1_feature/test_iconography.js', name: 'SVG Iconography & Emoji Cleanliness' },
      { file: 'tier1_feature/test_botanical_styling.js', name: 'Botanical Styling & Dark Mode' },
      { file: 'tier1_feature/test_persistence.js', name: 'LocalStorage State Persistence' },
      { file: 'tier1_feature/test_backend_integrity.js', name: 'Spring Boot & Template Integrity' }
    ]
  },
  2: {
    name: 'Tier 2: Boundary & Corner Cases (Extreme Inputs & State)',
    suites: [
      { file: 'tier2_boundary/test_boundary_inputs.js', name: 'Boundary Inputs & Extreme Values' },
      { file: 'tier2_boundary/test_boundary_state.js', name: 'Boundary State & Empty Collections' },
      { file: 'tier2_boundary/test_security_limits.js', name: 'Security Limits & Role Permissions' }
    ]
  },
  3: {
    name: 'Tier 3: Pairwise Combinations (Cross-Module Workflows)',
    suites: [
      { file: 'tier3_pairwise/test_gardener_lifecycle.js', name: 'Gardener Registration & Project Lifecycle' },
      { file: 'tier3_pairwise/test_tip_moderation.js', name: 'Tip Submission & Admin Moderation Flow' },
      { file: 'tier3_pairwise/test_admin_settings.js', name: 'Platform Settings & Governance Flow' }
    ]
  },
  4: {
    name: 'Tier 4: Real-World Scenarios (End-to-End User Workloads)',
    suites: [
      { file: 'tier4_realworld/test_gardening_season.js', name: 'Full Gardening Season Simulation' },
      { file: 'tier4_realworld/test_community_discussions.js', name: 'Multi-User Discussion & Audit Trail' }
    ]
  }
};

function parseArgs(rawArgs) {
  const args = {
    tier: null,
    filter: null,
    verbose: false,
    bail: false,
    help: false
  };

  for (let i = 0; i < rawArgs.length; i++) {
    const a = rawArgs[i];
    if (a.startsWith('--tier=')) {
      args.tier = parseInt(a.split('=')[1], 10);
    } else if (a === '-t' && i + 1 < rawArgs.length) {
      args.tier = parseInt(rawArgs[++i], 10);
    } else if (a.startsWith('--filter=')) {
      args.filter = new RegExp(a.split('=')[1], 'i');
    } else if (a === '-f' && i + 1 < rawArgs.length) {
      args.filter = new RegExp(rawArgs[++i], 'i');
    } else if (a === '--verbose' || a === '-v') {
      args.verbose = true;
    } else if (a === '--bail' || a === '-b') {
      args.bail = true;
    } else if (a === '--help' || a === '-h') {
      args.help = true;
    }
  }
  return args;
}

function printHeader(args) {
  console.log('\x1b[1;36m========================================================================================\x1b[0m');
  console.log('\x1b[1;36m       Online Gardening Community Platform - E2E Master Test Runner\x1b[0m');
  console.log('\x1b[1;36m       Requirement-Driven Opaque-Box Automated Verification Engine\x1b[0m');
  console.log('\x1b[1;36m========================================================================================\x1b[0m');
  if (args.tier) console.log(`  \x1b[33m[Scope]\x1b[0m Tier ${args.tier} only`);
  if (args.filter) console.log(`  \x1b[33m[Filter]\x1b[0m ${args.filter}`);
  if (args.bail) console.log(`  \x1b[33m[Mode]\x1b[0m Bail on first failure`);
  if (args.verbose) console.log(`  \x1b[33m[Verbosity]\x1b[0m Verbose output enabled`);
  console.log('');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(`
Usage: node e2e_tests/runner.js [options]

Options:
  --tier=<1|2|3|4>   Run tests for a specific tier only (default: all tiers)
  -t <1|2|3|4>       Short flag for --tier
  --filter=<regex>   Filter test suites or cases by name/id pattern
  -f <regex>         Short flag for --filter
  --verbose, -v      Enable verbose logging per test
  --bail, -b         Halt on first test failure
  --help, -h         Show this help screen
`);
    process.exit(0);
  }

  printHeader(args);

  const stats = {
    totalSuites: 0,
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    skippedTests: 0,
    durationMs: 0,
    tierStats: {
      1: { name: SUITE_REGISTRY[1].name, suites: 0, tests: 0, passed: 0, failed: 0, assertions: 0, durationMs: 0 },
      2: { name: SUITE_REGISTRY[2].name, suites: 0, tests: 0, passed: 0, failed: 0, assertions: 0, durationMs: 0 },
      3: { name: SUITE_REGISTRY[3].name, suites: 0, tests: 0, passed: 0, failed: 0, assertions: 0, durationMs: 0 },
      4: { name: SUITE_REGISTRY[4].name, suites: 0, tests: 0, passed: 0, failed: 0, assertions: 0, durationMs: 0 }
    },
    failures: []
  };

  assert.resetCount();
  const overallStart = performance.now();
  const selectedTiers = args.tier ? [args.tier] : [1, 2, 3, 4];

  for (const tierNum of selectedTiers) {
    const tierDef = SUITE_REGISTRY[tierNum];
    if (!tierDef) continue;

    console.log(`\x1b[1;35m>>> ${tierDef.name}\x1b[0m`);
    const tierStart = performance.now();
    const tierAssertStart = assert.count;

    for (const suiteDef of tierDef.suites) {
      const suiteMatched = !args.filter || Boolean(suiteDef.name.match(args.filter)) || Boolean(suiteDef.file.match(args.filter));
      if (args.filter && !suiteMatched) {
        continue;
      }

      stats.totalSuites++;
      stats.tierStats[tierNum].suites++;

      console.log(`  \x1b[1;37mSuite: ${suiteDef.name}\x1b[0m \x1b[90m(${suiteDef.file})\x1b[0m`);
      const suiteStart = performance.now();
      const suiteAssertStart = assert.count;
      let suitePassed = 0;
      let suiteFailed = 0;

      const suiteRunner = {
        test: async (arg1, arg2, arg3) => {
          let testId = '';
          let testName = '';
          let testFn = null;

          if (typeof arg2 === 'function') {
            testId = '';
            testName = String(arg1);
            testFn = arg2;
          } else {
            testId = String(arg1);
            testName = String(arg2);
            testFn = arg3;
          }

          const fullLabel = testId ? `[${testId}] ${testName}` : testName;
          if (args.filter && !suiteMatched && !fullLabel.match(args.filter)) {
            stats.skippedTests++;
            return;
          }

          stats.totalTests++;
          stats.tierStats[tierNum].tests++;
          const tStart = performance.now();

          try {
            if (typeof testFn === 'function') {
              const res = testFn();
              if (res && typeof res.then === 'function') {
                await res;
              }
            }
            const tDuration = (performance.now() - tStart).toFixed(1);
            stats.passedTests++;
            stats.tierStats[tierNum].passed++;
            suitePassed++;
            console.log(`    \x1b[32m✔\x1b[0m ${testId ? `\x1b[90m${testId}\x1b[0m ` : ''}${testName} \x1b[90m(${tDuration}ms)\x1b[0m`);
          } catch (err) {
            const tDuration = (performance.now() - tStart).toFixed(1);
            stats.failedTests++;
            stats.tierStats[tierNum].failed++;
            suiteFailed++;
            console.log(`    \x1b[31m✖\x1b[0m \x1b[1;31m${testId ? `${testId} ` : ''}${testName}\x1b[0m \x1b[90m(${tDuration}ms)\x1b[0m`);
            console.log(`      \x1b[31m${err.name}: ${err.message}\x1b[0m`);
            if (err.stack && args.verbose) {
              console.log(`      \x1b[90m${err.stack.split('\n').slice(1, 4).join('\n      ')}\x1b[0m`);
            }
            stats.failures.push({
              tier: tierNum,
              suite: suiteDef.name,
              file: suiteDef.file,
              testId,
              testName,
              error: err
            });

            if (args.bail) {
              throw new Error(`Bail triggered on failure: ${fullLabel}`);
            }
          }
        }
      };

      try {
        const suitePath = path.resolve(__dirname, suiteDef.file);
        const suiteFn = require(suitePath);
        if (typeof suiteFn === 'function') {
          await suiteFn(assert, sandbox, suiteRunner);
        } else {
          throw new Error(`Suite file ${suiteDef.file} does not export an executable function.`);
        }
      } catch (err) {
        if (args.bail && stats.failedTests > 0) {
          break;
        }
        console.log(`    \x1b[1;31m✖ Suite load error in ${suiteDef.file}: ${err.message}\x1b[0m`);
        stats.failedTests++;
        stats.tierStats[tierNum].failed++;
        stats.failures.push({
          tier: tierNum,
          suite: suiteDef.name,
          file: suiteDef.file,
          testId: 'SUITE_ERROR',
          testName: suiteDef.name,
          error: err
        });
        if (args.bail) break;
      }

      const suiteDuration = (performance.now() - suiteStart).toFixed(1);
      const suiteAssertions = assert.count - suiteAssertStart;
      console.log(`    \x1b[90m↳ Summary: ${suitePassed} passed, ${suiteFailed} failed (${suiteAssertions} assertions, ${suiteDuration}ms)\x1b[0m\n`);

      if (args.bail && stats.failedTests > 0) break;
    }

    stats.tierStats[tierNum].durationMs = performance.now() - tierStart;
    stats.tierStats[tierNum].assertions = assert.count - tierAssertStart;
    if (args.bail && stats.failedTests > 0) break;
  }

  stats.durationMs = performance.now() - overallStart;

  // Print Summary Table
  console.log('\x1b[1;36m========================================================================================\x1b[0m');
  console.log('\x1b[1;36m                                 TEST EXECUTION SUMMARY\x1b[0m');
  console.log('\x1b[1;36m========================================================================================\x1b[0m');
  console.log(' Tier                                            Suites  Tests  Pass  Fail  Assertions  Time(ms) ');
  console.log(' ----------------------------------------------------------------------------------------');

  for (const t of selectedTiers) {
    const s = stats.tierStats[t];
    const tierName = s.name.padEnd(46, ' ');
    const suites = String(s.suites).padStart(6, ' ');
    const tests = String(s.tests).padStart(6, ' ');
    const pass = `\x1b[32m${String(s.passed).padStart(5, ' ')}\x1b[0m`;
    const fail = s.failed > 0
      ? `\x1b[31m${String(s.failed).padStart(5, ' ')}\x1b[0m`
      : `\x1b[90m${String(s.failed).padStart(5, ' ')}\x1b[0m`;
    const asserts = String(s.assertions).padStart(11, ' ');
    const time = `${s.durationMs.toFixed(1)}ms`.padStart(9, ' ');
    console.log(` ${tierName} ${suites} ${tests} ${pass} ${fail} ${asserts} ${time}`);
  }

  console.log(' ----------------------------------------------------------------------------------------');
  const totalSuites = String(stats.totalSuites).padStart(6, ' ');
  const totalTests = String(stats.totalTests).padStart(6, ' ');
  const totalPass = `\x1b[1;32m${String(stats.passedTests).padStart(5, ' ')}\x1b[0m`;
  const totalFail = stats.failedTests > 0
    ? `\x1b[1;31m${String(stats.failedTests).padStart(5, ' ')}\x1b[0m`
    : `\x1b[90m${String(stats.failedTests).padStart(5, ' ')}\x1b[0m`;
  const totalAsserts = String(assert.count).padStart(11, ' ');
  const totalTime = `${stats.durationMs.toFixed(1)}ms`.padStart(9, ' ');
  console.log(` TOTAL                                          ${totalSuites} ${totalTests} ${totalPass} ${totalFail} ${totalAsserts} ${totalTime}`);
  console.log('\x1b[1;36m========================================================================================\x1b[0m');

  if (stats.failedTests > 0) {
    console.log(`\x1b[1;31mFAILURE: ${stats.failedTests} test(s) failed out of ${stats.totalTests}.\x1b[0m`);
    console.log('\x1b[1;31mFailed Test Details:\x1b[0m');
    stats.failures.forEach((f, idx) => {
      console.log(`  ${idx + 1}) [Tier ${f.tier}] ${f.suite} > ${f.testId} ${f.testName}`);
      console.log(`     ${f.error.message}`);
    });
    console.log('\x1b[1;36m========================================================================================\x1b[0m');
    process.exit(1);
  } else {
    console.log(`\x1b[1;32mSUCCESS: All ${stats.passedTests} tests passed across all tiers!\x1b[0m`);
    console.log(`\x1b[1;32mTotal Monotonic Assertions: ${assert.count}\x1b[0m`);
    console.log(`\x1b[1;32mDuration: ${stats.durationMs.toFixed(1)}ms | Exit Code: 0\x1b[0m`);
    console.log('\x1b[1;36m========================================================================================\x1b[0m');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('\x1b[1;31mFatal unhandled error in test runner:\x1b[0m', err);
  process.exit(1);
});
