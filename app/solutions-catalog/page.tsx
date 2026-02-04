import React from 'react';
import SolutionsCatalog from '@/components/SolutionsCatalog';
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

            // Add company filtering if the ecosystem becomes restrictive

            if (records && records.length > 0) {
                solutions = records.map(record => {
                    const fields = record.fields;

                    // Handle attachments for logoUrl
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
            <header>
                <div className="max-w-xl">
                    <h1 className="text-[24px] font-bold text-gray-900 tracking-tight leading-tight">
                        Solutions Ecosystem
                    </h1>
                    <p className="text-[15px] text-gray-500 font-medium mt-1">
                        Explore our curated network of top-tier providers and platforms.
                    </p>
                </div>
            </header>

            <SolutionsCatalog solutions={solutions} />
        </div>
    );
}
