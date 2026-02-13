import React from 'react';
import { ProgressStep, ProgressStatus } from '@/types';

interface Props {
  steps: ProgressStep[];
}

const ProgressSteps: React.FC<Props> = ({ steps }) => {
  const getStatusStyle = (status: ProgressStatus) => {
    switch (status) {
      case ProgressStatus.APPROVED: return 'bg-brand-50 text-brand-700 border-brand-100';
      case ProgressStatus.IN_REVIEW: return 'bg-blue-50 text-blue-700 border-blue-100';
      case ProgressStatus.FLAGGED: return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-200';
    }
  };

  return (
    <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-8 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Step</th>
              <th className="px-8 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Category</th>
              <th className="px-8 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-4 text-right text-[11px] font-bold text-gray-400 uppercase tracking-widest">Last Updated</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {steps.length > 0 ? (
              steps.map((step) => (
                <tr key={step.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="text-[15px] font-bold text-gray-900 tracking-tight">{step.name}</div>
                    {step.notes && <div className="text-[13px] text-gray-500 font-medium mt-0.5">{step.notes}</div>}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-[14px] text-gray-600 font-medium">
                    {step.category}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-lg text-[12px] font-bold border uppercase tracking-wide ${getStatusStyle(step.status)}`}>
                      {step.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right text-[13px] text-gray-400 font-bold">
                    {step.lastUpdated || '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-8 py-12 text-center text-gray-500">
                  No progress steps available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ProgressSteps;
