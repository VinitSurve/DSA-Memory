export default function ReviewsPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.5"/><path d="m9 11 3 3L22 4"/></svg>
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-4">Reviews & Spaced Repetition</h1>
      <p className="text-slate-500 max-w-md text-lg">
        This feature is coming in the next phase. You will be able to review your past problems and track your mastery over time.
      </p>
    </div>
  );
}
