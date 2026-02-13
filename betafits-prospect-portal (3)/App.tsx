
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import AssignedForms from './components/AssignedForms';
import DocumentsSection from './components/DocumentsSection';
import ProgressSteps from './components/ProgressSteps';
import AvailableForms from './components/AvailableForms';
import CompanyDetails from './components/CompanyDetails';
import BenefitPlans from './components/BenefitPlans';
import BenefitsAnalysis from './components/BenefitsAnalysis';
import EmployeeFeedback from './components/EmployeeFeedback';
import SolutionsCatalog from './components/SolutionsCatalog';
import SolutionDetail from './components/SolutionDetail';
import FAQ from './components/FAQ';
import { 
  ASSIGNED_FORMS, 
  AVAILABLE_FORMS, 
  DOCUMENT_ARTIFACTS, 
  PROGRESS_STEPS, 
  COMPANY_DETAILS,
  ELIGIBILITY_DATA,
  CONTRIBUTION_STRATEGIES,
  BENEFIT_PLANS,
  DEMOGRAPHIC_INSIGHTS,
  FINANCIAL_KPIS,
  BUDGET_BREAKDOWN,
  FEEDBACK_STATS,
  FEEDBACK_RESPONSES
} from './constants';
import { ViewType, Solution } from './types';

// Main Application Component
const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);

  const handleNavigate = (view: ViewType) => {
    setCurrentView(view);
    if (view !== 'solution-detail') {
      setSelectedSolution(null);
    }
  };

  const handleSelectSolution = (solution: Solution) => {
    setSelectedSolution(solution);
    setCurrentView('solution-detail');
  };

  // Renders the main dashboard layout
  const renderHome = () => (
    <div className="space-y-12 animate-in fade-in duration-500">
      <header>
        <h1 className="text-[24px] font-bold text-gray-900 tracking-tight leading-tight">Prospect Portal</h1>
        <p className="text-[15px] text-gray-500 font-medium mt-1">Manage your intake workflow and document submissions with ease.</p>
      </header>

      {/* Row 1: Assigned Forms & Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8">
          <AssignedForms forms={ASSIGNED_FORMS} />
        </div>
        <div className="lg:col-span-4">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-[#1c240f] tracking-tight">Your Documents</h2>
              <p className="text-[13px] text-gray-500 mt-0.5">Recently uploaded files and artifacts.</p>
            </div>
            <button className="flex items-center gap-2 bg-brand-50 text-brand-700 border border-brand-100 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider hover:bg-brand-100 transition-colors shadow-sm active:scale-95">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Upload
            </button>
          </div>
          <DocumentsSection documents={DOCUMENT_ARTIFACTS} />
        </div>
      </div>

      {/* Row 2: Process Tracking (Full Width / Stretched) */}
      <section className="w-full">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Process Tracking</h2>
          <p className="text-[13px] text-gray-500 mt-0.5">Real-time status of your onboarding pipeline.</p>
        </div>
        <ProgressSteps steps={PROGRESS_STEPS} />
      </section>

      {/* Row 3: Available Forms (Full Width) */}
      <section className="w-full">
        <AvailableForms forms={AVAILABLE_FORMS} />
      </section>
    </div>
  );

  // Router-like function to render current view content
  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return renderHome();
      case 'company-details':
        return <CompanyDetails data={COMPANY_DETAILS} />;
      case 'benefit-plans':
        return <BenefitPlans eligibility={ELIGIBILITY_DATA} strategies={CONTRIBUTION_STRATEGIES} plans={BENEFIT_PLANS} />;
      case 'benefits-analysis':
        return <BenefitsAnalysis demographics={DEMOGRAPHIC_INSIGHTS} kpis={FINANCIAL_KPIS} breakdown={BUDGET_BREAKDOWN} />;
      case 'employee-feedback':
        return <EmployeeFeedback stats={FEEDBACK_STATS} responses={FEEDBACK_RESPONSES} />;
      case 'faq':
        return <FAQ />;
      case 'solutions-catalog':
        return <SolutionsCatalog onSelectSolution={handleSelectSolution} />;
      case 'solution-detail':
        return selectedSolution ? (
          <SolutionDetail solution={selectedSolution} onBack={() => handleNavigate('solutions-catalog')} />
        ) : renderHome();
      default:
        return renderHome();
    }
  };

  return (
    <div className="flex h-screen bg-white font-sans text-gray-900 overflow-hidden">
      <Sidebar currentView={currentView} onNavigate={handleNavigate} />
      <main className="flex-1 overflow-y-auto bg-white p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
