import React from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import SolutionsCatalogList from '@/components/SolutionsCatalogList';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { fetchAirtableRecords } from '@/lib/airtable/fetch';
import { Solution, SolutionCategory } from '@/types';

export const dynamic = 'force-dynamic';

export default async function SolutionsCatalogPage() {
    const companyId = await getCompanyId();
    const apiKey = process.env.AIRTABLE_API_KEY;

    // Default to empty/live-only structure
    let solutions: Solution[] = [];

    if (apiKey) {
        try {
            // Fetch Solutions (Ecosystem)
            // TODO: Update 'tblyp74Xh14940523' with the correct Table ID from your Airtable base
            // const records = await fetchAirtableRecords('tblyp74Xh14940523', {
            //     apiKey,
            // });
            const records: any[] = []; // Temporary fallback until ID is fixed

            if (records && records.length > 0) {
                solutions = records.map(record => {
                    const fields = record.fields;

                    const logoAttachments = fields['Logo'] as any[];
                    const logoUrl = logoAttachments && logoAttachments.length > 0 ? logoAttachments[0].url : undefined;

                    return {
                        id: record.id,
                        name: String(fields['Name'] || 'Unnamed Provider'),
                        category: (fields['Category'] as SolutionCategory) || 'Provider',
                        description: String(fields['Description'] || ''),
                        logoUrl: logoUrl,
                        rating: Number(fields['Rating'] || 0),
                        tags: (fields['Tags'] as string[]) || [],
                        website: String(fields['Website'] || ''),
                    };
                });
            }
        } catch (error) {
            console.error('[SolutionsCatalogPage] Error fetching live data:', error);
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <DashboardHeader
                title="Solutions Catalog"
                subtitle="Discover benefit providers and technology partners."
            />

            <SolutionsCatalogList solutions={solutions} />
        </div>
    );
}
