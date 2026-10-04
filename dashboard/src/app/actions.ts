'use server'

import { completeReview } from '@/services/db';
import { ReviewRating } from '@/services/review-engine';
import { revalidatePath } from 'next/cache';

export async function submitReview(problemId: string, rating: ReviewRating) {
  const result = await completeReview(problemId, rating);
  if (result.success) {
    revalidatePath('/reviews');
    revalidatePath(`/problems/${problemId}`);
    return result;
  }
  return { success: false };
}

import { evaluateRecall, EvaluationResult } from '@/services/evaluator';

export async function runEvaluation(
  problemTitle: string,
  userApproach: string,
  userTime: string,
  userSpace: string,
  referenceCode: string,
  language: string
): Promise<EvaluationResult | null> {
  return evaluateRecall(problemTitle, userApproach, userTime, userSpace, referenceCode, language);
}

import { generateCodeChoiceChallenge, CodeChoiceChallenge } from '@/services/question-generator';

export async function getRecallChallenge(
  problemTitle: string,
  solutionCode: string,
  language: string
): Promise<CodeChoiceChallenge | null> {
  console.log(`[getRecallChallenge] Invoked for problem: "${problemTitle}"`);
  console.log(`[getRecallChallenge] Solution code length: ${solutionCode ? solutionCode.length : 0} chars`);
  
  if (!solutionCode || solutionCode.trim() === '') {
    console.error(`[getRecallChallenge] FAILED: solutionCode is empty.`);
    return null;
  }

  console.log(`[getRecallChallenge] Calling generateCodeChoiceChallenge...`);
  const result = await generateCodeChoiceChallenge(problemTitle, solutionCode, language);
  
  if (!result) {
    console.error(`[getRecallChallenge] FAILED: generateCodeChoiceChallenge returned null.`);
  } else {
    console.log(`[getRecallChallenge] SUCCESS: Generated challenge of type: ${result.type}`);
  }
  
  return result;
}
