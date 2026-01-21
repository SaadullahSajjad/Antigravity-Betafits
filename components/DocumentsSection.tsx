import React from 'react';
import { DocumentArtifact, DocumentStatus } from '@/types';

interface Props {
    documents: DocumentArtifact[];
}

const DocumentsSection: React.FC<Props> = ({ documents }) => {
    const getStatusColor = (status: DocumentStatus) => {
        switch (status) {
            case DocumentStatus.APPROVED:
                return 'text-green-600';
            case DocumentStatus.UNDER_REVIEW:
                return 'text-blue-600';
            case DocumentStatus.REJECTED:
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const safeDocuments = Array.isArray(documents) ? documents.slice(0, 3) : [];

    if (safeDocuments.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                <p className="text-[13px] text-gray-500">No documents uploaded yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {safeDocuments.map((doc) => (
                <div
                    key={doc.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-[14px] truncate">
                                {doc.name}
                            </h4>
                            <p className="text-[12px] text-gray-500 mt-1">{doc.fileName}</p>
                            <p className="text-[11px] text-gray-400 mt-1">{doc.date}</p>
                        </div>
                        <span
                            className={`text-[11px] font-bold uppercase tracking-wider ${getStatusColor(doc.status)}`}
                        >
                            {doc.status}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DocumentsSection;
