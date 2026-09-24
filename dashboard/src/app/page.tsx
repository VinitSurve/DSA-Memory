import { getDashboardStats, getProblems } from '../services/db';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { BookOpen, Code2, BrainCircuit, Activity } from 'lucide-react';

// Next.js config to ensure this route is dynamically rendered since it fetches from DB
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  // Fetch problems and grab top 5 recent ones
  const allProblems = await getProblems();
  const recentProblems = allProblems.slice(0, 5);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 text-slate-500 mb-4">
            <BookOpen className="text-blue-500" size={24} />
            <h3 className="font-medium">Total Problems</h3>
          </div>
          <span className="text-4xl font-bold text-slate-900">{stats.totalProblems}</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 text-slate-500 mb-4">
            <Code2 className="text-emerald-500" size={24} />
            <h3 className="font-medium">Total Submissions</h3>
          </div>
          <span className="text-4xl font-bold text-slate-900">{stats.totalSubmissions}</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 text-slate-500 mb-4">
            <BrainCircuit className="text-amber-500" size={24} />
            <h3 className="font-medium">Due for Review</h3>
          </div>
          <span className="text-4xl font-bold text-slate-900">{stats.problemsDueForReview}</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 text-slate-500 mb-4">
            <Activity className="text-indigo-500" size={24} />
            <h3 className="font-medium">Solved (Last 7d)</h3>
          </div>
          <span className="text-4xl font-bold text-slate-900">{stats.problemsRecentlySolved}</span>
        </div>
      </div>

      {/* Recent Problems */}
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Recent Problems</h2>
      {recentProblems.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center text-slate-500">
          No problems captured yet. Start solving on HackerRank!
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm uppercase text-slate-500 font-semibold tracking-wider">
                <th className="p-4">Title</th>
                <th className="p-4">Platform</th>
                <th className="p-4">Difficulty</th>
                <th className="p-4 text-right">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentProblems.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <Link href={`/problems/${p.id}`} className="text-blue-600 hover:underline font-medium">
                      {p.title}
                    </Link>
                  </td>
                  <td className="p-4">
                    <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md capitalize font-medium">
                      {p.platform}
                    </span>
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
                  <td className="p-4 text-right text-sm text-slate-500">
                    {formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
