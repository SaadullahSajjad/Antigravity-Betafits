/**
 * Sync form metadata from Airtable (Available Forms) into constants and React forms.
 *
 * 1. Fetches all Available Forms from Airtable (id, Name, Description, Intro Text, Forms URL).
 * 2. Updates each matching constants/*Form.ts so id and title match Airtable (questions unchanged).
 * 3. Optionally updates the first section description from Airtable Intro Text.
 *
 * Run after fetch-fillout-form-structure.ts --from-airtable, or standalone with AIRTABLE_API_KEY.
 *
 *   npx tsx scripts/sync-forms-from-airtable.ts
 */

import * as fs from 'fs';
import * as path from 'path';

require('dotenv').config({ path: '.env.local' });

const FORMS: { id: string; name: string; constant: string; file: string }[] = [
  { id: 'rec4V98J6aPaM3u9H', name: 'MedicalCoverageSurvey', constant: 'MEDICAL_COVERAGE_SURVEY_FORM_DATA', file: 'medicalCoverageSurveyForm' },
  { id: 'rec7NfuiBQ8wrEmu7', name: 'WorkersCompensation', constant: 'WORKERS_COMPENSATION_FORM_DATA', file: 'workersCompensationForm' },
  { id: 'recFVcfdoXkUjIcod', name: 'AddNewGroup', constant: 'ADD_NEW_GROUP_FORM_DATA', file: 'addNewGroupForm' },
  { id: 'recFxyNqTLDdrxXN2', name: 'BenefitsAdministration', constant: 'BENEFITS_ADMINISTRATION_FORM_DATA', file: 'benefitsAdministrationForm' },
  { id: 'recGrsR8Sdx96pckJ', name: 'BenefitsCompliance', constant: 'BENEFITS_COMPLIANCE_FORM_DATA', file: 'benefitsComplianceForm' },
  { id: 'recKzuznmqq29uASl', name: 'PEOEORAssessment', constant: 'PEO_EOR_ASSESSMENT_FORM_DATA', file: 'peoEORAssessmentForm' },
  { id: 'recOE9pVakkobVzU7', name: 'AppointBetafits', constant: 'APPOINT_BETAFITS_FORM_DATA', file: 'appointBetafitsForm' },
  { id: 'recOt6cX0t1DksDFT', name: 'HRTech', constant: 'HR_TECH_FORM_DATA', file: 'hrTechForm' },
  { id: 'recUnTZFK5UyfWqzm', name: 'ComprehensiveIntake', constant: 'COMPREHENSIVE_INTAKE_FORM_DATA', file: 'comprehensiveIntakeForm' },
  { id: 'recdjXjySYuYUGkdP', name: 'PremiumsContributionStrategy', constant: 'PREMIUMS_CONTRIBUTION_STRATEGY_FORM_DATA', file: 'premiumsContributionStrategyForm' },
  { id: 'rechTHxZIxS3bBcqF', name: 'BasicIntake', constant: 'BASIC_INTAKE_FORM_DATA', file: 'basicIntakeForm' },
  { id: 'reclUQ6KhVzCssuVl', name: 'QuickStartNewBenefits', constant: 'QUICK_START_NEW_BENEFITS_FORM_DATA', file: 'quickStartNewBenefitsForm' },
  { id: 'recmB9IdRhtgckvaY', name: 'BenefitsPulseSurvey', constant: 'BENEFITS_PULSE_SURVEY_FORM_DATA', file: 'benefitsPulseSurveyForm' },
  { id: 'recsLJiBVdED8EEbr', name: 'DocumentUploader', constant: 'DOCUMENT_UPLOADER_FORM_DATA', file: 'documentUploaderForm' },
  { id: 'recufWIRuSFArZ9GG', name: 'QuickStartAlt', constant: 'QUICK_START_ALT_FORM_DATA', file: 'quickStartFormAlt' },
  { id: 'recxH9Jrk10bbqU58', name: 'BrokerRole', constant: 'BROKER_ROLE_FORM_DATA', file: 'brokerRoleForm' },
  { id: 'recySUNj6jv47SOKr', name: 'NDA', constant: 'NDA_FORM_DATA', file: 'ndaForm' },
];

function escapeForTsString(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

async function main() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  if (!apiKey) {
    console.error('❌ AIRTABLE_API_KEY not set in .env.local');
    process.exit(1);
  }

  const { getAvailableFormsWithAllFields } = await import('../lib/airtable/getFilloutFormIds');
  const forms = await getAvailableFormsWithAllFields({ apiKey, maxRecords: 100 });
  if (!forms.length) {
    console.error('❌ No forms returned from Airtable');
    process.exit(1);
  }

  const byId = new Map(forms.map((f) => [f.id, f]));
  const constantsDir = path.join(process.cwd(), 'constants');
  let updated = 0;

  for (const form of FORMS) {
    const air = byId.get(form.id);
    if (!air) {
      console.warn(`⚠️  No Airtable record for ${form.id} (${form.file}), skipping`);
      continue;
    }

    const fields = air.fields as Record<string, unknown>;
    const name = String(fields['Name'] ?? form.name);
    const introText = fields['Intro Text'] != null ? String(fields['Intro Text']).trim() : '';
    const description = fields['Description'] != null ? String(fields['Description']).trim() : '';

    const filePath = path.join(constantsDir, `${form.file}.ts`);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  Constant file not found: ${form.file}.ts, skipping`);
      continue;
    }

    let content = fs.readFileSync(filePath, 'utf-8');

    // Replace id: '...' (first occurrence after FormDataDefinition = {)
    const idRegex = /(\bid:\s*)['"]([^'"]*)['"]/;
    if (idRegex.test(content)) {
      content = content.replace(idRegex, `$1'${form.id}'`);
    }

    // Replace title: '...'
    const titleRegex = /(\btitle:\s*)['"]([^'"]*)['"]/;
    if (titleRegex.test(content)) {
      content = content.replace(titleRegex, `$1'${escapeForTsString(name)}'`);
    }

    // Optionally update first section description from Intro Text (if present; first occurrence only)
    if (introText) {
      const firstDescRegex = /(description:\s*)['"]([^'"]*)['"]/;
      content = content.replace(firstDescRegex, `$1'${escapeForTsString(introText)}'`);
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ ${form.file}.ts — id: ${form.id}, title: "${name}"`);
    updated++;
  }

  console.log(`\n📄 Updated ${updated} form constant(s). React forms use these constants and will show the new titles/descriptions.`);
  console.log('✨ Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
