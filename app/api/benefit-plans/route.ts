import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { getCompanyId } from '@/lib/auth/getCompanyId';
import { fetchAirtableRecordById, fetchAirtableRecords } from '@/lib/airtable/fetch';
import { BenefitEligibilityData, ContributionStrategy, BenefitPlan } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = await getCompanyId();
    if (!companyId) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const token = process.env.AIRTABLE_API_KEY;
    if (!token) {
      return NextResponse.json({ error: 'Airtable API key not configured' }, { status: 500 });
    }

    // Fetch eligibility data from Intake - Group Data
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
        requiredHours: (() => {
          const raw = fields['Weekly Hours Required for Eligibility'] ||
            fields['Required Hours'] ||
            fields['Hours Required'] ||
            fields['Required Hours per Week'] ||
            fields['Min Hours'] ||
            '';
          const val = String(raw || '').trim();
          if (val.toLowerCase() === 'unknown') return '';
          return val || '30 Hours per week';
        })(),
      };
    }

    // Fetch contribution strategies - try from Group Data record first, then separate table
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
              console.warn(`[Benefit Plans API] Error fetching plan ${planId} for strategy:`, error);
            }
          }
          break; // Found the field, no need to check others
        }
      }
    }

    // Fetch benefit plans - try from Group Data linked records or separate table
    let plans: BenefitPlan[] = [];
    
    console.log('[Benefit Plans API] Starting to fetch plans...');
    
    if (groupRecord) {
      const fields = groupRecord.fields;
      console.log('[Benefit Plans API] Group record found, checking for linked plans...');
      console.log('[Benefit Plans API] Available fields in Group Data:', Object.keys(fields));
      
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
        console.log(`[Benefit Plans API] Checking field "${linkField}":`, linkedPlans ? (Array.isArray(linkedPlans) ? `${linkedPlans.length} linked plans` : 'Not an array') : 'Not found');
        
        if (Array.isArray(linkedPlans) && linkedPlans.length > 0) {
          console.log(`[Benefit Plans API] Found ${linkedPlans.length} linked plan IDs in field "${linkField}"`);
          // Fetch each linked plan record from Intake - Plan Data table
          const planTableId = 'tblPJjWgnbblYLym4'; // Intake - Plan Data
          for (const planId of linkedPlans) {
            try {
              console.log(`[Benefit Plans API] Fetching plan record: ${planId}`);
              const planRecord = await fetchAirtableRecordById(planTableId, planId, { apiKey: token });
              if (planRecord) {
                const planFields = planRecord.fields;
                console.log(`[Benefit Plans API] Successfully fetched plan ${planId}`);
                console.log(`[Benefit Plans API] Plan fields available:`, Object.keys(planFields));
                console.log(`[Benefit Plans API] Plan name:`, planFields['Plan Name (Client)'] || planFields['Plan Name'] || planFields['Name']);
                console.log(`[Benefit Plans API] Plan category:`, planFields['Benefit Type'] || planFields['Category'] || planFields['Type']);
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
                  annualMax: planFields['Annual Max'] ? String(planFields['Annual Max']) : undefined,
                  preventive: planFields['Preventive'] ? String(planFields['Preventive']) : undefined,
                  basic: planFields['Basic'] ? String(planFields['Basic']) : undefined,
                  major: planFields['Major'] ? String(planFields['Major']) : undefined,
                  // Vision fields - using correct type field names
                  examCopay: planFields['Vision - Exam Copay'] || planFields['Exam'] ? String(planFields['Vision - Exam Copay'] || planFields['Exam']) : undefined,
                  materialsCopay: planFields['Vision - Materials Copay'] || planFields['Materials'] ? String(planFields['Vision - Materials Copay'] || planFields['Materials']) : undefined,
                  frameAllowance: planFields['Vision - Frame Allowance'] || planFields['Frames'] ? String(planFields['Vision - Frame Allowance'] || planFields['Frames']) : undefined,
                  materialsFrequency: planFields['Vision - Materials Frequency'] || planFields['Materials Frequency'] ? String(planFields['Vision - Materials Frequency'] || planFields['Materials Frequency']) : undefined,
                  frameFrequency: planFields['Vision - Frame Frequency'] || planFields['Frame Frequency'] ? String(planFields['Vision - Frame Frequency'] || planFields['Frame Frequency']) : undefined,
                });
                console.log(`[Benefit Plans API] Mapped plan ${planId} to BenefitPlan object`);
              } else {
                console.warn(`[Benefit Plans API] Plan record ${planId} is null or undefined`);
              }
            } catch (error) {
              console.warn(`[Benefit Plans API] Error fetching plan ${planId}:`, error);
            }
          }
          console.log(`[Benefit Plans API] Total plans mapped from linked records: ${plans.length}`);
          break; // Found the field, no need to check others
        }
      }
    } else {
      console.log('[Benefit Plans API] No group record found, cannot fetch plans');
    }
    
    // If no plans found via linked records, try fetching all plans and filtering by company
    if (plans.length === 0 && groupRecord) {
      console.log('[Benefit Plans API] No plans found via linked records, trying fallback method...');
      try {
        const planTableId = 'tblPJjWgnbblYLym4'; // Intake - Plan Data
        const allPlans = await fetchAirtableRecords(planTableId, {
          apiKey: token,
          maxRecords: 100,
        });
        
        console.log(`[Benefit Plans API] Fetched ${allPlans?.length || 0} total plans from table for filtering`);
        
        // Filter plans linked to this company
        if (allPlans && allPlans.length > 0) {
          // Log first plan to see what fields are available
          console.log('[Benefit Plans API] Sample plan fields:', Object.keys(allPlans[0].fields));
          console.log('[Benefit Plans API] Sample plan record:', JSON.stringify(allPlans[0].fields, null, 2));
          
          const companyLinkFields = ['Link to Intake - Group Data', 'Link to Intake Group Data', 'Link to Group Data', 'Company', 'Link to Company', 'Group Data'];
          let filteredCount = 0;
          for (const planRecord of allPlans) {
            const planFields = planRecord.fields;
            for (const linkField of companyLinkFields) {
              const linkedCompany = planFields[linkField];
              if (linkedCompany) {
                console.log(`[Benefit Plans API] Plan ${planRecord.id} has field "${linkField}":`, linkedCompany);
              }
              if (Array.isArray(linkedCompany) && linkedCompany.includes(companyId)) {
                filteredCount++;
                console.log(`[Benefit Plans API] Plan ${planRecord.id} is linked to company ${companyId}`);
                // Map plan (same logic as above)
                const category = String(planFields['Category'] || planFields['Type'] || 'Medical').toLowerCase();
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
                  annualMax: planFields['Annual Max'] ? String(planFields['Annual Max']) : undefined,
                  preventive: planFields['Preventive'] ? String(planFields['Preventive']) : undefined,
                  basic: planFields['Basic'] ? String(planFields['Basic']) : undefined,
                  major: planFields['Major'] ? String(planFields['Major']) : undefined,
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
          console.log(`[Benefit Plans API] Filtered ${filteredCount} plans matching company ${companyId}`);
        }
      } catch (error) {
        console.warn('[Benefit Plans API] Error fetching plans from table:', error);
      }
    }
    
    console.log(`[Benefit Plans API] Final result: ${plans.length} plans fetched`);

    return NextResponse.json({
      eligibility,
      strategies,
      plans,
    }, { status: 200 });
  } catch (error) {
    console.error('[Benefit Plans API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch benefit plans' },
      { status: 500 }
    );
  }
}
