'use client';

import React from 'react';
import Link from 'next/link';
import { AssignedForm, FormStatus } from '@/types';

interface Props {
    forms: AssignedForm[];
}

const AssignedForms: React.FC<Props> = ({ forms }) => {

    const getStatusStyle = (status: FormStatus) => {
        switch (status) {
            case FormStatus.COMPLETED:
                return 'bg-brand-50 text-brand-700 border-brand-100';
            case FormStatus.IN_PROGRESS:
                return 'bg-blue-50 text-blue-700 border-blue-100';
            case FormStatus.SUBMITTED:
                return 'bg-gray-50 text-gray-700 border-gray-200';
            default:
                // Match Softr: Pink badge for "Not Started"
                return 'bg-pink-100 text-pink-700 border-pink-200';
        }
    };

    const getStatusLabel = (status: FormStatus) => {
        switch (status) {
            case FormStatus.IN_PROGRESS:
                return 'Incomplete';
            default:
                return status;
        }
    };

    const getFormRoute = (formId: string, formName: string, description: string): string => {
        // Map all 17 forms by ID (most reliable)
        const formRouteMap: Record<string, string> = {
            // Fillout forms (4)
            'eBxXtLZdK4us': '/forms/quick-start', // Quick Start uses this route
            'rZhiEaUEskus': '/forms/rzhieaueskus',
            'gn6WNJPJKTus': '/forms/gn6wnjpjktus',
            'urHF8xDu7eus': '/forms/urhf8xdu7eus',
            
            // All other forms (13)
            'rec4V98J6aPaM3u9H': '/forms/rec4v98j6apam3u9h',
            'rec7NfuiBQ8wrEmu7': '/forms/rec7nfuibq8wremu7',
            'recFVcfdoXkUjIcod': '/forms/recfvcfdoxkujicod',
            'recFxyNqTLDdrxXN2': '/forms/recfxynqtlddrxxn2',
            'recGrsR8Sdx96pckJ': '/forms/recgrsr8sdx96pckj',
            'recKzuznmqq29uASl': '/forms/reckzuznmqq29uasl',
            'recOE9pVakkobVzU7': '/forms/recoe9pvakkobvzu7',
            'recOt6cX0t1DksDFT': '/forms/recot6cx0t1dksdft',
            'recUnTZFK5UyfWqzm': '/forms/recuntzfk5uyfwqzm',
            'recdjXjySYuYUGkdP': '/forms/recdjxjysyuyugkdp',
            'rechTHxZIxS3bBcqF': '/forms/rechthxzixs3bbcqf',
            'reclUQ6KhVzCssuVl': '/forms/recluq6khvzcssuvl',
            'recmB9IdRhtgckvaY': '/forms/recmb9idrhtgckvay',
            'recsLJiBVdED8EEbr': '/forms/recsljibvded8eebr',
            'recufWIRuSFArZ9GG': '/forms/recufwirusfarz9gg',
            'recxH9Jrk10bbqU58': '/forms/recxh9jrk10bbqu58',
            'recySUNj6jv47SOKr': '/forms/recysunj6jv47sokr',
        };

        // First try direct ID mapping
        if (formRouteMap[formId]) {
            return formRouteMap[formId];
        }

        // Fallback: Map by form name (case-insensitive)
        const formNameLower = formName.toLowerCase();
        
        // Quick Start forms - prioritize by specific identifiers
        if (formNameLower.includes('quick start') && formNameLower.includes('multi-page')) {
            return '/forms/ebxxtlzdk4us';
        }
        if (formNameLower.includes('quick start') && formNameLower.includes('current benefits')) {
            return '/forms/ebxxtlzdk4us';
        }
        if (formNameLower.includes('quick start') && formNameLower.includes('new benefits')) {
            return '/forms/recluq6khvzcssuvl';
        }
        if (formNameLower.includes('quick start') || formNameLower.includes('quickstart')) {
            if (formNameLower.includes('update')) {
                return '/forms/rzhieaueskus';
            }
            // Default Quick Start should use the main form (eBxXtLZdK4us)
            return '/forms/quick-start'; // This routes to /forms/quick-start which uses eBxXtLZdK4us
        }
        
        // PEO/HR form
        if (formNameLower.includes('peo/hr') || (formNameLower.includes('peo') && formNameLower.includes('update'))) {
            return '/forms/gn6wnjpjktus';
        }
        if (formNameLower.includes('peo/eor') || formNameLower.includes('peo eor')) {
            return '/forms/reckzuznmqq29uasl';
        }
        
        // Broker Role form
        if (formNameLower.includes('broker role') && formNameLower.includes('update')) {
            return '/forms/urhf8xdu7eus';
        }
        if (formNameLower.includes('broker role') || formNameLower.includes('broker')) {
            return '/forms/recxh9jrk10bbqu58';
        }
        
        // Other specific forms
        if (formNameLower.includes('medical coverage')) {
            return '/forms/rec4v98j6apam3u9h';
        }
        if (formNameLower.includes('workers compensation')) {
            return '/forms/rec7nfuibq8wremu7';
        }
        if (formNameLower.includes('add new group')) {
            return '/forms/recfvcfdoxkujicod';
        }
        if (formNameLower.includes('benefits administration')) {
            return '/forms/recfxynqtlddrxxn2';
        }
        if (formNameLower.includes('benefits compliance')) {
            return '/forms/recgrsr8sdx96pckj';
        }
        if (formNameLower.includes('appoint betafits')) {
            return '/forms/recoe9pvakkobvzu7';
        }
        if (formNameLower.includes('hr tech')) {
            return '/forms/recot6cx0t1dksdft';
        }
        if (formNameLower.includes('comprehensive intake')) {
            return '/forms/recuntzfk5uyfwqzm';
        }
        if (formNameLower.includes('premiums') || formNameLower.includes('contribution strategy')) {
            return '/forms/recdjxjysyuyugkdp';
        }
        if (formNameLower.includes('basic intake')) {
            return '/forms/rechthxzixs3bbcqf';
        }
        if (formNameLower.includes('benefits pulse survey')) {
            return '/forms/recmb9idrhtgckvay';
        }
        if (formNameLower.includes('document uploader')) {
            return '/forms/recsljibvded8eebr';
        }
        if (formNameLower === 'nda') {
            return '/forms/recysunj6jv47sokr';
        }
        
        // Map by Fillout template ID if description contains it
        if (description && description.includes('fillout.com/t/')) {
            const templateIdMatch = description.match(/fillout\.com\/t\/([a-zA-Z0-9]+)/);
            if (templateIdMatch) {
                const templateId = templateIdMatch[1];
                if (formRouteMap[templateId]) {
                    return formRouteMap[templateId];
                }
            }
        }
        
        // Check if description contains a URL
        if (description && description.trim() && !description.startsWith('?id=')) {
            // If description is a URL, use it
            if (description.startsWith('http://') || description.startsWith('https://')) {
                return description;
            }
            // If description starts with /, treat as internal route
            if (description.startsWith('/')) {
                return description;
            }
        }
        
        // Default: return form ID route (lowercase)
        return `/forms/${formId.toLowerCase()}`;
    };

    return (
        <section>
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Assigned Forms</h2>
                <p className="text-[13px] text-gray-500 mt-0.5">Core tasks required for your enrollment profile.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {forms.map((form) => {
                    const formRoute = getFormRoute(form.id, form.name, form.description);
                    // Check if it's a valid route (not empty and not just company ID)
                    const isLink = formRoute !== '#' && 
                                   formRoute !== `/forms/${form.id}` && 
                                   !form.description.startsWith('?id=');

                    // Clean up form name - remove any unwanted suffixes, patterns, or email addresses
                    let displayName = form.name.trim();
                    
                    // Remove leading dashes and spaces first
                    displayName = displayName.replace(/^[-\s]+/, '');
                    
                    // Remove "Assigned to:" prefix and email addresses
                    displayName = displayName.replace(/^Assigned to:\s*/i, '');
                    displayName = displayName.replace(/\bAssigned to:\s*/gi, '');
                    displayName = displayName.replace(/\b[\w\.-]+@[\w\.-]+\.\w+\b/g, '');
                    
                    // Remove company name prefixes (e.g., "Endue - Quick Start" -> "Quick Start")
                    // Pattern: "CompanyName - FormName" or "CompanyName: FormName"
                    // If name contains " - " (with spaces), split and take the part after the dash
                    if (displayName.includes(' - ')) {
                        const parts = displayName.split(' - ');
                        if (parts.length > 1) {
                            // Take the last part (the form name)
                            displayName = parts[parts.length - 1].trim();
                        }
                    }
                    // Also handle colon pattern: "CompanyName: FormName"
                    if (displayName.includes(': ')) {
                        const parts = displayName.split(': ');
                        if (parts.length > 1) {
                            // Take the last part (the form name)
                            displayName = parts[parts.length - 1].trim();
                        }
                    }
                    
                    // Remove patterns like "(Original)", trailing dashes
                    displayName = displayName.replace(/\s*\(Original\)\s*/gi, '');
                    displayName = displayName.replace(/\s*-\s*$/, ''); // Remove trailing dashes
                    // Only remove specific unwanted patterns in parentheses, not all parentheses
                    displayName = displayName.replace(/\s*\((Original|Copy|Duplicate)\)\s*/gi, '');
                    
                    // Remove common unwanted prefixes
                    displayName = displayName.replace(/^(Form|Survey|Intake):\s*/i, '');
                    
                    // Final cleanup - remove any remaining leading dashes or spaces
                    displayName = displayName.replace(/^[-\s]+/, '').trim();
                    
                    // If name is empty after cleaning, use a fallback
                    if (!displayName || displayName.length === 0) {
                        displayName = 'Untitled Form';
                    }

                    return (
                        <div key={form.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between hover:border-gray-300 transition-colors">
                            <div>
                                <div className="flex justify-between items-start mb-5">
                                    <div className="w-11 h-11 bg-gray-50 rounded-md flex items-center justify-center text-gray-400 border border-gray-100">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <span className={`text-[12px] font-semibold uppercase tracking-wider px-3 py-1 rounded-md border ${getStatusStyle(form.status)}`}>
                                        {getStatusLabel(form.status)}
                                    </span>
                                </div>
                                <h3 className="text-[17px] font-bold text-gray-900 mb-8 leading-tight">{displayName || 'Untitled Form'}</h3>
                            </div>
                            {isLink ? (
                                formRoute.startsWith('http://') || formRoute.startsWith('https://') ? (
                                    <a href={formRoute} target="_blank" rel="noopener noreferrer" className="block">
                                        <button 
                                            className={`w-full py-2.5 rounded-md font-semibold text-[12px] transition-all shadow-sm active:scale-[0.98] ${
                                                form.status === FormStatus.SUBMITTED || form.status === FormStatus.COMPLETED
                                                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                                    : 'bg-brand-500 text-white hover:bg-brand-600'
                                            }`}
                                            disabled={form.status === FormStatus.SUBMITTED || form.status === FormStatus.COMPLETED}
                                        >
                                            {form.status === FormStatus.NOT_STARTED 
                                                ? 'Start Form' 
                                                : form.status === FormStatus.SUBMITTED || form.status === FormStatus.COMPLETED
                                                    ? 'Already Submitted'
                                                    : form.status === FormStatus.IN_PROGRESS
                                                        ? 'Update'
                                                        : 'Continue'}
                                        </button>
                                    </a>
                                ) : (
                                    <Link href={formRoute} className="block">
                                        <button 
                                            className={`w-full py-2.5 rounded-md font-semibold text-[12px] transition-all shadow-sm active:scale-[0.98] ${
                                                form.status === FormStatus.SUBMITTED || form.status === FormStatus.COMPLETED
                                                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                                    : 'bg-brand-500 text-white hover:bg-brand-600'
                                            }`}
                                            disabled={form.status === FormStatus.SUBMITTED || form.status === FormStatus.COMPLETED}
                                        >
                                            {form.status === FormStatus.NOT_STARTED 
                                                ? 'Start Form' 
                                                : form.status === FormStatus.SUBMITTED || form.status === FormStatus.COMPLETED
                                                    ? 'Already Submitted'
                                                    : form.status === FormStatus.IN_PROGRESS
                                                        ? 'Update'
                                                        : 'Continue'}
                                        </button>
                                    </Link>
                                )
                            ) : (
                                <button
                                    className="w-full py-2.5 bg-gray-100 text-gray-400 rounded-md font-semibold text-[12px] cursor-not-allowed"
                                    disabled
                                >
                                    Coming Soon
                                </button>
                            )}
                        </div>
                    );
                })}
                {forms.length === 0 && (
                    <div className="col-span-full bg-gray-50 border border-dashed border-gray-300 rounded-xl p-12 text-center">
                        <p className="text-gray-500 font-medium">No forms currently assigned.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default AssignedForms;
