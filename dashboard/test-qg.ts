import { generateCodeChoiceChallenge } from './src/services/question-generator';

async function run() {
  console.log("Testing Question Generator...");
  const code = `def solveMeFirst(a,b):\n    return a+b\n\nnum1 = int(input())\nnum2 = int(input())\nres = solveMeFirst(num1,num2)\nprint(res)`;
  const res = await generateCodeChoiceChallenge("Solve Me First", code, "python");
  console.log("Result:", JSON.stringify(res, null, 2));
}

run().catch(console.error);
