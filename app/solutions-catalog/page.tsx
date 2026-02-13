import React from 'react';
import SolutionsCatalog from '@/components/SolutionsCatalog';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { fetchAirtableRecords } from '@/lib/airtable/fetch';
import { Solution } from '@/types';

export const dynamic = 'force-dynamic';

export default async function SolutionsCatalogPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return <SolutionsCatalog solutions={[]} categories={['All Solutions']} />;
  }

  const companyId = await getCompanyId();
  const token = process.env.AIRTABLE_API_KEY;
  
  let solutions: Solution[] = [];
  const categories: string[] = ['All Solutions'];

  if (token) {
    try {
      // Fetch solutions from Airtable (placeholder table ID - update when actual table is available)
      const tableId = 'tblyp74Xh14940523'; // Solutions table
      const records = await fetchAirtableRecords(tableId, {
        apiKey: token,
        maxRecords: 100,
      });

      if (records && records.length > 0) {
        solutions = records.map(record => {
          const fields = record.fields;
          return {
            id: record.id,
            name: String(fields['Name'] || fields['Solution Name'] || ''),
            category: String(fields['Category'] || 'Other'),
            color: String(fields['Color'] || '#97C25E'),
            description: String(fields['Description'] || ''),
            features: Array.isArray(fields['Features']) ? fields['Features'].map((f: any) => String(f)) : [],
            websiteUrl: String(fields['Website URL'] || fields['URL'] || ''),
            integrationType: String(fields['Integration Type'] || ''),
          };
        });

        // Extract unique categories
        const uniqueCategories = new Set(solutions.map(s => s.category));
        categories.push(...Array.from(uniqueCategories));
      }
    } catch (error) {
      console.error('[SolutionsCatalogPage] Error fetching solutions:', error);
    }
  }

  return <SolutionsCatalog solutions={solutions} categories={categories} />;
}
