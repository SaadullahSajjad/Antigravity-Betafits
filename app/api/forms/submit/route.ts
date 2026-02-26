import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { updateAirtableRecord } from '@/lib/airtable/update';
import { createAirtableRecord } from '@/lib/airtable/create';

/** Alternate Airtable field names for Group Data (try when primary fails) */
const GROUP_DATA_FIELD_ALTERNATIVES: Record<string, string[]> = {
    'Estimated Benefit-Eligible Employees': ['Estimated Benefit-Eligible Employees', 'Estimated Benefit Eligible EEs', 'Benefit Eligible Employees', 'Benefit-Eligible US Employees Range'],
    'Estimated Benefit Eligible EEs': ['Estimated Benefit Eligible EEs', 'Estimated Benefit-Eligible Employees', 'Benefit Eligible Employees'],
    'Company Name': ['Company Name', 'Name'],
    'Phone Number': ['Phone Number', 'Phone'],
    'Expected Start Month': ['Expected Start Month', 'Expected Benefit Start Month', 'Current Start Month'],
    'Currently with a PEO': ['Currently with a PEO', 'Medical Coinsurance'],
    'Ideal Number of Medical Plan Options': ['Ideal Number of Medical Plan Options', 'Additional Notes'],
    'Expected Plan Types': ['Expected plan types', 'Expected Plan Types', 'Additional Notes'],
};

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
            console.error('[Form Submit] Company ID not found - user may not be linked to a company in Airtable (Intake - Users → Intake - Group Data)');
            return NextResponse.json(
                { error: 'Company not found. Please ensure your account is linked to a company in the portal.' },
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

        // Benefits Pulse Survey creates NEW record in EE Pulse Surveys (not Group Data)
        const EE_PULSE_SURVEYS_TABLE = 'tbl28XVUekjvl2Ujn';
        const GROUP_DATA_TABLE = 'tbliXJ7599ngxEriO';

        if (formId === 'recmB9IdRhtgckvaY') {
            const apiKey = process.env.AIRTABLE_API_KEY;
            if (!apiKey) {
                return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
            }
            const MEDICAL_TIER_LABELS: Record<string, string> = {
                employee_only: 'Employee Only',
                employee_spouse: 'Employee + Spouse',
                employee_children: 'Employee + Child(ren)',
                family: 'Family',
                waived: 'Waived',
                not_eligible: 'Not Eligible',
            };
            const fields: Record<string, unknown> = {
                'Link to Intake - Group Data': [companyId],
            };
            if (values.company) fields['Company'] = String(values.company);
            if (values.healthBenefitsEnrollment) {
                const tier = MEDICAL_TIER_LABELS[String(values.healthBenefitsEnrollment)] || String(values.healthBenefitsEnrollment);
                fields['Medical Tier'] = tier;
            }
            const overallVal = values.overallBenefitsPackage ?? values.overallSatisfaction;
            if (overallVal !== undefined && overallVal !== null && overallVal !== '') {
                const n = Number(overallVal);
                if (!isNaN(n)) fields['Overall'] = n <= 5 ? n : Math.round((n / 10) * 5) || 1;
            }
            const medicalVal = values.medicalPlanOptions ?? values.medicalSatisfaction;
            if (medicalVal !== undefined && medicalVal !== null && medicalVal !== '') {
                const n = Number(medicalVal);
                if (!isNaN(n)) fields['Medical Options'] = n <= 5 ? n : Math.round((n / 10) * 5) || 1;
            }
            if (values.surveyComments) fields['Comments'] = String(values.surveyComments);
            if (values.dentalSatisfaction !== undefined && values.dentalSatisfaction !== null && values.dentalSatisfaction !== '') {
                const n = Number(values.dentalSatisfaction);
                if (!isNaN(n)) fields['Non-Medical'] = n <= 5 ? n : Math.round((n / 10) * 5) || 1;
            }
            if (values.visionSatisfaction !== undefined && values.visionSatisfaction !== null && values.visionSatisfaction !== '') {
                const n = Number(values.visionSatisfaction);
                if (!isNaN(n) && !fields['Non-Medical']) fields['Non-Medical'] = n <= 5 ? n : Math.round((n / 10) * 5) || 1;
            }
            try {
                const record = await createAirtableRecord(EE_PULSE_SURVEYS_TABLE, { apiKey, fields: fields as Record<string, any> });
                revalidatePath('/employee-feedback');
                revalidatePath('/');
                return NextResponse.json({ success: true, message: 'Survey submitted successfully', recordId: record.id });
            } catch (err: any) {
                console.error('[Form Submit] Benefits Pulse Survey create error:', err);
                return NextResponse.json(
                    { success: false, error: err?.message || 'Failed to save survey. Please try again or contact support.' },
                    { status: 500 }
                );
            }
        }

        // Map form ID to Airtable table (all other forms update Group Data)
        const formTableMap: Record<string, string> = {
            'eBxXtLZdK4us': GROUP_DATA_TABLE,
            'rZhiEaUEskus': GROUP_DATA_TABLE,
            'gn6WNJPJKTus': GROUP_DATA_TABLE,
            'urHF8xDu7eus': GROUP_DATA_TABLE,
            'rec4V98J6aPaM3u9H': GROUP_DATA_TABLE,
            'rec7NfuiBQ8wrEmu7': GROUP_DATA_TABLE,
            'recFVcfdoXkUjIcod': GROUP_DATA_TABLE,
            'recFxyNqTLDdrxXN2': GROUP_DATA_TABLE,
            'recGrsR8Sdx96pckJ': GROUP_DATA_TABLE,
            'recKzuznmqq29uASl': GROUP_DATA_TABLE,
            'recOE9pVakkobVzU7': GROUP_DATA_TABLE,
            'recOt6cX0t1DksDFT': GROUP_DATA_TABLE,
            'recUnTZFK5UyfWqzm': GROUP_DATA_TABLE,
            'recdjXjySYuYUGkdP': GROUP_DATA_TABLE,
            'rechTHxZIxS3bBcqF': GROUP_DATA_TABLE,
            'reclUQ6KhVzCssuVl': GROUP_DATA_TABLE,
            'recsLJiBVdED8EEbr': GROUP_DATA_TABLE,
            'recufWIRuSFArZ9GG': GROUP_DATA_TABLE,
            'recxH9Jrk10bbqU58': GROUP_DATA_TABLE,
            'recySUNj6jv47SOKr': GROUP_DATA_TABLE,
        };

        const tableId = formTableMap[formId] || GROUP_DATA_TABLE;
        console.log(`[Form Submit] formId=${formId}, companyId=${companyId}, tableId=${tableId}`);

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
                'employeeCount': 'Estimated Benefit Eligible EEs', // Group Data uses this name; fallback in retry: Estimated Benefit-Eligible Employees
                'benefitsNeeded': 'New Benefits Additional Info', // Textarea; Expected Benefit Offering is single-select
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

        // Quick Start (eBxXtLZdK4us) form sends Fillout question IDs; map ALL to Airtable field names
        const quickStartQuestionIdToAirtable: Record<string, string> = {
            // Contact & Company Info
            '3khn37NbHQYb7CN6NPgrx2': 'Last Name',
            'qYvbJrrJqLQjqQnVip6c3N': 'First Name',
            '2d65uNNeKNqSmZT1k2WVRq': 'Job Title',
            'jZa7ip7oU533vM2qLWCkZj': 'Phone Number',
            'ckkAfnKZoQag2Kqf7j71Cq': 'Work Email',
            '2UCyRd53bWrtdKXAK1XMy6': 'Company Name',
            'ayXo': 'Street Address',
            'fT94': 'City',
            'hmTa': 'State / Province',
            'wLev': 'ZIP Code',
            'r1TkXLw3QBZBCkoRHidEPs': 'Year Company Founded',
            'uTuDTocoypgCbQCkcHWUXN': 'EIN',
            'hf2rRXr8RmGS1o5PFoFJJn': 'Preferred SIC Code',
            'xfBVQncwKZoTzx4FDeHDLR': 'Preferred NAICS Code',
            'jMkzWAv3b9K5VCyGHPsZmw': 'Benefit-Eligible US Employees Range',
            '87fD37dczxpgzodHMWgvWT': 'Estimated Medical Enrolled EEs',
            'onbhhvHYbup9VUBE6eAAaz': 'Estimated Benefit Eligible EEs',
            'xcqpaj6Sfv98YJFAUiCZ4z': 'Expected Headcount Growth (next 12 months)',
            'opsQwCsEVnschNufM581ph': 'NDA Required',
            '6eWgGjt7iTjtYcnZRfnCjm': 'Additional Notes',
            '8xGZP1oCmeWgPa2GhFquPc': 'Additional Notes',
            'tP2QxuesGXQswTM8r8LNeV': 'Additional Notes',
            '4eLaFN3YpBRxS1gqEFhqG8': 'Additional Notes',
            'aE23zBVWqLxxKfyZAacKm3': 'Additional Notes',
            '6jRhRnuZ2kzaWXQEYjccAQ': 'Additional Notes',
            '52iYqLmZqi87WApC4ZUuM1': 'Additional Notes',
            '89C6yaJhUwD2hLhed5Pd9R': 'Additional Notes',
            'uJTQWkaMyr8daPGbwKfGJt': 'Additional Notes',
            // Benefits Overview
            'd4wVEowxCpRtdsXr81nFnF': 'Offered Benefits',
            'iHxYYn5HYHDvKGH7Ec9Z5L': 'Current Start Month',
            'gSmJUwa363oWH5x2Q68ojZ': 'Expected Start Month',
            '62Sic2EiCFMVuxwFUM9L1k': 'Medical Offering Type',
            '7XiD4e9FAysNviYb9ocJQd': 'Medical Contribution Strategy',
            'hRA1LaWSMrrX2irz3r6XXd': 'Additional Notes',
            'aJ5QJvpDNyhXNMvoSmVEoT': 'Additional Notes',
            'uaFGXRZwNyovwuXGKsCgDf': 'Additional Notes',
            'aByPiuEENQzRDaTFecMkKT': 'Medical Buy-Up Strategy',
            'b5zjBDR1YeKTq9GaVxQYWv': 'Currently with a PEO',
            'mM5ZyS9KeVz83eeqfdHoRn': 'Current PEO',
            'vPgLS18szbAabJNGiwDnev': 'Evaluated PEOs',
            'kewbuyogJjkbbQNNXpbtxe': 'HR Software Used',
            'i5Cg': 'Predominant Payroll Frequency',
            'eKX8': 'Deduction Frequency',
            '1DzLVcVYD9X23eBWJguR2p': 'Additional Notes',
            'iUedSGbFvtuwGorGfJLmoU': 'Additional Notes',
            // Benefit Preference
            'hkZ8KcqU7mWUPnJK3WBybe': 'Ideal Number of Medical Plan Options',
            'qjLXquRvoppwrWfFrFNEnf': 'Expected Plan Types',
            'h5JdKC6cUHMWkD1NSFtJE4': 'Additional Notes',
            'qLpBxT2RxYU81MgD6Qb48P': 'Additional Notes',
            'pmcR22jTVUgcBSXBKQGMJq': 'Additional Notes',
            'awX85gzf6ywgCQsnu1HAKr': 'Additional Notes',
            // Document upload section (non-file text fields -> Additional Notes)
            'kHhRbt6vRBSRSj6TLwbLBc': 'Additional Notes',
            '5gwf': 'Additional Notes',
            '8bvEVKyaGbAv564V7oZ81f': 'Additional Notes',
            'gGmnnURpgpAkzaSHN7W3rs': 'Additional Notes',
            // Ending (thank you - skip saving, map to avoid unknown field error)
            'kTCf1qrYPJsrHcdx1PifGR': 'Additional Notes',
        };

        const baseMapping = fieldMappings[formId] || {};
        const mapping = formId === 'eBxXtLZdK4us'
            ? { ...baseMapping, ...quickStartQuestionIdToAirtable }
            : baseMapping;
        const airtableFields: Record<string, any> = {};
        // Note: We're updating the Group Data table directly, so we don't need to link to it
        // The "Link to Intake - Group Data" field is used in OTHER tables to link TO Group Data
        // Since we're updating the Group Data record itself, we just update its fields directly

        // Define number fields that need conversion from string to number
        // These are Airtable field names that expect number type
        const numberFields = new Set([
            // Employee counts and growth
            'Estimated Benefit-Eligible Employees',
            'Estimated Benefit Eligible EEs',
            'Estimated Medical Enrolled EEs',
            'Expected Headcount Growth (next 12 months)',
            // Company info
            'Year Company Founded',
            // Financial fields
            'Current Monthly Premium',
            'Employer Contribution Percentage',
            // Broker evaluation ratings (1-10 scale)
            'Broker Responsiveness Rating',
            'Broker Renewal Strategy Rating',
            'Broker Compliance Rating',
            'Broker Admin Support Rating',
            'Broker Strategic Value Rating',
            // Benefits satisfaction ratings (1-10 scale)
            'Overall Benefits Satisfaction',
            'Medical Benefits Satisfaction',
            'Dental Benefits Satisfaction',
            'Vision Benefits Satisfaction',
            // Broker info (if they're numbers)
            'Years Experience',
            'Number of Clients',
            'Average Client Size',
        ]);

        // Map form values to Airtable fields
        // Filter out system fields that shouldn't be sent to Airtable
        const systemFields = ['error', 'confirmAccuracy']; // Fields to skip

        // Quick Start (New Benefits): merge benefits text and convert date to month name
        const valuesToMap = { ...values };
        if (formId === 'reclUQ6KhVzCssuVl') {
            const benefitsParts = [
                values.benefitsNeeded,
                values.benefitsNotes,
            ].filter((v) => v != null && v !== '');
            if (benefitsParts.length > 0) {
                valuesToMap.benefitsNotes = benefitsParts.join('\n\n');
            }
            if (values.targetStartDate) {
                const d = new Date(String(values.targetStartDate));
                if (!isNaN(d.getTime())) {
                    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
                    valuesToMap.targetStartDate = months[d.getMonth()];
                }
            }
        }
        
        for (const [formField, value] of Object.entries(valuesToMap)) {
            // Skip system fields and empty values
            if (systemFields.includes(formField)) {
                continue;
            }
            
            const airtableField = mapping[formField] || formField;
            if (value !== null && value !== undefined && value !== '') {
                // Convert number fields from string to number if needed
                if (numberFields.has(airtableField)) {
                    const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
                    if (!isNaN(numValue)) {
                        airtableFields[airtableField] = numValue;
                    } else {
                        // If conversion fails, skip this field
                        console.warn(`[Form Submit] Could not convert "${airtableField}" to number, skipping:`, value);
                    }
                } else {
                    airtableFields[airtableField] = value;
                }
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
                // If we get an unknown field error or invalid value error, try to extract which field is problematic
                const errorMessage = error.message || '';
                if (errorMessage.includes('UNKNOWN_FIELD_NAME') || errorMessage.includes('INVALID_VALUE_FOR_COLUMN')) {
                    // Extract the field name from the error message
                    const fieldMatch = errorMessage.match(/"([^"]+)"/);
                    if (fieldMatch && fieldMatch[1]) {
                        const problematicField = fieldMatch[1];
                        const errorType = errorMessage.includes('UNKNOWN_FIELD_NAME') ? 'does not exist' : 'cannot accept the provided value';
                        console.warn(`[Form Submit] Field "${problematicField}" ${errorType} in Airtable`);
                        console.warn(`[Form Submit] Field value was:`, fieldsToUpdate[problematicField], `(type: ${typeof fieldsToUpdate[problematicField]})`);

                        // Try alternate field name before removing (Group Data table may use different names)
                        const alternatives = GROUP_DATA_FIELD_ALTERNATIVES[problematicField];
                        const savedValue = fieldsToUpdate[problematicField];
                        const { [problematicField]: _removed, ...remainingFields } = fieldsToUpdate;
                        fieldsToUpdate = remainingFields;

                        if (alternatives && alternatives.length > 1 && savedValue !== undefined) {
                            const idx = alternatives.indexOf(problematicField);
                            const nextName = alternatives[idx + 1];
                            if (nextName) {
                                console.warn(`[Form Submit] Retrying with alternate field name "${nextName}"`);
                                fieldsToUpdate = { ...fieldsToUpdate, [nextName]: savedValue };
                                retryCount++;
                                continue;
                            }
                        }
                        
                        if (Object.keys(fieldsToUpdate).length === 0) {
                            console.error(`[Form Submit] No fields could be saved for form ${formId}. Fields attempted:`, Object.keys(airtableFields));
                            return NextResponse.json({
                                success: false,
                                error: 'Form data could not be saved to the database. Please try again or contact support.',
                                details: process.env.NODE_ENV === 'development' ? { attemptedFields: Object.keys(airtableFields) } : undefined,
                            }, { status: 502 });
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
            console.error(`[Form Submit] No record updated for form ${formId}. Fields attempted:`, Object.keys(airtableFields));
            return NextResponse.json({
                success: false,
                error: 'Form data could not be saved to the database. Please try again or contact support.',
                details: process.env.NODE_ENV === 'development' ? { attemptedFields: Object.keys(airtableFields) } : undefined,
            }, { status: 502 });
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

        // Revalidate so dashboard and other pages show fresh Airtable data (two-way sync)
        try {
            revalidatePath('/');
            revalidatePath('/company-details');
            revalidatePath('/benefits-analysis');
        } catch (e) {
            console.warn('[Form Submit] revalidatePath failed:', e);
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
