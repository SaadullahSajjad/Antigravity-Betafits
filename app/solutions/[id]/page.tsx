import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchAirtableRecords } from '@/lib/airtable/fetch';
import { Solution, SolutionCategory } from '@/types';

interface Props {
    params: {
        id: string;
    };
}

export const dynamic = 'force-dynamic';

export default async function SolutionDetailPage({ params }: Props) {
    const apiKey = process.env.AIRTABLE_API_KEY;
    const tableId = 'tblyp74Xh14940523'; // Solutions / Ecosystem table
    
    let solution: Solution | null = null;

    if (apiKey) {
        try {
            const records = await fetchAirtableRecords(tableId, {
                apiKey,
                filterByFormula: `RECORD_ID() = '${params.id}'`,
                maxRecords: 1,
            });

            if (records && records.length > 0) {
                const record = records[0];
                const fields = record.fields;

                const logoAttachments = fields['Logo'] as any[];
                const logoUrl = logoAttachments && logoAttachments.length > 0 ? logoAttachments[0].url : undefined;

                solution = {
                    id: record.id,
                    name: String(fields['Name'] || 'Unnamed Provider'),
                    category: (fields['Category'] as SolutionCategory) || 'Provider',
                    description: String(fields['Description'] || ''),
                    logoUrl: logoUrl,
                    rating: Number(fields['Rating'] || 0),
                    tags: (fields['Tags'] as string[]) || [],
                    website: String(fields['Website'] || ''),
                    longDescription: String(fields['Long Description'] || fields['Description'] || ''),
                    features: (fields['Features'] as string[]) || [],
                };
            }
        } catch (error) {
            console.error('[SolutionDetailPage] Error fetching solution:', error);
        }
    }

    if (!solution) {
        notFound();
    }

    return (
        <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
            {/* Breadcrumb / Back Navigation */}
            <div className="mb-8">
                <Link
                    href="/solutions-catalog"
                    className="text-[13px] font-bold text-gray-400 hover:text-brand-600 transition-colors flex items-center gap-1"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Catalog
                </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-[32px] overflow-hidden shadow-sm">
                {/* Header Section */}
                <div className="bg-gray-50/50 p-8 md:p-12 border-b border-gray-100 flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-24 h-24 bg-white rounded-[24px] shadow-sm flex items-center justify-center text-[32px] font-bold text-gray-400">
                        {solution.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider">
                                {solution.category}
                            </span>
                            <div className="flex items-center gap-1 text-yellow-600 font-bold text-[13px]">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                                {solution.rating}
                            </div>
                        </div>
                        <h1 className="text-[32px] md:text-[40px] font-bold text-gray-900 tracking-tight leading-tight mb-4">
                            {solution.name}
                        </h1>
                        <p className="text-[18px] text-gray-500 leading-relaxed font-medium">
                            {solution.description}
                        </p>

                        {solution.website && (
                            <a
                                href={solution.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 mt-6 bg-gray-900 text-white px-6 py-3 rounded-full text-[14px] font-bold hover:bg-gray-800 transition-colors shadow-lg active:scale-95"
                            >
                                Visit Website
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        <section>
                            <h2 className="text-[20px] font-bold text-gray-900 mb-4">About</h2>
                            <p className="text-gray-600 leading-loose text-[16px]">
                                {solution.longDescription || solution.description}
                            </p>
                        </section>

                        {solution.features && (
                            <section>
                                <h2 className="text-[20px] font-bold text-gray-900 mb-4">Key Features</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {solution.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                                            <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span className="font-medium text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    <div className="space-y-8">
                        <div className="bg-gray-50 rounded-[24px] p-6">
                            <h3 className="text-[14px] font-bold text-gray-900 uppercase tracking-widest mb-4">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {solution.tags.map((tag) => (
                                    <span key={tag} className="bg-white text-gray-600 text-[13px] font-semibold px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
