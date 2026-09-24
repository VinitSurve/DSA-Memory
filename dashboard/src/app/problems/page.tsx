import { getProblems } from '../../services/db';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, Clock, GitCommitHorizontal } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProblemsPage() {
  const problems = await getProblems();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Problems</h1>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
          {problems.length} total
        </span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm uppercase text-slate-500 font-semibold tracking-wider">
              <th className="p-4">Title</th>
              <th className="p-4">Difficulty</th>
              <th className="p-4">Topics</th>
              <th className="p-4 text-center">Submissions</th>
              <th className="p-4 text-center">Review State</th>
              <th className="p-4 text-right">Last Solved</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {problems.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <Link href={`/problems/${p.id}`} className="text-blue-600 hover:underline font-medium block">
                    {p.title}
                  </Link>
                  <span className="text-xs text-slate-400 capitalize mt-1 block">{p.platform}</span>
                </td>
                <td className="p-4">
                  {p.difficulty ? (
                    <span className={`inline-block px-2 py-1 text-xs rounded-md font-medium ${
                      p.difficulty.toLowerCase() === 'easy' ? 'bg-emerald-100 text-emerald-800' :
                      p.difficulty.toLowerCase() === 'medium' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {p.difficulty}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs font-medium">N/A</span>
                  )}
                </td>
                <td className="p-4 max-w-[200px] truncate">
                  {p.topics && p.topics.length > 0 ? (
                    <div className="flex gap-1 flex-wrap">
                      {p.topics.slice(0, 2).map(t => (
                        <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-medium border border-slate-200">
                          {t}
                        </span>
                      ))}
                      {p.topics.length > 2 && <span className="text-xs text-slate-400">+{p.topics.length - 2}</span>}
                    </div>
                  ) : (
                    <span className="text-slate-400 text-xs font-medium">-</span>
                  )}
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-slate-600">
                    <GitCommitHorizontal size={16} className="text-slate-400" />
                    <span className="font-semibold">{p.submissions.count}</span>
                  </div>
                </td>
                <td className="p-4 text-center">
                  {p.memory && p.memory.review_count > 0 ? (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-emerald-600 flex items-center gap-1 text-xs font-bold">
                        <CheckCircle2 size={14} />
                        Reviewed x{p.memory.review_count}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400 flex items-center justify-center gap-1 text-xs font-medium">
                      <Clock size={14} />
                      Unreviewed
                    </span>
                  )}
                </td>
                <td className="p-4 text-right text-sm text-slate-600 font-medium">
                  {p.submissions.latest 
                    ? formatDistanceToNow(new Date(p.submissions.latest), { addSuffix: true }) 
                    : <span className="text-slate-400">Never</span>}
                </td>
              </tr>
            ))}
            
            {problems.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  No problems found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
