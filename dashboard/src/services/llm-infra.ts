import { GoogleGenAI } from '@google/genai';

export interface KeyStatus {
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
    isInvalid: !k.key.startsWith('AIza'), // Standard Google AI Studio API keys start with AIza
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
  const fullStr = JSON.stringify(error || {}).toLowerCase();
  
  // 400 or zero quota limit = Invalid Key / Auth Issues / Inactive Project Key
  if (
    status === 400 || 
    status === 'INVALID_ARGUMENT' || 
    message.includes('invalid api key') || 
    message.includes('api key not valid') ||
    fullStr.includes('quota_limit_value":"0"') ||
    fullStr.includes('quota_limit_value": 0') ||
    fullStr.includes('limit_value":"0"') ||
    fullStr.includes('limit_value": 0')
  ) {
    return { retryable: false, invalidKey: true, reason: 'INVALID_OR_ZERO_QUOTA_KEY' };
  }

  // 429 = Rate Limit / Quota Exhaustion
  if (status === 429 || status === 'RESOURCE_EXHAUSTED' || message.includes('quota') || message.includes('429')) {
    return { retryable: true, reason: 'RATE_LIMIT_OR_QUOTA' };
  }
  
  // 503 = High Demand / Unavailable
  if (status === 503 || status === 'UNAVAILABLE' || message.includes('503') || message.includes('high demand') || message.includes('overloaded')) {
    return { retryable: true, reason: 'HIGH_DEMAND_OR_503' };
  }

  // Network timeouts / Fetch failures
  if (message.includes('timeout') || message.includes('network') || message.includes('fetch failed')) {
     return { retryable: true, reason: 'NETWORK_ERROR' };
  }

  // Other structural or 4xx errors should fail immediately and not burn through other keys
  return { retryable: false, reason: 'NON_RETRYABLE_ERROR' };
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function executeWithGemini<T>(
  actionName: string,
  action: (ai: GoogleGenAI) => Promise<T | null>
): Promise<T | null> {
  initKeys();
  if (!keyPool || keyPool.length === 0) {
    console.warn(`[${actionName}] No GEMINI_API_KEY variables are set. Skipping AI execution.`);
    return null;
  }

  let attempts = 0;
  const maxAttempts = keyPool.length * 2; // Allow some retries if keys are on cooldown

  while (attempts < maxAttempts) {
    const ks = getAvailableKey();
    
    if (!ks) {
      // If no keys are currently available, check if any are on cooldown
      const hasValidKeysOnCooldown = keyPool.some(k => !k.isInvalid && k.cooldownUntil > Date.now());
      if (hasValidKeysOnCooldown) {
         console.log(`[${actionName}] All valid keys are on cooldown. Waiting 2 seconds before checking again...`);
         await sleep(2000);
         attempts++;
         continue;
      }
      
      console.error(`[${actionName}] All configured API keys are invalid or exhausted. Infrastructure failure.`);
      return null;
    }
    
    const ai = new GoogleGenAI({ apiKey: ks.key });
    try {
      return await action(ai);
    } catch (error: any) {
      console.error(`[${actionName}] Raw API error:`, error.status, error.message);
      const classification = isRetryableApiError(error);
      attempts++;
      
      if (classification.invalidKey) {
        console.error(`[${actionName}] failed using key_slot: ${ks.slot}. Reason: Invalid API Key. Marking key as permanently invalid.`);
        ks.isInvalid = true;
        continue;
      }
      
      if (classification.retryable) {
        console.error(`[${actionName}] failed using key_slot: ${ks.slot}. Reason: ${classification.reason}. Putting key on 60s cooldown.`);
        ks.cooldownUntil = Date.now() + 60000; // 60s cooldown
        continue;
      }
      
      // If not retryable and not an invalid key (e.g. malformed request, model unsupported)
      console.error(`[${actionName}] failed using key_slot: ${ks.slot}. Reason: ${classification.reason}. Aborting request as it is not a retryable infrastructure error. Details:`, error.message || error);
      return null;
    }
  }
  
  console.error(`[${actionName}] Exhausted max attempts (${maxAttempts}) rotating through key pool. Infrastructure failure.`);
  return null;
}
