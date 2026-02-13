
import React from 'react';
import { AssignedForm, FormStatus } from '../types';

interface Props {
  forms: AssignedForm[];
}

const AssignedForms: React.FC<Props> = ({ forms }) => {
  const getStatusStyle = (status: FormStatus) => {
    switch (status) {
      case FormStatus.COMPLETED: return 'bg-brand-50 text-brand-700 border-brand-100';
      case FormStatus.IN_PROGRESS: return 'bg-blue-50 text-blue-700 border-blue-100';
      case FormStatus.SUBMITTED: return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-500 border-gray-200';
    }
  };

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Assigned Forms</h2>
        <p className="text-[13px] text-gray-500 mt-0.5">Core tasks required for your enrollment profile.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {forms.map((form) => (
          <div key={form.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between hover:border-gray-300 transition-colors">
            <div>
              <div className="flex justify-between items-start mb-5">
                <div className="w-11 h-11 bg-gray-50 rounded-md flex items-center justify-center text-gray-400 border border-gray-100">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className={`text-[12px] font-semibold uppercase tracking-wider px-3 py-1 rounded-md border ${getStatusStyle(form.status)}`}>
                  {form.status}
                </span>
              </div>
              <h3 className="text-[17px] font-bold text-gray-900 mb-2 leading-tight">{form.name}</h3>
              <p className="text-[14px] text-gray-500 mb-8 leading-relaxed font-medium">{form.description}</p>
            </div>
            <button className="w-full py-2.5 bg-brand-500 text-white rounded-md font-semibold text-[12px] hover:bg-brand-600 transition-all shadow-sm active:scale-[0.98]">
              {form.status === FormStatus.NOT_STARTED ? 'Start Form' : 'Continue'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AssignedForms;
