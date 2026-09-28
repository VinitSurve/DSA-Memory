import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

const StatusEnum = z.enum(['correct', 'partial', 'incorrect', 'uncertain']);

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

export type EvaluationResult = z.infer<typeof EvaluationSchema>;

export async function evaluateRecall(
  problemTitle: string,
  userApproach: string,
  userTime: string,
  userSpace: string,
  referenceCode: string,
  language: string,
  problemStatement: string = ""
): Promise<EvaluationResult | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Skipping AI evaluation.");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });

  const problemContext = problemStatement
    ? `Problem Statement & Constraints:\n${problemStatement}`
    : `The original problem statement is unavailable.

Do NOT invent constraints or input definitions that are not supported
by the available context.

If the available title, reference solution, and user answer are
insufficient to confidently evaluate correctness or complexity,
return the corresponding evaluation as "uncertain" rather than
pretending certainty.

Do NOT infer that a variable number of scores exists merely because the
reference implementation reads a variable-length input line.`;

  const prompt = `You are a computer science tutor evaluating a student's recall of a Data Structures and Algorithms problem.

${problemContext}

Problem Title: ${problemTitle}
Reference Solution Language: ${language}
Reference Solution Code:
\`\`\`
${referenceCode}
\`\`\`

Student's Recalled Approach: "${userApproach}"
Student's Recalled Time Complexity: "${userTime}"
Student's Recalled Space Complexity: "${userSpace}"

Task:
Evaluate the student's recall against the reference solution and general principles for this problem.

1. APPROACH: Is their conceptual algorithm valid for solving this problem efficiently? 
   - DO NOT require them to match the reference solution exactly. Valid alternative algorithms are perfectly acceptable if they correctly solve the problem.
   - DO NOT penalize for different variable names.
   - If their answer is empty or nonsensical, it is 'uncertain'.
   - Explain why it is incorrect or what is missing if partial.

2. TIME COMPLEXITY: 
   - Judge the time complexity of the STUDENT'S DESCRIBED APPROACH given the problem constraints, not simply copy the complexity of the reference solution.
   - DO NOT use simple string matching. You must semantically compare their answer.
   - Equivalent notations MUST be accepted (e.g., O(N*M) is the exact same as O(M*N) or O(N × M)). 
   - If the original problem constraints are unavailable and the complexity depends on constraints that cannot be confidently established from the available context, return 'uncertain' instead of 'incorrect'.
   - Do NOT invent variables such as M or L merely because the reference implementation could theoretically support them.
   - Only return 'incorrect' if it can be confidently established as wrong from the available context.

3. SPACE COMPLEXITY: 
   - Judge the space complexity of the STUDENT'S DESCRIBED APPROACH given the problem constraints, not simply copy the complexity of the reference solution.
   - DO NOT use simple string matching. Evaluate semantically.
   - If constraints are missing, return 'uncertain' instead of 'incorrect'. Do NOT invent variables.

Return ONLY a valid JSON object matching this schema:
{
  "approach": {
    "status": "correct" | "partial" | "incorrect" | "uncertain",
    "feedback": "string"
  },
  "time_complexity": {
    "status": "correct" | "partial" | "incorrect" | "uncertain",
    "user_answer": "string",
    "expected": "string",
    "feedback": "string"
  },
  "space_complexity": {
    "status": "correct" | "partial" | "incorrect" | "uncertain",
    "user_answer": "string",
    "expected": "string",
    "feedback": "string"
  }
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) return null;

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.error("AI returned malformed JSON");
      return null;
    }

    const result = EvaluationSchema.safeParse(parsed);
    if (!result.success) {
      console.error("AI response failed Zod schema validation", result.error);
      return null;
    }

    return result.data;
  } catch (error) {
    console.error("AI Evaluation failed:", error);
    return null;
  }
}
