'use client';

import { useState } from 'react';
import { ProblemDetail } from '@/services/db';
import { submitReview, runEvaluation } from '@/app/actions';
import { ReviewRating } from '@/services/review-engine';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CodeViewer from './CodeViewer';
import { EvaluationResult } from '@/services/evaluator';

type Step = 'RECALL' | 'EVALUATE' | 'REVEAL' | 'DONE';

export default function ReviewSessionClient({ problem }: { problem: ProblemDetail }) {
  const [step, setStep] = useState<Step>('RECALL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [nextReviewDate, setNextReviewDate] = useState<string | null>(null);
  
  const [approach, setApproach] = useState('');
  const [time, setTime] = useState('');
  const [space, setSpace] = useState('');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  
  const router = useRouter();

  const handleReveal = () => setStep('REVEAL');

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    const latestSubmission = problem.submissions && problem.submissions.length > 0 ? problem.submissions[0] : null;
    const result = await runEvaluation(
      problem.title,
      approach,
      time,
      space,
      latestSubmission?.solution_code || '',
      latestSubmission?.language || 'text'
    );
    setEvaluation(result);
    setStep('EVALUATE');
    setIsEvaluating(false);
  };

  const handleAssessment = async (rating: ReviewRating) => {
    setIsSubmitting(true);
    const result = await submitReview(problem.id, rating);
    if (result.success) {
      if (result.nextReviewAt) {
        setNextReviewDate(new Date(result.nextReviewAt).toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        }));
      }
      setStep('DONE');
    }
    setIsSubmitting(false);
  };

  const latestSubmission = problem.submissions && problem.submissions.length > 0 ? problem.submissions[0] : null;
  const otherSubmissionsCount = problem.submissions ? Math.max(0, problem.submissions.length - 1) : 0;

  if (step === 'DONE') {
    return (
      <div className="p-8 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Review completed</h1>
        <p className="text-slate-500 mb-2">The next review interval has been scheduled.</p>
        {nextReviewDate && (
          <div className="text-xl font-medium text-slate-800 mb-8 bg-slate-100 px-6 py-3 rounded-lg inline-block">
            Next review: {nextReviewDate}
          </div>
        )}
        <button 
          onClick={() => router.push('/reviews')}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{problem.title}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
            <span className="font-medium bg-slate-100 px-2.5 py-0.5 rounded-full">{problem.platform}</span>
            <span className="capitalize">{problem.difficulty || 'N/A'}</span>
            <span>•</span>
            <span>{problem.submissions?.length || 0} previous submissions</span>
          </div>
        </div>
        <Link href={problem.url} target="_blank" className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
          Open Problem
        </Link>
      </div>

      {(step === 'RECALL' || step === 'EVALUATE') && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">How would you solve this problem?</h2>
            <p className="text-sm text-slate-500 mb-6 -mt-2">Describe the algorithm in your own words. Don't write the full code.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Algorithm / Approach</label>
                <textarea 
                  value={approach}
                  onChange={e => setApproach(e.target.value)}
                  disabled={step === 'EVALUATE'}
                  placeholder="How would you solve this?"
                  className="w-full h-32 p-3 text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-75"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Time Complexity</label>
                  <input type="text" value={time} onChange={e => setTime(e.target.value)} disabled={step === 'EVALUATE'} className="w-full p-2.5 text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-75" placeholder="e.g. O(N)" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Space Complexity</label>
                  <input type="text" value={space} onChange={e => setSpace(e.target.value)} disabled={step === 'EVALUATE'} className="w-full p-2.5 text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-75" placeholder="e.g. O(1)" />
                </div>
              </div>
            </div>
            
            {step === 'RECALL' && (
              <div className="mt-8 flex justify-end gap-3">
                <button 
                  onClick={handleReveal}
                  disabled={isEvaluating}
                  className="px-6 py-3 text-slate-600 hover:text-slate-900 font-medium transition-colors md:w-auto text-center disabled:opacity-50"
                >
                  Skip
                </button>
                <button 
                  onClick={handleEvaluate}
                  disabled={isEvaluating}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors w-full md:w-auto text-center disabled:opacity-50 flex items-center gap-2"
                >
                  {isEvaluating ? 'Evaluating...' : 'Check My Recall'}
                </button>
              </div>
            )}
          </div>
          
          {step === 'EVALUATE' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Recall Evaluation</h2>
              
              {!evaluation ? (
                <div className="text-amber-600 bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
                  Evaluation unavailable right now. You can still reveal the solution.
                </div>
              ) : (
                <div className="space-y-6 mb-8">
                  <div className={`p-4 rounded-lg border ${evaluation.approach.status === 'correct' ? 'bg-green-50 border-green-200' : evaluation.approach.status === 'partial' ? 'bg-amber-50 border-amber-200' : evaluation.approach.status === 'unclear' ? 'bg-slate-100 border-slate-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-slate-900">Approach</h3>
                      <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${evaluation.approach.status === 'correct' ? 'text-green-700 bg-green-100' : evaluation.approach.status === 'partial' ? 'text-amber-700 bg-amber-100' : evaluation.approach.status === 'unclear' ? 'text-slate-600 bg-slate-200' : 'text-red-700 bg-red-100'}`}>{evaluation.approach.status}</span>
                    </div>
                    <p className="text-sm text-slate-700">{evaluation.approach.feedback}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg border ${evaluation.time_complexity.status === 'correct' ? 'bg-green-50 border-green-200' : evaluation.time_complexity.status === 'partial' ? 'bg-amber-50 border-amber-200' : evaluation.time_complexity.status === 'unclear' ? 'bg-slate-100 border-slate-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-slate-900">Time</h3>
                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${evaluation.time_complexity.status === 'correct' ? 'text-green-700 bg-green-100' : evaluation.time_complexity.status === 'partial' ? 'text-amber-700 bg-amber-100' : evaluation.time_complexity.status === 'unclear' ? 'text-slate-600 bg-slate-200' : 'text-red-700 bg-red-100'}`}>{evaluation.time_complexity.status}</span>
                      </div>
                      <div className="text-sm space-y-1 mt-2 mb-2">
                        <p><span className="text-slate-500">Your answer:</span> {evaluation.time_complexity.user_answer}</p>
                        <p><span className="text-slate-500">Expected:</span> {evaluation.time_complexity.expected}</p>
                      </div>
                      <p className="text-sm text-slate-700 border-t border-slate-200/50 pt-2">{evaluation.time_complexity.feedback}</p>
                    </div>
                    
                    <div className={`p-4 rounded-lg border ${evaluation.space_complexity.status === 'correct' ? 'bg-green-50 border-green-200' : evaluation.space_complexity.status === 'partial' ? 'bg-amber-50 border-amber-200' : evaluation.space_complexity.status === 'unclear' ? 'bg-slate-100 border-slate-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-slate-900">Space</h3>
                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${evaluation.space_complexity.status === 'correct' ? 'text-green-700 bg-green-100' : evaluation.space_complexity.status === 'partial' ? 'text-amber-700 bg-amber-100' : evaluation.space_complexity.status === 'unclear' ? 'text-slate-600 bg-slate-200' : 'text-red-700 bg-red-100'}`}>{evaluation.space_complexity.status}</span>
                      </div>
                      <div className="text-sm space-y-1 mt-2 mb-2">
                        <p><span className="text-slate-500">Your answer:</span> {evaluation.space_complexity.user_answer}</p>
                        <p><span className="text-slate-500">Expected:</span> {evaluation.space_complexity.expected}</p>
                      </div>
                      <p className="text-sm text-slate-700 border-t border-slate-200/50 pt-2">{evaluation.space_complexity.feedback}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <button 
                  onClick={handleReveal}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors w-full md:w-auto text-center"
                >
                  Reveal Solution
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 'REVEAL' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex justify-between items-center">
              <h2 className="font-semibold text-slate-700">Your solution</h2>
              <span className="text-sm font-medium text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded">
                {latestSubmission?.language || 'Code'}
              </span>
            </div>
            
            <CodeViewer 
              code={latestSubmission?.solution_code || 'No code found'} 
              language={latestSubmission?.language || 'text'} 
            />
            
            {otherSubmissionsCount > 0 && (
              <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 flex justify-between items-center">
                <span>You also have {otherSubmissionsCount} other submission{otherSubmissionsCount > 1 ? 's' : ''}</span>
                <Link href={`/problems/${problem.id}`} className="text-blue-600 hover:underline">View all</Link>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-blue-900 mb-6">How well did you remember this?</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={() => handleAssessment('forgot')}
                disabled={isSubmitting}
                className="flex flex-col items-center justify-center p-4 bg-white border border-red-200 rounded-lg hover:border-red-500 hover:bg-red-50 hover:text-red-700 transition-colors group disabled:opacity-50"
              >
                <span className="text-red-500 mb-1 group-hover:scale-110 transition-transform">🔴</span>
                <span className="font-medium text-slate-700 group-hover:text-red-700">Forgot</span>
                <span className="text-xs text-slate-400 mt-1">&lt; 1 min</span>
              </button>
              
              <button 
                onClick={() => handleAssessment('hard')}
                disabled={isSubmitting}
                className="flex flex-col items-center justify-center p-4 bg-white border border-orange-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 hover:text-orange-700 transition-colors group disabled:opacity-50"
              >
                <span className="text-orange-500 mb-1 group-hover:scale-110 transition-transform">🟠</span>
                <span className="font-medium text-slate-700 group-hover:text-orange-700">Hard</span>
                <span className="text-xs text-slate-400 mt-1">Struggled</span>
              </button>
              
              <button 
                onClick={() => handleAssessment('remembered')}
                disabled={isSubmitting}
                className="flex flex-col items-center justify-center p-4 bg-white border border-green-200 rounded-lg hover:border-green-500 hover:bg-green-50 hover:text-green-700 transition-colors group disabled:opacity-50"
              >
                <span className="text-green-500 mb-1 group-hover:scale-110 transition-transform">🟢</span>
                <span className="font-medium text-slate-700 group-hover:text-green-700">Remembered</span>
                <span className="text-xs text-slate-400 mt-1">Good</span>
              </button>
              
              <button 
                onClick={() => handleAssessment('easy')}
                disabled={isSubmitting}
                className="flex flex-col items-center justify-center p-4 bg-white border border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors group disabled:opacity-50"
              >
                <span className="text-blue-500 mb-1 group-hover:scale-110 transition-transform">🔵</span>
                <span className="font-medium text-slate-700 group-hover:text-blue-700">Easy</span>
                <span className="text-xs text-slate-400 mt-1">Too simple</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
