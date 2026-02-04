export enum FormStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  SUBMITTED = 'Submitted',
  COMPLETED = 'Completed',
}

export enum DocumentStatus {
  RECEIVED = 'Received',
  UNDER_REVIEW = 'Under Review',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export enum ProgressStatus {
  NOT_REQUESTED = 'Not Requested',
  MISSING = 'Missing',
  IN_REVIEW = 'In Review',
  APPROVED = 'Approved',
  FLAGGED = 'Flagged',
}

export interface AssignedForm {
  id: string;
  name: string;
  status: FormStatus;
  description: string;
  dueDate?: string;
}

export interface DocumentArtifact {
  id: string;
  name: string;
  status: DocumentStatus;
  fileName: string;
  date: string;
  url?: string;
}

export interface ProgressStep {
  id: string;
  name: string;
  category: string;
  status: ProgressStatus;
  notes?: string;
}

export interface AvailableForm {
  id: string;
  name: string;
  category: string;
  estimatedTime: string;
  description: string;
}

export interface CompanyData {
  id: string;
  companyName: string;
  industry?: string;
  employeeCount?: number;
  website?: string;
  address?: string;
  primaryContact?: string;
  phone?: string;
  foundedYear?: string;
}

export interface BenefitEligibilityData {
  waitingPeriod: string;
  minHoursPerWeek: number;
  effectiveDateRule: string;
}

export interface ContributionStrategy {
  id: string;
  employeeType: string;
  employerContribution: string;
  description: string;
}

export interface BenefitPlan {
  id: string;
  name: string;
  carrier: string;
  type: string;
  network: string;
  deductible: string;
  outOfPocketMax: string;
  copay?: string;
}

export interface DemographicInsights {
  averageAge: number;
  genderRatio: { male: number; female: number; other: number };
  averageTenure: number;
  dependentCoverageRatio: number;
}

export interface FinancialKPIs {
  pepm: number;
  totalAnnualSpend: number;
  employerContributionPercentage: number;
  benchmarkPercentile: number;
}

export interface BudgetBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface FeedbackStats {
  participationRate: number;
  averageScore: number; // 0-10 or 0-5
  totalResponses: number;
  lastSurveyDate: string;
}

export interface FeedbackResponse {
  id: string;
  date: string;
  category: string;
  score: number;
  comment?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQCategory {
  id: string;
  title: string;
  items: FAQItem[];
}

export type SolutionCategory = 'Provider' | 'Platform' | 'Wellness';

export interface Solution {
  id: string;
  name: string;
  category: SolutionCategory;
  description: string;
  logoUrl?: string; // Placeholder for now
  rating: number;
  tags: string[];
  longDescription?: string;
  features?: string[];
  website?: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  companyId: string;
  role?: string;
}

