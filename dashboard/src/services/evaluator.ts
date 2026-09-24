import { GoogleGenAI } from '@google/genai';
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

export type EvaluationResult = z.infer<typeof EvaluationSchema>;

export async function evaluateRecall(
  problemTitle: string,
  userApproach: string,
  userTime: string,
  userSpace: string,
  referenceCode: string,
  language: string
): Promise<EvaluationResult | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Skipping AI evaluation.");
    return null;
  }
  
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are a computer science tutor evaluating a student's recall of a Data Structures and Algorithms problem.

NOTE: The full problem statement text is not available. You must infer the problem constraints and definitions of input variables (like N or M) directly from the problem title and the reference solution provided below.

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
   - If their answer is empty or nonsensical, it is 'unclear'.
   - Explain why it is incorrect or what is missing if partial.

2. TIME COMPLEXITY: 
   - Infer the true expected time complexity from the reference solution and input variables.
   - DO NOT use simple string matching. You must semantically compare their answer.
   - Equivalent notations MUST be accepted (e.g., O(N*M) is the exact same as O(M*N) or O(N × M)). 
   - If empty, it is 'unclear'.

3. SPACE COMPLEXITY: 
   - Infer the true expected space complexity from the reference solution.
   - DO NOT use simple string matching. Evaluate semantically.

Return ONLY a valid JSON object matching this schema:
{
  "approach": {
    "status": "correct" | "partial" | "incorrect" | "unclear",
    "feedback": "string"
  },
  "time_complexity": {
    "status": "correct" | "partial" | "incorrect" | "unclear",
    "user_answer": "string",
    "expected": "string",
    "feedback": "string"
  },
  "space_complexity": {
    "status": "correct" | "partial" | "incorrect" | "unclear",
    "user_answer": "string",
    "expected": "string",
    "feedback": "string"
  }
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
