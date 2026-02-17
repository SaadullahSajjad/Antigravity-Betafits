'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import QuickStartCompleteForm from '@/components/forms/QuickStartCompleteForm';
import { FormValues } from '@/types/form';
import { FormStatus } from '@/types';

export default function QuickStartFormPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [formStatus, setFormStatus] = useState<FormStatus | null>(null);
    const [isCheckingStatus, setIsCheckingStatus] = useState(true);

    const formId = 'eBxXtLZdK4us';

    // Check form status on load
    useEffect(() => {
        const checkFormStatus = async () => {
            try {
                const response = await fetch('/api/forms/assigned');
                if (response.ok) {
                    const forms = await response.json();
                    const thisForm = forms.find((f: any) => f.id === formId || f.description?.includes(formId));
                    if (thisForm) {
                        setFormStatus(thisForm.status);
                    }
                }
            } catch (error) {
                console.error('Error checking form status:', error);
            } finally {
                setIsCheckingStatus(false);
            }
        };

        checkFormStatus();

        // Load saved progress only if form is not submitted
        const saved = localStorage.getItem(`form_${formId}_progress`);
        if (saved) {
            try {
                JSON.parse(saved);
            } catch (e) {
                console.error('Error loading saved progress:', e);
            }
        }
    }, [formId]);

    const handleSave = async (values: FormValues) => {
        // Filter out File objects (they can't be serialized to JSON)
        const serializableValues: FormValues = {};
        for (const [key, value] of Object.entries(values)) {
            if (value instanceof File) {
                serializableValues[key] = { type: 'file', name: value.name, size: value.size };
            } else if (Array.isArray(value) && value.length > 0 && value[0] instanceof File) {
                serializableValues[key] = { 
                    type: 'files', 
                    files: (value as File[]).map(f => ({ name: f.name, size: f.size }))
                };
            } else {
                serializableValues[key] = value;
            }
        }
        localStorage.setItem('form_eBxXtLZdK4us_progress', JSON.stringify(serializableValues));
    };

    const handleSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        setSubmitError('');
        
        try {
            // First, upload any files
            const processedValues = { ...values };
            const fileFields = ['benefitGuide', 'sbcPlanSummaries', 'census', 'otherDocuments'];
            
            for (const fieldId of fileFields) {
                const fileValue = processedValues[fieldId];
                
                if (fileValue) {
                    try {
                        // Handle single file
                        if (fileValue instanceof File) {
                            const formData = new FormData();
                            formData.append('file', fileValue);
                            formData.append('name', fileValue.name);
                            
                            const uploadResponse = await fetch('/api/documents/upload', {
                                method: 'POST',
                                body: formData,
                            });
                            
                            if (uploadResponse.ok) {
                                const uploadData = await uploadResponse.json();
                                processedValues[fieldId] = uploadData.fileUrl || uploadData.fileId || fileValue.name;
                            } else {
                                console.warn(`Failed to upload file for ${fieldId}:`, await uploadResponse.text());
                                processedValues[fieldId] = fileValue.name;
                            }
                        }
                        // Handle multiple files
                        else if (Array.isArray(fileValue) && fileValue.length > 0 && fileValue[0] instanceof File) {
                            const uploadedFiles: string[] = [];
                            
                            for (const file of fileValue as File[]) {
                                const formData = new FormData();
                                formData.append('file', file);
                                formData.append('name', file.name);
                                
                                const uploadResponse = await fetch('/api/documents/upload', {
                                    method: 'POST',
                                    body: formData,
                                });
                                
                                if (uploadResponse.ok) {
                                    const uploadData = await uploadResponse.json();
                                    uploadedFiles.push(uploadData.fileUrl || uploadData.fileId || file.name);
                                } else {
                                    console.warn(`Failed to upload file ${file.name}:`, await uploadResponse.text());
                                    uploadedFiles.push(file.name);
                                }
                            }
                            
                            processedValues[fieldId] = uploadedFiles.join(', ');
                        }
                    } catch (uploadError) {
                        console.error(`Error uploading file for ${fieldId}:`, uploadError);
                        if (fileValue instanceof File) {
                            processedValues[fieldId] = fileValue.name;
                        } else if (Array.isArray(fileValue)) {
                            processedValues[fieldId] = (fileValue as File[]).map(f => f.name).join(', ');
                        }
                    }
                }
            }
            
            // Now submit the form with processed values
            const response = await fetch('/api/forms/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    formId: 'eBxXtLZdK4us',
                    formName: 'Quick Start (Current Benefits) Multi-Page',
                    values: processedValues,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.removeItem('form_eBxXtLZdK4us_progress');
                setIsSuccess(true);
                setTimeout(() => {
                    router.push('/?formSubmitted=true');
                    router.refresh();
                }, 2000);
            } else {
                setSubmitError(data.message || data.error || 'Failed to submit form. Please try again.');
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error('Form submission error:', error);
            setSubmitError('An error occurred while submitting the form. Please try again.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center gap-2 text-[13px] font-medium text-gray-500">
                <Link href="/" className="hover:text-brand-600 transition-colors">
                    Dashboard
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-gray-900">Quick Start</span>
            </div>

            <header className="mb-8">
                <h1 className="text-[32px] font-bold text-gray-900 tracking-tight leading-tight mb-2">
                    Quick Start
                </h1>
                <p className="text-[16px] text-gray-500 font-medium">
                    Complete your organization profile to unlock better benefits recommendations.
                </p>
            </header>

            {/* Success Message */}
            {isSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex-shrink-0 mt-0.5">
                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-green-900 mb-1">Form Submitted Successfully!</h3>
                        <p className="text-sm text-green-700">Your form has been completed and submitted. Redirecting to dashboard...</p>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {submitError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex-shrink-0 mt-0.5">
                        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-red-900 mb-1">Submission Failed</h3>
                        <p className="text-sm text-red-700">{submitError}</p>
                    </div>
                    <button
                        onClick={() => setSubmitError('')}
                        className="flex-shrink-0 text-red-400 hover:text-red-600"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Already Submitted Message */}
            {!isCheckingStatus && (formStatus === FormStatus.SUBMITTED || formStatus === FormStatus.COMPLETED) && (
                <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex-shrink-0 mt-0.5">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-blue-900 mb-1">Form Already Submitted</h3>
                        <p className="text-sm text-blue-700 mb-4">This form has already been submitted and cannot be edited.</p>
                        <Link href="/">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors">
                                Return to Dashboard
                            </button>
                        </Link>
                    </div>
                </div>
            )}

            {/* Show form only if not submitted and not checking status */}
            {!isCheckingStatus && formStatus !== FormStatus.SUBMITTED && formStatus !== FormStatus.COMPLETED && (
                <QuickStartCompleteForm onSave={handleSave} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            )}
        </div>
    );
}
