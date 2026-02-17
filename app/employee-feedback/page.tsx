import React from 'react';
import EmployeeFeedback from '@/components/EmployeeFeedback';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { fetchAirtableRecords } from '@/lib/airtable/fetch';
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

  const apiKey = process.env.AIRTABLE_API_KEY;
  let stats: FeedbackStats | null = null;
  let responses: FeedbackResponse[] = [];

  if (apiKey && companyId) {
    try {
      // Fetch all Pulse Survey records and filter in code (ARRAYJOIN doesn't work reliably)
      const allRecords = await fetchAirtableRecords('tbl28XVUekjvl2Ujn', {
        apiKey,
        maxRecords: 1000,
      });

      // Filter by company ID in code (more reliable than ARRAYJOIN)
      const records = allRecords?.filter((record) => {
        const linkField = record.fields['Link to Intake - Group Data'];
        
        if (!linkField) {
          return false;
        }
        
        // Handle array of linked record IDs
        if (Array.isArray(linkField) && linkField.length > 0) {
          return linkField.some((id: string) => String(id).trim() === String(companyId).trim());
        }
        
        // Handle single linked record ID
        return String(linkField).trim() === String(companyId).trim();
      }) || [];

      if (records && records.length > 0) {
        // Sort by createdTime (newest first)
        const sortedRecords = [...records].sort((a, b) => {
          const timeA = a.createdTime ? new Date(a.createdTime).getTime() : 0;
          const timeB = b.createdTime ? new Date(b.createdTime).getTime() : 0;
          return timeB - timeA;
        });

        // Map to FeedbackResponse structure
        responses = sortedRecords.map(record => {
          const fields = record.fields;
          return {
            id: record.id,
            submittedAt: String(fields['Created'] || record.createdTime || new Date().toISOString()).split('T')[0],
            tier: String(fields['Tier'] || fields['Coverage Tier'] || 'Individual Only'),
            overallRating: Number(fields['Overall Rating'] || fields['Rating'] || fields['Score'] || 0),
            medicalOptions: Number(fields['Medical Options'] || fields['Medical Options Rating'] || 0),
            medicalNetwork: Number(fields['Medical Network'] || fields['Medical Network Rating'] || 0),
            medicalCost: Number(fields['Medical Cost'] || fields['Employee Cost'] || fields['Cost Rating'] || 0),
            nonMedical: Number(fields['Non-Medical'] || fields['Non-Medical Rating'] || 0),
            comments: String(fields['Comments'] || fields['Text'] || ''),
          };
        });

        // Calculate stats from responses
        if (responses.length > 0) {
          const overallSum = responses.reduce((sum, r) => sum + r.overallRating, 0);
          const medicalOptionsSum = responses.reduce((sum, r) => sum + r.medicalOptions, 0);
          const medicalNetworkSum = responses.reduce((sum, r) => sum + r.medicalNetwork, 0);
          const medicalCostSum = responses.reduce((sum, r) => sum + r.medicalCost, 0);
          const nonMedicalSum = responses.reduce((sum, r) => sum + r.nonMedical, 0);
          const employeeCostSum = medicalCostSum; // Assuming employee cost is same as medical cost

          stats = {
            overall: overallSum / responses.length,
            responses: responses.length,
            nonMedical: nonMedicalSum / responses.length,
            employeeCost: employeeCostSum / responses.length,
            medicalNetwork: medicalNetworkSum / responses.length,
            medicalOptions: medicalOptionsSum / responses.length,
            retirement: null,
          };
        }
      }
    } catch (error) {
      console.error('[EmployeeFeedbackPage] Error fetching data:', error);
    }
  }

  return <EmployeeFeedback stats={stats} responses={responses} />;
}
