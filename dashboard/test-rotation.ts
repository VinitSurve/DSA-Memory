import { evaluateRecall } from './src/services/evaluator';

async function run() {
  const result = await evaluateRecall(
    'Test Problem',
    'I just hardcoded everything.',
    'O(1)',
    'O(1)',
    'def solve(): pass',
    'Python 3'
  );

  console.log("\nFinal result returned:", result ? "SUCCESS" : "NULL/FAILED");
}

run().catch(console.error);
