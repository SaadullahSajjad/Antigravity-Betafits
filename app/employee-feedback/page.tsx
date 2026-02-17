import React from 'react';
import EmployeeFeedback from '@/components/EmployeeFeedback';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { fetchAirtableRecords, fetchAirtableRecordById } from '@/lib/airtable/fetch';
import { FeedbackStats, FeedbackResponse } from '@/types';

export const dynamic = 'force-dynamic';

export default async function EmployeeFeedbackPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return <EmployeeFeedback stats={null} responses={[]} />;
  }

  const companyId = await getCompanyId();
  if (!companyId) {
    return <EmployeeFeedback stats={null} responses={[]} />;
  }

  const apiKey = process.env.AIRTABLE_API_KEY;
  let stats: FeedbackStats | null = null;
  let responses: FeedbackResponse[] = [];

  if (apiKey && companyId) {
    try {
      // Fetch feedback responses from EE Pulse Surveys table
      const allFeedbackRecords = await fetchAirtableRecords('tbl28XVUekjvl2Ujn', {
        apiKey,
        maxRecords: 1000,
      });

      console.log(`[EmployeeFeedbackPage] Fetched ${allFeedbackRecords?.length || 0} records from EE Pulse Surveys table`);

      // Filter by company ID in code (more reliable than ARRAYJOIN)
      const feedbackRecords = allFeedbackRecords?.filter((record) => {
        const linkField = record.fields['Link to Intake - Group Data'];
        
        if (!linkField) {
          return false;
        }
        
        // Handle array of linked record IDs
        if (Array.isArray(linkField) && linkField.length > 0) {
          return linkField.some((id: string) => String(id).trim() === String(companyId).trim());
        }
        
        // Handle single linked record ID
        return String(linkField).trim() === String(companyId).trim();
      }) || [];
      
      console.log(`[EmployeeFeedbackPage] Filtered to ${feedbackRecords.length} feedback records for company ${companyId}`);
      
      // Fetch Company x Year table directly - it's a separate table linked to the company
      const allStatsRecords = await fetchAirtableRecords('tblbtLkv8l4uAm5h6', {
        apiKey,
        maxRecords: 1000,
      });

      console.log(`[EmployeeFeedbackPage] Fetched ${allStatsRecords?.length || 0} records from Company x Year table`);
      
      // Log first record to see what link fields are available
      if (allStatsRecords && allStatsRecords.length > 0) {
        console.log(`[EmployeeFeedbackPage] Sample Company x Year record fields:`, Object.keys(allStatsRecords[0].fields));
        console.log(`[EmployeeFeedbackPage] Sample Company x Year record link fields:`, {
          'Link to Intake - Group Data': allStatsRecords[0].fields['Link to Intake - Group Data'],
          'Link to Intake Group Data': allStatsRecords[0].fields['Link to Intake Group Data'],
          'Link to Group Data': allStatsRecords[0].fields['Link to Group Data'],
          'Company': allStatsRecords[0].fields['Company'],
          'Link to Company': allStatsRecords[0].fields['Link to Company'],
          'Intake - Group Data': allStatsRecords[0].fields['Intake - Group Data'],
          'Group Data': allStatsRecords[0].fields['Group Data'],
        });
      }

      // Filter stats records by company ID - try ALL possible link field variations
      const linkFieldVariations = [
        'Link to Intake - Group Data',
        'Link to Intake Group Data',
        'Link to Group Data',
        'Intake - Group Data',
        'Intake Group Data',
        'Group Data',
        'Company',
        'Link to Company',
        'Company Name',
        'Link to Company Name',
      ];
      
      const statsRecords = allStatsRecords?.filter((record) => {
        for (const linkFieldName of linkFieldVariations) {
          const linkField = record.fields[linkFieldName];
          
          if (!linkField) continue;
          
          // Handle array of linked record IDs
          if (Array.isArray(linkField) && linkField.length > 0) {
            if (linkField.some((id: string) => String(id).trim() === String(companyId).trim())) {
              console.log(`[EmployeeFeedbackPage] ✅ Found Company x Year record via field "${linkFieldName}"`);
              return true;
            }
          } else {
            // Handle single linked record ID
            if (String(linkField).trim() === String(companyId).trim()) {
              console.log(`[EmployeeFeedbackPage] ✅ Found Company x Year record via field "${linkFieldName}"`);
              return true;
            }
          }
        }
        return false;
      }) || [];
      
      console.log(`[EmployeeFeedbackPage] Filtered to ${statsRecords.length} stats records for company ${companyId}`);
      
      let statsRecord: any = null;
      if (statsRecords.length > 0) {
        statsRecord = statsRecords[0];
        console.log(`[EmployeeFeedbackPage] ✅ Using Company x Year record ID: ${statsRecord.id}`);
      } else {
        console.log(`[EmployeeFeedbackPage] ⚠️ No Company x Year record found for company ${companyId}`);
        // Log all available link fields from first record for debugging
        if (allStatsRecords && allStatsRecords.length > 0) {
          const sampleRecord = allStatsRecords[0];
          const availableLinkFields = linkFieldVariations.filter(field => sampleRecord.fields[field]);
          console.log(`[EmployeeFeedbackPage] Available link fields in Company x Year:`, availableLinkFields);
          console.log(`[EmployeeFeedbackPage] All fields in Company x Year:`, Object.keys(sampleRecord.fields));
        }
      }
      
      // Use feedback records for responses
      const records = feedbackRecords;

      if (records && records.length > 0) {
        // Sort by createdTime (newest first)
        const sortedRecords = [...records].sort((a, b) => {
          const timeA = a.createdTime ? new Date(a.createdTime).getTime() : 0;
          const timeB = b.createdTime ? new Date(b.createdTime).getTime() : 0;
          return timeB - timeA;
        });

        // Log first record to see what fields are available
        if (sortedRecords.length > 0) {
          console.log(`[EmployeeFeedbackPage] Sample feedback record fields:`, Object.keys(sortedRecords[0].fields));
          // Log all possible tier-related fields
          const sampleFields = sortedRecords[0].fields;
          console.log(`[EmployeeFeedbackPage] All tier-related field values:`, {
            'Tier': sampleFields['Tier'],
            'Coverage Tier': sampleFields['Coverage Tier'],
            'Medical Tier': sampleFields['Medical Tier'],
            'Tier (Medical)': sampleFields['Tier (Medical)'],
            'Coverage': sampleFields['Coverage'],
            'Medical Coverage Tier': sampleFields['Medical Coverage Tier'],
          });
          // Log the full record to see all fields
          console.log(`[EmployeeFeedbackPage] Full sample record:`, JSON.stringify(sampleFields, null, 2));
        }
        
        // Map to FeedbackResponse structure
        responses = sortedRecords.map(record => {
          const fields = record.fields;
          
          // Get tier - try multiple field name variations (based on schema: efld_survey_medical_tier)
          let tierValue = 
            fields['Medical Tier'] ||
            fields['Tier (Medical)'] ||
            fields['Medical Coverage Tier'] ||
            fields['Coverage Tier'] || 
            fields['Tier'] || 
            fields['Coverage'] ||
            fields['Medical'] ||
            null;
          
          // Handle if tier is an array (multiple values)
          if (Array.isArray(tierValue)) {
            tierValue = tierValue.join(' ');
          }
          
          // Convert to string and clean up
          let tier = tierValue ? String(tierValue).trim() : '';
          
          // If tier is empty or just whitespace, use default
          if (!tier || tier === '') {
            tier = 'Individual Only';
          }
          
          console.log(`[EmployeeFeedbackPage] Mapped tier for record ${record.id}: "${tier}" (from value: ${JSON.stringify(tierValue)})`);
          
          // Helper to parse numeric field with multiple name variations (returns number)
          const parseNumericField = (possibleNames: string[], defaultValue: number = 0): number => {
            for (const name of possibleNames) {
              const value = fields[name];
              if (value !== undefined && value !== null && value !== '') {
                const parsed = Number(value);
                if (!isNaN(parsed)) {
                  console.log(`[EmployeeFeedbackPage] Found "${name}" field with value: ${parsed} for record ${record.id}`);
                  return parsed;
                }
              }
            }
            return defaultValue;
          };
          
          // Helper to parse numeric field that can return null (for optional fields like retirement)
          const parseNumericFieldNullable = (possibleNames: string[], defaultValue: number | null = null): number | null => {
            for (const name of possibleNames) {
              const value = fields[name];
              if (value !== undefined && value !== null && value !== '') {
                const parsed = Number(value);
                if (!isNaN(parsed)) {
                  console.log(`[EmployeeFeedbackPage] Found "${name}" field with value: ${parsed} for record ${record.id}`);
                  return parsed;
                }
              }
            }
            return defaultValue;
          };
          
          return {
            id: record.id,
            submittedAt: String(fields['Created'] || record.createdTime || new Date().toISOString()).split('T')[0],
            tier: tier,
            overallRating: parseNumericField([
              'Overall',  // Primary field name as confirmed by user
              'Overall Rating',
              'Rating',
              'Score',
              'Overall Score',
            ], 0),
            medicalOptions: parseNumericField([
              'Medical Options',
              'Medical Options Rating',
              'Options',
              'Options Rating',
            ], 0),
            medicalNetwork: parseNumericField([
              'Medical Network',
              'Medical Network Rating',
              'Network',
              'Network Rating',
            ], 0),
            medicalCost: parseNumericField([
              'Medical Cost',
              'Employee Cost',
              'Cost Rating',
              'Cost',
              'EE Cost',
            ], 0),
            nonMedical: parseNumericField([
              'Non-Medical',
              'Non-Medical Rating',
              'Non Medical',
              'Non Medical Rating',
            ], 0),
            retirement: parseNumericFieldNullable([
              'Retirement',  // Primary field name as confirmed by user
              'Retirement Rating',
              'Retirement Score',
            ], null), // null if not found, not 0
            comments: String(fields['Comments'] || fields['Text'] || fields['Comment'] || ''),
          };
        });

        // Get stats from Company x Year table (prioritize this over calculated stats)
        if (statsRecord) {
          const statsFields = statsRecord.fields;
          
          console.log(`[EmployeeFeedbackPage] ✅ Found stats record from Company x Year, ID:`, statsRecord.id);
          console.log(`[EmployeeFeedbackPage] Stats record fields:`, Object.keys(statsFields));
          
          // Log retirement field specifically
          console.log(`[EmployeeFeedbackPage] Retirement field values:`, {
            'Retirement': statsFields['Retirement'],
            'Retirement Score': statsFields['Retirement Score'],
            'Retirement Rating': statsFields['Retirement Rating'],
            'Average Retirement': statsFields['Average Retirement'],
            'Retirement Average': statsFields['Retirement Average'],
          });
          
          // Log ALL fields to see what's available
          console.log(`[EmployeeFeedbackPage] ALL STATS FIELDS:`, JSON.stringify(statsFields, null, 2));
          
          // Helper function to find field value by trying multiple name variations
          const findFieldValue = (possibleNames: string[], defaultValue: any = null): any => {
            for (const name of possibleNames) {
              const value = statsFields[name];
              if (value !== undefined && value !== null && value !== '') {
                console.log(`[EmployeeFeedbackPage] Found field "${name}" with value:`, value);
                return value;
              }
            }
            return defaultValue;
          };
          
          // Helper function to parse numeric value
          const parseNumeric = (value: any, defaultValue: number = 0): number => {
            if (value === null || value === undefined || value === '') return defaultValue;
            if (typeof value === 'number') return value;
            const parsed = parseFloat(String(value).trim());
            return isNaN(parsed) ? defaultValue : parsed;
          };
          
          // Map stats from Company x Year table - try ALL possible field name variations
          const overallValue = findFieldValue([
            'Overall',  // Primary field name as confirmed by user
            'Overall Score',
            'Overall Rating',
            'Average Overall',
            'Overall Average',
            'Average Score',
            'Score',
            'Overall Average Score',
            'Overall Rating Average',
          ]);
          
          const responsesValue = findFieldValue([
            'Total Responses',
            'Responses',
            'Response Count',
            'Number of Responses',
            'Total Response Count',
            'Count',
          ], responses.length);
          
          const nonMedicalValue = findFieldValue([
            'Non-Medical',
            'Non-Medical Score',
            'Non-Medical Rating',
            'Average Non-Medical',
            'Non-Medical Average',
            'Non Medical',
            'Non Medical Score',
          ]);
          
          const employeeCostValue = findFieldValue([
            'Employee Cost',
            'Employee Cost Score',
            'Employee Cost Rating',
            'Cost Score',
            'Average Employee Cost',
            'EE Cost',
            'EE Cost Score',
          ]);
          
          const medicalNetworkValue = findFieldValue([
            'Medical Network',
            'Medical Network Score',
            'Medical Network Rating',
            'Network Score',
            'Average Medical Network',
            'Network',
            'Network Rating',
          ]);
          
          const medicalOptionsValue = findFieldValue([
            'Medical Options',
            'Medical Options Score',
            'Medical Options Rating',
            'Options Score',
            'Average Medical Options',
            'Options',
            'Options Rating',
          ]);
          
          const retirementValue = findFieldValue([
            'Retirement',  // Primary field name as confirmed by user
            'Retirement Score',
            'Retirement Rating',
            'Average Retirement',
            'Retirement Average',
          ]);
          
          console.log(`[EmployeeFeedbackPage] Mapped values:`, {
            overall: overallValue,
            responses: responsesValue,
            nonMedical: nonMedicalValue,
            employeeCost: employeeCostValue,
            medicalNetwork: medicalNetworkValue,
            medicalOptions: medicalOptionsValue,
            retirement: retirementValue,
          });
          
          console.log(`[EmployeeFeedbackPage] Retirement value from Company x Year:`, retirementValue, `(type: ${typeof retirementValue})`);
          
          // Parse retirement - if found in Company x Year, use it and round to whole number; otherwise null
          let parsedRetirement: number | null = null;
          if (retirementValue !== null && retirementValue !== undefined && retirementValue !== '') {
            const numericValue = parseNumeric(retirementValue, 0);
            parsedRetirement = Math.round(numericValue); // Round to whole number
            console.log(`[EmployeeFeedbackPage] Using retirement from Company x Year: ${numericValue} → rounded to ${parsedRetirement}`);
          } else {
            console.log(`[EmployeeFeedbackPage] Retirement not found in Company x Year, will be null`);
          }
          
          stats = {
            overall: parseNumeric(overallValue, 0),
            responses: parseInt(String(responsesValue)) || responses.length,
            nonMedical: parseNumeric(nonMedicalValue, 0),
            employeeCost: parseNumeric(employeeCostValue, 0),
            medicalNetwork: parseNumeric(medicalNetworkValue, 0),
            medicalOptions: parseNumeric(medicalOptionsValue, 0),
            retirement: parsedRetirement, // Use value from Company x Year, or null if not found
          };
          
          console.log(`[EmployeeFeedbackPage] ✅ Final stats from Company x Year:`, stats);
          console.log(`[EmployeeFeedbackPage] Retirement value in final stats:`, stats.retirement);
        } else if (responses.length > 0) {
          // Fallback: Calculate stats from responses if no stats record found
          // BUT: Retirement should ALWAYS come from Company x Year, not calculated
          console.log(`[EmployeeFeedbackPage] ⚠️ No stats record found in Company x Year, calculating from responses...`);
          console.log(`[EmployeeFeedbackPage] ⚠️ WARNING: Retirement should come from Company x Year table, not calculated!`);
          console.log(`[EmployeeFeedbackPage] Sample response overallRating values:`, responses.slice(0, 3).map(r => r.overallRating));
          
          const overallSum = responses.reduce((sum, r) => sum + (r.overallRating || 0), 0);
          const medicalOptionsSum = responses.reduce((sum, r) => sum + (r.medicalOptions || 0), 0);
          const medicalNetworkSum = responses.reduce((sum, r) => sum + (r.medicalNetwork || 0), 0);
          const medicalCostSum = responses.reduce((sum, r) => sum + (r.medicalCost || 0), 0);
          const nonMedicalSum = responses.reduce((sum, r) => sum + (r.nonMedical || 0), 0);
          const employeeCostSum = medicalCostSum; // Assuming employee cost is same as medical cost

          const calculatedOverall = responses.length > 0 ? overallSum / responses.length : 0;
          console.log(`[EmployeeFeedbackPage] Calculated overall: ${overallSum} / ${responses.length} = ${calculatedOverall}`);
          
          // IMPORTANT: Retirement should NOT be calculated - it must come from Company x Year
          // If Company x Year record is not found, retirement should be null, not calculated
          console.log(`[EmployeeFeedbackPage] ⚠️ Retirement will be null because Company x Year record was not found`);

          stats = {
            overall: calculatedOverall,
            responses: responses.length,
            nonMedical: responses.length > 0 ? nonMedicalSum / responses.length : 0,
            employeeCost: responses.length > 0 ? employeeCostSum / responses.length : 0,
            medicalNetwork: responses.length > 0 ? medicalNetworkSum / responses.length : 0,
            medicalOptions: responses.length > 0 ? medicalOptionsSum / responses.length : 0,
            retirement: null, // ALWAYS null if Company x Year record not found - should not calculate
          };
          
          console.log(`[EmployeeFeedbackPage] Calculated stats from responses (retirement is null - must come from Company x Year):`, stats);
        }
      }
    } catch (error) {
      console.error('[EmployeeFeedbackPage] Error fetching data:', error);
    }
  }

  return <EmployeeFeedback stats={stats} responses={responses} />;
}
