
import { 
  FormStatus, 
  ProgressStatus, 
  DocumentStatus, 
  AssignedForm, 
  AvailableForm, 
  DocumentArtifact, 
  ProgressStep, 
  CompanyData,
  BenefitEligibilityData,
  ContributionStrategy,
  BenefitPlan,
  DemographicInsights,
  FinancialKPIs,
  BudgetBreakdown,
  FeedbackResponse,
  FeedbackStats,
  Solution
} from './types';

export const ASSIGNED_FORMS: AssignedForm[] = [
  {
    id: '1',
    name: 'Quick Start',
    status: FormStatus.IN_PROGRESS,
    description: 'Provide basic company info and primary contact details.'
  },
  {
    id: '1a',
    name: 'Medical Plan Review',
    status: FormStatus.NOT_STARTED,
    description: 'Verify current medical plan offerings and contribution strategies for the upcoming year.'
  },
  {
    id: '1b',
    name: 'Compliance Census',
    status: FormStatus.NOT_STARTED,
    description: 'Submit detailed employee census data required for mandatory compliance testing and reporting.'
  }
];

export const AVAILABLE_FORMS: AvailableForm[] = [
  {
    id: '2',
    name: 'PEO/EOR Assessment',
    description: 'Indicate whether you work with a PEO or EOR and share key details to help us understand your current setup.'
  },
  {
    id: '3',
    name: 'Broker Role',
    description: "Outline your broker's role, including their type, agreements, and any fees or subsidies they provide."
  },
  {
    id: '4',
    name: 'Benefits Administration',
    description: 'Describe how your company manages benefits, including who handles enrollments, payroll deductions, and COBRA.'
  }
];

export const DOCUMENT_ARTIFACTS: DocumentArtifact[] = [
  {
    id: '101',
    name: 'E$1,000 — (AA)',
    status: DocumentStatus.APPROVED,
    fileName: 'AcklenAvenue_E1000IBOLX278_2024-11.pdf',
    date: 'Oct 12, 2025'
  },
  {
    id: '102',
    name: 'Medical Invoice — (AA)',
    status: DocumentStatus.UNDER_REVIEW,
    fileName: 'AcklenAvenue_Medical_Invoice_539348.pdf',
    date: 'Oct 13, 2025'
  }
];

export const PROGRESS_STEPS: ProgressStep[] = [
  { id: '1', name: 'Quick Start', category: 'Form', status: ProgressStatus.IN_REVIEW, notes: 'Awaiting final signature', lastUpdated: '10/13/2025' },
  { id: '3', name: 'Benefit Guide', category: 'Document Extraction', status: ProgressStatus.APPROVED, notes: 'Extraction complete', lastUpdated: '10/12/2025' },
  { id: '4', name: 'SBCs / Plan Summaries', category: 'Document Extraction', status: ProgressStatus.FLAGGED, notes: 'Missing Dental SBC', lastUpdated: '10/13/2025' }
];

export const COMPANY_DETAILS: CompanyData = {
  name: 'Acklen Avenue',
  entityType: 'Limited Liability Company (LLC)',
  legalName: 'Acklen Avenue LLC',
  ein: '27-5227791',
  sicCode: '3434',
  naicsCode: '541511',
  address: '1033 Demonbreun Street, Suite 300, Nashville, Tennessee, 37203',
  renewalMonth: 'November',
  contact: {
    firstName: 'Sarah',
    lastName: 'Johnson',
    jobTitle: 'Project Coordinator',
    phone: '(407) 334-8920',
    email: 'sarah.johnson@acklen.com'
  },
  workforce: {
    totalEmployees: '501-1000',
    usHqEmployees: '501-1000',
    hqCity: 'Nashville',
    otherUsCities: ['Savannah', 'Austin', 'Boston'],
    otherCountries: [],
    openJobs: '12',
    linkedInUrl: 'https://www.linkedin.com/company/acklen-avenue'
  },
  glassdoor: {
    overallRating: 3.6,
    benefitsRating: 2.8,
    healthInsuranceRating: 2.0,
    retirementRating: 2.0,
    overallReviews: 37,
    benefitsReviews: 15,
    glassdoorUrl: 'https://www.glassdoor.com/Reviews/Acklen-Avenue-Reviews-E123456.htm'
  }
};

