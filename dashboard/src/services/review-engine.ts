import { Memory } from '../types/database';

export type ReviewRating = 'forgot' | 'hard' | 'remembered' | 'easy';

const REVIEW_INTERVALS = [
  1,   // count 0
  3,   // count 1
  7,   // count 2
  14,  // count 3
  30,  // count 4
  60,  // count 5+
];

export function calculateNextReview(currentMemory: Memory | null, rating: ReviewRating): Partial<Memory> {
  const currentCount = currentMemory?.review_count || 0;
  let nextCount = currentCount;

  switch (rating) {
    case 'forgot':
      nextCount = 0;
      break;
    case 'hard':
      // Keep count same, effectively repeating current interval bucket
      nextCount = currentCount;
      break;
    case 'remembered':
      nextCount = currentCount + 1;
      break;
    case 'easy':
      nextCount = currentCount + 2;
      break;
  }

  // The nextCount starts at 1 for the first bucket (1 day), 
  // so we subtract 1 to get the 0-based array index.
  // Exception: if count is 0 (forgot), we still use bucket 0 (1 day).
  const bucketIndex = Math.max(0, nextCount - 1);
  const maxBucket = REVIEW_INTERVALS.length - 1;
  const effectiveBucket = Math.min(bucketIndex, maxBucket);
  
  const intervalDays = REVIEW_INTERVALS[effectiveBucket];
  
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + intervalDays);
  
  // We don't return the exact interval, just the updated fields for the DB
  return {
    review_count: nextCount,
    last_reviewed_at: new Date().toISOString(),
    next_review_at: nextDate.toISOString()
  };
}
