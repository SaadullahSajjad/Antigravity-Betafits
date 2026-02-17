import React from 'react';
import BenefitsAnalysis from '@/components/BenefitsAnalysis';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { fetchAirtableRecordById } from '@/lib/airtable/fetch';
import { DemographicInsights, FinancialKPIs, BudgetBreakdown } from '@/types';

export const dynamic = 'force-dynamic';

export default async function BenefitsAnalysisPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return <BenefitsAnalysis demographics={null} kpis={null} breakdown={[]} reportUrl={undefined} availableReportTypes={[]} />;
  }

  const companyId = await getCompanyId();
  if (!companyId) {
    return <BenefitsAnalysis demographics={null} kpis={null} breakdown={[]} reportUrl={undefined} availableReportTypes={[]} />;
  }

  const token = process.env.AIRTABLE_API_KEY;
  if (!token) {
    return <BenefitsAnalysis demographics={null} kpis={null} breakdown={[]} reportUrl={undefined} availableReportTypes={[]} />;
  }

  try {
    const { fetchAirtableRecords, fetchAirtableRecordById } = await import('@/lib/airtable/fetch');
    
    // First, try to get Group Data record to check for linked KPI Metrics
    const groupDataTableId = 'tbliXJ7599ngxEriO'; // Intake - Group Data
    const groupDataRecord = await fetchAirtableRecordById(groupDataTableId, companyId, {
      apiKey: token,
    });

    let sourceFields: Record<string, any> = {};
    let kpiMetricsRecord: any = null;

    // Fetch from KPI Metrics table - primary source based on Softr config
    const kpiMetricsTableId = 'tblMSbQDSGoiPBWxy'; // Intake - KPI Metrics
    console.log('[BenefitsAnalysisPage] Fetching from KPI Metrics table:', kpiMetricsTableId);
    
    // First, try via linked records from Group Data
    let kpiMetricsRecordId: string | null = null;
    if (groupDataRecord) {
      const fields = groupDataRecord.fields;
      console.log('[BenefitsAnalysisPage] Available fields in Group Data:', Object.keys(fields));
      
      const kpiMetricsLinkFields = [
        'Link to Intake - KPI Metrics',
        'Link to KPI Metrics',
        'KPI Metrics',
        'Link to Intake KPI Metrics',
      ];
      
      for (const linkField of kpiMetricsLinkFields) {
        const linkedKpi = fields[linkField];
        if (Array.isArray(linkedKpi) && linkedKpi.length > 0) {
          kpiMetricsRecordId = linkedKpi[0];
          console.log(`[BenefitsAnalysisPage] Found linked KPI Metrics record ID: ${kpiMetricsRecordId} in field: ${linkField}`);
          break;
        }
      }
    }

    // Try to fetch KPI Metrics record directly if we have the record ID
    if (kpiMetricsRecordId) {
      try {
        kpiMetricsRecord = await fetchAirtableRecordById(kpiMetricsTableId, kpiMetricsRecordId, {
          apiKey: token,
        });
        if (kpiMetricsRecord) {
          console.log('[BenefitsAnalysisPage] Successfully fetched KPI Metrics record via linked record ID');
        }
      } catch (error) {
        console.log('[BenefitsAnalysisPage] Could not fetch KPI Metrics record by ID:', error);
      }
    }

    // If we don't have a linked record, fetch all records and filter by company
    if (!kpiMetricsRecord) {
      try {
        console.log('[BenefitsAnalysisPage] Fetching all KPI Metrics records to filter by company...');
        const allKpiRecords = await fetchAirtableRecords(kpiMetricsTableId, {
          apiKey: token,
          maxRecords: 1000,
        });
        
        console.log(`[BenefitsAnalysisPage] Fetched ${allKpiRecords?.length || 0} KPI Metrics records`);
        
        if (allKpiRecords && allKpiRecords.length > 0) {
          // Log first record to see structure
          console.log('[BenefitsAnalysisPage] Sample KPI Metrics record fields:', Object.keys(allKpiRecords[0].fields));
          
          // Filter by company ID - try multiple link field variations
          const linkFieldVariations = [
            'Link to Intake - Group Data',
            'Link to Intake Group Data',
            'Link to Group Data',
            'Company',
            'Link to Company',
            'Group Data',
          ];
          
          const companyKpiRecord = allKpiRecords.find((record: any) => {
            for (const fieldName of linkFieldVariations) {
              const linkField = record.fields[fieldName];
              if (!linkField) continue;
              
              if (Array.isArray(linkField)) {
                if (linkField.some((id: string) => String(id).trim() === String(companyId).trim())) {
                  return true;
                }
              } else if (String(linkField).trim() === String(companyId).trim()) {
                return true;
              }
            }
            return false;
          });
          
          if (companyKpiRecord) {
            kpiMetricsRecord = companyKpiRecord;
            console.log('[BenefitsAnalysisPage] Found KPI Metrics record by company filter');
          } else {
            console.log('[BenefitsAnalysisPage] No KPI Metrics record found for company ID:', companyId);
            // Log all available link fields from first record for debugging
            if (allKpiRecords.length > 0) {
              const sampleRecord = allKpiRecords[0];
              const availableLinkFields = linkFieldVariations.filter(field => sampleRecord.fields[field]);
              console.log('[BenefitsAnalysisPage] Available link fields in KPI Metrics:', availableLinkFields);
            }
          }
        }
      } catch (error) {
        console.error('[BenefitsAnalysisPage] Error fetching from KPI Metrics table:', error);
      }
    }

    // Use Group Data as fallback, but prioritize KPI Metrics if found
    if (groupDataRecord) {
      sourceFields = groupDataRecord.fields;
      console.log('[BenefitsAnalysisPage] Using Group Data fields. Sample values:', {
        'Eligible Employees': sourceFields['Eligible Employees'],
        'Total Employees': sourceFields['Total Employees'],
        'Benefit Eligible Employees': sourceFields['Benefit Eligible Employees'],
        'Average Salary': sourceFields['Average Salary'],
        'Average Age': sourceFields['Average Age'],
        'Male Percentage': sourceFields['Male Percentage'],
        'Female Percentage': sourceFields['Female Percentage'],
      });
    }

    // If we found a KPI Metrics record, use that instead (it takes priority)
    if (kpiMetricsRecord) {
      sourceFields = kpiMetricsRecord.fields;
      console.log('[BenefitsAnalysisPage] Using KPI Metrics fields (priority). Available fields:', Object.keys(sourceFields));
    }

    if (!groupDataRecord && !kpiMetricsRecord) {
      console.warn('[BenefitsAnalysisPage] No records found in Group Data or KPI Metrics');
      return <BenefitsAnalysis demographics={null} kpis={null} breakdown={[]} reportUrl={undefined} availableReportTypes={[]} />;
    }

    // Helper function to parse employee count (handles ranges like "51-200")
    const parseEmployeeCount = (value: any): number => {
      if (!value) return 0;
      const str = String(value).trim();
      // Handle ranges like "51-200" - take the midpoint or first number
      const rangeMatch = str.match(/(\d+)\s*-\s*(\d+)/);
      if (rangeMatch) {
        const min = parseInt(rangeMatch[1]);
        const max = parseInt(rangeMatch[2]);
        // Return midpoint for ranges, or you could return min/max
        return Math.round((min + max) / 2);
      }
      // Try to extract first number if there's text
      const numberMatch = str.match(/(\d+)/);
      if (numberMatch) {
        return parseInt(numberMatch[1]);
      }
      // Direct parse
      const parsed = parseInt(str);
      return isNaN(parsed) ? 0 : parsed;
    };

    // Map demographics from Airtable fields - try multiple field name variations
    const demographics: DemographicInsights = {
      eligibleEmployees: parseEmployeeCount(
        sourceFields['Eligible Employees'] || 
        sourceFields['Total Employees'] || 
        sourceFields['Benefit Eligible Employees'] ||
        sourceFields['Eligible'] ||
        sourceFields['Employee Count'] ||
        sourceFields['Number of Employees'] ||
        sourceFields['Headcount'] ||
        '0'
      ),
      averageSalary: parseFloat(String(
        sourceFields['Average Salary'] || 
        sourceFields['Avg Salary'] ||
        sourceFields['Salary'] ||
        '0'
      )) || 0,
      averageAge: parseFloat(String(
        sourceFields['Average Age'] || 
        sourceFields['Avg Age'] ||
        sourceFields['Age'] ||
        '0'
      )) || 0,
      malePercentage: parseFloat(String(
        sourceFields['Male Percentage'] || 
        sourceFields['Male %'] ||
        sourceFields['Male'] ||
        '0'
      )) || 0,
      femalePercentage: parseFloat(String(
        sourceFields['Female Percentage'] || 
        sourceFields['Female %'] ||
        sourceFields['Female'] ||
        '0'
      )) || 0,
    };

    // Map financial KPIs from Airtable fields - try multiple field name variations
    const kpis: FinancialKPIs = {
      totalMonthlyCost: parseFloat(String(
        sourceFields['Total Monthly Cost'] || 
        sourceFields['Monthly Cost'] ||
        sourceFields['Total Cost'] ||
        '0'
      )) || 0,
      totalEmployerContribution: parseFloat(String(
        sourceFields['Total Employer Contribution'] || 
        sourceFields['Employer Contribution'] ||
        sourceFields['ER Contribution'] ||
        '0'
      )) || 0,
      totalEmployeeContribution: parseFloat(String(
        sourceFields['Total Employee Contribution'] || 
        sourceFields['Employee Contribution'] ||
        sourceFields['EE Contribution'] ||
        '0'
      )) || 0,
      erCostPerEligible: parseFloat(String(
        sourceFields['ER Cost per Eligible'] || 
        sourceFields['Cost per Eligible'] ||
        sourceFields['ER Cost/Eligible'] ||
        '0'
      )) || 0,
    };

    console.log('[BenefitsAnalysisPage] Mapped demographics:', demographics);
    console.log('[BenefitsAnalysisPage] Mapped KPIs:', kpis);

    // Map budget breakdown - try to extract from Group Data or calculate from existing fields
    let breakdown: BudgetBreakdown[] = [];
    
    const recordForBreakdown = kpiMetricsRecord || groupDataRecord;
    if (recordForBreakdown) {
      const recordFields = recordForBreakdown.fields;
      
      // Try to get budget breakdown from linked records or fields
      const breakdownLinkFields = [
        'Link to Budget Breakdown',
        'Budget Breakdown',
        'Breakdown',
      ];
      
      for (const linkField of breakdownLinkFields) {
        const linkedBreakdown = recordFields[linkField];
        if (Array.isArray(linkedBreakdown) && linkedBreakdown.length > 0) {
          // TODO: Need to know the budget breakdown table ID to fetch linked records
          // For now, breakdown remains empty until table structure is confirmed
          break;
        }
      }
    }
    
    // TODO: If breakdown is in a separate table, fetch from there

    // Get the Benefit Budget Report URL from Airtable
    // Try multiple field name variations
    const reportUrlFieldVariations = [
      'ROI Workbook URL',
      'Benefit Budget Report URL',
      'Report URL',
      'Budget Report URL',
      'Benefit Report URL',
      'Budget Report',
      'Report Link',
      'Document URL',
    ];
    
    // Log all available fields for debugging
    console.log('[BenefitsAnalysisPage] Available fields in source:', Object.keys(sourceFields));
    
    let reportUrl: string | undefined;
    for (const fieldName of reportUrlFieldVariations) {
      const url = sourceFields[fieldName];
      if (url && typeof url === 'string' && url.trim() !== '') {
        reportUrl = url.trim();
        console.log(`[BenefitsAnalysisPage] Found report URL in field "${fieldName}": ${reportUrl}`);
        break;
      } else if (sourceFields[fieldName]) {
        console.log(`[BenefitsAnalysisPage] Field "${fieldName}" exists but value is:`, sourceFields[fieldName], typeof sourceFields[fieldName]);
      }
    }
    
    // Initialize companyDocuments in outer scope
    let companyDocuments: any[] = [];
    
    // Always fetch documents from Documents table for the dropdown (even if reportUrl was found)
    try {
      const documentsTableId = 'tblBgAZKJln76anVn'; // Documents / Intake - Document Upload
      const { fetchAirtableRecords } = await import('@/lib/airtable/fetch');
      
      // Fetch more records to ensure we get all documents
      const allDocuments = await fetchAirtableRecords(documentsTableId, {
        apiKey: token,
        maxRecords: 500, // Increased to catch more documents
      });
      
      console.log(`[BenefitsAnalysisPage] Fetched ${allDocuments?.length || 0} total documents from Documents table`);
      
      // Define link field variations to check
      const linkFieldVariations = [
        'Link to Intake - Group Data',
        'Link to Intake Group Data',
        'Link to Group Data',
        'Company',
        'Link to Company',
      ];
      
      // Debug: Check what link fields exist in documents
      if (allDocuments && allDocuments.length > 0) {
        const firstDoc = allDocuments[0];
        console.log(`[BenefitsAnalysisPage] Sample document (first of ${allDocuments.length}):`, {
          id: firstDoc.id,
          name: firstDoc.fields['Name'] || firstDoc.fields['Extracted Document Title'],
          allFields: Object.keys(firstDoc.fields),
        });
        
        // Check all possible link field variations
        const linkFieldChecks: Record<string, any> = {};
        linkFieldVariations.forEach(fieldName => {
          linkFieldChecks[fieldName] = firstDoc.fields[fieldName];
        });
        console.log(`[BenefitsAnalysisPage] Sample document link fields:`, linkFieldChecks);
        
        // Also log a few more documents to see if they have different structures
        if (allDocuments.length > 1) {
          console.log(`[BenefitsAnalysisPage] Checking first 5 documents for link fields...`);
          allDocuments.slice(0, 5).forEach((doc, idx) => {
            const name = doc.fields['Name'] || doc.fields['Extracted Document Title'] || 'Untitled';
            let linkFieldValue = null;
            for (const fieldName of linkFieldVariations) {
              if (doc.fields[fieldName]) {
                linkFieldValue = { field: fieldName, value: doc.fields[fieldName] };
                break;
              }
            }
            console.log(`[BenefitsAnalysisPage] Doc ${idx + 1}: "${name}" - Link field:`, linkFieldValue);
          });
        }
      }
      
      // Get company name from Group Data for name-based matching (as shown in the condition)
      const companyName = groupDataRecord?.fields['Company Name'] || groupDataRecord?.fields['Name'] || sourceFields['Company Name'] || sourceFields['Name'] || '';
      console.log(`[BenefitsAnalysisPage] Company name for matching: "${companyName}"`);
      
      // Filter documents linked to this company - try multiple field name variations
      companyDocuments = allDocuments?.filter((docRecord) => {
        // First, try matching by linked record ID
        for (const fieldName of linkFieldVariations) {
          const linkField = docRecord.fields[fieldName];
          if (!linkField) continue;
          
          if (Array.isArray(linkField)) {
            const matches = linkField.some((id: string) => String(id).trim() === String(companyId).trim());
            if (matches) {
              console.log(`[BenefitsAnalysisPage] Document ${docRecord.id} matched via field "${fieldName}" (record ID)`);
              return true;
            }
          } else {
            const matches = String(linkField).trim() === String(companyId).trim();
            if (matches) {
              console.log(`[BenefitsAnalysisPage] Document ${docRecord.id} matched via field "${fieldName}" (record ID)`);
              return true;
            }
          }
        }
        
        // Fallback: Try matching by company name (as shown in the condition: "Company Name" includes "Company Name (from Intake - Group Data)")
        if (companyName) {
          const docCompanyName = docRecord.fields['Company Name (from Link to Intake - Group Data)'] || 
                                docRecord.fields['Company Name'] ||
                                docRecord.fields['Company'];
          
          if (docCompanyName) {
            const docCompanyNameStr = String(docCompanyName).trim();
            const companyNameStr = String(companyName).trim();
            
            // Check if company names match (case-insensitive, or if one includes the other)
            if (docCompanyNameStr.toLowerCase() === companyNameStr.toLowerCase() ||
                docCompanyNameStr.toLowerCase().includes(companyNameStr.toLowerCase()) ||
                companyNameStr.toLowerCase().includes(docCompanyNameStr.toLowerCase())) {
              console.log(`[BenefitsAnalysisPage] Document ${docRecord.id} matched via company name: "${docCompanyNameStr}" === "${companyNameStr}"`);
              return true;
            }
          }
        }
        
        return false;
      }) || [];
      
      console.log(`[BenefitsAnalysisPage] Found ${companyDocuments.length} documents linked to company ${companyId}`);
      
      // Log all document names for debugging
      companyDocuments.forEach((doc) => {
        const name = String(doc.fields['Name'] || doc.fields['Extracted Document Title'] || 'Untitled');
        console.log(`[BenefitsAnalysisPage] Document: "${name}" (ID: ${doc.id})`);
      });
      
      // Look for a document with "Benefit Budget Report" in the name or Document Type (case-insensitive)
      // Only if reportUrl wasn't already found
      if (!reportUrl) {
        const searchTerms = [
          'benefit budget report',
          'budget report',
          'roi workbook',
          'benefit report',
          'benefits report',
          'cost report',
          'financial report',
          'benefit analysis',
          'budget analysis',
          'workbook',
        ];
        
        const reportDocument = companyDocuments.find((doc) => {
          const name = String(doc.fields['Name'] || doc.fields['Extracted Document Title'] || '').toLowerCase();
          const docType = String(doc.fields['Document Type'] || '').toLowerCase();
          
          // Check both name and document type
          const nameMatch = searchTerms.some(term => name.includes(term));
          const typeMatch = searchTerms.some(term => docType.includes(term));
          
          return nameMatch || typeMatch;
        });
        
        // If still not found in company documents, search ALL documents by name/type
        // (in case the document isn't properly linked to the company)
        if (!reportDocument && allDocuments && allDocuments.length > 0) {
          console.log(`[BenefitsAnalysisPage] Not found in company documents, searching all ${allDocuments.length} documents...`);
          const allReportDocument = allDocuments.find((doc) => {
            const name = String(doc.fields['Name'] || doc.fields['Extracted Document Title'] || '').toLowerCase();
            const docType = String(doc.fields['Document Type'] || '').toLowerCase();
            
            const nameMatch = searchTerms.some(term => name.includes(term));
            const typeMatch = searchTerms.some(term => docType.includes(term));
            
            return nameMatch || typeMatch;
          });
          
          if (allReportDocument) {
            console.log(`[BenefitsAnalysisPage] Found report document in all documents (not linked to company): "${allReportDocument.fields['Name'] || allReportDocument.fields['Extracted Document Title']}"`);
            // Use this document even though it's not linked to the company
            const finalReportDoc = allReportDocument;
            
            // Extract URL from this document
            const fileField = finalReportDoc.fields['File'];
            const fileAttachment = Array.isArray(fileField) && fileField.length > 0 ? (fileField[0] as any) : null;
            
            if (fileAttachment?.url) {
              reportUrl = fileAttachment.url;
              console.log(`[BenefitsAnalysisPage] Using Airtable attachment URL from all documents: ${reportUrl}`);
            } else {
              const fileId = finalReportDoc.fields['File ID'] || finalReportDoc.fields['FileId'] || finalReportDoc.fields['file_id'];
              const fileUrl = finalReportDoc.fields['File URL'] || finalReportDoc.fields['FileUrl'] || finalReportDoc.fields['file_url'];
              
              if (fileId && typeof fileId === 'string') {
                const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
                reportUrl = `${baseUrl.replace(/\/$/, '')}/api/files/${fileId}`;
                console.log(`[BenefitsAnalysisPage] Reconstructed URL from File ID (all documents): ${reportUrl}`);
              } else if (fileUrl && typeof fileUrl === 'string') {
                if (fileUrl.includes('/api/files/')) {
                  const fileIdMatch = fileUrl.match(/\/api\/files\/([^\/\?]+)/);
                  if (fileIdMatch) {
                    const extractedFileId = fileIdMatch[1];
                    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
                    reportUrl = `${baseUrl.replace(/\/$/, '')}/api/files/${extractedFileId}`;
                    console.log(`[BenefitsAnalysisPage] Reconstructed URL from File URL field (all documents): ${reportUrl}`);
                  } else {
                    reportUrl = fileUrl;
                    console.log(`[BenefitsAnalysisPage] Using File URL field directly (all documents): ${reportUrl}`);
                  }
                } else {
                  reportUrl = fileUrl;
                  console.log(`[BenefitsAnalysisPage] Using File URL field (all documents): ${reportUrl}`);
                }
              }
            }
          } else {
            console.log(`[BenefitsAnalysisPage] No report document found in all ${allDocuments.length} documents`);
            
            // Log all document names and types to help identify the report
            console.log(`[BenefitsAnalysisPage] All document names and types (first 20):`);
            allDocuments.slice(0, 20).forEach((doc, idx) => {
              const name = doc.fields['Name'] || doc.fields['Extracted Document Title'] || 'Untitled';
              const docType = doc.fields['Document Type'] || 'No Type';
              console.log(`[BenefitsAnalysisPage]   ${idx + 1}. "${name}" (Type: "${docType}")`);
            });
            
            // Also check if there are any documents with "report" in the name (case-insensitive)
            const reportLikeDocs = allDocuments.filter((doc) => {
              const name = String(doc.fields['Name'] || doc.fields['Extracted Document Title'] || '').toLowerCase();
              const docType = String(doc.fields['Document Type'] || '').toLowerCase();
              return name.includes('report') || docType.includes('report');
            });
            
            if (reportLikeDocs.length > 0) {
              console.log(`[BenefitsAnalysisPage] Found ${reportLikeDocs.length} documents with "report" in name/type:`);
              reportLikeDocs.forEach((doc, idx) => {
                const name = doc.fields['Name'] || doc.fields['Extracted Document Title'] || 'Untitled';
                const docType = doc.fields['Document Type'] || 'No Type';
                console.log(`[BenefitsAnalysisPage]   ${idx + 1}. "${name}" (Type: "${docType}")`);
              });
            }
          }
        }
        
        // Process the report document if found in company documents
        if (reportDocument) {
          console.log(`[BenefitsAnalysisPage] Found matching document: "${reportDocument.fields['Name'] || reportDocument.fields['Extracted Document Title']}"`);
          
          // Get the file URL from the document (same logic as Documents API)
          const fileField = reportDocument.fields['File'];
          const fileAttachment = Array.isArray(fileField) && fileField.length > 0 ? (fileField[0] as any) : null;
          
          if (fileAttachment?.url) {
            reportUrl = fileAttachment.url;
            console.log(`[BenefitsAnalysisPage] Using Airtable attachment URL: ${reportUrl}`);
          } else {
            // Try File ID or File URL fields
            const fileId = reportDocument.fields['File ID'] || reportDocument.fields['FileId'] || reportDocument.fields['file_id'];
            const fileUrl = reportDocument.fields['File URL'] || reportDocument.fields['FileUrl'] || reportDocument.fields['file_url'];
            
            if (fileId && typeof fileId === 'string') {
              const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
              reportUrl = `${baseUrl.replace(/\/$/, '')}/api/files/${fileId}`;
              console.log(`[BenefitsAnalysisPage] Reconstructed URL from File ID: ${reportUrl}`);
            } else if (fileUrl && typeof fileUrl === 'string') {
              if (fileUrl.includes('/api/files/')) {
                const fileIdMatch = fileUrl.match(/\/api\/files\/([^\/\?]+)/);
                if (fileIdMatch) {
                  const extractedFileId = fileIdMatch[1];
                  const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
                  reportUrl = `${baseUrl.replace(/\/$/, '')}/api/files/${extractedFileId}`;
                  console.log(`[BenefitsAnalysisPage] Reconstructed URL from File URL field: ${reportUrl}`);
                } else {
                  reportUrl = fileUrl;
                  console.log(`[BenefitsAnalysisPage] Using File URL field directly: ${reportUrl}`);
                }
              } else {
                reportUrl = fileUrl;
                console.log(`[BenefitsAnalysisPage] Using File URL field: ${reportUrl}`);
              }
            }
          }
          
          if (reportUrl) {
            console.log(`[BenefitsAnalysisPage] ✓ Successfully found report URL: ${reportUrl}`);
          } else {
            console.warn(`[BenefitsAnalysisPage] Document found but no URL available. File field:`, fileField);
          }
        } else if (!reportUrl) {
          console.log(`[BenefitsAnalysisPage] No "Benefit Budget Report" document found. Available company documents:`, 
            companyDocuments.map(d => d.fields['Name'] || d.fields['Extracted Document Title'] || 'Untitled'));
        }
      }
    } catch (docError) {
      console.error('[BenefitsAnalysisPage] Error fetching documents:', docError);
    }

    // Get all available document types from company documents for the dropdown
    let availableReportTypes: { type: string; documents: any[] }[] = [];
    if (companyDocuments && companyDocuments.length > 0) {
      // Group documents by Document Type
      const documentsByType: Record<string, any[]> = {};
      companyDocuments.forEach((doc) => {
        const docType = String(doc.fields['Document Type'] || 'No Type').trim();
        if (!documentsByType[docType]) {
          documentsByType[docType] = [];
        }
        documentsByType[docType].push(doc);
      });
      
      // Convert to array and sort by most recent document first
      availableReportTypes = Object.entries(documentsByType)
        .map(([type, docs]) => ({
          type,
          documents: docs.sort((a, b) => b.id.localeCompare(a.id)), // Most recent first
        }))
        .sort((a, b) => a.type.localeCompare(b.type)); // Sort types alphabetically
      
      console.log(`[BenefitsAnalysisPage] Found ${availableReportTypes.length} document types:`, availableReportTypes.map(r => r.type));
    }

    return <BenefitsAnalysis demographics={demographics} kpis={kpis} breakdown={breakdown} reportUrl={reportUrl} availableReportTypes={availableReportTypes} />;
  } catch (error) {
    console.error('[BenefitsAnalysisPage] Error:', error);
    return <BenefitsAnalysis demographics={null} kpis={null} breakdown={[]} reportUrl={undefined} availableReportTypes={[]} />;
  }
}
