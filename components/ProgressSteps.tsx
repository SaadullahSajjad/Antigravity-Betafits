import React from 'react';
import { ProgressStep, ProgressStatus } from '@/types';

interface Props {
  steps: ProgressStep[];
}

const ProgressSteps: React.FC<Props> = ({ steps }) => {
  const getStatusStyle = (status: ProgressStatus) => {
    switch (status) {
      case ProgressStatus.APPROVED: return 'bg-blue-50 text-blue-700 border-blue-100'; // Completed - blue
      case ProgressStatus.IN_REVIEW: return 'bg-blue-50 text-blue-700 border-blue-100';
      case ProgressStatus.FLAGGED: return 'bg-red-50 text-red-700 border-red-100';
      case ProgressStatus.MISSING: return 'bg-pink-50 text-pink-700 border-pink-100'; // Not Started - pink
      case ProgressStatus.NOT_REQUESTED: return 'bg-orange-50 text-orange-700 border-orange-100'; // Not Requested - orange
      default: return 'bg-gray-50 text-gray-500 border-gray-200';
    }
  };
  
  // Map status enum to display text
  const getStatusDisplay = (status: ProgressStatus): string => {
    switch (status) {
      case ProgressStatus.APPROVED: return 'Completed';
      case ProgressStatus.MISSING: return 'Not Started';
      case ProgressStatus.NOT_REQUESTED: return 'Not Requested';
      default: return status;
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
                      {getStatusDisplay(step.status)}
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
