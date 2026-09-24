import { saveSubmission } from './src/services/submission-service.js';
import { supabase } from './src/services/supabase.js';
import { ExtractedSubmissionPayload } from './src/shared/types.js';

async function runTests() {
  console.log('--- STARTING PERSISTENCE TESTS ---');

  // We need to fetch the existing 'Solve Me First' problem to use its exact details for Test A
  const { data: existingProblems } = await supabase.from('problems').select('*').eq('title', 'Solve Me First');
  if (!existingProblems || existingProblems.length === 0) {
    console.error('Could not find Solve Me First problem. Make sure migration is run.');
    return;
  }
  const solveMeFirst = existingProblems[0];
  
  // We also need an existing submission to get the exact code used
  const { data: existingSubmissions } = await supabase.from('submissions').select('*').eq('problem_id', solveMeFirst.id);
  if (!existingSubmissions || existingSubmissions.length === 0) {
    console.error('Could not find existing submission for Solve Me First.');
    return;
  }
  const originalSubmission = existingSubmissions[0];

  const basePayload: ExtractedSubmissionPayload = {
    platform: solveMeFirst.platform,
    title: solveMeFirst.title,
    url: solveMeFirst.url,
    difficulty: solveMeFirst.difficulty,
    language: originalSubmission.language,
    solutionCode: originalSubmission.solution_code,
    submittedAt: new Date().toISOString()
  };

  // TEST A: Existing problem + EXACT same solution
  console.log('\n--- TEST A: Existing problem + EXACT same solution ---');
  const resA = await saveSubmission(basePayload);
  console.log('Result A:', resA);

  // TEST B: Existing problem + DIFFERENT solution
  console.log('\n--- TEST B: Existing problem + DIFFERENT solution ---');
  const payloadB = {
    ...basePayload,
    solutionCode: basePayload.solutionCode + '\n# Added a comment for Test B'
  };
  const resB = await saveSubmission(payloadB);
  console.log('Result B:', resB);

  // TEST C: NEW problem
  console.log('\n--- TEST C: NEW problem ---');
  const payloadC: ExtractedSubmissionPayload = {
    platform: 'hackerrank',
    title: 'Test New Problem 2',
    url: 'https://www.hackerrank.com/challenges/test-new-problem-2/problem',
    difficulty: 'Easy',
    language: 'Python 3',
    solutionCode: 'print("Hello World 2")\n# Test C Code',
    submittedAt: new Date().toISOString()
  };
  const resC = await saveSubmission(payloadC);
  console.log('Result C:', resC);

  // TEST D: REFRESH + duplicate (using TEST C payload again)
  console.log('\n--- TEST D: REFRESH + duplicate ---');
  const resD = await saveSubmission(payloadC);
  console.log('Result D:', resD);

  console.log('\n--- FINAL DATABASE STATE ---');
  
  const { data: query1, error: err1 } = await supabase
    .from('problems')
    .select(`
      id,
      title,
      submissions(id),
      memories(id, review_count, next_review_at)
    `);
    
  if (err1) {
    console.error('Query 1 Error:', err1);
  } else {
    console.log('\nProblem -> Submissions -> Memory:');
    query1.forEach(p => {
      console.log(`- ${p.title} (ID: ${p.id})`);
      console.log(`  Submissions: ${p.submissions.length}`);
      console.log(`  Memory ID: ${p.memories?.[0]?.id || 'NONE'}`);
      console.log(`  Review Count: ${p.memories?.[0]?.review_count}`);
    });
  }

  const { data: query2, error: err2 } = await supabase
    .from('submissions')
    .select('id, problem_id, language, submission_fingerprint, submitted_at')
    .order('submitted_at', { ascending: true });

  if (err2) {
    console.error('Query 2 Error:', err2);
  } else {
    console.log('\nAll Submissions:');
    console.table(query2);
  }
}

runTests();
