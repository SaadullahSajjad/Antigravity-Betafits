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

    const getFormRoute = (formId: string, formName: string, description: string): string => {
        // Map all 17 forms by ID (most reliable)
        const formRouteMap: Record<string, string> = {
            // Fillout forms (4)
            'eBxXtLZdK4us': '/forms/ebxxtlzdk4us',
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
        
        // Quick Start forms
        if (formNameLower.includes('quick start') && formNameLower.includes('multi-page')) {
            return '/forms/ebxxtlzdk4us';
        }
        if (formNameLower.includes('quick start') && formNameLower.includes('new benefits')) {
            return '/forms/recluq6khvzcssuvl';
        }
        if (formNameLower.includes('quick start') || formNameLower.includes('quickstart')) {
            if (formNameLower.includes('update')) {
                return '/forms/rzhieaueskus';
            }
            return '/forms/recufwirusfarz9gg'; // Quick Start (alt)
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {forms.map((form) => {
                    const formRoute = getFormRoute(form.id, form.name, form.description);
                    // Check if it's a valid route (not empty and not just company ID)
                    const isLink = formRoute !== '#' && 
                                   formRoute !== `/forms/${form.id}` && 
                                   !form.description.startsWith('?id=');

                    return (
                        <div
                            key={form.id}
                            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between hover:border-gray-300 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="font-bold text-gray-900 text-[16px]">
                                    {form.name}
                                </h3>
                                <span
                                    className={`inline-block px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${getStatusStyle(form.status)}`}
                                >
                                    {form.status === FormStatus.NOT_STARTED ? 'Not Started' : form.status}
                                </span>
                            </div>
                            {isLink ? (
                                formRoute.startsWith('http://') || formRoute.startsWith('https://') ? (
                                    <a href={formRoute} target="_blank" rel="noopener noreferrer">
                                        <button className="w-full py-3 bg-brand-500 text-white rounded-lg font-bold text-[14px] hover:bg-brand-600 transition-all shadow-sm active:scale-[0.98]">
                                            Open
                                        </button>
                                    </a>
                                ) : (
                                    <Link href={formRoute}>
                                        <button className="w-full py-3 bg-brand-500 text-white rounded-lg font-bold text-[14px] hover:bg-brand-600 transition-all shadow-sm active:scale-[0.98]">
                                            Open
                                        </button>
                                    </Link>
                                )
                            ) : (
                                <button
                                    className="w-full py-3 bg-brand-500 text-white rounded-lg font-bold text-[14px] cursor-not-allowed opacity-50"
                                    disabled
                                >
                                    Coming Soon
                                </button>
                            )}
                        </div>
                    );
                })}
                {forms.length === 0 && (
                    <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-12 text-center">
                        <p className="text-gray-500 font-medium">No forms currently assigned.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default AssignedForms;
