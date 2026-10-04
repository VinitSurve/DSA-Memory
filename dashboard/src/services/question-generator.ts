import { z } from 'zod';
import { executeWithGemini } from './llm-infra';

const CodeChoiceSchema = z.object({
  type: z.literal('code_choice'),
  promptText: z.string(),
  codeSnippet: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.string(),
  explanation: z.string()
});

export type CodeChoiceChallenge = z.infer<typeof CodeChoiceSchema>;

export async function generateCodeChoiceChallenge(
  problemTitle: string,
  solutionCode: string,
  language: string
): Promise<CodeChoiceChallenge | null> {
  const prompt = `You are a computer science tutor creating a recall challenge for a student.

Problem: ${problemTitle}
Language: ${language}
Student's Actual Solution Code:
\`\`\`
${solutionCode}
\`\`\`

Task:
Generate a "code_choice" (multiple choice) recall challenge based STRICTLY on the student's solution code above.
1. Pick one important line or expression from their code.
2. Replace a crucial variable, function name, or small expression in that line with '_____' (5 underscores).
3. Provide the modified code snippet (it can be just the surrounding lines or the whole code, but keep it brief enough to read quickly).
4. Provide 4 plausible options for what goes in the blank. One must be the exact correct answer from their original code.
5. Provide a short explanation of why the correct answer is right in the context of their algorithm.

CRITICAL RULES:
- DO NOT invent new code. The snippet MUST be verbatim from their solution, just with one part blanked out.
- The options should be realistic distractor variables or functions that appear elsewhere in the code or are common mistakes.
- Return ONLY a valid JSON object matching this schema:
{
  "type": "code_choice",
  "promptText": "string (e.g., 'Fill in the missing part of the code:')",
  "codeSnippet": "string (the code with _____)",
  "options": ["string", "string", "string", "string"],
  "correctAnswer": "string (exactly matching one of the options)",
  "explanation": "string"
}`;

  return executeWithGemini('Question Generator', async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
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
      console.error("AI returned malformed JSON for question generation.");
      return null;
    }

    const result = CodeChoiceSchema.safeParse(parsed);
    if (!result.success) {
      console.error("AI response failed Zod schema validation for question generation.", result.error);
      return null; 
    }

    return result.data;
  });
}
