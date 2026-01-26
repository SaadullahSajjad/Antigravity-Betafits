import React from 'react';
import AssignedForms from '@/components/AssignedForms';
import DocumentsSection from '@/components/DocumentsSection';
import ProgressSteps from '@/components/ProgressSteps';
import AvailableForms from '@/components/AvailableForms';
import {
    ASSIGNED_FORMS,
    AVAILABLE_FORMS,
    DOCUMENT_ARTIFACTS,
    PROGRESS_STEPS
} from '@/constants';
import { fetchAirtableRecords } from '@/lib/airtable/fetch';
import { DocumentArtifact, AssignedForm, AvailableForm, DocumentStatus, FormStatus } from '@/types';

export const dynamic = 'force-dynamic';

// HelpCard component (inline)
const HelpCard = () => (
    <div className="bg-[#1c240f] rounded-[28px] p-8 text-white relative overflow-hidden group shadow-xl flex flex-col justify-between">
        <div className="relative z-10">
            <h3 className="text-[22px] font-bold mb-3 tracking-tight">Need assistance?</h3>
            <p className="text-[#a1c270] text-[15px] font-medium leading-relaxed mb-8 max-w-[260px]">
                Our support team is available 9am-5pm EST to help you navigate your intake workflow.
            </p>
        </div>
        <div className="relative z-10">
            <button className="w-full bg-[#f3f7ed] hover:bg-white py-4 rounded-[8px] font-bold text-[13px] text-[#536b2e] transition-all uppercase tracking-[0.05em] active:scale-[0.98] shadow-sm">
                Contact Support
            </button>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-black/10 rounded-full -mr-10 -mt-10"></div>
        <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-black/10 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
    </div>
);

export default async function HomePage() {
    const token = process.env.AIRTABLE_API_KEY;

    // Table IDs
    const docsTableId = 'tblBgAZKJln76anVn';
    const assignedFormsTableId = 'tblNeyKm9sKAKZq9n';
    const availableFormsTableId = 'tblZVnNaE4y8e56fa';

    let documents: DocumentArtifact[] = DOCUMENT_ARTIFACTS;
    let assignedForms: AssignedForm[] = ASSIGNED_FORMS;
    let availableForms: AvailableForm[] = AVAILABLE_FORMS;

    if (token) {
        try {
            // Fetch Documents
            const docRecords = await fetchAirtableRecords(docsTableId, {
                apiKey: token,
                sort: [{ field: 'Name', direction: 'desc' }],
                maxRecords: 10,
            });
            if (docRecords && docRecords.length > 0) {
                documents = docRecords.map((record) => {
                    const fileField = record.fields['File'];
                    const fileAttachment = Array.isArray(fileField) && fileField.length > 0 ? (fileField[0] as any) : null;
                    const fileName = fileAttachment?.filename || String(record.fields['Name'] || '');
                    const fileDate = fileAttachment?.createdTime
                        ? new Date(fileAttachment.createdTime).toISOString()
                        : new Date().toISOString();

                    return {
                        id: record.id,
                        name: String(record.fields['Name'] || record.fields['Extracted Document Title'] || ''),
                        status: DocumentStatus.RECEIVED,
                        fileName: fileName,
                        date: fileDate,
                    };
                });
            }

            // Fetch Assigned Forms
            const assignedRecords = await fetchAirtableRecords(assignedFormsTableId, {
                apiKey: token,
            });
            if (assignedRecords && assignedRecords.length > 0) {
                assignedForms = assignedRecords.map((record) => ({
                    id: record.id,
                    name: String(record.fields['Name'] || ''),
                    status: (record.fields['Status'] as FormStatus) || FormStatus.NOT_STARTED,
                    description: String(record.fields['Assigned Form URL'] || ''),
                }));
            }

            // Fetch Available Forms
            const availableRecords = await fetchAirtableRecords(availableFormsTableId, {
                apiKey: token,
            });
            if (availableRecords && availableRecords.length > 0) {
                availableForms = availableRecords.map((record) => ({
                    id: record.id,
                    name: String(record.fields['Name'] || ''),
                    category: 'General',
                    estimatedTime: '',
                    description: String(record.fields['Description'] || record.fields['Intro Text'] || ''),
                }));
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Fallback to mock data (already assigned)
        }
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            <header>
                <h1 className="text-[24px] font-bold text-gray-900 tracking-tight leading-tight">
                    Prospect Portal
                </h1>
                <p className="text-[15px] text-gray-500 font-medium mt-1">
                    Manage your intake workflow and document submissions with ease.
                </p>
            </header>

            {/* Row 1: Assigned Forms & Documents */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                <div className="lg:col-span-8">
                    <AssignedForms forms={assignedForms} />
                </div>
                <div className="lg:col-span-4">
                    <div className="mb-6 flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Documents</h2>
                            <p className="text-[13px] text-gray-500 mt-0.5">Recently uploaded files and artifacts.</p>
                        </div>
                        <button className="flex items-center gap-2 bg-brand-50 text-brand-700 border border-brand-100 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider hover:bg-brand-100 transition-colors shadow-sm active:scale-95">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                            Upload
                        </button>
                    </div>
                    <DocumentsSection documents={documents} />
                </div>
            </div>

            {/* Row 2: Process Tracking */}
            <section className="w-full">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Process Tracking</h2>
                    <p className="text-[13px] text-gray-500 mt-0.5">Real-time status of your onboarding pipeline.</p>
                </div>
                <ProgressSteps steps={PROGRESS_STEPS} />
            </section>

            {/* Row 3: Available Forms & Help Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                <div className="lg:col-span-8">
                    <AvailableForms forms={availableForms} />
                </div>
                <div className="lg:col-span-4">
                    <HelpCard />
                </div>
            </div>
        </div>
    );
}
