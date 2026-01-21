import React from 'react';
import EmployeeFeedback from '@/components/EmployeeFeedback';
import { FEEDBACK_RESPONSES, FEEDBACK_STATS } from '@/constants';

export default function EmployeeFeedbackPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-[24px] font-bold text-gray-900 tracking-tight leading-tight">
                            Employee Feedback
                        </h1>
                        <p className="text-[15px] text-gray-500 font-medium mt-1">
                            Insights from pulse surveys and engagement metrics.
                        </p>
                    </div>
                    <button className="bg-brand-500 text-white px-4 py-2 rounded-md font-semibold text-[13px] hover:bg-brand-600 transition-all shadow-sm active:scale-[0.98]">
                        Create Survey
                    </button>
                </div>
            </header>

            <EmployeeFeedback stats={FEEDBACK_STATS} responses={FEEDBACK_RESPONSES} />
        </div>
    );
}
