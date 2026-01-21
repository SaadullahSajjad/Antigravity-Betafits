import React from 'react';
import { ProgressStep, ProgressStatus } from '@/types';

interface Props {
    steps: ProgressStep[];
}

const ProgressSteps: React.FC<Props> = ({ steps }) => {
    const getStatusBadge = (status: ProgressStatus) => {
        const styles = {
            [ProgressStatus.APPROVED]: 'bg-green-50 text-green-700 border-green-200',
            [ProgressStatus.IN_REVIEW]: 'bg-blue-50 text-blue-700 border-blue-200',
            [ProgressStatus.FLAGGED]: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            [ProgressStatus.MISSING]: 'bg-red-50 text-red-700 border-red-200',
            [ProgressStatus.NOT_REQUESTED]: 'bg-gray-50 text-gray-500 border-gray-200',
        };
        return styles[status] || styles[ProgressStatus.NOT_REQUESTED];
    };

    const safeSteps = Array.isArray(steps) ? steps : [];

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-3 text-left text-[12px] font-bold text-gray-700 uppercase tracking-wider">
                            Step
                        </th>
                        <th className="px-6 py-3 text-left text-[12px] font-bold text-gray-700 uppercase tracking-wider">
                            Category
                        </th>
                        <th className="px-6 py-3 text-left text-[12px] font-bold text-gray-700 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-[12px] font-bold text-gray-700 uppercase tracking-wider">
                            Notes
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {safeSteps.map((step) => (
                        <tr key={step.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-[14px] font-medium text-gray-900">
                                {step.name}
                            </td>
                            <td className="px-6 py-4 text-[13px] text-gray-600">
                                {step.category}
                            </td>
                            <td className="px-6 py-4">
                                <span
                                    className={`inline-block px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider border ${getStatusBadge(step.status)}`}
                                >
                                    {step.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-[13px] text-gray-500">
                                {step.notes || '-'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProgressSteps;
