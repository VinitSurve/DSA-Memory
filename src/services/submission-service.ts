import { supabase } from './supabase';
import { ExtractedSubmissionPayload } from '../shared/types';

async function generateFingerprint(platform: string, url: string, code: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(platform + ':' + url + ':' + code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function saveSubmission(data: ExtractedSubmissionPayload) {
  try {
    const fingerprint = await generateFingerprint(data.platform, data.url, data.solutionCode);

    // Step 1: Upsert the conceptual Problem (guaranteed unique by platform, url)
    const { data: problemData, error: problemError } = await supabase
      .from('problems')
      .upsert(
        {
          platform: data.platform,
          external_problem_id: data.externalProblemId,
          title: data.title,
          url: data.url,
          difficulty: data.difficulty,
        },
        { onConflict: 'platform,url' }
      )
      .select('id')
      .single();

    if (problemError || !problemData) {
      console.error('[DSA Memory] Supabase problem upsert error:', problemError);
      return { success: false, error: problemError };
    }

    const problemId = problemData.id;

    // Step 2: Insert the Submission using the problem_id
    const { error: submissionError } = await supabase
      .from('submissions')
      .insert({
        problem_id: problemId,
        language: data.language,
        solution_code: data.solutionCode,
        submission_fingerprint: fingerprint,
        submitted_at: data.submittedAt
      });

    if (submissionError) {
      // Postgres unique violation code is '23505'
      if (submissionError.code === '23505') {
        console.log('[DSA Memory] Duplicate submission blocked atomically by database unique constraint.');
        return { success: true, duplicate: true };
      }
      console.error('[DSA Memory] Supabase submission insert error:', submissionError);
      return { success: false, error: submissionError };
    }

    // Step 3: Ensure a Memory record exists (don't overwrite if it does)
    const { error: memoryError } = await supabase
      .from('memories')
      .upsert(
        { problem_id: problemId },
        { onConflict: 'problem_id', ignoreDuplicates: true }
      );

    if (memoryError) {
      console.error('[DSA Memory] Supabase memory initialization error:', memoryError);
      // We don't fail the whole submission if memory init fails, but we log it
    }

    return { success: true, duplicate: false };
  } catch (err) {
    console.error('[DSA Memory] Error saving submission:', err);
    return { success: false, error: err };
  }
}
