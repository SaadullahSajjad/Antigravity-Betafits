
export enum FormStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  SUBMITTED = 'Submitted',
  COMPLETED = 'Completed'
}

export enum ProgressStatus {
  APPROVED = 'Approved',
  IN_REVIEW = 'In Review',
  FLAGGED = 'Flagged',
  MISSING = 'Missing',
  NOT_REQUESTED = 'Not Requested'
}

export enum DocumentStatus {
  RECEIVED = 'Received',
  UNDER_REVIEW = 'Under Review',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export interface AssignedForm {
  id: string;
  name: string;
  status: FormStatus;
  description: string;
}

export interface AvailableForm {
  id: string;
  name: string;
  description: string;
}

export interface DocumentArtifact {
  id: string;
  name: string;
  status: DocumentStatus;
  fileName: string;
  date: string;
}

export interface ProgressStep {
  id: string;
  name: string;
  status: ProgressStatus;
  category: string;
  notes?: string;
  lastUpdated?: string;
}

export interface CompanyData {
  name: string;
  entityType: string;
  legalName: string;
  ein: string;
  sicCode: string;
  naicsCode: string;
  address: string;
  renewalMonth: string;
  contact: {
    firstName: string;
    lastName: string;
    jobTitle: string;
    phone: string;
    email: string;
  };
  workforce: {
    totalEmployees: string;
    usHqEmployees: string;
    hqCity: string;
    otherUsCities: string[];
    otherCountries: string[];
    openJobs: string;
    linkedInUrl: string;
  };
  glassdoor: {
    overallRating: number;
    benefitsRating: number;
    healthInsuranceRating: number; // 0-5
    retirementRating: number; // 0-5
    overallReviews: number;
    benefitsReviews: number;
    glassdoorUrl: string;
  };
}

export interface Solution {
  id: string;
  name: string;
  category: string;
  color: string;
  description: string;
  features: string[];
  websiteUrl: string;
  integrationType: string;
}

export interface DemographicInsights {
  eligibleEmployees: number;
  averageSalary: number;
  averageAge: number;
  malePercentage: number;
  femalePercentage: number;
}

export interface FinancialKPIs {
  totalMonthlyCost: number;
  totalEmployerContribution: number;
  totalEmployeeContribution: number;
  erCostPerEligible: number;
}

export interface BudgetBreakdown {
  benefit: string;
  carrier: string;
  participation: number;
  monthlyTotal: number;
  annualTotal: number;
  erCostMonth: number;
  eeCostMonth: number;
  erCostEnrolled: number;
  erCostFte: number;
}

export interface BenefitEligibilityData {
  className: string;
  waitingPeriod: string;
  effectiveDate: string;
  requiredHours: string;
}

export interface ContributionStrategy {
  benefit: string;
  strategyType: string;
  flatAmount: string;
  eePercent: string;
  depPercent: string;
  buyUpStrategy: string;
}

export interface BenefitPlan {
  id: string;
  name: string;
  carrier: string;
  score: number;
  category: 'Medical' | 'Dental' | 'Vision';
  type: string;
  // Medical
  deductible?: string;
  oopm?: string;
  coinsurance?: string;
  copay?: string;
  rx?: string;
  // Dental
  annualMax?: string;
  preventive?: string;
  basic?: string;
  major?: string;
  oonReimbursement?: string;
  // Vision
  examCopay?: string;
  materialsCopay?: string;
  frameAllowance?: string;
  materialsFrequency?: string;
  frameFrequency?: string;
}

export interface FeedbackResponse {
  id: string;
  submittedAt: string;
  tier: string;
  overallRating: number;
  medicalOptions: number;
  medicalNetwork: number;
  medicalCost: number;
  nonMedical: number;
  comments?: string;
}

export interface FeedbackStats {
  overall: number;
  responses: number;
  nonMedical: number;
  employeeCost: number;
  medicalNetwork: number;
  medicalOptions: number;
  retirement: number | null;
}

export type ViewType = 'home' | 'company-details' | 'benefit-plans' | 'benefits-analysis' | 'benefit-budget' | 'employee-feedback' | 'appoint-betafits' | 'faq' | 'solutions-catalog' | 'solution-detail';
