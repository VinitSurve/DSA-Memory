import { z } from 'zod';

const StatusEnum = z.enum(['correct', 'partial', 'incorrect', 'unclear']);

const EvaluationSchema = z.object({
  approach: z.object({
    status: StatusEnum,
    feedback: z.string(),
  }),
  time_complexity: z.object({
    status: StatusEnum,
    user_answer: z.string(),
    expected: z.string(),
    feedback: z.string(),
  }),
  space_complexity: z.object({
    status: StatusEnum,
    user_answer: z.string(),
    expected: z.string(),
    feedback: z.string(),
  }),
});

function testMock(jsonText: string) {
  try {
    const parsed = JSON.parse(jsonText);
    const result = EvaluationSchema.safeParse(parsed);
    return result.success;
  } catch(e) {
    return false;
  }
}

console.log("Malformed evaluator response (banana):", !testMock('{"approach": {"status": "banana"}}') ? "PASS (Caught)" : "FAIL");
console.log("Empty response:", !testMock('') ? "PASS (Caught)" : "FAIL");
console.log("Invalid JSON:", !testMock('{"approach": {') ? "PASS (Caught)" : "FAIL");
console.log("Valid Response:", testMock(JSON.stringify({
  approach: { status: "correct", feedback: "Good" },
  time_complexity: { status: "correct", user_answer: "O(N)", expected: "O(N)", feedback: "Good" },
  space_complexity: { status: "correct", user_answer: "O(1)", expected: "O(1)", feedback: "Good" }
})) ? "PASS" : "FAIL");