export const DEMOGRAPHIC_INSIGHTS: DemographicInsights = {
  eligibleEmployees: 946,
  averageSalary: 155679,
  averageAge: 35.4,
  malePercentage: 40.8,
  femalePercentage: 59.2
};

export const FINANCIAL_KPIS: FinancialKPIs = {
  totalMonthlyCost: 9533,
  totalEmployerContribution: 82289,
  totalEmployeeContribution: 32104,
  erCostPerEligible: 9143
};

export const BUDGET_BREAKDOWN: BudgetBreakdown[] = [
  { benefit: 'Medical', carrier: 'UHC', participation: 450, monthlyTotal: 7200, annualTotal: 86400, erCostMonth: 5400, eeCostMonth: 1800, erCostEnrolled: 12.00, erCostFte: 14.50 },
  { benefit: 'Dental', carrier: 'Aetna', participation: 380, monthlyTotal: 1800, annualTotal: 21600, erCostMonth: 1200, eeCostMonth: 600, erCostEnrolled: 3.15, erCostFte: 4.20 },
  { benefit: 'Vision', carrier: 'Aetna', participation: 310, monthlyTotal: 533, annualTotal: 6396, erCostMonth: 333, eeCostMonth: 200, erCostEnrolled: 1.07, erCostFte: 1.50 }
];

export const ELIGIBILITY_DATA: BenefitEligibilityData = {
  className: 'All Full-Time Employees',
  waitingPeriod: 'First of month following 30 days',
  effectiveDate: '01/01/2026',
  requiredHours: '30 Hours per week'
};

export const CONTRIBUTION_STRATEGIES: ContributionStrategy[] = [
  { benefit: 'Medical', strategyType: 'Employer Percentage', flatAmount: '$0', eePercent: '100%', depPercent: '50%', buyUpStrategy: 'Available' },
  { benefit: 'Dental', strategyType: 'Flat Contribution', flatAmount: '$45', eePercent: '100%', depPercent: '25%', buyUpStrategy: 'None' },
  { benefit: 'Vision', strategyType: 'Employer Percentage', flatAmount: '$0', eePercent: '100%', depPercent: '0%', buyUpStrategy: 'None' }
];

export const BENEFIT_PLANS: BenefitPlan[] = [
  {
    id: 'p1',
    category: 'Medical',
    name: 'UHC Choice Plus HSA $3300',
    carrier: 'UHC',
    score: 88,
    type: 'HDHP',
    deductible: '$3,300',
    oopm: '$7,500',
    coinsurance: '20%',
    copay: 'Ded/Coins',
    rx: '$10 / $35 / $70 / $150'
  },
  {
    id: 'p2',
    category: 'Medical',
    name: 'UHC Choice Plus PPO $3000',
    carrier: 'UHC',
    score: 92,
    type: 'PPO',
    deductible: '$3,000',
    oopm: '$6,500',
    coinsurance: '20%',
    copay: '$25',
    rx: '$10 / $35 / $70 / $250'
  },
  {
    id: 'd1',
    category: 'Dental',
    name: 'Aetna PPO 3',
    carrier: 'Aetna',
    score: 0,
    type: 'PPO',
    annualMax: '$1,000',
    preventive: '100%',
    basic: '80%',
    major: '50%',
    oonReimbursement: 'MAC'
  },
  {
    id: 'd2',
    category: 'Dental',
    name: 'Aetna PPO 2',
    carrier: 'Aetna',
    score: 0,
    type: 'PPO',
    annualMax: '$1,500',
    preventive: '100%',
    basic: '90%',
    major: '60%',
    oonReimbursement: 'MAC'
  },
  {
    id: 'v1',
    category: 'Vision',
    name: 'Aetna Vision',
    carrier: 'Aetna',
    score: 0,
    type: 'Vision',
    examCopay: '$20',
    materialsCopay: '$20',
    frameAllowance: '$100 + 20%',
    materialsFrequency: 'Every 12 months',
    frameFrequency: 'Every 12 months'
  },
  {
    id: 'v2',
    category: 'Vision',
    name: 'Aetna Vision+',
    carrier: 'Aetna',
    score: 0,
    type: 'Vision',
    examCopay: '$10',
    materialsCopay: '$10',
    frameAllowance: '$150 + 20%',
    materialsFrequency: 'Every 12 months',
    frameFrequency: 'Every 12 months'
  }
];

