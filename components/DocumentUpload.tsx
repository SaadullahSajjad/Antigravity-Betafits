'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface DocumentUploadProps {
    onUploadComplete?: () => void;
}

export default function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                return;
            }
            setSelectedFile(file);
            setError('');
            setIsModalOpen(true);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('name', selectedFile.name);

            const response = await fetch('/api/documents/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setIsModalOpen(false);
                setSelectedFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                // Wait a moment for Airtable to process, then refresh
                setTimeout(() => {
                    router.refresh();
                    if (onUploadComplete) {
                        onUploadComplete();
                    }
                }, 1000);
            } else {
                setError(data.error || 'Failed to upload document');
            }
        } catch (err) {
            setError('An error occurred while uploading. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-brand-50 text-brand-700 border border-brand-100 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider hover:bg-brand-100 transition-colors shadow-sm active:scale-95"
            >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Upload
            </button>

            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
            />

            {/* Upload Modal */}
            {isModalOpen && selectedFile && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Upload Document</h3>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                File Name
                            </label>
                            <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900">
                                {selectedFile.name}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedFile(null);
                                    setError('');
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = '';
                                    }
                                }}
                                disabled={uploading}
                                className="px-4 py-2 border border-gray-200 rounded-md text-[13px] font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="px-4 py-2 bg-[#97C25E] hover:bg-[#8bb356] text-white rounded-md text-[13px] font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
