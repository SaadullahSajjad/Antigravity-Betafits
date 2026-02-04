import {
    AssignedForm,
    AvailableForm,
    CompanyData,
    BenefitEligibilityData,
    ContributionStrategy,
    BenefitPlan,
    DemographicInsights,
    FinancialKPIs,
    BudgetBreakdown,
    FeedbackStats,
    FeedbackResponse,
    FAQCategory,
    Solution,
    DocumentArtifact,
    DocumentStatus,
    FormStatus,
    ProgressStatus,
    ProgressStep,
} from '@/types';

export const COMPANY_DATA: CompanyData = {
    id: 'recCompany123',
    companyName: 'Acme Corporation',
    industry: 'Technology',
    employeeCount: 150,
    website: 'https://acme.example.com',
    address: '123 Tech Blvd, San Francisco, CA 94105',
    primaryContact: 'Jane Doe',
    phone: '(555) 123-4567',
    foundedYear: '2010',
};

export const BENEFIT_ELIGIBILITY: BenefitEligibilityData = {
    waitingPeriod: '30 days',
    minHoursPerWeek: 30,
    effectiveDateRule: 'First of month following waiting period',
};

export const CONTRIBUTION_STRATEGIES: ContributionStrategy[] = [
    {
        id: 'strat1',
        employeeType: 'Full-Time Employees',
        employerContribution: '80%',
        description: 'Employer covers 80% of the employee premium.',
    },
    {
        id: 'strat2',
        employeeType: 'Executives',
        employerContribution: '100%',
        description: 'Employer covers 100% of the premium.',
    },
];

export const BENEFIT_PLANS: BenefitPlan[] = [
    {
        id: 'plan1',
        name: 'Gold PPO',
        carrier: 'BlueCross',
        type: 'PPO',
        network: 'National Network',
        deductible: '$500',
        outOfPocketMax: '$3,000',
        copay: '$20 Office Visit',
    },
    {
        id: 'plan2',
        name: 'Silver HMO',
        carrier: 'Kaiser',
        type: 'HMO',
        network: 'Regional',
        deductible: '$1,500',
        outOfPocketMax: '$5,000',
        copay: '$30 Office Visit',
    },
];

export const BENEFITS_DEMOGRAPHICS: DemographicInsights = {
    averageAge: 38,
    genderRatio: { male: 45, female: 52, other: 3 },
    averageTenure: 4.2,
    dependentCoverageRatio: 0.65,
};

export const BENEFITS_KPIS: FinancialKPIs = {
    pepm: 850,
    totalAnnualSpend: 1530000,
    employerContributionPercentage: 78,
    benchmarkPercentile: 65,
};

export const BUDGET_BREAKDOWN: BudgetBreakdown[] = [
    { category: 'Medical', amount: 950000, percentage: 62, color: 'bg-blue-500' },
    { category: 'Dental & Vision', amount: 150000, percentage: 10, color: 'bg-teal-500' },
    { category: 'Rx', amount: 300000, percentage: 20, color: 'bg-indigo-500' },
    { category: 'Admin & Tech', amount: 130000, percentage: 8, color: 'bg-gray-400' },
];

export const FEEDBACK_STATS: FeedbackStats = {
    participationRate: 72,
    averageScore: 4.2,
    totalResponses: 145,
    lastSurveyDate: '2024-01-15',
};

export const FEEDBACK_RESPONSES: FeedbackResponse[] = [
    {
        id: 'resp1',
        date: '2024-01-15',
        category: 'Benefits Satisfaction',
        score: 5,
        comment: 'Really appreciate the new dental options. Great coverage!',
        sentiment: 'positive',
    },
    {
        id: 'resp2',
        date: '2024-01-14',
        category: 'Enrollment Process',
        score: 3,
        comment: 'The platform was a bit slow during peak hours, but instructions were clear.',
        sentiment: 'neutral',
    },
    {
        id: 'resp3',
        date: '2024-01-12',
        category: 'Wellness Program',
        score: 4,
        comment: 'Loved the gym reimbursement perk.',
        sentiment: 'positive',
    },
];

