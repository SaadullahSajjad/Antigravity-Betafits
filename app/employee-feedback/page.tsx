import React from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import CreateSurveyButton from '@/components/CreateSurveyButton';
import FeedbackKPIs from '@/components/FeedbackKPIs';
import FeedbackCollectionCard from '@/components/FeedbackCollectionCard';
import FeedbackScoresPanel from '@/components/FeedbackScoresPanel';
import RecentFeedbackList from '@/components/RecentFeedbackList';
import FeedbackHistoryTable from '@/components/FeedbackHistoryTable';
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
    let activeSurveyUrl: string | undefined;
    let activeSurveyFormUrl: string | undefined;

    if (apiKey && companyId) {
        try {
            // Fetch Pulse Survey records (surveys, not responses)
            // Get the most recent survey for the company
            const surveyRecords = await fetchAirtableRecords('tbl28XVUekjvl2Ujn', {
                apiKey,
                filterByFormula: `FIND('${companyId}', ARRAYJOIN({Link to Intake - Group Data})) > 0`,
                maxRecords: 1,
            });

            // Get the most recent survey for URL
            if (surveyRecords && surveyRecords.length > 0) {
                const latestSurvey = surveyRecords[0];
                // Try to get survey URL from various field names
                activeSurveyUrl = String(latestSurvey.fields['Survey URL'] || 
                                        latestSurvey.fields['Survey Link'] || 
                                        latestSurvey.fields['URL'] || 
                                        latestSurvey.fields['Link'] || 
                                        '');
                activeSurveyFormUrl = String(latestSurvey.fields['Form URL'] || 
                                            latestSurvey.fields['Fillout URL'] || 
                                            latestSurvey.fields['Form Link'] || 
                                            '');
            }

            // Fetch all survey responses (for stats and history)
            const records = await fetchAirtableRecords('tbl28XVUekjvl2Ujn', {
                apiKey,
                filterByFormula: `FIND('${companyId}', ARRAYJOIN({Link to Intake - Group Data})) > 0`,
            });

            if (records && records.length > 0) {
                // Sort by createdTime (newest first)
                const sortedRecords = [...records].sort((a, b) => {
                    const timeA = a.createdTime ? new Date(a.createdTime).getTime() : 0;
                    const timeB = b.createdTime ? new Date(b.createdTime).getTime() : 0;
                    return timeB - timeA;
                });

                let totalScore = 0;
                const mappedResponses: FeedbackResponse[] = sortedRecords.map(record => {
                    const fields = record.fields;
                    const score = Number(fields['Rating'] || fields['Score'] || 0);
                    totalScore += score;

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

                const averageScore = totalScore / records.length;
                stats = {
                    participationRate: 0.75,
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
            <DashboardHeader
                title="Employee Feedback"
                subtitle="Employee feedback helps shape stronger benefit programs. Each response guides Betafits and your company in making informed, employee-focused decisions."
            />

            <div className="max-w-xl">
                <FeedbackCollectionCard 
                    surveyUrl={activeSurveyUrl}
                    surveyFormUrl={activeSurveyFormUrl}
                />
            </div>

            <FeedbackScoresPanel responses={responses} />

            <RecentFeedbackList responses={responses} limit={5} />
        </div>
    );
}
