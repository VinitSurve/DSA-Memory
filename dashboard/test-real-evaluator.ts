import { evaluateRecall } from './src/services/evaluator';

async function run() {
  console.log("Testing Real Evaluator...");
  const res = await evaluateRecall("Test", "Test", "O(1)", "O(1)", "print('Hello')", "python");
  console.log("Result:", JSON.stringify(res, null, 2));
}

run().catch(console.error);
