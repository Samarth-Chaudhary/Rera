import { runForensicAuditTests } from './src/lib/test-runner.ts';

console.log("==========================================");
console.log("RUNNING RERA FORENSIC AUDIT ACCEPTANCE TESTS");
console.log("==========================================");

const results = runForensicAuditTests();
let passed = 0;
let failed = 0;

results.forEach((r, idx) => {
  const status = r.passed ? "✓ PASS" : "✗ FAIL";
  console.log(`${idx + 1}. [${r.category}] ${status}: ${r.testName}`);
  if (!r.passed) {
    console.error(`   Message: ${r.message}`);
    console.error(`   Expected:`, r.expected);
    console.error(`   Actual:`, r.actual);
    failed++;
  } else {
    passed++;
  }
});

console.log("==========================================");
console.log(`TOTAL: ${results.length} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("==========================================");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
