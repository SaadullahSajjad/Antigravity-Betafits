import React from 'react';
import SolutionsCatalog from '@/components/SolutionsCatalog';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { Solution } from '@/types';

export const dynamic = 'force-dynamic';

export default async function SolutionsCatalogPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return <SolutionsCatalog solutions={[]} categories={['All Solutions']} />;
  }

  // For now, return empty data - can be populated from Airtable when solutions table is available
  const solutions: Solution[] = [];
  const categories: string[] = ['All Solutions'];

  return <SolutionsCatalog solutions={solutions} categories={categories} />;
}
