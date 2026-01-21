'use client';

import React from 'react';
import { FormSectionData, FormValues } from '@/types/form';

interface Props {
    section: FormSectionData;
    values: FormValues;
    errors: Record<string, string>;
    onChange: (id: string, value: any) => void;
}

const FormSection: React.FC<Props> = ({ section, values, errors, onChange }) => {
    return (
        <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{section.title}</h3>
            {section.description && (
                <p className="text-sm text-gray-500 mb-4">{section.description}</p>
            )}

            <div className="space-y-5">
                {section.questions.map((question) => (
                    <div key={question.id} className="flex flex-col">
                        <label htmlFor={question.id} className="text-[13px] font-semibold text-gray-700 mb-1.5 ml-0.5">
                            {question.label} {question.required && <span className="text-red-500">*</span>}
                        </label>

                        {question.type === 'text' || question.type === 'email' || question.type === 'number' || question.type === 'date' ? (
                            <input
                                type={question.type}
                                id={question.id}
                                value={values[question.id] || ''}
                                onChange={(e) => onChange(question.id, e.target.value)}
                                placeholder={question.placeholder}
                                className={`px-3 py-2.5 rounded-md border text-[14px] outline-none transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-brand-100 ${errors[question.id]
                                        ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-400'
                                        : 'border-gray-200 bg-white text-gray-900 focus:border-brand-400'
                                    }`}
                            />
                        ) : question.type === 'textarea' ? (
                            <textarea
                                id={question.id}
                                value={values[question.id] || ''}
                                onChange={(e) => onChange(question.id, e.target.value)}
                                placeholder={question.placeholder}
                                rows={4}
                                className={`px-3 py-2.5 rounded-md border text-[14px] outline-none transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-brand-100 ${errors[question.id]
                                        ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-400'
                                        : 'border-gray-200 bg-white text-gray-900 focus:border-brand-400'
                                    }`}
                            />
                        ) : question.type === 'select' ? (
                            <div className="relative">
                                <select
                                    id={question.id}
                                    value={values[question.id] || ''}
                                    onChange={(e) => onChange(question.id, e.target.value)}
                                    className={`w-full px-3 py-2.5 rounded-md border text-[14px] outline-none transition-all appearance-none cursor-pointer focus:ring-2 focus:ring-brand-100 ${errors[question.id]
                                            ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-400'
                                            : 'border-gray-200 bg-white text-gray-900 focus:border-brand-400'
                                        }`}
                                >
                                    <option value="" disabled>Select an option</option>
                                    {question.options?.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        ) : question.type === 'radio' ? (
                            <div className="space-y-2">
                                {question.options?.map((opt) => (
                                    <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative flex items-center justify-center w-5 h-5">
                                            <input
                                                type="radio"
                                                name={question.id}
                                                value={opt.value}
                                                checked={values[question.id] === opt.value}
                                                onChange={(e) => onChange(question.id, e.target.value)}
                                                className="peer appearance-none w-5 h-5 border border-gray-300 rounded-full checked:border-brand-500 checked:bg-brand-500 transition-all"
                                            />
                                            <div className="absolute w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                        </div>
                                        <span className="text-[14px] text-gray-700 group-hover:text-gray-900 transition-colors">
                                            {opt.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        ) : null}

                        {errors[question.id] && (
                            <span className="text-[12px] text-red-500 font-medium mt-1.5 flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {errors[question.id]}
                            </span>
                        )}
                        {question.helperText && !errors[question.id] && (
                            <span className="text-[12px] text-gray-400 mt-1.5">{question.helperText}</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FormSection;
