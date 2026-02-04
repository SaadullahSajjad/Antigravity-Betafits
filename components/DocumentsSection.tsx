'use client';

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
                    className={`bg-white border border-gray-200 rounded-lg p-4 transition-colors group ${doc.url ? 'hover:border-blue-300 cursor-pointer' : 'hover:border-gray-300'
                        }`}
                    onClick={() => {
                        if (doc.url && doc.url !== '#') {
                            window.open(doc.url, '_blank', 'noopener,noreferrer');
                        }
                    }}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h4 
                                    className="font-semibold text-gray-900 text-[14px] truncate"
                                    title={doc.name}
                                >
                                    {doc.name}
                                </h4>
                                {doc.url && doc.url !== '#' && (
                                    <svg
                                        className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 transition-colors"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                )}
                            </div>
                            <p className="text-[12px] text-gray-500 mt-1 truncate" title={doc.fileName}>
                                {doc.fileName}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-1">{doc.date}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span
                                className={`text-[11px] font-bold uppercase tracking-wider ${getStatusColor(doc.status)}`}
                            >
                                {doc.status}
                            </span>
                            {doc.url && doc.url !== '#' && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(doc.url, '_blank', 'noopener,noreferrer');
                                    }}
                                    className="text-[10px] text-blue-600 hover:text-blue-700 font-medium px-2 py-1 bg-blue-50 rounded border border-blue-100 transition-colors"
                                >
                                    View
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DocumentsSection;
