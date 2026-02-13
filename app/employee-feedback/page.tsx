import React from 'react';
import EmployeeFeedback from '@/components/EmployeeFeedback';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { FeedbackStats, FeedbackResponse } from '@/types';

export const dynamic = 'force-dynamic';

export default async function EmployeeFeedbackPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return <EmployeeFeedback stats={null} responses={[]} />;
  }

  const companyId = await getCompanyId();
  if (!companyId) {
    return <EmployeeFeedback stats={null} responses={[]} />;
  }

  // For now, return empty data - can be populated from Airtable when feedback table is available
  const stats: FeedbackStats | null = null;
  const responses: FeedbackResponse[] = [];

  return <EmployeeFeedback stats={stats} responses={responses} />;
}
