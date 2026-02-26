'use client';

import React, { useState } from 'react';
import { BenefitEligibilityData, ContributionStrategy, BenefitPlan } from '@/types';

interface Props {
  eligibility: BenefitEligibilityData | null;
  strategies: ContributionStrategy[];
  plans: BenefitPlan[];
}

const RatesModal: React.FC<{ plan: BenefitPlan; onClose: () => void }> = ({ plan, onClose }) => {
  const tiers = [
    { label: 'EE', premium: '25.00', er: '25.00', ee: '0.00' },
    { label: 'ES', premium: '48.50', er: '46.62', ee: '1.88' },
    { label: 'EC', premium: '42.10', er: '40.00', ee: '2.10' },
    { label: 'EF', premium: '68.07', er: '64.00', ee: '4.07' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/30 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 scale-in-center animate-in zoom-in-95 duration-200">
        <div className="px-10 pt-10 pb-4 relative">
          <button 
            onClick={onClose} 
            className="absolute top-8 right-8 p-1.5 hover:bg-gray-100 rounded-md text-gray-400 transition-all z-10"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="mb-6">
            <h2 className="text-[26px] font-bold text-brand-500 tracking-tight leading-tight mb-2">{plan.name}</h2>
            <p className="text-[16px] font-bold text-gray-900">{plan.carrier}</p>
          </div>
        </div>
        <div className="px-10 pb-12 overflow-y-auto">
          <div className="grid grid-cols-3 gap-8 py-6 border-b border-gray-50">
            <div className="text-[15px] font-bold text-gray-800">Premium</div>
            <div className="text-[15px] font-bold text-gray-800">Employer Cost</div>
            <div className="text-[15px] font-bold text-gray-800">Employee Cost</div>
          </div>
          <div className="divide-y divide-gray-50">
            {tiers.map((tier, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-8 py-8">
                <div className="flex flex-col gap-3">
                  <div className="text-[13px] font-medium text-gray-500">{tier.label}</div>
                  <div className="text-[16px] font-medium text-gray-800">{tier.premium}</div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="text-[13px] font-medium text-gray-500">{tier.label}</div>
                  <div className="text-[16px] font-medium text-gray-800">{tier.er}</div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="text-[13px] font-medium text-gray-500">{tier.label}</div>
                  <div className="text-[16px] font-medium text-gray-800">{tier.ee}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PlanDetailsModal: React.FC<{ plan: BenefitPlan; onClose: () => void }> = ({ plan, onClose }) => {
  const renderGridItem = (label: string, value: string | undefined) => (
    <div className="flex flex-col">
      <span className="text-[14px] font-medium text-gray-500 mb-2">{label}</span>
      <span className="text-[17px] font-bold text-gray-800">{value || '-'}</span>
    </div>
  );

  const renderRow = (label: string, value: string | undefined) => (
    <div className="flex justify-between items-center py-5 border-b border-gray-100 last:border-0">
      <span className="text-[15px] font-medium text-gray-500">{label}</span>
      <span className="text-[15px] font-bold text-gray-800">{value || '-'}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/30 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200 scale-in-center animate-in zoom-in-95 duration-200">
        <div className="px-10 pt-10 pb-6 relative">
          <button 
            onClick={onClose} 
            className="absolute top-8 right-8 p-1.5 hover:bg-gray-100 rounded-md text-gray-400 transition-all z-10"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="mb-6">
            <h2 className="text-[26px] font-bold text-brand-500 tracking-tight leading-tight mb-2">{plan.name}</h2>
            <p className="text-[16px] font-bold text-gray-900">{plan.carrier}</p>
          </div>
          <div className="w-full h-px bg-gray-100"></div>
        </div>
        <div className="px-10 pb-12 overflow-y-auto space-y-8">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 space-y-12">
            <div className="grid grid-cols-2 gap-x-12 gap-y-12">
              {renderGridItem("Plan Score (ML)", "-")}
              {renderGridItem("Value Score (ML)", "-")}
              
              {plan.category === 'Medical' && (
                <>
                  {renderGridItem("Medical Plan Type", plan.type)}
                  {renderGridItem("Deductible (Single)", plan.deductible)}
                  {renderGridItem("OOPM (Single)", plan.oopm)}
                  {renderGridItem("Coinsurance", plan.coinsurance)}
                  {renderGridItem("Copay", plan.copay)}
                  {renderGridItem("Rx (Combined)", plan.rx)}
                </>
              )}

              {plan.category === 'Dental' && (
                <>
                  {renderGridItem("Dental Plan Type", plan.type)}
                  {renderGridItem("Annual Maximum", plan.annualMax)}
                  {renderGridItem("Preventive %", plan.preventive)}
                  {renderGridItem("Basic %", plan.basic)}
                  {renderGridItem("Major %", plan.major)}
                  {renderGridItem("OON Reimbursement", plan.oonReimbursement)}
                </>
              )}

              {plan.category === 'Vision' && (
                <>
                  {renderGridItem("Vision - Exam Copay", plan.examCopay)}
                  {renderGridItem("Materials Allowance", plan.materialsCopay)}
                  {renderGridItem("Materials Frequency", plan.materialsFrequency)}
                  {renderGridItem("Frame Allowance", plan.frameAllowance)}
                </>
              )}
            </div>

            {plan.category === 'Vision' && (
              <div className="mt-4">
                {renderGridItem("Frame Frequency", plan.frameFrequency)}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl px-10 py-2">
            {plan.category === 'Vision' ? (
              <>
                {renderRow("Exam Frequency", "Every 12 months")}
                {renderRow("Contact Frequency", "Every 12 months")}
                {renderRow("Lens Allowance", "$20")}
              </>
            ) : plan.category === 'Dental' ? (
              <>
                {renderRow("Deductible (Individual)", "$50")}
                {renderRow("Waiting Period", "None")}
                {renderRow("Endodontics", "80%")}
              </>
            ) : (
              <>
                {renderRow("ER Visit", "Ded/Coins")}
                {renderRow("Urgent Care", "$50")}
                {renderRow("Inpatient Hospital", "Ded/Coins")}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PlanCard: React.FC<{ 
  plan: BenefitPlan; 
  onViewDetails: (plan: BenefitPlan) => void;
  onViewRates: (plan: BenefitPlan) => void;
}> = ({ plan, onViewDetails, onViewRates }) => {
  const renderMedicalGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-12 pt-6 border-t border-gray-50">
      <div>
        <div className="text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Medical Plan Type</div>
        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200`}>
          {plan.type}
        </span>
      </div>
      <div>
        <div className="text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Deductible (Single)</div>
        <div className="text-[16px] font-bold text-gray-900">{plan.deductible}</div>
      </div>
      <div>
        <div className="text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">OOPM (Single)</div>
        <div className="text-[16px] font-bold text-gray-900">{plan.oopm}</div>
      </div>
      <div>
        <div className="text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Coinsurance</div>
        <div className="text-[16px] font-bold text-gray-900">{plan.coinsurance}</div>
      </div>
    </div>
  );

  const renderDentalGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-12 pt-6 border-t border-gray-50">
      <div>
        <div className="text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Dental Plan Type</div>
        <span className="px-1.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-500 border border-blue-100">
          {plan.type}
        </span>
      </div>
      <div>
        <div className="text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Annual Maximum</div>
        <div className="text-[16px] font-bold text-gray-900">{plan.annualMax}</div>
      </div>
      <div>
        <div className="text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Preventive %</div>
        <div className="text-[16px] font-bold text-gray-900">{plan.preventive}</div>
      </div>
      <div>
        <div className="text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Basic %</div>
        <div className="text-[16px] font-bold text-gray-900">{plan.basic}</div>
      </div>
    </div>
  );

  const renderVisionGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-12 pt-6 border-t border-gray-50">
      <div>
        <div className="text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Vision - Exam Copay</div>
        <div className="text-[16px] font-bold text-gray-900">{plan.examCopay}</div>
      </div>
      <div>
        <div className="text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Materials Copay</div>
        <div className="text-[16px] font-bold text-gray-900">{plan.materialsCopay}</div>
      </div>
      <div>
        <div className="text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Frame Allowance</div>
        <div className="text-[16px] font-bold text-gray-900">{plan.frameAllowance}</div>
      </div>
      <div>
        <div className="text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Materials Frequency</div>
        <div className="text-[16px] font-bold text-gray-900">{plan.materialsFrequency}</div>
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-8 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-[20px] font-bold text-brand-500 mb-1">{plan.name}</h3>
          <p className="text-[14px] font-bold text-gray-900 mb-2">
            {plan.category === 'Vision' ? `Carrier: ${plan.carrier}` : plan.carrier}
          </p>
          <div className="space-y-1">
            <p className="text-[14px] text-gray-900 font-medium">Plan Score: <span className="font-bold">{plan.score}</span></p>
            {plan.category !== 'Medical' && (
              <p className="text-[14px] text-gray-900 font-medium">Value Score: <span className="font-bold">{plan.score} Star</span></p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onViewDetails(plan)}
            className="bg-brand-500 text-white px-5 py-2.5 rounded-md text-sm font-bold hover:bg-brand-600 transition-colors shadow-sm shadow-brand-100"
          >
            View Details
          </button>
          <button 
            onClick={() => onViewRates(plan)}
            className="border border-gray-400 text-gray-900 px-5 py-2.5 rounded-md text-sm font-bold hover:bg-gray-50 transition-colors"
          >
            View Rates
          </button>
        </div>
      </div>

      {plan.category === 'Medical' && renderMedicalGrid()}
      {plan.category === 'Dental' && renderDentalGrid()}
      {plan.category === 'Vision' && renderVisionGrid()}
    </div>
  );
};

const BenefitPlans: React.FC<Props> = ({ eligibility, strategies, plans }) => {
  const [activeTab, setActiveTab] = useState<'Medical' | 'Dental' | 'Vision'>('Medical');
  const [selectedPlan, setSelectedPlan] = useState<BenefitPlan | null>(null);
  const [selectedRatesPlan, setSelectedRatesPlan] = useState<BenefitPlan | null>(null);

  const filteredPlans = plans.filter(p => p.category === activeTab);

  // Default eligibility if not provided
  const defaultEligibility: BenefitEligibilityData = {
    className: '',
    waitingPeriod: '',
    effectiveDate: '',
    requiredHours: '',
  };

  const displayEligibility = eligibility || defaultEligibility;

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-8">
      {/* Header Section */}
      <div className="flex flex-col">
        <h1 className="text-h1 text-neutral-900 tracking-tight mb-1">Benefit Plans</h1>
        <p className="text-neutral-500 text-body font-medium max-w-2xl leading-relaxed">
          Review your organization's benefit ecosystem, from coverage rules to employer contribution strategies.
        </p>
      </div>

      {/* Top Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-4 bg-white border border-gray-200 rounded-xl shadow-sm p-8 flex flex-col justify-between overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
          <div className="relative z-10 h-full flex flex-col">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Benefit Eligibility</h2>
              <p className="text-sm text-gray-500 font-medium mt-1">Core qualification rules for your workforce.</p>
            </div>
            
            <div className="space-y-6 flex-1 flex flex-col justify-around">
              {[
                { label: 'Benefit Class', value: displayEligibility.className, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5', color: 'brand' },
                { label: 'Waiting Period', value: displayEligibility.waitingPeriod, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'blue' },
                { label: 'Effective Date', value: displayEligibility.effectiveDate, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'amber' },
                { label: 'Work Commitment', value: displayEligibility.requiredHours, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'pink' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center group">
                  <div className={`w-10 h-10 rounded-md flex items-center justify-center mr-4 bg-${item.color}-50 text-${item.color}-600 group-hover:scale-110 transition-transform flex-shrink-0`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                  </div>
                  <div className="flex-1 border-b border-gray-50 pb-2 group-last:border-0 group-last:pb-0">
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{item.label}</div>
                    <div className="text-[16px] font-bold text-gray-900 tracking-tight">{item.value || '-'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Contribution Strategy</h2>
              <p className="text-sm text-gray-500 font-medium mt-1">Employer investment framework per benefit line.</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-white">
                  <th className="px-8 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Benefit Line</th>
                  <th className="px-4 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Model</th>
                  <th className="px-4 py-4 text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest">Flat Amt</th>
                  <th className="px-6 py-4 text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest">Employee %</th>
                  <th className="px-6 py-4 text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest">Dependent %</th>
                  <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-400 uppercase tracking-widest">Buy-Up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {strategies.map((s, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${s.benefit === 'Medical' ? 'bg-brand-500' : s.benefit === 'Dental' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
                        <div className="text-[16px] font-bold text-gray-900">{s.benefit}</div>
                      </div>
                    </td>
                    <td className="px-4 py-6">
                      <div className="text-[15px] text-gray-600 font-medium truncate max-w-[120px]" title={s.strategyType}>{s.strategyType}</div>
                    </td>
                    <td className="px-4 py-6 text-center">
                      <div className={`text-[15px] font-bold ${s.flatAmount === '$0' ? 'text-gray-300' : 'text-gray-900'}`}>{s.flatAmount}</div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="text-[16px] font-bold text-gray-900">{s.eePercent}</div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="text-[16px] font-bold text-gray-900">{s.depPercent}</div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                        s.buyUpStrategy === 'Available' ? 'bg-brand-50 text-brand-700 border-brand-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                      }`}>
                        {s.buyUpStrategy}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-gray-50/50 border-t border-gray-100 text-center">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Strategy data is based on most recent enrollment cycle</span>
          </div>
        </div>
      </div>

      {/* Plans Section */}
      <div className="pt-6">
        <div className="flex gap-10 border-b border-gray-100 mb-8">
          {(['Medical', 'Dental', 'Vision'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-[15px] font-bold tracking-tight transition-all relative ${
                activeTab === tab ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 rounded-full"></div>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {filteredPlans.length > 0 ? (
            filteredPlans.map(plan => (
              <PlanCard 
                key={plan.id} 
                plan={plan} 
                onViewDetails={(p) => setSelectedPlan(p)}
                onViewRates={(p) => setSelectedRatesPlan(p)}
              />
            ))
          ) : (
            <div className="bg-white border border-dashed border-gray-200 rounded-xl p-24 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                 <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <p className="text-gray-400 font-bold text-xl tracking-tight">No {activeTab} plans mapped yet.</p>
              <p className="text-gray-400 text-base mt-1 max-w-sm font-normal">Our benefit analysts are currently processing your plan documents. You'll be notified as soon as they're ready.</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modals */}
      {selectedPlan && (
        <PlanDetailsModal 
          plan={selectedPlan} 
          onClose={() => setSelectedPlan(null)} 
        />
      )}
      {selectedRatesPlan && (
        <RatesModal 
          plan={selectedRatesPlan} 
          onClose={() => setSelectedRatesPlan(null)} 
        />
      )}
    </div>
  );
};

export default BenefitPlans;
