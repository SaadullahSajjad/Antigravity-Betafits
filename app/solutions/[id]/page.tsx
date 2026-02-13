import React from 'react';
import { notFound } from 'next/navigation';
import SolutionDetail from '@/components/SolutionDetail';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { Solution } from '@/types';

interface Props {
  params: {
    id: string;
  };
}

export const dynamic = 'force-dynamic';

export default async function SolutionDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    notFound();
  }

  // For now, return null - can be populated from Airtable when solutions table is available
  const solution: Solution | null = null;

  if (!solution) {
    notFound();
  }

  return <SolutionDetail solution={solution} />;
}