export const FEEDBACK_STATS: FeedbackStats = {
  overall: 3.8,
  responses: 4,
  nonMedical: 4.0,
  employeeCost: 3.5,
  medicalNetwork: 4.3,
  medicalOptions: 3.8,
  retirement: null
};

export const FEEDBACK_RESPONSES: FeedbackResponse[] = [
  {
    id: 'fr1',
    submittedAt: '7/23/2024, 7:51 PM',
    tier: 'Family',
    overallRating: 5,
    medicalOptions: 5,
    medicalNetwork: 5,
    medicalCost: 5,
    nonMedical: 5,
    comments: 'Extremely satisfied with the level of coverage and the seamless onboarding process.'
  },
  {
    id: 'fr2',
    submittedAt: '7/23/2024, 8:06 PM',
    tier: 'Employee Only',
    overallRating: 3,
    medicalOptions: 3,
    medicalNetwork: 3,
    medicalCost: 4,
    nonMedical: 3,
    comments: 'Health benefits seem fairly standard, but I wish there were more HMO options available.'
  },
  {
    id: 'fr3',
    submittedAt: '8/1/2024, 11:35 PM',
    tier: 'Family',
    overallRating: 4,
    medicalOptions: 4,
    medicalNetwork: 4,
    medicalCost: 4,
    nonMedical: 4
  },
  {
    id: 'fr4',
    submittedAt: '8/2/2024, 9:50 PM',
    tier: 'Employee + Child(ren)',
    overallRating: 4,
    medicalOptions: 4,
    medicalNetwork: 4,
    medicalCost: 3,
    nonMedical: 4,
    comments: 'I would say the out of pocket max is really high for the employee + children.'
  }
];

export const CATALOG_CATEGORIES = [
  'All Solutions',
  '401(k)',
  'Analytics',
  'Ancillary',
  'Apps/Navigation',
  'COBRA/HRA/FSA',
  'HCM/Payroll',
  'HSA',
  'Lifestyle',
  'National Carriers',
  'PBM',
  'PEO',
  'QSEHRA/ICHRA',
  'Self-Funded'
];

