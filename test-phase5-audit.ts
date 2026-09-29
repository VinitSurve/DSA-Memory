import { saveSubmission } from './src/services/submission-service.js';

async function runAudit() {
  console.log("=== PHASE 5 INTEGRATION AUDIT ===");

  const payload1 = {
    platform: 'hackerrank',
    title: 'Audit Test Problem',
    url: 'https://www.hackerrank.com/challenges/audit-test/problem',
    difficulty: 'Easy',
    language: 'Python 3',
    solutionCode: 'print("Hello World")',
    submittedAt: new Date().toISOString()
  };

  console.log("\n1. First Submission (New)");
  const res1 = await saveSubmission(payload1);
  console.log("Result:", res1);

  console.log("\n2. Duplicate Submission (Same Code)");
  const res2 = await saveSubmission(payload1);
  console.log("Result:", res2);
  if (res2.duplicate) {
    console.log("-> ✅ Duplicate correctly detected by database constraint.");
  }

  console.log("\n3. New Submission (Modified Code)");
  const payload2 = { ...payload1, solutionCode: 'print("Hello World Modified")' };
  const res3 = await saveSubmission(payload2);
  console.log("Result:", res3);
  if (res3.success && !res3.duplicate) {
    console.log("-> ✅ Modified code successfully saved as a new submission.");
  }
}

runAudit().catch(console.error);
