import { getProblemById } from '@/services/db';
import { notFound } from 'next/navigation';
import ReviewSessionClient from '@/components/ReviewSessionClient';

export const dynamic = 'force-dynamic';

export default async function ReviewSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const problem = await getProblemById(resolvedParams.id);

  if (!problem) {
    notFound();
  }

  return <ReviewSessionClient problem={problem} />;
}
