import React from 'react';
import BenefitPlans from '@/components/BenefitPlans';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { fetchAirtableRecordById, fetchAirtableRecords } from '@/lib/airtable/fetch';
import { BenefitEligibilityData, ContributionStrategy, BenefitPlan } from '@/types';

export const dynamic = 'force-dynamic';

export default async function BenefitPlansPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return <BenefitPlans eligibility={null} strategies={[]} plans={[]} />;
  }

  const companyId = await getCompanyId();
  if (!companyId) {
    return <BenefitPlans eligibility={null} strategies={[]} plans={[]} />;
  }

  const token = process.env.AIRTABLE_API_KEY;
  if (!token) {
    return <BenefitPlans eligibility={null} strategies={[]} plans={[]} />;
  }

  try {
    const groupDataTableId = 'tbliXJ7599ngxEriO';
    const groupRecord = await fetchAirtableRecordById(groupDataTableId, companyId, {
      apiKey: token,
    });

    let eligibility: BenefitEligibilityData | null = null;
    if (groupRecord) {
      const fields = groupRecord.fields;
      eligibility = {
        className: String(fields['Benefit Class'] || 'All Full-Time Employees'),
        waitingPeriod: String(fields['Waiting Period'] || ''),
        effectiveDate: String(fields['Effective Date'] || ''),
        requiredHours: String(fields['Required Hours'] || '30 Hours per week'),
      };
    }

    // Fetch contribution strategies - try from Group Data record first
    let strategies: ContributionStrategy[] = [];
    
    if (groupRecord) {
      const fields = groupRecord.fields;
      
    }
    
    // Fetch Contribution Strategies from Plan Data table
    // Each plan record has its own contribution strategy fields
    if (groupRecord) {
      const fields = groupRecord.fields;
      
      // Get linked plan records from Group Data
      const planLinkFields = [
        'Link to Benefit Plans',
        'Benefit Plans',
        'Plans',
        'Link to Plans',
        'Link to Intake - Plan Data',
      ];
      
      const planTableId = 'tblPJjWgnbblYLym4'; // Intake - Plan Data
      
      for (const linkField of planLinkFields) {
        const linkedPlans = fields[linkField];
        if (Array.isArray(linkedPlans) && linkedPlans.length > 0) {
          for (const planId of linkedPlans) {
            try {
              const planRecord = await fetchAirtableRecordById(planTableId, planId, { apiKey: token });
              if (planRecord) {
                const planFields = planRecord.fields;
                
                // Get benefit category
                const category = String(planFields['Benefit Type'] || planFields['Category'] || planFields['Type'] || 'Medical').toLowerCase();
                const benefit = category.includes('dental') ? 'Dental' : category.includes('vision') ? 'Vision' : 'Medical';
                
                // Get contribution strategy fields from Plan Data
                const strategyType = planFields['Contribution Strategy'] 
                  ? (typeof planFields['Contribution Strategy'] === 'string' 
                      ? planFields['Contribution Strategy'] 
                      : (planFields['Contribution Strategy']?.label || String(planFields['Contribution Strategy'])))
                  : '';
                
                const flatAmount = planFields['Flat Amount'] ? String(planFields['Flat Amount']) : '';
                const eePercent = planFields['EE'] ? String(planFields['EE']) : '';
                const depPercent = planFields['Dep'] ? String(planFields['Dep']) : '';
                const buyUpStrategy = planFields['Buy-Up Strategy'] ? String(planFields['Buy-Up Strategy']) : '';
                
                // Add strategy if it has a strategy type (show all strategies from all plans)
                if (strategyType) {
                  strategies.push({
                    benefit: benefit,
                    strategyType: String(strategyType).trim(),
                    flatAmount: flatAmount,
                    eePercent: eePercent,
                    depPercent: depPercent,
                    buyUpStrategy: buyUpStrategy,
                  });
                }
              }
            } catch (error) {
              console.warn(`[BenefitPlansPage] Error fetching plan ${planId} for strategy:`, error);
            }
          }
          break; // Found the field, no need to check others
        }
      }
    }

    // Fetch benefit plans - try from Group Data linked records
    let plans: BenefitPlan[] = [];
    
    console.log('[BenefitPlansPage] Starting to fetch plans...');
    
    if (groupRecord) {
      const fields = groupRecord.fields;
      console.log('[BenefitPlansPage] Group record found, checking for linked plans...');
      console.log('[BenefitPlansPage] Available fields in Group Data:', Object.keys(fields));
      
      // Try to get linked benefit plan records
      const planLinkFields = [
        'Link to Benefit Plans',
        'Benefit Plans',
        'Plans',
        'Link to Plans',
        'Link to Intake - Plan Data',
      ];
      
      for (const linkField of planLinkFields) {
        const linkedPlans = fields[linkField];
        console.log(`[BenefitPlansPage] Checking field "${linkField}":`, linkedPlans ? (Array.isArray(linkedPlans) ? `${linkedPlans.length} linked plans` : 'Not an array') : 'Not found');
        
        if (Array.isArray(linkedPlans) && linkedPlans.length > 0) {
          console.log(`[BenefitPlansPage] Found ${linkedPlans.length} linked plan IDs in field "${linkField}"`);
          // Fetch each linked plan record from Intake - Plan Data table
          const planTableId = 'tblPJjWgnbblYLym4'; // Intake - Plan Data
          for (const planId of linkedPlans) {
            try {
              console.log(`[BenefitPlansPage] Fetching plan record: ${planId}`);
              const planRecord = await fetchAirtableRecordById(planTableId, planId, {
                apiKey: token,
              });
              if (planRecord) {
                const planFields = planRecord.fields;
                console.log(`[BenefitPlansPage] Successfully fetched plan ${planId}`);
                console.log(`[BenefitPlansPage] Plan fields available:`, Object.keys(planFields));
                console.log(`[BenefitPlansPage] Plan name:`, planFields['Plan Name (Client)'] || planFields['Plan Name'] || planFields['Name']);
                console.log(`[BenefitPlansPage] Plan category:`, planFields['Benefit Type'] || planFields['Category'] || planFields['Type']);
                // Use Benefit Type or Category field to determine plan category
                const category = String(planFields['Benefit Type'] || planFields['Category'] || planFields['Type'] || 'Medical').toLowerCase();
                const planCategory = category.includes('dental') ? 'Dental' : category.includes('vision') ? 'Vision' : 'Medical';
                
                plans.push({
                  id: planRecord.id,
                  name: String(planFields['Plan Name (Client)'] || planFields['Plan Name'] || planFields['Name'] || ''),
                  carrier: String(planFields['Carrier'] || ''),
                  score: parseFloat(String(planFields['Plan Score (ML)'] || planFields['Plan Score'] || planFields['Score'] || planFields['Rating'] || '0')) || 0,
                  category: planCategory as 'Medical' | 'Dental' | 'Vision',
                  type: String(planFields['Medical Plan Type'] || planFields['Dental Plan Type'] || planFields['Vision Plan Type'] || planFields['Plan Type'] || planFields['Type'] || ''),
                  // Medical fields - using exact field names from schema
                  deductible: planFields['Medical - Deductible (Single)'] ? String(planFields['Medical - Deductible (Single)']) : undefined,
                  oopm: planFields['Medical OOPM (Single)'] || planFields['Medical - OOPM (Single)'] ? String(planFields['Medical OOPM (Single)'] || planFields['Medical - OOPM (Single)']) : undefined,
                  coinsurance: planFields['Medical - Coinsurance'] ? String(planFields['Medical - Coinsurance']) : undefined,
                  copay: planFields['Medical - Office Visit'] || planFields['Medical - Copay'] || planFields['Copay'] ? String(planFields['Medical - Office Visit'] || planFields['Medical - Copay'] || planFields['Copay']) : undefined,
                  rx: planFields['Medical - Rx (Combined)'] || planFields['Rx (Combined)'] || planFields['RX'] || planFields['Prescription'] ? String(planFields['Medical - Rx (Combined)'] || planFields['Rx (Combined)'] || planFields['RX'] || planFields['Prescription']) : undefined,
                  // Dental fields
                  annualMax: planFields['Dental - Annual Max'] || planFields['Annual Max'] ? String(planFields['Dental - Annual Max'] || planFields['Annual Max']) : undefined,
                  preventive: planFields['Dental - Preventive'] || planFields['Preventive'] ? String(planFields['Dental - Preventive'] || planFields['Preventive']) : undefined,
                  basic: planFields['Dental - Basic'] || planFields['Basic'] ? String(planFields['Dental - Basic'] || planFields['Basic']) : undefined,
                  major: planFields['Dental - Major'] || planFields['Major'] ? String(planFields['Dental - Major'] || planFields['Major']) : undefined,
                  // Vision fields - using correct type field names
                  examCopay: planFields['Vision - Exam Copay'] || planFields['Exam'] ? String(planFields['Vision - Exam Copay'] || planFields['Exam']) : undefined,
                  materialsCopay: planFields['Vision - Materials Copay'] || planFields['Materials'] ? String(planFields['Vision - Materials Copay'] || planFields['Materials']) : undefined,
                  frameAllowance: planFields['Vision - Frame Allowance'] || planFields['Frames'] ? String(planFields['Vision - Frame Allowance'] || planFields['Frames']) : undefined,
                  materialsFrequency: planFields['Vision - Materials Frequency'] || planFields['Materials Frequency'] ? String(planFields['Vision - Materials Frequency'] || planFields['Materials Frequency']) : undefined,
                  frameFrequency: planFields['Vision - Frame Frequency'] || planFields['Frame Frequency'] ? String(planFields['Vision - Frame Frequency'] || planFields['Frame Frequency']) : undefined,
                });
                console.log(`[BenefitPlansPage] Mapped plan ${planId} to BenefitPlan object`);
              } else {
                console.warn(`[BenefitPlansPage] Plan record ${planId} is null or undefined`);
              }
            } catch (error) {
              console.warn(`[BenefitPlansPage] Error fetching plan ${planId}:`, error);
            }
          }
          console.log(`[BenefitPlansPage] Total plans mapped from linked records: ${plans.length}`);
          break;
        }
      }
    } else {
      console.log('[BenefitPlansPage] No group record found, cannot fetch plans');
    }
    
    // If no plans found via linked records, try fetching all plans and filtering by company
    if (plans.length === 0 && groupRecord) {
      console.log('[BenefitPlansPage] No plans found via linked records, trying fallback method...');
      try {
        const planTableId = 'tblPJjWgnbblYLym4'; // Intake - Plan Data
        const allPlans = await fetchAirtableRecords(planTableId, {
          apiKey: token,
          maxRecords: 100,
        });
        
        console.log(`[BenefitPlansPage] Fetched ${allPlans?.length || 0} total plans from table for filtering`);
        
        if (allPlans && allPlans.length > 0) {
          // Log first plan to see what fields are available
          console.log('[BenefitPlansPage] Sample plan fields:', Object.keys(allPlans[0].fields));
          console.log('[BenefitPlansPage] Sample plan record:', JSON.stringify(allPlans[0].fields, null, 2));
          
          const companyLinkFields = ['Link to Intake - Group Data', 'Link to Intake Group Data', 'Link to Group Data', 'Company', 'Link to Company', 'Group Data'];
          let filteredCount = 0;
          for (const planRecord of allPlans) {
            const planFields = planRecord.fields;
            for (const linkField of companyLinkFields) {
              const linkedCompany = planFields[linkField];
              if (linkedCompany) {
                console.log(`[BenefitPlansPage] Plan ${planRecord.id} has field "${linkField}":`, linkedCompany);
              }
              if (Array.isArray(linkedCompany) && linkedCompany.includes(companyId)) {
                filteredCount++;
                console.log(`[BenefitPlansPage] Plan ${planRecord.id} is linked to company ${companyId}`);
                // Use Benefit Type or Category field to determine plan category
                const category = String(planFields['Benefit Type'] || planFields['Category'] || planFields['Type'] || 'Medical').toLowerCase();
                const planCategory = category.includes('dental') ? 'Dental' : category.includes('vision') ? 'Vision' : 'Medical';
                
                plans.push({
                  id: planRecord.id,
                  name: String(planFields['Plan Name (Client)'] || planFields['Plan Name'] || planFields['Name'] || ''),
                  carrier: String(planFields['Carrier'] || ''),
                  score: parseFloat(String(planFields['Plan Score (ML)'] || planFields['Plan Score'] || planFields['Score'] || planFields['Rating'] || '0')) || 0,
                  category: planCategory as 'Medical' | 'Dental' | 'Vision',
                  type: String(planFields['Medical Plan Type'] || planFields['Dental Plan Type'] || planFields['Vision Plan Type'] || planFields['Plan Type'] || planFields['Type'] || ''),
                  // Medical fields - using exact field names from schema
                  deductible: planFields['Medical - Deductible (Single)'] ? String(planFields['Medical - Deductible (Single)']) : undefined,
                  oopm: planFields['Medical OOPM (Single)'] || planFields['Medical - OOPM (Single)'] ? String(planFields['Medical OOPM (Single)'] || planFields['Medical - OOPM (Single)']) : undefined,
                  coinsurance: planFields['Medical - Coinsurance'] ? String(planFields['Medical - Coinsurance']) : undefined,
                  copay: planFields['Medical - Office Visit'] || planFields['Medical - Copay'] || planFields['Copay'] ? String(planFields['Medical - Office Visit'] || planFields['Medical - Copay'] || planFields['Copay']) : undefined,
                  rx: planFields['Medical - Rx (Combined)'] || planFields['Rx (Combined)'] || planFields['RX'] || planFields['Prescription'] ? String(planFields['Medical - Rx (Combined)'] || planFields['Rx (Combined)'] || planFields['RX'] || planFields['Prescription']) : undefined,
                  // Dental fields
                  annualMax: planFields['Dental - Annual Max'] || planFields['Annual Max'] ? String(planFields['Dental - Annual Max'] || planFields['Annual Max']) : undefined,
                  preventive: planFields['Dental - Preventive'] || planFields['Preventive'] ? String(planFields['Dental - Preventive'] || planFields['Preventive']) : undefined,
                  basic: planFields['Dental - Basic'] || planFields['Basic'] ? String(planFields['Dental - Basic'] || planFields['Basic']) : undefined,
                  major: planFields['Dental - Major'] || planFields['Major'] ? String(planFields['Dental - Major'] || planFields['Major']) : undefined,
                  // Vision fields - using correct type field names
                  examCopay: planFields['Vision - Exam Copay'] || planFields['Exam'] ? String(planFields['Vision - Exam Copay'] || planFields['Exam']) : undefined,
                  materialsCopay: planFields['Vision - Materials Copay'] || planFields['Materials'] ? String(planFields['Vision - Materials Copay'] || planFields['Materials']) : undefined,
                  frameAllowance: planFields['Vision - Frame Allowance'] || planFields['Frames'] ? String(planFields['Vision - Frame Allowance'] || planFields['Frames']) : undefined,
                  materialsFrequency: planFields['Vision - Materials Frequency'] || planFields['Materials Frequency'] ? String(planFields['Vision - Materials Frequency'] || planFields['Materials Frequency']) : undefined,
                  frameFrequency: planFields['Vision - Frame Frequency'] || planFields['Frame Frequency'] ? String(planFields['Vision - Frame Frequency'] || planFields['Frame Frequency']) : undefined,
                });
                break;
              }
            }
          }
          console.log(`[BenefitPlansPage] Filtered ${filteredCount} plans matching company ${companyId}`);
        }
      } catch (error) {
        console.warn('[BenefitPlansPage] Error fetching plans from table:', error);
      }
    }
    
    console.log(`[BenefitPlansPage] Final result: ${plans.length} plans fetched`);

    return <BenefitPlans eligibility={eligibility} strategies={strategies} plans={plans} />;
  } catch (error) {
    console.error('[BenefitPlansPage] Error:', error);
    return <BenefitPlans eligibility={null} strategies={[]} plans={[]} />;
  }
}
