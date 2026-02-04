import React from 'react';
import Link from 'next/link';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { fetchAirtableRecords } from '@/lib/airtable/fetch';
import { FeedbackResponse } from '@/types';

export const dynamic = 'force-dynamic';

export default async function EmployeeFeedbackAllPage() {
    const companyId = await getCompanyId();
    const apiKey = process.env.AIRTABLE_API_KEY;

    // Default to empty/live-only structure
    let responses: FeedbackResponse[] = [];

    if (apiKey && companyId) {
        try {
            // Fetch all Pulse Survey records (no limit, sorted by newest first)
            const records = await fetchAirtableRecords('tbl28XVUekjvl2Ujn', {
                apiKey,
                filterByFormula: `FIND('${companyId}', ARRAYJOIN({Link to Intake - Group Data})) > 0`,
                maxRecords: 1000, // Fetch up to 1000 records
            });

            if (records && records.length > 0) {
                // Sort by createdTime (newest first) since we can't sort by it in the API
                const sortedRecords = [...records].sort((a, b) => {
                    const timeA = a.createdTime ? new Date(a.createdTime).getTime() : 0;
                    const timeB = b.createdTime ? new Date(b.createdTime).getTime() : 0;
                    return timeB - timeA; // Descending order (newest first)
                });

                const mappedResponses: FeedbackResponse[] = sortedRecords.map(record => {
                    const fields = record.fields;
                    const score = Number(fields['Rating'] || fields['Score'] || 0);

                    // Sentiment logic based on score
                    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
                    if (score >= 4) sentiment = 'positive';
                    else if (score <= 2) sentiment = 'negative';

                    return {
                        id: record.id,
                        date: String(fields['Created'] || record.createdTime).split('T')[0],
                        category: String(fields['Category'] || 'General'),
                        score: score,
                        comment: String(fields['Comments'] || fields['Text'] || ''),
                        sentiment: sentiment,
                    };
                });

                responses = mappedResponses;
            }
        } catch (error) {
            console.error('[EmployeeFeedbackAllPage] Error fetching live data:', error);
        }
    } else {
        console.warn('[EmployeeFeedbackAllPage] No API key or company ID available for live data.');
    }

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'positive':
                return 'bg-green-50 text-green-700 border-green-100';
            case 'negative':
                return 'bg-red-50 text-red-700 border-red-100';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 4.5) return 'text-green-600';
        if (score >= 3.5) return 'text-brand-600';
        if (score >= 2.5) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Link
                                href="/employee-feedback"
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </Link>
                            <h1 className="text-[24px] font-bold text-gray-900 tracking-tight leading-tight">
                                All Feedback Responses
                            </h1>
                        </div>
                        <p className="text-[15px] text-gray-500 font-medium mt-1">
                            Complete list of all employee feedback and survey responses.
                        </p>
                    </div>
                </div>
            </header>

            {/* All Responses */}
            <section>
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                            All Responses ({responses.length})
                        </h2>
                    </div>
                </div>

                {responses.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 text-[15px] font-medium">No feedback responses found.</p>
                        <p className="text-gray-400 text-[13px] mt-1">Survey responses will appear here once employees submit feedback.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {responses.map((response) => (
                            <div key={response.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:border-gray-300 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className={`inline-block px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider border ${getSentimentColor(response.sentiment)}`}>
                                            {response.sentiment}
                                        </span>
                                        <span className="text-[12px] text-gray-400 font-medium">
                                            {response.category}
                                        </span>
                                        <span className={`text-[14px] font-bold ${getScoreColor(response.score)}`}>
                                            {response.score}/5
                                        </span>
                                    </div>
                                    <span className="text-[12px] text-gray-400 tabular-nums">
                                        {response.date}
                                    </span>
                                </div>
                                <p className="text-[14px] text-gray-700 leading-relaxed font-medium mb-4">
                                    "{response.comment}"
                                </p>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <svg
                                            key={star}
                                            className={`w-4 h-4 ${star <= response.score ? 'text-yellow-400' : 'text-gray-200'}`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
