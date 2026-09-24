import { calculateNextReview } from './dashboard/src/services/review-engine';

const tests = [
  { memory: { review_count: 0 }, rating: 'remembered' }, // Expect count=1, interval=1
  { memory: { review_count: 0 }, rating: 'forgot' },     // Expect count=0, interval=??
  { memory: { review_count: 0 }, rating: 'hard' },       // Expect count=0, interval=??
  { memory: { review_count: 1 }, rating: 'remembered' }, // Expect count=2, interval=3
];

tests.forEach((t) => {
  const result = calculateNextReview(t.memory as any, t.rating as any);
  const diffHours = Math.round((new Date(result.next_review_at as string).getTime() - new Date().getTime()) / (1000 * 60 * 60));
  const diffDays = Math.round(diffHours / 24);
  console.log(`count=${t.memory.review_count} rating=${t.rating} -> next_count=${result.review_count} interval=${diffDays} days`);
});