export const CATALOG_SOLUTIONS: Solution[] = [
  { 
    id: 's1', 
    name: 'Rain', 
    category: 'Other / Miscellaneous', 
    color: 'amber',
    description: 'Rain is an earned wage access provider that helps companies increase retention by giving employees control over their financial lives.',
    features: ['Earned Wage Access', 'Financial Wellness Tools', 'Direct Payroll Integration'],
    websiteUrl: 'https://rain.us',
    integrationType: 'Native API'
  },
  { 
    id: 's2', 
    name: 'Springbuk', 
    category: 'Technology & Platforms', 
    color: 'gray',
    description: 'Springbuk is a health intelligence platform that empowers employers to sharpen their benefits strategy with data-driven insights.',
    features: ['Predictive Analytics', 'Population Health Management', 'Financial Forecasting'],
    websiteUrl: 'https://springbuk.com',
    integrationType: 'Cloud Connector'
  },
  { 
    id: 's3', 
    name: 'Centivo', 
    category: 'Benefits & Navigation', 
    color: 'purple',
    description: 'Centivo is a new kind of health plan for self-funded employers that focuses on high-quality, local primary care.',
    features: ['Care Navigation', 'Primary Care Centric', 'Lower Deductibles'],
    websiteUrl: 'https://centivo.com',
    integrationType: 'Carrier Sync'
  },
  { 
    id: 's4', 
    name: 'Betterment at Work', 
    category: 'Financial & Retirement', 
    color: 'pink',
    description: 'Betterment provides a full-service 401(k) and financial wellness platform designed for the modern workforce.',
    features: ['Robo-Advisory', 'Low Fee 401(k)', 'Financial Coaching'],
    websiteUrl: 'https://betterment.com',
    integrationType: 'Payroll Link'
  },
  { 
    id: 's5', 
    name: 'Ubiquity', 
    category: 'Financial & Retirement', 
    color: 'pink',
    description: 'Ubiquity Retirement + Savings specializes in offering affordable, simple retirement plans for small and mid-sized businesses.',
    features: ['Transparent Pricing', 'Custom Plan Design', 'Compliance Support'],
    websiteUrl: 'https://myubiquity.com',
    integrationType: 'Direct File Transfer'
  },
  { 
    id: 's6', 
    name: 'Rippling', 
    category: 'HR/Payroll/PEO', 
    color: 'green',
    description: 'Rippling is the first way for businesses to manage all of their HR, IT, and Finance in one unified platform.',
    features: ['Global Payroll', 'Device Management', 'Automated Onboarding'],
    websiteUrl: 'https://rippling.com',
    integrationType: 'Full Platform'
  },
  { 
    id: 's7', 
    name: 'Lively', 
    category: 'Financial & Retirement', 
    color: 'pink',
    description: 'Lively is a modern HSA & FSA provider that prioritizes a great user experience for both employers and employees.',
    features: ['Interest-Bearing HSAs', 'Easy FSA Claims', 'Mobile App Access'],
    websiteUrl: 'https://livelyme.com',
    integrationType: 'API Integration'
  },
  { 
    id: 's8', 
    name: 'MultiPlan', 
    category: 'Technology & Platforms', 
    color: 'gray',
    description: 'MultiPlan delivers healthcare cost management solutions that leverage analytics and provider networks.',
    features: ['Network Access', 'Claim Pricing', 'Payment Integrity'],
    websiteUrl: 'https://multiplan.com',
    integrationType: 'Data Exchange'
  },
  { 
    id: 's9', 
    name: 'Guideline', 
    category: 'Financial & Retirement', 
    color: 'pink',
    description: 'Guideline makes it easy and affordable for small businesses to offer a 401(k) with automated administration.',
    features: ['Auto-Enrollment', '0% Investment Fees', 'Integrated Payroll'],
    websiteUrl: 'https://guideline.com',
    integrationType: 'Sync+ Integration'
  },
  { 
    id: 's10', 
    name: 'Gusto', 
    category: 'HR/Payroll/PEO', 
    color: 'green',
    description: 'Gusto is an all-in-one platform that helps businesses onboard, pay, insure, and support their teams.',
    features: ['Automated Payroll', 'Health Insurance Admin', 'Hiring & Onboarding'],
    websiteUrl: 'https://gusto.com',
    integrationType: 'Partner API'
  },
  { 
    id: 's11', 
    name: 'Justworks', 
    category: 'HR/Payroll/PEO', 
    color: 'green',
    description: 'Justworks provides small businesses with access to corporate-level benefits, seamless payroll, and HR support.',
    features: ['PEO Services', 'Compliance Monitoring', 'Group Insurance'],
    websiteUrl: 'https://justworks.com',
    integrationType: 'Full Service'
  },
  { 
    id: 's12', 
    name: 'Beam Dental', 
    category: 'Insurance (Health / Ancillary / Property)', 
    color: 'blue',
    description: 'Beam is a digital-first dental insurer that uses technology to reward healthy habits and simplify benefits.',
    features: ['Smart Toothbrush', 'Adjustable Premiums', 'Digital Claims'],
    websiteUrl: 'https://beam.dental',
    integrationType: 'Real-time Sync'
  }
];
