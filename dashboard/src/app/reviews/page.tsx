import { getReviewQueue } from '@/services/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ReviewsPage() {
  const queue = await getReviewQueue();

  const totalDue = queue.due.length;
  const nextUp = totalDue > 0 ? queue.due[0] : (queue.unreviewed.length > 0 ? queue.unreviewed[0] : null);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Review Dashboard</h1>
          <p className="text-slate-500 mt-2">Active recall and spaced repetition</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wider mb-2">Due Today</h3>
            <div className="text-4xl font-bold text-slate-900">{totalDue}</div>
          </div>
          <div className="mt-6">
            {nextUp ? (
              <Link 
                href={`/reviews/${nextUp.id}`}
                className="block w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-lg font-medium transition-colors"
              >
                Start Reviewing
              </Link>
            ) : (
              <div className="py-2.5 px-4 bg-slate-100 text-slate-400 text-center rounded-lg font-medium">
                All caught up
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wider mb-2">New / Unreviewed</h3>
          <div className="text-4xl font-bold text-slate-900">{queue.unreviewed.length}</div>
          <p className="text-sm text-slate-500 mt-2">Ready for first review</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wider mb-2">Upcoming (Later)</h3>
          <div className="text-4xl font-bold text-slate-900">{queue.upcoming.length}</div>
          <p className="text-sm text-slate-500 mt-2">Scheduled for future</p>
        </div>
      </div>

      <div className="space-y-6">
        {queue.due.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> Due For Review
            </h2>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
              {queue.due.map((p) => (
                <div key={p.id} className="p-4 hover:bg-slate-50 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-slate-900">{p.title}</h3>
                    <div className="text-xs text-slate-500 mt-1">{p.difficulty} • {p.platform}</div>
                  </div>
                  <Link href={`/reviews/${p.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                    Review
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {queue.unreviewed.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> New Problems
            </h2>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
              {queue.unreviewed.map((p) => (
                <div key={p.id} className="p-4 hover:bg-slate-50 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-slate-900">{p.title}</h3>
                    <div className="text-xs text-slate-500 mt-1">{p.difficulty} • {p.platform}</div>
                  </div>
                  <Link href={`/reviews/${p.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                    First Review
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {queue.upcoming.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-300"></span> Upcoming
            </h2>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
              {queue.upcoming.map((p) => {
                const date = p.memory?.next_review_at ? new Date(p.memory.next_review_at) : null;
                const dateStr = date ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Unknown';
                return (
                  <div key={p.id} className="p-4 flex justify-between items-center opacity-60">
                    <div>
                      <h3 className="font-medium text-slate-900">{p.title}</h3>
                    </div>
                    <div className="text-sm text-slate-500 text-right">
                      Due: {dateStr}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {queue.due.length === 0 && queue.unreviewed.length === 0 && queue.upcoming.length === 0 && (
          <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
            No problems found. Capture a problem from HackerRank to get started!
          </div>
        )}
      </div>
    </div>
  );
}
