import { getProblemById } from '../../../services/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, ExternalLink, Hash, Clock, History, Cpu } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProblemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Await the params object in Next.js 15+
  const { id } = await params;
  
  const problem = await getProblemById(id);

  if (!problem) {
    notFound();
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Link href="/problems" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 mb-6 transition-colors">
        <ArrowLeft size={16} className="mr-1" /> Back to problems
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Problem Details & Memory */}
        <div className="lg:w-1/3 flex flex-col gap-6">
          {/* Problem Info Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-xl font-bold text-slate-900 leading-tight">{problem.title}</h1>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 text-sm flex items-center gap-2"><Cpu size={16}/> Platform</span>
                <span className="font-medium capitalize text-sm">{problem.platform}</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 text-sm flex items-center gap-2"><Hash size={16}/> Difficulty</span>
                <span className={`font-semibold text-sm ${
                      problem.difficulty?.toLowerCase() === 'easy' ? 'text-emerald-600' :
                      problem.difficulty?.toLowerCase() === 'medium' ? 'text-amber-600' :
                      problem.difficulty?.toLowerCase() === 'hard' ? 'text-red-600' : 'text-slate-600'
                    }`}>
                  {problem.difficulty || 'N/A'}
                </span>
              </div>
              
              {problem.topics && problem.topics.length > 0 && (
                <div className="py-2 border-b border-slate-100">
                  <span className="text-slate-500 text-sm mb-2 block">Topics</span>
                  <div className="flex gap-2 flex-wrap">
                    {problem.topics.map(t => (
                      <span key={t} className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium border border-slate-200">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <a href={problem.url} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center justify-center w-full gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium">
                View on {problem.platform} <ExternalLink size={16} />
              </a>
            </div>
          </div>

          {/* Memory State Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock size={20} className="text-blue-500"/> Memory State
            </h2>
            
            {problem.memory ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm">Review Count</span>
                  <span className="font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm">{problem.memory.review_count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm">Last Reviewed</span>
                  <span className="font-medium text-sm text-slate-700">
                    {problem.memory.last_reviewed_at ? format(new Date(problem.memory.last_reviewed_at), 'PPp') : 'Never'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm">Next Review</span>
                  <span className="font-medium text-sm text-slate-700">
                    {problem.memory.next_review_at ? format(new Date(problem.memory.next_review_at), 'PPp') : 'Not scheduled'}
                  </span>
                </div>

                {problem.memory.user_notes && (
                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <span className="text-slate-500 text-sm mb-2 block">My Notes</span>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap p-3 bg-slate-50 rounded-lg border border-slate-100">
                      {problem.memory.user_notes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-slate-500 italic text-center p-4">
                No memory state initialized for this problem.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Submission History */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-slate-200 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <History size={20} className="text-indigo-500"/> Submission History
                <span className="ml-auto text-sm font-normal text-slate-500 bg-slate-200/50 px-2 py-1 rounded-md">
                  {problem.submissions.length} total
                </span>
              </h2>
            </div>
            
            <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
              {problem.submissions.length > 0 ? (
                problem.submissions.map((sub, idx) => (
                  <div key={sub.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 bg-slate-900 text-white rounded-md text-xs font-bold font-mono">
                          {sub.language || 'Unknown'}
                        </span>
                        <span className="text-sm font-medium text-slate-600">
                          {format(new Date(sub.submitted_at), 'PPP ')} <span className="text-slate-400">at</span> {format(new Date(sub.submitted_at), 'p')}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono" title="Fingerprint">
                        {sub.submission_fingerprint.substring(0, 8)}
                      </span>
                    </div>
                    
                    <div className="relative group">
                      <pre className="p-4 bg-[#0d1117] text-[#c9d1d9] rounded-lg overflow-x-auto text-sm font-mono leading-relaxed border border-slate-800 shadow-inner">
                        <code>{sub.solution_code}</code>
                      </pre>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-slate-500">
                  No submissions recorded.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