export const FAQ_DATA: FAQCategory[] = [
    {
        id: 'cat1',
        title: 'Enrollment & Eligibility',
        items: [
            {
                id: 'q1',
                question: 'When does coverage begin for new hires?',
                answer: 'Coverage typically begins on the first of the month following the waiting period defined in your plan documents (usually 30 days).',
            },
            {
                id: 'q2',
                question: 'Can I change my elections mid-year?',
                answer: 'Generally, elections are locked until Open Enrollment. However, you may make changes if you experience a Qualifying Life Event (QLE) such as marriage, birth of a child, or loss of other coverage.',
            },
        ],
    },
    {
        id: 'cat2',
        title: 'Claims & Coverage',
        items: [
            {
                id: 'q3',
                question: 'How do I submit an out-of-network claim?',
                answer: 'You can submit claims directly through the carrier portal or by mailing the completed claim form along with your itemized receipt to the address on the back of your ID card.',
            },
        ],
    },
];

export const SOLUTIONS: Solution[] = [
    {
        id: 'sol1',
        name: 'BlueCross BlueShield',
        category: 'Provider',
        description: 'Nationwide healthcare coverage with extensive provider networks.',
        rating: 4.8,
        tags: ['Health', 'Dental', 'Vision'],
        longDescription: 'BlueCross BlueShield offers comprehensive health insurance plans tailored to businesses of all sizes. With a vast network of doctors and hospitals, employees get the care they need, wherever they are.',
        features: ['National Network', 'Telehealth Included', 'Wellness Rewards'],
        website: 'https://www.bcbs.com',
    },
    {
        id: 'sol2',
        name: 'Gusto',
        category: 'Platform',
        description: 'Modern HR, payroll, and benefits platform for small businesses.',
        rating: 4.7,
        tags: ['HRIS', 'Payroll', 'Onboarding'],
        longDescription: 'Gusto makes it easy to onboard, pay, and insure your team. Their all-in-one people platform helps businesses run smoothly and compliant.',
        features: ['Auto-Payroll', 'Benefits Admin', 'Time Tracking'],
        website: 'https://gusto.com',
    },
    {
        id: 'sol3',
        name: 'Headspace',
        category: 'Wellness',
        description: 'Meditation and sleep app to improve employee mental well-being.',
        rating: 4.9,
        tags: ['Mental Health', 'Perks', 'App'],
        longDescription: 'Headspace for Work offers science-backed meditation and mindfulness tools to help your team stress less, focus more, and sleep better.',
        features: ['Guided Meditations', 'Sleep Sounds', 'Team Challenges'],
        website: 'https://www.headspace.com/work',
    },
];

export const ASSIGNED_FORMS: AssignedForm[] = [
    {
        id: 'recQuickStart',
        name: 'Betafits Quick Start',
        status: FormStatus.NOT_STARTED,
        description: 'Initial onboarding form for company information and benefits.',
    },
    {
        id: 'recCensus',
        name: 'Employee Census',
        status: FormStatus.IN_PROGRESS,
        description: 'Upload employee demographic and enrollment data.',
    },
];

export const AVAILABLE_FORMS: AvailableForm[] = [
    {
        id: 'recChangeReq',
        name: 'Benefit Change Request',
        category: 'Administrative',
        estimatedTime: '5 mins',
        description: 'Request changes to your current benefit plan structure.',
    },
    {
        id: 'recNewHire',
        name: 'New Hire Enrollment',
        category: 'Personnel',
        estimatedTime: '10 mins',
        description: 'Enroll a new employee into the benefits program.',
    },
];

export const DOCUMENT_ARTIFACTS: DocumentArtifact[] = [
    {
        id: 'recDoc1',
        name: 'Employee Census',
        status: DocumentStatus.UNDER_REVIEW,
        fileName: 'census_2024.xlsx',
        date: '2024-01-15',
        url: '#',
    },
    {
        id: 'recDoc2',
        name: 'Tax Documents',
        status: DocumentStatus.APPROVED,
        fileName: 'form_941.pdf',
        date: '2024-01-10',
        url: '#',
    },
];

export const PROGRESS_STEPS: ProgressStep[] = [
    {
        id: 'step1',
        name: 'Company Information',
        category: 'Onboarding',
        status: ProgressStatus.APPROVED,
        notes: 'Verified via Quick Start form',
    },
    {
        id: 'step2',
        name: 'Employee Census',
        category: 'Data Collection',
        status: ProgressStatus.IN_REVIEW,
        notes: 'Checking for missing dates of birth',
    },
    {
        id: 'step3',
        name: 'Plan Selection',
        category: 'Benefits',
        status: ProgressStatus.MISSING,
        notes: 'Waiting for stakeholder approval',
    },
];
