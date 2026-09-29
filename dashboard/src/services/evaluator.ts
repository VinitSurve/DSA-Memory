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

interface KeyStatus {
  key: string;
  slot: number;
  cooldownUntil: number;
  isInvalid: boolean;
}

let keyPool: KeyStatus[] | null = null;
let currentKeyIndex = 0;

function initKeys() {
  if (keyPool) return;
  const envKeys: { slot: number; key: string }[] = [];
  for (const [envName, value] of Object.entries(process.env)) {
    if (envName.startsWith('GEMINI_API_KEY') && value) {
      const match = envName.match(/^GEMINI_API_KEY_(\d+)$/);
      // Fallback slot to 0 if it's just 'GEMINI_API_KEY', otherwise use the captured number
      let slot = match ? parseInt(match[1], 10) : 0;
      envKeys.push({ slot, key: value });
    }
  }
  
  // Sort by slot number to guarantee deterministic ordering
  envKeys.sort((a, b) => a.slot - b.slot);
  
  keyPool = envKeys.map((k, idx) => ({
    key: k.key,
    slot: k.slot || idx + 1,
    cooldownUntil: 0,
    isInvalid: false,
  }));
}

function getAvailableKey(): KeyStatus | null {
  initKeys();
  if (!keyPool || keyPool.length === 0) return null;
  
  const now = Date.now();
  const startIndex = currentKeyIndex;
  
  do {
    const ks = keyPool[currentKeyIndex];
    if (!ks.isInvalid && ks.cooldownUntil <= now) {
      // Found a good key, advance index for next time to round-robin
      currentKeyIndex = (currentKeyIndex + 1) % keyPool.length;
      return ks;
    }
    currentKeyIndex = (currentKeyIndex + 1) % keyPool.length;
  } while (currentKeyIndex !== startIndex);
  
  return null; // All keys are exhausted, invalid, or on cooldown
}

function isRetryableApiError(error: any): { retryable: boolean; invalidKey?: boolean; reason?: string } {
  const status = error?.status;
  const message = (error?.message || '').toLowerCase();
  
  // 429 = Rate Limit / Quota Exhaustion
  if (status === 429 || status === 'RESOURCE_EXHAUSTED' || message.includes('quota') || message.includes('429')) {
    return { retryable: true, reason: 'RATE_LIMIT_OR_QUOTA' };
  }
  
  // 503 = High Demand / Unavailable
  if (status === 503 || status === 'UNAVAILABLE' || message.includes('503') || message.includes('high demand') || message.includes('overloaded')) {
    return { retryable: true, reason: 'HIGH_DEMAND_OR_503' };
  }
  
  // 400 = Invalid Key / Auth Issues
  if (status === 400 || status === 'INVALID_ARGUMENT' || message.includes('invalid api key') || message.includes('api key not valid')) {
    return { retryable: false, invalidKey: true, reason: 'INVALID_API_KEY' };
  }

  // Network timeouts / Fetch failures
  if (message.includes('timeout') || message.includes('network') || message.includes('fetch failed')) {
     return { retryable: true, reason: 'NETWORK_ERROR' };
  }

  // Other structural or 4xx errors should fail immediately and not burn through other keys
  return { retryable: false, reason: 'NON_RETRYABLE_ERROR' };
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function evaluateRecall(
  problemTitle: string,
  userApproach: string,
  userTime: string,
  userSpace: string,
  referenceCode: string,
  language: string,
  problemStatement: string = ""
): Promise<EvaluationResult | null> {
  initKeys();
  if (!keyPool || keyPool.length === 0) {
    console.warn("No GEMINI_API_KEY variables are set. Skipping AI evaluation.");
    return null;
  }

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

  let attempts = 0;
  const maxAttempts = keyPool.length * 2; // Allow some retries if keys are on cooldown

  while (attempts < maxAttempts) {
    const ks = getAvailableKey();
    
    if (!ks) {
      // If no keys are currently available, check if any are on cooldown
      const hasValidKeysOnCooldown = keyPool.some(k => !k.isInvalid && k.cooldownUntil > Date.now());
      if (hasValidKeysOnCooldown) {
         console.log("All valid keys are on cooldown. Waiting 2 seconds before checking again...");
         await sleep(2000);
         attempts++;
         continue;
      }
      
      console.error("All configured API keys are invalid or exhausted. Infrastructure failure.");
      return null;
    }
    
    const ai = new GoogleGenAI({ apiKey: ks.key });
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
        console.error("AI returned malformed JSON. This is an evaluation error, not infrastructure.");
        return null;
      }

      const result = EvaluationSchema.safeParse(parsed);
      if (!result.success) {
        console.error("AI response failed Zod schema validation. Evaluation error, not infrastructure.", result.error);
        return null; 
      }

      return result.data;
    } catch (error: any) {
      const classification = isRetryableApiError(error);
      attempts++;
      
      if (classification.invalidKey) {
        console.error(`AI Evaluation failed using key_slot: ${ks.slot}. Reason: Invalid API Key. Marking key as permanently invalid.`);
        ks.isInvalid = true;
        continue;
      }
      
      if (classification.retryable) {
        console.error(`AI Evaluation failed using key_slot: ${ks.slot}. Reason: ${classification.reason}. Putting key on 60s cooldown.`);
        ks.cooldownUntil = Date.now() + 60000; // 60s cooldown
        continue;
      }
      
      // If not retryable and not an invalid key (e.g. malformed request, model unsupported)
      console.error(`AI Evaluation failed using key_slot: ${ks.slot}. Reason: ${classification.reason}. Aborting request as it is not a retryable infrastructure error. Details:`, error.message || error);
      return null;
    }
  }
  
  console.error(`Exhausted max attempts (${maxAttempts}) rotating through key pool. Infrastructure failure.`);
  return null;
}
