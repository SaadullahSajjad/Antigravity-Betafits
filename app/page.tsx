import React from 'react';
import AssignedForms from '@/components/AssignedForms';
import AvailableForms from '@/components/AvailableForms';
import DocumentsSection from '@/components/DocumentsSection';
import DocumentUpload from '@/components/DocumentUpload';
import ProgressSteps from '@/components/ProgressSteps';
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
    const progressStepsTableId = 'tbl5KoDB657pRju5x'; // Intake - Progress Steps

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
                documents = docRecords
                    .map((record) => {
                    const fileField = record.fields['File'];
                    console.log(`[Dashboard] Processing document ${record.id}, File field:`, fileField);
                    
                    // Airtable file attachments can be an array of objects with structure:
                    // [{ id: string, url: string, filename: string, size: number, type: string }]
                    const fileAttachment = Array.isArray(fileField) && fileField.length > 0 ? (fileField[0] as any) : null;
                    
                    if (fileAttachment) {
                        console.log(`[Dashboard] File attachment found:`, {
                            id: fileAttachment.id,
                            url: fileAttachment.url,
                            filename: fileAttachment.filename,
                            size: fileAttachment.size,
                            type: fileAttachment.type,
                        });
                    } else {
                        console.warn(`[Dashboard] No file attachment found for document ${record.id}, File field:`, fileField);
                    }
                    
                    const fileName = fileAttachment?.filename || String(record.fields['Name'] || '');
                    const fileDate = fileAttachment?.createdTime
                        ? new Date(fileAttachment.createdTime).toISOString()
                        : record.createdTime
                        ? new Date(record.createdTime).toISOString()
                        : new Date().toISOString();

                    // Use filename as name if Name field is empty (since it's computed)
                    const documentName = String(
                        record.fields['Name'] || 
                        record.fields['Extracted Document Title'] || 
                        fileAttachment?.filename || 
                        'Untitled Document'
                    );

                    // Get the document URL - Airtable attachment objects have a 'url' property
                    let documentUrl = fileAttachment?.url;
                    
                    // If Airtable attachment URL exists, use it directly
                    // Airtable attachment URLs are in format: https://dl.airtable.com/.attachments/...
                    if (documentUrl && typeof documentUrl === 'string' && documentUrl.trim() !== '') {
                        if (documentUrl.startsWith('https://dl.airtable.com')) {
                            // This is Airtable's attachment URL - use it directly
                            console.log(`[Dashboard] Using Airtable attachment URL for document ${record.id}`);
                        } else if (documentUrl.includes('/api/files/')) {
                            // This is our file storage URL - ensure it's accessible
                            // Extract fileId from URL
                            const fileIdMatch = documentUrl.match(/\/api\/files\/([^\/\?]+)/);
                            if (fileIdMatch) {
                                const fileId = fileIdMatch[1];
                                // Construct full URL with proper base - use request origin for client-side access
                                const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
                                documentUrl = `${baseUrl.replace(/\/$/, '')}/api/files/${fileId}`;
                                console.log(`[Dashboard] Reconstructed file storage URL for document ${record.id}: ${documentUrl}`);
                            }
                        }
                    } else {
                        // No URL from Airtable attachment - try to reconstruct from stored fileId or File URL
                        const fileId = record.fields['File ID'] || record.fields['FileId'] || record.fields['file_id'];
                        const storedFileUrl = record.fields['File URL'] || record.fields['FileUrl'] || record.fields['file_url'];
                        
                        if (fileId && typeof fileId === 'string') {
                            // Reconstruct URL from stored fileId
                            const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
                            documentUrl = `${baseUrl.replace(/\/$/, '')}/api/files/${fileId}`;
                            console.log(`[Dashboard] Reconstructed URL from stored fileId for document ${record.id}: ${documentUrl}`);
                        } else if (storedFileUrl && typeof storedFileUrl === 'string' && storedFileUrl.includes('/api/files/')) {
                            // Use stored file URL
                            const fileIdMatch = storedFileUrl.match(/\/api\/files\/([^\/\?]+)/);
                            if (fileIdMatch) {
                                const extractedFileId = fileIdMatch[1];
                                const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
                                documentUrl = `${baseUrl.replace(/\/$/, '')}/api/files/${extractedFileId}`;
                                console.log(`[Dashboard] Reconstructed URL from stored File URL for document ${record.id}: ${documentUrl}`);
                            }
                        } else {
                            // No URL found - document might not have been properly attached
                            console.warn(`[Dashboard] Document ${record.id} has no file URL, fileId, or stored URL. File attachment:`, fileAttachment);
                            documentUrl = undefined;
                        }
                    }

                    // Only return documents that have a valid file attachment or URL
                    // Documents without files are likely failed uploads or incomplete records
                    if (!documentUrl && !fileAttachment) {
                        console.warn(`[Dashboard] Skipping document ${record.id} - no file attachment found`);
                        return null;
                    }

                    return {
                        id: record.id,
                        name: documentName,
                        status: DocumentStatus.RECEIVED,
                        fileName: fileName,
                        date: fileDate,
                        url: documentUrl,
                    };
                    })
                    .filter((doc) => doc !== null) as DocumentArtifact[]; // Filter out null documents
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
            
            // Fetch Available Forms - show all forms that are NOT "Coming Soon" and NOT already assigned
            // Softr shows all available forms (not filtered by company link), excluding those already assigned
            let allAvailableRecords: any[] = [];
            let availableRecords: any[] = [];
            
            try {
                // Fetch all available forms
                allAvailableRecords = await fetchAirtableRecords(availableFormsTableId, {
                    apiKey: token,
                    maxRecords: 100,
                });
                
                console.log(`[Dashboard] Fetched ${allAvailableRecords?.length || 0} total available forms from Airtable`);
                
                if (allAvailableRecords && allAvailableRecords.length > 0) {
                    // Get list of Available Form IDs that are already assigned to this company
                    const assignedAvailableFormIds: string[] = [];
                    if (assignedRecords && assignedRecords.length > 0) {
                        assignedRecords.forEach((assignedRecord: any) => {
                            const linkToAvailable = assignedRecord.fields['Link to Available Forms'];
                            if (linkToAvailable) {
                                const linkedIds = Array.isArray(linkToAvailable) ? linkToAvailable : [linkToAvailable];
                                linkedIds.forEach((id: string) => {
                                    if (!assignedAvailableFormIds.includes(String(id).trim())) {
                                        assignedAvailableFormIds.push(String(id).trim());
                                    }
                                });
                            }
                        });
                    }
                    
                    console.log(`[Dashboard] Found ${assignedAvailableFormIds.length} available forms already assigned to company ${companyId}`);
                    
                    // Filter: exclude "Coming Soon" and already assigned forms
                    availableRecords = allAvailableRecords.filter((record: any) => {
                        // Filter out "Coming Soon" forms
                        const status = String(record.fields['Status'] || '').toLowerCase();
                        const name = String(record.fields['Name'] || '').toLowerCase();
                        if (status.includes('coming soon') || name.includes('coming soon')) {
                            return false;
                        }
                        
                        // Filter out forms that are already assigned to this company
                        if (assignedAvailableFormIds.includes(record.id)) {
                            return false;
                        }
                        
                        return true;
                    });
                    
                    console.log(`[Dashboard] Filtered to ${availableRecords.length} available forms (excluding Coming Soon and already assigned)`);
                }
            } catch (error) {
                console.error('[Dashboard] Error fetching available forms:', error);
            }
            
            // Create lookup map: available form ID -> form name (for use in assigned forms mapping)
            const availableFormsLookup: Record<string, string> = {};
            if (allAvailableRecords && allAvailableRecords.length > 0) {
                allAvailableRecords.forEach((record) => {
                    availableFormsLookup[record.id] = String(record.fields['Name'] || '');
                });
                console.log(`[Dashboard] Created lookup for ${Object.keys(availableFormsLookup).length} available forms`);
            }
            
            // Map to availableForms for display
            availableForms = availableRecords.map((record) => ({
                id: record.id,
                name: String(record.fields['Name'] || ''),
                category: String(record.fields['Category'] || 'General'),
                estimatedTime: String(record.fields['Estimated Time'] || record.fields['Estimated Completion Time'] || record.fields['Completion Time'] || ''),
                description: String(record.fields['Description'] || record.fields['Intro Text'] || ''),
            }));
            
            if (assignedRecords && assignedRecords.length > 0) {
                // Sort by createdTime descending (newest first)
                const sortedRecords = [...assignedRecords].sort((a, b) => {
                    const timeA = a.createdTime ? new Date(a.createdTime).getTime() : 0;
                    const timeB = b.createdTime ? new Date(b.createdTime).getTime() : 0;
                    return timeB - timeA;
                });
                
                // Filter out "Coming Soon" forms
                const filteredRecords = sortedRecords.filter((record: any) => {
                    const status = String(record.fields['Status'] || '').toLowerCase();
                    const name = String(record.fields['Name'] || '').toLowerCase();
                    
                    // Check if the assigned form itself is "Coming Soon"
                    if (status.includes('coming soon') || name.includes('coming soon')) {
                        return false;
                    }
                    
                    // Also check if the linked Available Form is "Coming Soon"
                    const availableFormLink = record.fields['Link to Available Forms'];
                    if (availableFormLink) {
                        const linkedFormIds = Array.isArray(availableFormLink) ? availableFormLink : [availableFormLink];
                        for (const linkedFormId of linkedFormIds) {
                            const linkedFormName = availableFormsLookup[String(linkedFormId)];
                            if (linkedFormName && linkedFormName.toLowerCase().includes('coming soon')) {
                                return false;
                            }
                        }
                    }
                    
                    return true;
                });
                
                console.log(`[Dashboard] Filtered out ${sortedRecords.length - filteredRecords.length} "Coming Soon" assigned forms`);
                
                assignedForms = filteredRecords.map((record) => {
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

    // Fetch Progress Steps from Airtable
    let progressSteps: ProgressStep[] = [];
    
    if (token && companyId) {
        try {
            // Fetch all progress steps and filter by company ID
            const allProgressSteps = await fetchAirtableRecords(progressStepsTableId, {
                apiKey: token,
                maxRecords: 100,
            });
            
            console.log(`[Dashboard] Fetched ${allProgressSteps?.length || 0} total progress steps from Airtable`);
            
            if (allProgressSteps && allProgressSteps.length > 0) {
                // Filter by company ID in code
                const companyProgressSteps = allProgressSteps.filter((record: any) => {
                    const linkField = record.fields['Link to Intake - Group Data'];
                    
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
                        return matches;
                    }
                    
                    // Handle single linked record ID
                    return String(linkField).trim() === String(companyId).trim();
                });
                
                console.log(`[Dashboard] Filtered to ${companyProgressSteps.length} progress steps for company ${companyId}`);
                
                // Map Airtable records to ProgressStep interface
                progressSteps = companyProgressSteps.map((record: any) => {
                    // Map Airtable Status to ProgressStatus enum
                    const airtableStatus = String(record.fields['Status'] || '').toLowerCase();
                    let mappedStatus: ProgressStatus;
                    
                    switch (airtableStatus) {
                        case 'completed':
                            mappedStatus = ProgressStatus.APPROVED;
                            break;
                        case 'in review':
                        case 'in_review':
                            mappedStatus = ProgressStatus.IN_REVIEW;
                            break;
                        case 'flagged':
                            mappedStatus = ProgressStatus.FLAGGED;
                            break;
                        case 'not started':
                        case 'not_started':
                        case 'missing':
                            mappedStatus = ProgressStatus.MISSING;
                            break;
                        case 'not requested':
                        case 'not_requested':
                            mappedStatus = ProgressStatus.NOT_REQUESTED;
                            break;
                        case 'in progress':
                        case 'in_progress':
                        default:
                            mappedStatus = ProgressStatus.IN_REVIEW;
                            break;
                    }
                    
                    // Get category from "Description for Prospect (from Progress Steps/Automation Templates)" or "Category" field
                    const category = String(
                        record.fields['Category'] || 
                        record.fields['Description for Prospect (from Progress Steps/Automation Templates)'] ||
                        'General'
                    );
                    
                    // Get notes from "Notes" field
                    const notes = String(record.fields['Notes'] || '');
                    
                    return {
                        id: record.id,
                        name: String(record.fields['Name'] || 'Untitled Step'),
                        category: category,
                        status: mappedStatus,
                        notes: notes || undefined,
                    };
                });
                
                console.log(`[Dashboard] Mapped ${progressSteps.length} progress steps`);
            } else {
                console.log(`[Dashboard] No progress steps found in Airtable`);
            }
        } catch (error) {
            console.error('[Dashboard] Error fetching progress steps:', error);
        }
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            {/* Row 1: Assigned Forms & Documents (matching Softr layout) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                <div className="lg:col-span-8">
                    <div className="mb-6">
                        <h2 className="text-[24px] font-bold text-gray-900 tracking-tight leading-tight mb-2">
                            Assigned Forms
                        </h2>
                        <p className="text-[15px] text-gray-500 font-medium">
                            Complete the forms assigned to you to move your benefits onboarding forward.
                        </p>
                    </div>
                    <AssignedForms forms={assignedForms} />
                </div>
                <div className="lg:col-span-4">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Your Documents</h2>
                    </div>
                    <DocumentUpload />
                    <div className="mt-6">
                        <DocumentsSection documents={documents} />
                    </div>
                </div>
            </div>

            {/* Row 2: Available Forms Section (matching Softr layout) */}
            {availableForms.length > 0 && (
                <section>
                    <div className="mb-6">
                        <h2 className="text-[24px] font-bold text-gray-900 tracking-tight leading-tight mb-2">
                            Available Forms
                        </h2>
                        <p className="text-[15px] text-gray-500 font-medium">
                            Browse and start additional forms to complete your onboarding.
                        </p>
                    </div>
                    <AvailableForms forms={availableForms} />
                </section>
            )}

            {/* Row 3: Progress Steps Section (matching Softr layout) */}
            <section>
                <div className="mb-6">
                    <h2 className="text-[24px] font-bold text-gray-900 tracking-tight leading-tight mb-2">
                        Progress Steps
                    </h2>
                    <p className="text-[15px] text-gray-500 font-medium">
                        Track your onboarding progress and see what's left to finish.
                    </p>
                </div>
                <ProgressSteps steps={progressSteps} />
            </section>
        </div>
    );
}
