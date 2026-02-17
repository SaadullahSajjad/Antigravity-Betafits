import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { fetchAirtableRecords } from '@/lib/airtable/fetch';
import { FeedbackStats, FeedbackResponse } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = await getCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const token = process.env.AIRTABLE_API_KEY;
    if (!token) {
      return NextResponse.json({ error: 'Airtable API key not configured' }, { status: 500 });
    }

    // Fetch all Pulse Survey records and filter in code (ARRAYJOIN doesn't work reliably)
    const allRecords = await fetchAirtableRecords('tbl28XVUekjvl2Ujn', {
      apiKey: token,
      maxRecords: 1000,
    });

    let stats: FeedbackStats | null = null;
    let responses: FeedbackResponse[] = [];

    if (allRecords && allRecords.length > 0) {
      // Filter by company ID in code (more reliable than ARRAYJOIN)
      const filteredRecords = allRecords.filter((record) => {
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
      });

      // Sort by createdTime (newest first)
      const sortedRecords = [...filteredRecords].sort((a, b) => {
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

        stats = {
          overall: overallSum / responses.length,
          responses: responses.length,
          nonMedical: nonMedicalSum / responses.length,
          employeeCost: medicalCostSum / responses.length,
          medicalNetwork: medicalNetworkSum / responses.length,
          medicalOptions: medicalOptionsSum / responses.length,
          retirement: null,
        };
      }
    }

    return NextResponse.json({
      stats,
      responses,
    }, { status: 200 });
  } catch (error) {
    console.error('[Employee Feedback API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee feedback' },
      { status: 500 }
    );
  }
}
