import React, { useState } from 'react';
import { DocumentArtifact, DocumentStatus } from '../types';

interface Props {
  documents: DocumentArtifact[];
}

const getStatusStyle = (status: DocumentStatus) => {
  switch (status) {
    case DocumentStatus.APPROVED:
      return 'bg-[#d1fae5] text-[#065f46] border-[#10b981]/20';
    case DocumentStatus.UNDER_REVIEW:
      return 'bg-[#fef3c7] text-[#92400e] border-[#f59e0b]/20';
    case DocumentStatus.REJECTED:
      return 'bg-[#fee2e2] text-[#991b1b] border-[#ef4444]/20';
    case DocumentStatus.RECEIVED:
    default:
      return 'bg-[#f3f4f6] text-[#374151] border-[#9ca3af]/20';
  }
};

const getStatusLabel = (status: DocumentStatus) => {
  if (status === DocumentStatus.APPROVED) return 'Reviewed';
  if (status === DocumentStatus.UNDER_REVIEW) return 'In Review';
  return status;
};

const DocumentCard: React.FC<{ doc: DocumentArtifact }> = ({ doc }) => (
  <div 
    className="bg-white border border-gray-100 rounded-[14px] p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4"
  >
    {/* Header */}
    <h3 className="text-[17px] font-bold text-[#1c240f] tracking-tight">
      {doc.name}
    </h3>

    {/* File Box */}
    <div className="bg-[#fdfdfc] border border-gray-100 rounded-lg p-3 flex items-center gap-3">
      <div className="text-gray-900">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      </div>
      <div className="text-[14px] font-medium text-gray-700 truncate">
        {doc.fileName}
      </div>
    </div>

    {/* Status Badge */}
    <div className="flex">
      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${getStatusStyle(doc.status)}`}>
        {getStatusLabel(doc.status)}
      </span>
    </div>
  </div>
);

const DocumentsSection: React.FC<Props> = ({ documents }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const displayedDocs = documents.slice(0, 2);

  return (
    <>
      <section className="flex flex-col gap-5">
        {displayedDocs.map((doc) => (
          <DocumentCard key={doc.id} doc={doc} />
        ))}

        {/* View More Button */}
        {documents.length > 0 && (
          <div className="flex justify-center pt-2">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-white border border-gray-100 rounded-lg text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm active:scale-95"
            >
              View More
            </button>
          </div>
        )}
      </section>

      {/* Modal for All Documents */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/10 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Your Documents</h2>
                <p className="text-sm text-gray-500 font-normal">Full repository of your uploaded files and artifacts.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 hover:bg-gray-100 rounded-md text-gray-400 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex flex-col gap-6 bg-gray-50/30">
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))
              ) : (
                <div className="py-20 text-center">
                  <p className="text-gray-400 font-medium">No documents uploaded yet.</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="bg-[#1c240f] text-white px-10 py-3 rounded-xl font-bold text-[13px] hover:bg-black transition-all shadow-lg uppercase tracking-widest"
              >
                Close List
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentsSection;