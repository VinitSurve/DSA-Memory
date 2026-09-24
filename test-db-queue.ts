import { getReviewQueue } from './dashboard/src/services/db';
getReviewQueue().then(res => console.log(JSON.stringify(res, null, 2))).catch(console.error);
