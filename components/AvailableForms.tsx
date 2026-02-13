'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AvailableForm } from '@/types';

interface Props {
  forms: AvailableForm[];
}

const FormCard: React.FC<{ form: AvailableForm; onStart?: (form: AvailableForm) => void }> = ({ form, onStart }) => {
  const router = useRouter();

  const handleOpen = () => {
    if (onStart) {
      onStart(form);
    } else {
      // Try to navigate to form if route exists
      const formRoute = `/forms/${form.id.toLowerCase()}`;
      router.push(formRoute);
    }
  };

  return (
    <div className="group bg-white border border-gray-100 rounded-lg p-5 hover:border-brand-200 hover:shadow-sm transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-10">
      <div className="flex-shrink-0 md:w-1/4">
        <h3 className="text-[15px] font-bold text-gray-900 group-hover:text-brand-600 transition-colors tracking-tight">
          {form.name}
        </h3>
      </div>
      <div className="flex-1">
        <p className="text-[13px] text-gray-600 font-normal leading-relaxed">
          {form.description}
        </p>
      </div>
      <div className="flex-shrink-0 text-right">
        <button 
          onClick={handleOpen}
          className="px-5 py-1.5 border border-brand-500 rounded-md text-[11px] font-semibold text-brand-500 hover:bg-brand-50 transition-all active:scale-95 uppercase tracking-wide"
        >
          Open
        </button>
      </div>
    </div>
  );
};

const AvailableForms: React.FC<Props> = ({ forms }) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<AvailableForm | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  const handleStartForm = async (form: AvailableForm) => {
    setSelectedForm(form);
    setIsAssigning(true);

    try {
      const response = await fetch('/api/forms/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId: form.id }),
      });

      if (response.ok) {
        router.refresh();
        setTimeout(() => {
          window.location.href = '/';
        }, 300);
      }
    } catch (error) {
      console.error('Error assigning form:', error);
    } finally {
      setIsAssigning(false);
      setSelectedForm(null);
    }
  };

  const visibleForms = forms.slice(0, 5);

  return (
    <>
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Available Forms</h2>
          <p className="text-sm text-gray-600 font-normal">Complete these forms to progress through your enrollment.</p>
        </div>
        <div className="flex flex-col gap-3">
          {visibleForms.map((form) => (
            <FormCard key={form.id} form={form} onStart={handleStartForm} />
          ))}
        </div>
        {forms.length > 5 && (
          <div className="mt-8 flex justify-center">
             <button 
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-2.5 border border-gray-200 rounded-md text-[11px] font-semibold text-gray-900 hover:border-gray-400 hover:bg-white transition-all active:scale-95 shadow-sm uppercase tracking-widest"
             >
               View more
             </button>
          </div>
        )}
      </section>

      {/* Full Modal for All Available Forms */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/10 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">All Intake Modules</h2>
                <p className="text-sm text-gray-500 font-normal">Choose a module to complete your profile.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-md text-gray-400 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-8 overflow-y-auto flex flex-col gap-3 bg-gray-50/30">
              {forms.map((form) => (
                <FormCard key={form.id} form={form} onStart={handleStartForm} />
              ))}
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button onClick={() => setIsModalOpen(false)} className="bg-brand-500 text-white px-10 py-3 rounded-md font-semibold text-[12px] hover:bg-brand-600 transition-all shadow-lg uppercase tracking-widest">Close List</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AvailableForms;
