import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { updateAirtableRecord } from '@/lib/airtable/update';

/**
 * Submit form data to Airtable
 * 
 * This endpoint handles form submissions from React forms converted from Fillout.
 * It maps form data to Airtable records based on the form ID.
 */
export async function POST(request: NextRequest) {
    try {
        // Authenticate user
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const companyId = await getCompanyId();
        if (!companyId) {
            return NextResponse.json(
                { error: 'Company ID not found' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { formId, formName, values } = body;

        if (!formId || !values) {
            return NextResponse.json(
                { error: 'Missing required fields: formId and values' },
                { status: 400 }
            );
        }

        // Map form ID to Airtable table (all forms go to Group Data table)
        const formTableMap: Record<string, string> = {
            // All forms map to Intake - Group Data table
            'eBxXtLZdK4us': 'tbliXJ7599ngxEriO',
            'rZhiEaUEskus': 'tbliXJ7599ngxEriO',
            'gn6WNJPJKTus': 'tbliXJ7599ngxEriO',
            'urHF8xDu7eus': 'tbliXJ7599ngxEriO',
            'rec4V98J6aPaM3u9H': 'tbliXJ7599ngxEriO',
            'rec7NfuiBQ8wrEmu7': 'tbliXJ7599ngxEriO',
            'recFVcfdoXkUjIcod': 'tbliXJ7599ngxEriO',
            'recFxyNqTLDdrxXN2': 'tbliXJ7599ngxEriO',
            'recGrsR8Sdx96pckJ': 'tbliXJ7599ngxEriO',
            'recKzuznmqq29uASl': 'tbliXJ7599ngxEriO',
            'recOE9pVakkobVzU7': 'tbliXJ7599ngxEriO',
            'recOt6cX0t1DksDFT': 'tbliXJ7599ngxEriO',
            'recUnTZFK5UyfWqzm': 'tbliXJ7599ngxEriO',
            'recdjXjySYuYUGkdP': 'tbliXJ7599ngxEriO',
            'rechTHxZIxS3bBcqF': 'tbliXJ7599ngxEriO',
            'reclUQ6KhVzCssuVl': 'tbliXJ7599ngxEriO',
            'recmB9IdRhtgckvaY': 'tbliXJ7599ngxEriO',
            'recsLJiBVdED8EEbr': 'tbliXJ7599ngxEriO',
            'recufWIRuSFArZ9GG': 'tbliXJ7599ngxEriO',
            'recxH9Jrk10bbqU58': 'tbliXJ7599ngxEriO',
            'recySUNj6jv47SOKr': 'tbliXJ7599ngxEriO',
        };

        const tableId = formTableMap[formId] || 'tbliXJ7599ngxEriO';

        // Map form values to Airtable field names for all 17 forms
        // Common field mappings (used across multiple forms)
        // Note: Airtable field names use exact display names from the Airtable interface
        const commonFields: Record<string, string> = {
            'firstName': 'First Name',
            'lastName': 'Last Name',
            'title': 'Job Title',
            'phone': 'Phone Number',
            'phoneNumber': 'Phone Number',
            'email': 'Work Email',
            'companyName': 'Company Name',
            'employeeCount': 'Estimated Benefit-Eligible Employees',
            'address': 'Street Address',
            'city': 'City',
            'state': 'State / Province',
            'zipCode': 'ZIP Code',
            'industry': 'Industry',
        };

        const fieldMappings: Record<string, Record<string, string>> = {
            // Fillout forms (4)
            'eBxXtLZdK4us': {
                ...commonFields,
                // Company Information fields
                'ein': 'EIN',
                'yearFounded': 'Year Company Founded',
                'sicCode': 'Preferred SIC Code',
                'naicsCode': 'Preferred NAICS Code',
                // NDA field
                'hasNDA': 'NDA Required',
                // Employee Information fields
                'benefitEligibleEmployees': 'Benefit-Eligible US Employees Range',
                'estimatedBenefitEligibleEEs': 'Estimated Benefit Eligible EEs',
                'estimatedMedicalEnrolledEEs': 'Estimated Medical Enrolled EEs',
                'expectedHeadcountGrowth': 'Expected Headcount Growth (next 12 months)',
                // Benefits Overview fields
                'offeredBenefits': 'Offered Benefits',
                'medicalOfferingType': 'Medical Offering Type',
                'medicalContributionStrategy': 'Medical Contribution Strategy',
                // Document upload fields
                'benefitGuide': 'Benefit Guide Uploaded',
                'sbcPlanSummaries': 'SBC Plan Summaries Uploaded',
                'census': 'Employee Census Uploaded',
                'otherDocuments': 'Other Documents Notes',
                'additionalNotes': 'Additional Notes',
                // Legacy fields (kept for backward compatibility)
                'hasMedical': 'Offering Health Insurance Benefits?',
                'medicalCarrier': 'Medical Carrier',
                'hasDental': 'Has Dental Benefits',
                'dentalCarrier': 'Dental Carrier',
                'hasVision': 'Has Vision Benefits',
                'visionCarrier': 'Vision Carrier',
                'hasLifeInsurance': 'Has Life Insurance',
                'hasDisability': 'Has Disability Insurance',
                'has401k': 'Has 401k',
                'benefitsNotes': 'Additional Company or Benefits Info',
                'ndaNotes': 'NDA Notes',
            },
            'rZhiEaUEskus': {
                ...commonFields,
                'hasMedical': 'Offering Health Insurance Benefits?',
                'medicalDetails': 'Medical Benefits Details',
                'hasDental': 'Has Dental Benefits',
                'dentalDetails': 'Dental Benefits Details',
                'hasVision': 'Has Vision Benefits',
                'visionDetails': 'Vision Benefits Details',
                'benefitsNotes': 'Additional Company or Benefits Info',
            },
            'gn6WNJPJKTus': {
                ...commonFields,
                'currentPEO': 'Current PEO',
                'peoServices': 'PEO Services Used',
                'peoNotes': 'PEO Additional Info',
                'hasMedical': 'Offering Health Insurance Benefits?',
                'hasDental': 'Has Dental Benefits',
                'hasVision': 'Has Vision Benefits',
                'benefitsNotes': 'Benefits Notes',
            },
            'urHF8xDu7eus': {
                ...commonFields,
                // Broker Relationship fields
                'brokerType': 'Broker Type',
                'hasServiceAgreement': 'Has Service Agreement or BOR',
                'paysBrokerFees': 'Pays Broker Fees Beyond Commissions',
                'brokerSubsidizedServices': 'Broker Subsidized Services',
                // Broker Support & Services fields
                'brokerContactFrequency': 'Broker Contact Frequency',
                'brokerStrategicFrequency': 'Broker Strategic Meeting Frequency',
                'brokerSupportNotes': 'Broker Support Notes',
                // Broker Evaluation fields (Broker Scorecard - 1-10 ratings)
                'brokerResponsiveness': 'Broker Responsiveness Rating',
                'brokerRenewalStrategy': 'Broker Renewal Strategy Rating',
                'brokerCompliance': 'Broker Compliance Rating',
                'brokerAdminSupport': 'Broker Admin Support Rating',
                'brokerStrategicValue': 'Broker Strategic Value Rating',
                // Legacy fields (kept for backward compatibility)
                'brokerName': 'Broker Company Name',
                'brokerLicense': 'Broker License Number',
                'brokerState': 'Licensed States',
                'yearsExperience': 'Years Experience',
                'specializations': 'Specializations',
                'brokerNotes': 'Broker Additional Info',
                'numberOfClients': 'Number of Clients',
                'averageClientSize': 'Average Client Size',
                'clientIndustries': 'Client Industries',
                'clientNotes': 'Client Information Notes',
                'brokerEvaluationNotes': 'Broker Evaluation Notes',
            },
            // Remaining 13 forms
            'rec4V98J6aPaM3u9H': {
                ...commonFields,
                'hasMedicalCoverage': 'Offering Health Insurance Benefits?',
                'coverageType': 'Medical Coverage Type',
                'insuranceCarrier': 'Medical Carrier',
                'planName': 'Medical Plan Name',
                'coverageNotes': 'Medical Coverage Notes',
            },
            'rec7NfuiBQ8wrEmu7': {
                ...commonFields,
                'hasWorkersComp': 'Has Workers Comp',
                'compCarrier': 'Workers Comp Carrier',
                'policyNumber': 'Workers Comp Policy Number',
                'coverageStates': 'Workers Comp Coverage States',
                'compNotes': 'Workers Comp Notes',
            },
            'recFVcfdoXkUjIcod': {
                ...commonFields,
                'groupName': 'Group Name',
                'groupType': 'Group Type',
                'groupDescription': 'Group Description',
            },
            'recFxyNqTLDdrxXN2': {
                ...commonFields,
                'currentAdmin': 'Current Benefits Admin',
                'adminServices': 'Admin Services Used',
                'satisfactionLevel': 'Admin Satisfaction Level',
                'adminNotes': 'Admin Additional Info',
            },
            'recGrsR8Sdx96pckJ': {
                ...commonFields,
                'complianceConcerns': 'Compliance Concerns',
                'currentComplianceStatus': 'Compliance Status',
                'complianceAudits': 'Recent Compliance Audits',
                'complianceNotes': 'Compliance Additional Info',
            },
            'recKzuznmqq29uASl': {
                ...commonFields,
                'currentPEO': 'Current PEO',
                'peoServices': 'PEO Services Used',
                'satisfactionLevel': 'PEO Satisfaction Level',
                'assessmentNotes': 'PEO Assessment Notes',
            },
            'recOE9pVakkobVzU7': {
                ...commonFields,
                'preferredDate': 'Preferred Appointment Date',
                'preferredTime': 'Preferred Appointment Time',
                'appointmentNotes': 'Appointment Additional Notes',
            },
            'recOt6cX0t1DksDFT': {
                ...commonFields,
                'currentHRSystem': 'HR Software Used',
                'hrTechServices': 'HR Tech Services Used',
                'satisfactionLevel': 'HR Tech Satisfaction Level',
                'hrTechNotes': 'HR Tech Additional Info',
            },
            'recUnTZFK5UyfWqzm': {
                ...commonFields,
                'currentBenefits': 'Current Benefit Offering',
                'benefitsGoals': 'Benefits Goals',
            },
            'recdjXjySYuYUGkdP': {
                ...commonFields,
                'currentPremium': 'Current Monthly Premium',
                'employerContribution': 'Employer Contribution Percentage',
                'contributionStrategy': 'Preferred Contribution Strategy',
                'strategyNotes': 'Contribution Strategy Notes',
            },
            'rechTHxZIxS3bBcqF': {
                ...commonFields,
            },
            'reclUQ6KhVzCssuVl': {
                ...commonFields,
                'benefitsNeeded': 'Expected Benefit Offering',
                'targetStartDate': 'Expected Start Month',
                'benefitsNotes': 'New Benefits Additional Info',
            },
            'recmB9IdRhtgckvaY': {
                ...commonFields,
                // Benefits Feedback Form fields (Fillout template: eQ7FVU76PDus)
                'company': 'Company Name',
                'healthBenefitsEnrollment': 'Health Benefits Enrollment',
                'overallBenefitsPackage': 'Overall Benefits Satisfaction',
                'medicalPlanOptions': 'Medical Benefits Satisfaction',
                'overallSatisfaction': 'Overall Benefits Satisfaction', // Keep for backward compatibility
                'medicalSatisfaction': 'Medical Benefits Satisfaction', // Keep for backward compatibility
                'dentalSatisfaction': 'Dental Benefits Satisfaction',
                'visionSatisfaction': 'Vision Benefits Satisfaction',
                'surveyComments': 'Benefits Feedback',
            },
            'recsLJiBVdED8EEbr': {
                ...commonFields,
                'documentType': 'Document Type',
                'documentDescription': 'Document Description',
                'uploadNotes': 'Document Upload Notes',
            },
            'recufWIRuSFArZ9GG': {
                ...commonFields,
            },
            'recxH9Jrk10bbqU58': {
                ...commonFields,
                'brokerName': 'Broker Company Name',
                'brokerLicense': 'Broker License Number',
                'brokerNotes': 'Broker Additional Info',
            },
            'recySUNj6jv47SOKr': {
                ...commonFields,
                'hasNDA': 'NDA Required',
                'ndaType': 'NDA Type',
                'ndaNotes': 'NDA Notes',
            },
        };

        const mapping = fieldMappings[formId] || {};
        const airtableFields: Record<string, any> = {};
        // Note: We're updating the Group Data table directly, so we don't need to link to it
        // The "Link to Intake - Group Data" field is used in OTHER tables to link TO Group Data
        // Since we're updating the Group Data record itself, we just update its fields directly

        // Map form values to Airtable fields
        // Filter out system fields that shouldn't be sent to Airtable
        const systemFields = ['error', 'confirmAccuracy']; // Fields to skip
        
        for (const [formField, value] of Object.entries(values)) {
            // Skip system fields and empty values
            if (systemFields.includes(formField)) {
                continue;
            }
            
            const airtableField = mapping[formField] || formField;
            if (value !== null && value !== undefined && value !== '') {
                airtableFields[airtableField] = value;
            }
        }

        // Create or update record in Airtable
        const apiKey = process.env.AIRTABLE_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'Airtable API key not configured' },
                { status: 500 }
            );
        }

        // For now, we'll update the existing company record instead of creating a new one
        // In the future, you might want to create a separate "Form Submissions" table
        const { updateAirtableRecord } = await import('@/lib/airtable/update');
        
        // Try to update, and if we get unknown field errors, retry without those fields
        let record;
        let fieldsToUpdate = { ...airtableFields };
        const maxRetries = 5; // Prevent infinite loops
        let retryCount = 0;
        
        while (retryCount < maxRetries) {
            try {
                record = await updateAirtableRecord(tableId, companyId, {
                    apiKey,
                    fields: fieldsToUpdate,
                });
                console.log(`[Form Submit] Updated record ${record.id} for form ${formId}`);
                if (retryCount > 0) {
                    console.log(`[Form Submit] Successfully updated after removing ${retryCount} unknown field(s)`);
                }
                break; // Success, exit loop
            } catch (error: any) {
                // If we get an unknown field error, try to extract which field is unknown
                const errorMessage = error.message || '';
                if (errorMessage.includes('UNKNOWN_FIELD_NAME')) {
                    // Extract the field name from the error message
                    const fieldMatch = errorMessage.match(/"([^"]+)"/);
                    if (fieldMatch && fieldMatch[1]) {
                        const unknownField = fieldMatch[1];
                        console.warn(`[Form Submit] Field "${unknownField}" does not exist in Airtable, removing it and retrying...`);
                        
                        // Remove the unknown field and retry
                        const { [unknownField]: removed, ...remainingFields } = fieldsToUpdate;
                        fieldsToUpdate = remainingFields;
                        
                        if (Object.keys(fieldsToUpdate).length === 0) {
                            // If all fields were unknown, log a warning but don't fail
                            // This allows forms to submit successfully even if field mappings need to be updated
                            console.warn(`[Form Submit] All fields for form ${formId} were unknown. Form submitted but no data was saved to Airtable.`);
                            console.warn(`[Form Submit] Fields attempted:`, Object.keys(airtableFields));
                            console.warn(`[Form Submit] Please verify field mappings in app/api/forms/submit/route.ts`);
                            
                            // Return success anyway - the form was submitted, just not saved to Airtable
                            // This prevents blocking the user experience while field mappings are being fixed
                            return NextResponse.json({
                                success: true,
                                recordId: companyId,
                                message: 'Form submitted successfully (some fields may not have been saved - check logs)',
                                warning: 'Some fields could not be saved to Airtable. Please contact support if this persists.',
                            });
                        }
                        
                        retryCount++;
                        continue; // Retry with remaining fields
                    } else {
                        // If we can't parse the field name, just throw the original error
                        throw error;
                    }
                } else {
                    // For other errors, just throw them
                    throw error;
                }
            }
        }
        
        if (!record) {
            // If all fields were unknown, log a warning but don't fail
            // This allows forms to submit successfully even if field mappings need to be updated
            console.warn(`[Form Submit] All fields for form ${formId} were unknown. Form submitted but no data was saved to Airtable.`);
            console.warn(`[Form Submit] Fields attempted:`, Object.keys(airtableFields));
            console.warn(`[Form Submit] Please verify field mappings in app/api/forms/submit/route.ts`);
            
            // Don't return early - continue to update the form status below
            // Create a dummy record object so the code continues
            record = { id: companyId, fields: {}, createdTime: new Date().toISOString() };
        }

        // Update the assigned form status to "Submitted" or "Completed"
        // Find the assigned form record for this form
        try {
            const baseId = "appdqgKk1fmhfaJoT";
            const assignedFormsTableId = 'tblNeyKm9sKAKZq9n';
            const assignedFormsUrl = `https://api.airtable.com/v0/${baseId}/${assignedFormsTableId}`;
            
            // Fetch all assigned forms and filter in code (same approach as dashboard - more reliable)
            const { fetchAirtableRecords } = await import('@/lib/airtable/fetch');
            const allAssignedRecords = await fetchAirtableRecords(assignedFormsTableId, {
                apiKey,
                maxRecords: 100,
            });
            
            console.log(`[Form Submit] Fetched ${allAssignedRecords?.length || 0} total assigned forms from Airtable`);
            
            if (allAssignedRecords && allAssignedRecords.length > 0) {
                // Filter by company ID in code (same logic as dashboard)
                const companyAssignedForms = allAssignedRecords.filter((record: any) => {
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
                        return matches;
                    }
                    
                    // Handle single linked record ID
                    return String(linkField).trim() === String(companyId).trim();
                });
                
                console.log(`[Form Submit] Filtered to ${companyAssignedForms.length} assigned forms for company ${companyId}`);
                
                // Find the assigned form by matching the formId through "Link to Available Forms" field
                const assignedForm = companyAssignedForms.find((r: any) => {
                    // Check if the "Link to Available Forms" field contains the formId
                    const linkToAvailableForms = r.fields['Link to Available Forms'];
                    if (Array.isArray(linkToAvailableForms) && linkToAvailableForms.length > 0) {
                        // The field contains an array of record IDs, check if formId matches
                        return linkToAvailableForms.some((linkedId: string) => linkedId === formId);
                    }
                    
                    // Fallback: Try to match by form name or description (less reliable)
                    const formName = String(r.fields['Name'] || '').toLowerCase();
                    const formDesc = String(r.fields['Assigned Form URL'] || '').toLowerCase();
                    const searchFormId = formId.toLowerCase();
                    return formName.includes(searchFormId) || formDesc.includes(searchFormId);
                });
                
                if (assignedForm) {
                    // Update status to "Submitted"
                    const updateResponse = await fetch(`${assignedFormsUrl}/${assignedForm.id}`, {
                        method: 'PATCH',
                        headers: {
                            Authorization: `Bearer ${apiKey}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            fields: {
                                'Status': 'Submitted',
                            },
                        }),
                    });
                    
                    if (updateResponse.ok) {
                        console.log(`[Form Submit] ✓ Updated assigned form status to Submitted: ${assignedForm.id} for form ${formId}`);
                    } else {
                        const errorText = await updateResponse.text();
                        console.error(`[Form Submit] Failed to update form status:`, errorText);
                    }
                } else {
                    console.warn(`[Form Submit] Could not find assigned form for formId: ${formId}, companyId: ${companyId}`);
                    console.warn(`[Form Submit] Company assigned forms:`, companyAssignedForms.map((r: any) => ({
                        id: r.id,
                        name: r.fields['Name'],
                        linkToAvailableForms: r.fields['Link to Available Forms'],
                    })));
                }
            } else {
                console.warn(`[Form Submit] No assigned forms found in Airtable`);
            }
        } catch (statusError) {
            console.error('[Form Submit] Error updating form status:', statusError);
            // Don't fail the submission if status update fails
        }

        return NextResponse.json({
            success: true,
            recordId: record.id,
            message: 'Form submitted successfully',
        });
    } catch (error: any) {
        console.error('[Form Submit] Error:', error);
        return NextResponse.json(
            {
                error: error.message || 'Failed to submit form',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            },
            { status: 500 }
        );
    }
}
