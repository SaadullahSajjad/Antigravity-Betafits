import React from 'react';
import EmployeeFeedback from '@/components/EmployeeFeedback';
import CreateSurveyButton from '@/components/CreateSurveyButton';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { fetchAirtableRecords } from '@/lib/airtable/fetch';
import { FeedbackResponse, FeedbackStats } from '@/types';

export const dynamic = 'force-dynamic';

export default async function EmployeeFeedbackPage() {
    const companyId = await getCompanyId();
    const apiKey = process.env.AIRTABLE_API_KEY;

    // Default to empty/live-only structure
    let responses: FeedbackResponse[] = [];
    let stats: FeedbackStats = {
        participationRate: 0,
        averageScore: 0,
        totalResponses: 0,
        lastSurveyDate: 'N/A'
    };

    if (apiKey && companyId) {
        try {
            // Fetch Pulse Survey records
            // Use FIND for linked record filtering
            const records = await fetchAirtableRecords('tbl28XVUekjvl2Ujn', {
                apiKey,
                filterByFormula: `FIND('${companyId}', ARRAYJOIN({Link to Intake - Group Data})) > 0`,
            });

            if (records && records.length > 0) {
                // Sort by createdTime (newest first) since we can't sort by it in the API
                const sortedRecords = [...records].sort((a, b) => {
                    const timeA = a.createdTime ? new Date(a.createdTime).getTime() : 0;
                    const timeB = b.createdTime ? new Date(b.createdTime).getTime() : 0;
                    return timeB - timeA; // Descending order (newest first)
                });

                let totalScore = 0;
                const mappedResponses: FeedbackResponse[] = sortedRecords.map(record => {
                    const fields = record.fields;
                    const score = Number(fields['Rating'] || fields['Score'] || 0);
                    totalScore += score;

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

                // Calculate stats
                const averageScore = totalScore / records.length;
                stats = {
                    participationRate: 0.75, // Placeholder, requires total employee count
                    averageScore: Number(averageScore.toFixed(1)),
                    totalResponses: records.length,
                    lastSurveyDate: mappedResponses[0]?.date || new Date().toISOString().split('T')[0],
                };
            }
        } catch (error) {
            console.error('[EmployeeFeedbackPage] Error fetching live data:', error);
        }
    } else {
        console.warn('[EmployeeFeedbackPage] No API key or company ID available for live data.');
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-[24px] font-bold text-gray-900 tracking-tight leading-tight">
                            Employee Feedback
                        </h1>
                        <p className="text-[15px] text-gray-500 font-medium mt-1">
                            Insights from pulse surveys and engagement metrics.
                        </p>
                    </div>
                    <CreateSurveyButton variant="header" />
                </div>
            </header>

            <EmployeeFeedback stats={stats} responses={responses} />
        </div>
    );
}
