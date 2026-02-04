import React from 'react';
import AssignedForms from '@/components/AssignedForms';
import DocumentsSection from '@/components/DocumentsSection';
import ProgressSteps from '@/components/ProgressSteps';
import AvailableForms from '@/components/AvailableForms';
import DocumentUpload from '@/components/DocumentUpload';
import HelpCard from '@/components/HelpCard';
import { fetchAirtableRecords } from '@/lib/airtable/fetch';
import { DocumentArtifact, AssignedForm, AvailableForm, DocumentStatus, FormStatus, ProgressStep, ProgressStatus } from '@/types';
import { getCompanyId } from '@/lib/auth/getCompanyId';

export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";

export default async function HomePage() {
    const token = process.env.AIRTABLE_API_KEY;

    // Get user email from session
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    // Get company ID from authenticated user (optional)
    const companyId = await getCompanyId();

    // Table IDs
    const docsTableId = 'tblBgAZKJln76anVn';
    const assignedFormsTableId = 'tblNeyKm9sKAKZq9n';
    const availableFormsTableId = 'tblZVnNaE4y8e56fa';

    // Default to empty/live-only structure
    let documents: DocumentArtifact[] = [];
    let assignedForms: AssignedForm[] = [];
    let availableForms: AvailableForm[] = [];

    if (token && userEmail) {
        try {
            // Filter by company ID using FIND for linked records
            // Note: Field names vary by table

            // Fetch Documents (filtered by company)
            // Field: "Link to Intake - Group Data" (WITH hyphen)
            // Try fetching all documents first to debug, then filter in code
            let docRecords: any[] = [];
            
            try {
                // Fetch all documents (without filter) - don't sort by Name since it's computed and might be empty
                // Instead, fetch more records to ensure we get recent uploads
                const allRecords = await fetchAirtableRecords(docsTableId, {
                    apiKey: token,
                    maxRecords: 100, // Increased to catch more records
                });
                
                console.log(`[Dashboard] Fetched ${allRecords?.length || 0} total documents from Airtable`);
                console.log(`[Dashboard] Filtering for user: ${userEmail}${companyId ? ` (company: ${companyId})` : ' (no company)'}`);
                
                if (allRecords && allRecords.length > 0) {
                    // Filter documents by user email or company ID
                    // Priority: If company ID exists, filter by company. Otherwise, we'll need a user email field
                    // For now, if company ID exists, use it. Otherwise, show all user's documents (if we had a user field)
                    docRecords = allRecords.filter((record) => {
                        const linkField = record.fields['Link to Intake - Group Data'];
                        
                        // If company ID exists, filter by company
                        if (companyId) {
                            // Handle array of linked record IDs
                            if (Array.isArray(linkField) && linkField.length > 0) {
                                const matches = linkField.some((id: string) => {
                                    const idStr = String(id).trim();
                                    const companyIdStr = String(companyId).trim();
                                    return idStr === companyIdStr;
                                });
                                if (matches) {
                                    console.log(`[Dashboard] ✓ Found matching document: ${record.id} for company: ${companyId}`);
                                }
                                return matches;
                            }
                            
                            // Handle single linked record ID
                            if (linkField) {
                                const matches = String(linkField).trim() === String(companyId).trim();
                                if (matches) {
                                    console.log(`[Dashboard] ✓ Found matching document (single): ${record.id}`);
                                }
                                return matches;
                            }
                            return false;
                        }
                        
                        // If no company ID, we can't filter properly without a user email field
                        // For now, return empty - user needs to be linked to a company
                        // TODO: Add "User Email" or "Uploaded By" field in Airtable Documents table to filter by user
                        console.log(`[Dashboard] No company ID - cannot filter documents. User must be linked to a company.`);
                        return false;
                    });
                    
                    console.log(`[Dashboard] Filtered to ${docRecords.length} documents for user: ${userEmail}`);
                    
                    // Sort by most recent (by record ID or creation time if available)
                    // Newer records typically have later record IDs
                    docRecords.sort((a, b) => {
                        // Sort by record ID descending (newer records first)
                        return b.id.localeCompare(a.id);
                    });
                    
                    // Limit to 10 most recent
                    docRecords = docRecords.slice(0, 10);
                }
            } catch (err) {
                console.error('[Dashboard] Error fetching documents:', err);
            }
            if (docRecords && docRecords.length > 0) {
                documents = docRecords.map((record) => {
                    const fileField = record.fields['File'];
                    const fileAttachment = Array.isArray(fileField) && fileField.length > 0 ? (fileField[0] as any) : null;
                    const fileName = fileAttachment?.filename || String(record.fields['Name'] || '');
                    const fileDate = fileAttachment?.createdTime
                        ? new Date(fileAttachment.createdTime).toISOString()
                        : new Date().toISOString();

                    // Use filename as name if Name field is empty (since it's computed)
                    const documentName = String(
                        record.fields['Name'] || 
                        record.fields['Extracted Document Title'] || 
                        fileAttachment?.filename || 
                        'Untitled Document'
                    );

                    return {
                        id: record.id,
                        name: documentName,
                        status: DocumentStatus.RECEIVED,
                        fileName: fileName,
                        date: fileDate,
                        url: fileAttachment?.url,
                    };
                });
                console.log(`[Dashboard] Loaded ${documents.length} documents for company ${companyId}`);
            } else {
                console.log(`[Dashboard] No documents found for company ${companyId}`);
            }

            // Fetch Assigned Forms (filtered by company)
            // Field: "Link to Intake Group Data" (NO hyphen)
            // Use in-code filtering as primary method since Airtable filters can be unreliable with linked records
            let assignedRecords: any[] = [];
            
            try {
                // Fetch all assigned forms and filter in code (more reliable than Airtable filter formulas)
                const allAssignedRecords = await fetchAirtableRecords(assignedFormsTableId, {
                    apiKey: token,
                    maxRecords: 100,
                });
                
                console.log(`[Dashboard] Fetched ${allAssignedRecords?.length || 0} total assigned forms from Airtable`);
                
                if (allAssignedRecords && allAssignedRecords.length > 0) {
                    // Filter by company ID in code
                    assignedRecords = allAssignedRecords.filter((record) => {
                        const linkField = record.fields['Link to Intake Group Data'];
                        
                        if (!linkField) {
                            return false;
                        }
                        
                        // Handle array of linked record IDs
                        if (Array.isArray(linkField) && linkField.length > 0) {
                            const matches = linkField.some((id: string) => {
                                const idStr = String(id).trim();
                                const companyIdStr = String(companyId).trim();
                                return idStr === companyIdStr;
                            });
                            if (matches) {
                                console.log(`[Dashboard] ✓ Found matching assigned form: ${record.id} for company: ${companyId}`);
                            }
                            return matches;
                        }
                        
                        // Handle single linked record ID
                        const matches = String(linkField).trim() === String(companyId).trim();
                        if (matches) {
                            console.log(`[Dashboard] ✓ Found matching assigned form (single): ${record.id}`);
                        }
                        return matches;
                    });
                    
                    console.log(`[Dashboard] Filtered to ${assignedRecords.length} assigned forms for company ${companyId}`);
                }
            } catch (error) {
                console.error('[Dashboard] Error fetching assigned forms:', error);
            }
            
            // Fetch Available Forms first to create a lookup for form names
            const availableRecords = await fetchAirtableRecords(availableFormsTableId, {
                apiKey: token,
                maxRecords: 100,
            });
            
            // Create lookup map: available form ID -> form name
            const availableFormsLookup: Record<string, string> = {};
            if (availableRecords && availableRecords.length > 0) {
                availableRecords.forEach((record) => {
                    availableFormsLookup[record.id] = String(record.fields['Name'] || '');
                });
                console.log(`[Dashboard] Created lookup for ${Object.keys(availableFormsLookup).length} available forms`);
                
                // Also map to availableForms for display
                availableForms = availableRecords.map((record) => ({
                    id: record.id,
                    name: String(record.fields['Name'] || ''),
                    category: String(record.fields['Category'] || 'General'),
                    estimatedTime: String(record.fields['Estimated Time'] || record.fields['Estimated Completion Time'] || record.fields['Completion Time'] || ''),
                    description: String(record.fields['Description'] || record.fields['Intro Text'] || ''),
                }));
            }
            
            if (assignedRecords && assignedRecords.length > 0) {
                assignedForms = assignedRecords.map((record) => {
                    // Try to get the actual form name
                    let formName = String(record.fields['Name'] || '');
                    
                    // Check if there's a link to Available Forms
                    const availableFormLink = record.fields['Link to Available Forms'] || 
                                             record.fields['Available Form'] || 
                                             record.fields['Form'] ||
                                             record.fields['Source Form'] ||
                                             record.fields['Original Form'];
                    
                    // If name is just company name pattern, try to get form name from linked available form
                    if ((formName.includes('(Original)') || formName.trim().endsWith('-')) && availableFormLink) {
                        // availableFormLink might be an array of record IDs
                        const linkedFormIds = Array.isArray(availableFormLink) ? availableFormLink : [availableFormLink];
                        
                        // Try to find the form name from the lookup
                        for (const linkedFormId of linkedFormIds) {
                            const linkedFormName = availableFormsLookup[String(linkedFormId)];
                            if (linkedFormName) {
                                formName = linkedFormName;
                                console.log(`[Dashboard] Found form name "${linkedFormName}" from linked available form ${linkedFormId}`);
                                break;
                            }
                        }
                        
                        // If still not found, try lookup fields that might contain the name
                        const nameFromLookup = record.fields['Name (from Available Form)'] ||
                                              record.fields['Form Name (from Available Form)'] ||
                                              record.fields['Available Form Name'];
                        if (nameFromLookup) {
                            formName = Array.isArray(nameFromLookup) ? nameFromLookup[0] : String(nameFromLookup);
                            console.log(`[Dashboard] Found form name "${formName}" from lookup field`);
                        }
                    }
                    
                    return {
                        id: record.id,
                        name: formName,
                        status: (record.fields['Status'] as FormStatus) || FormStatus.NOT_STARTED,
                        description: String(record.fields['Assigned Form URL'] || ''),
                    };
                });
                console.log(`[Dashboard] Mapped ${assignedForms.length} assigned forms`);
            } else {
                console.log(`[Dashboard] No assigned forms found for company ${companyId}`);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    } else if (!companyId) {
        console.warn('[HomePage] No company ID available. User may not be authenticated.');
    }

    // Generate dynamic progress steps based on actual data
    let progressSteps: ProgressStep[] = [];
    
    if (companyId) {
        progressSteps = [
            {
                id: 'step1',
                name: 'Company Profile',
                category: 'Information',
                status: companyId ? ProgressStatus.APPROVED : ProgressStatus.MISSING,
                notes: companyId ? 'Basic company details have been verified.' : 'Please update your company profile.',
            },
            {
                id: 'step2',
                name: 'Assigned Forms',
                category: 'Action Items',
                status: assignedForms.length > 0 && assignedForms.every(f => f.status === FormStatus.COMPLETED)
                    ? ProgressStatus.APPROVED
                    : (assignedForms.some(f => f.status === FormStatus.COMPLETED || f.status === FormStatus.IN_PROGRESS) ? ProgressStatus.IN_REVIEW : ProgressStatus.MISSING),
                notes: `${assignedForms.filter(f => f.status === FormStatus.COMPLETED).length} of ${assignedForms.length} forms completed.`,
            },
            {
                id: 'step3',
                name: 'Document Uploads',
                category: 'Compliance',
                status: documents.length > 0 ? ProgressStatus.APPROVED : ProgressStatus.MISSING,
                notes: documents.length > 0 ? `${documents.length} documents received and under review.` : 'Main document artifacts are missing.',
            },
            {
                id: 'step4',
                name: 'Benefit Strategy',
                category: 'Consulting',
                status: ProgressStatus.IN_REVIEW,
                notes: 'Our team is reviewing your benefit plan preferences.',
            }
        ];
    }
    // If no company ID, progressSteps remains empty array

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
                        <DocumentUpload />
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
                <ProgressSteps steps={progressSteps} />
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
