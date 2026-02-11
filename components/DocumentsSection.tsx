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
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                </div>
                <p className="text-[14px] text-gray-500 font-medium">No documents have been uploaded yet.</p>
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
                        if (doc.url && doc.url !== '#' && doc.url.trim() !== '') {
                            // Open document in new tab
                            let url = doc.url.trim();
                            
                            // Ensure URL is absolute - if it's relative, make it absolute
                            if (url.startsWith('/api/files/')) {
                                // Relative URL - make it absolute using current origin
                                url = `${window.location.origin}${url}`;
                            } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
                                // Not a valid URL - try to make it absolute
                                if (url.startsWith('/')) {
                                    url = `${window.location.origin}${url}`;
                                } else {
                                    url = `${window.location.origin}/${url}`;
                                }
                            }
                            
                            console.log('[DocumentsSection] Opening document:', url, 'for document:', doc.name);
                            window.open(url, '_blank', 'noopener,noreferrer');
                        } else {
                            console.warn('[DocumentsSection] Document has no valid URL:', {
                                id: doc.id,
                                name: doc.name,
                                fileName: doc.fileName,
                                url: doc.url,
                            });
                            alert('This document is not available to view. The file may still be processing or the upload may have failed.');
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
                            {doc.url && doc.url !== '#' && doc.url.trim() !== '' && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        let url = doc.url?.trim();
                                        if (url) {
                                            // Ensure URL is absolute
                                            if (url.startsWith('/api/files/')) {
                                                url = `${window.location.origin}${url}`;
                                            } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
                                                if (url.startsWith('/')) {
                                                    url = `${window.location.origin}${url}`;
                                                } else {
                                                    url = `${window.location.origin}/${url}`;
                                                }
                                            }
                                            console.log('[DocumentsSection] Opening document via button:', url);
                                            window.open(url, '_blank', 'noopener,noreferrer');
                                        }
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
