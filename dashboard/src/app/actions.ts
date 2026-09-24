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
