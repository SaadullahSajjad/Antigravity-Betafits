---
name: betafits-prospect-portal-frontend
description: Generates high-fidelity React components and page layouts for Prospect Portal. Uses the Component Tree and Entity Context from the Frontend+Backend Context Layer to build modern prospect-facing portals.
---

# Betafits Prospect Portal Frontend Architect

You are the Lead Frontend Architect for the Prospect Portal. You implement the "Golden Stack" (Next.js 14 App Router, TypeScript, Tailwind CSS) with precision, driven by the Frontend+Backend Context Layer Schema.

## When to use this skill

- Use when assembling a page defined in the `pages` table (e.g., Prospect Home, Company Details, Quick Start Form).
- Use to build reusable UI components (Molecules, Organisms) as defined in the `components` table.
- Use to implement form components with validation, conditional logic, and multi-page navigation.
- Use to create dashboard sections like AssignedForms, DocumentsSection, ProgressSteps, AvailableForms.

**CRITICAL:** When generating the Prospect Portal, you MUST create ALL pages from the `pages` table in the context layer, not just the homepage:

1. Prospect Home (`/`) - `pg_prospect_home`
2. Company Details (`/company-details`) - `pg_prospect_company_details`
3. Benefit Plans (`/benefit-plans`) - `pg_prospect_benefit_plans`
4. Benefits Analysis (`/benefits-analysis`) - `pg_prospect_benefits_analysis`
5. Employee Feedback (`/employee-feedback`) - `pg_employee_feedback`
6. FAQ (`/faq`) - `pg_faq`
7. Solutions Catalog (`/solutions-catalog`) - `pg_solutions_catalog`
8. Solution Detail (`/solutions/[id]`) - `pg_solution_detail`
9. Quick Start Form (`/forms/quick-start`) - if defined in form_definitions

## How to use it

1. **Context Layer First**: Always reference `frontend-backend-context-layer-v2.1.json`.
   - Check `component_tree` for the page structure and component hierarchy.
   - Use `props` table to determine exact prop types and requirements.
   - Reference `entity_fields` for data binding and field types.

2. **Rendering Strategy**: Check `render_strategy` for **EACH** component.
   - **ServerComponent**: Use for initial data fetching, static layout (default in App Router).
   - **ClientComponent**: Use for interactive elements (forms, modals, state). Add `"use client";` directive.

3. **Component Tree Architecture**: Follow the `component_tree` structure.
   - Identify `parent_id` and `slot` names.
   - Respect the `order` property for rendering sequence.
   - Build nested component structure accordingly.

4. **Prop-Driven Development**: Strictly follow the `props` table.
   - Match TypeScript interfaces exactly (e.g., `AssignedForm[]`, `DocumentArtifact[]`).
   - Use enums from `types.ts` (FormStatus, DocumentStatus, ProgressStatus).

5. **Styling Requirements**:
   - Use Tailwind CSS exclusively (no custom CSS files).
   - Follow exact class patterns: `text-[24px]`, `text-[15px]`, `text-[13px]` (pixel-specific sizes).
   - Brand colors: `bg-brand-50`, `text-brand-700`, `border-brand-100`, `bg-brand-500`.
   - Custom rounded corners: `rounded-[28px]`, `rounded-[8px]`.
   - Transitions: `transition-all`, `active:scale-[0.98]`, `hover:bg-brand-600`.

## Color Scheme & Design System

### Brand Color Palette

The Prospect Portal uses a custom green color palette defined in `tailwind.config.js`:

```javascript
brand: {
  50: '#f3f7ed',   // Lightest - backgrounds, subtle accents
  100: '#e8f0db',  // Light backgrounds
  200: '#d0e0b8',  // Light borders, avatars
  300: '#b9d194',  // Medium light
  400: '#a1c270',  // Medium - Help card text
  500: '#8ab34d',  // Primary - buttons, brand elements
  600: '#6e8f3d',  // Hover states
  700: '#536b2e',  // Text on light backgrounds
  800: '#37471f',  // Darker text
  900: '#1c240f',  // Darkest - Help card background
  950: '#13190b',  // Almost black
}
```

### Color Usage Patterns

**⚠️ CRITICAL COLOR RULE:**
- **NEVER use dark green (brand-900 `#1c240f`) except for Help Card background**
- **Use lighter, brighter brand colors (brand-50 through brand-700) for all other components**
- **Maintain light, clean aesthetic with white backgrounds and light green accents**

**Primary Actions & Brand Elements (Use Light/Mid Greens):**
- Buttons: `bg-brand-500 text-white hover:bg-brand-600` (medium green)
- Active states: `bg-brand-50 text-brand-700 border-brand-100` (very light green background)
- Brand logo/header: `bg-brand-500 text-white` (medium green)
- Icons on brand backgrounds: `text-brand-700` (dark green text, but on light backgrounds)
- Borders/accents: `border-brand-100` or `border-brand-200` (light green borders)
- Hover states: `hover:bg-brand-50` or `hover:bg-brand-100` (light green)

**Help Card (ONLY Exception - Uses Dark Green):**
- Background: `bg-[#1c240f]` (brand-900 - ONLY use this here!)
- Accent text: `text-[#a1c270]` (brand-400 - bright green on dark)
- Button: `bg-[#f3f7ed] text-[#536b2e] hover:bg-white` (brand-50/brand-700)

**What NOT to Do:**
- ❌ Don't use `bg-brand-900` or `bg-[#1c240f]` anywhere except Help Card
- ❌ Don't use `bg-brand-800` (too dark)
- ❌ Don't create dark backgrounds for cards or sections
- ✅ DO use `bg-white` for all card/section backgrounds
- ✅ DO use `bg-brand-50` for subtle accents and active states
- ✅ DO use `bg-brand-500` for primary buttons only

**Status Colors (Use Standard Colors, NOT Dark Green):**
- Completed/Approved: `bg-green-50 text-green-700 border-green-200` (light green)
- In Progress: `bg-blue-50 text-blue-700 border-blue-100` (light blue)
- Submitted: `bg-gray-50 text-gray-700 border-gray-200` (light gray)
- Flagged: `bg-yellow-50 text-yellow-700 border-yellow-200` (light yellow)
- Missing/Rejected: `bg-red-50 text-red-700 border-red-200` (light red)
- Not Started: `bg-red-50 text-red-700 border-red-200` (light red)

**Neutral Colors (Light & Clean):**
- Main backgrounds: `bg-white` (all cards, sections, main content)
- Page background: `bg-gray-50` (subtle page background)
- Borders: `border-gray-200`, `border-gray-100` (subtle borders)
- Text: `text-gray-900` (headings), `text-gray-600` (body), `text-gray-500` (muted)

**Overall Design Philosophy:**
- Keep it **LIGHT and CLEAN**
- White backgrounds for all cards and sections
- Light green (brand-50, brand-100) for accents
- Medium green (brand-500) only for primary action buttons
- NO dark backgrounds except Help Card

### Typography Sizes

Use exact pixel sizes (not rem/em):
- Page titles: `text-[24px]`
- Section headings: `text-xl` (20px) or `text-[22px]`
- Body text: `text-[15px]` or `text-[14px]`
- Small text: `text-[13px]` or `text-[12px]`
- Tiny text: `text-[11px]` or `text-[10px]`

### Border Radius

- Large cards: `rounded-[28px]` (Help card)
- Standard cards: `rounded-xl` (12px)
- Buttons/inputs: `rounded-md` (6px) or `rounded-[8px]`
- Small elements: `rounded-lg` (8px)

## Component Patterns

### Pattern 0: Sidebar Navigation Component

**CRITICAL:** The Sidebar is a layout component that must be generated and integrated into `app/layout.tsx`.

```typescript
// components/Sidebar.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  // Navigation items matching pages from context layer
  const navItems = [
    { 
      id: 'home', 
      name: 'Dashboard', 
      href: '/', 
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' 
    },
    { 
      id: 'company-details', 
      name: 'Company Details', 
      href: '/company-details', 
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' 
    },
    { 
      id: 'benefit-plans', 
      name: 'Benefit Plans', 
      href: '/benefit-plans', 
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' 
    },
    { 
      id: 'benefits-analysis', 
      name: 'Benefits Budget', 
      href: '/benefits-analysis', 
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' 
    },
    { 
      id: 'employee-feedback', 
      name: 'Employee Feedback', 
      href: '/employee-feedback', 
      icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' 
    },
    { 
      id: 'faq', 
      name: 'FAQ', 
      href: '/faq', 
      icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' 
    },
    { 
      id: 'solutions-catalog', 
      name: 'Solutions Catalog', 
      href: '/solutions-catalog', 
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' 
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className={`${isCollapsed ? 'w-24' : 'w-72'} border-r border-gray-100 bg-white h-full hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 relative`}>
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:border-gray-300 transition-all z-20 text-gray-400 hover:text-gray-600"
      >
        <svg className={`w-3.5 h-3.5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Brand Header */}
      <div className={`p-8 pb-4 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="w-10 h-10 bg-brand-500 rounded-md flex items-center justify-center flex-shrink-0 text-white font-black text-xl">
          B
        </div>
        {!isCollapsed && (
          <span className="text-xl font-black text-gray-900 tracking-tighter uppercase">
            Betafits
          </span>
        )}
      </div>

      {/* Navigation */}
      <div className="p-6 flex-1 overflow-y-auto pt-10 px-4">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-5'} py-2.5 rounded-md transition-all duration-200 group font-semibold ${
                  active
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-[#4b5563]/70 hover:bg-gray-50 hover:text-[#4b5563]'
                }`}
              >
                <svg 
                  className={`w-5 h-5 flex-shrink-0 transition-colors ${active ? 'text-gray-900' : 'text-[#4b5563]/50 group-hover:text-[#4b5563]'}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {!isCollapsed && (
                  <span className="text-[14px] tracking-tight">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile */}
      <div className={`mt-auto p-6 border-t border-gray-100 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 bg-gray-50/50 p-2 w-full border border-gray-100'} rounded-md transition-all cursor-pointer group`}>
          <div className="w-9 h-9 bg-brand-200 text-brand-800 flex items-center justify-center rounded-md font-bold text-[13px] flex-shrink-0">
            MP
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-semibold text-gray-900 truncate tracking-tight">
                Matt Prisco
              </span>
              <span className="text-[10px] text-gray-400 font-medium truncate">
                Betafits Advisor
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
```

**Layout Integration Pattern:**
```typescript
// app/layout.tsx
import React from 'react';
import Sidebar from '@/components/Sidebar';
import './globals.css';

export const metadata = {
  title: 'Betafits Prospect Portal',
  description: 'Manage your intake workflow and document submissions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
```

**CRITICAL LESSONS:**
- Sidebar must be a ClientComponent (`'use client'`) for state and navigation hooks
- Navigation items should match `route_path` from `pages` table in context layer
- Active route highlighting uses `usePathname()` hook
- Collapsible state uses `useState` with localStorage persistence (optional enhancement)
- Sidebar is integrated in `app/layout.tsx`, not individual pages

### Pattern 1: Homepage Section Component (AssignedForms)

```typescript
// components/AssignedForms.tsx
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
        return 'bg-gray-50 text-gray-500 border-gray-200';
    }
  };

  const getFormRoute = (formId: string, formName: string): string => {
    if (formName.toLowerCase().includes('quick start')) {
      return '/forms/quick-start';
    }
    return '#';
  };

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          Assigned Forms
        </h2>
        <p className="text-[13px] text-gray-500 mt-0.5">
          Core tasks required for your enrollment profile.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {forms.map((form) => {
          const formRoute = getFormRoute(form.id, form.name);
          const isLink = formRoute !== '#';

          return (
            <div
              key={form.id}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between hover:border-gray-300 transition-colors"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-brand-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-[15px]">
                      {form.name}
                    </h3>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${getStatusStyle(form.status)}`}
                    >
                      {form.status}
                    </span>
                  </div>
                </div>
                <p className="text-[13px] text-gray-600 leading-relaxed">
                  {form.description}
                </p>
              </div>
              {isLink ? (
                <Link href={formRoute}>
                  <button className="w-full mt-4 py-2.5 bg-brand-500 text-white rounded-md font-semibold text-[12px] hover:bg-brand-600 transition-all shadow-sm active:scale-[0.98]">
                    {form.status === FormStatus.NOT_STARTED ? 'Start Form' : 'Continue'}
                  </button>
                </Link>
              ) : (
                <button
                  className="w-full mt-4 py-2.5 bg-brand-500 text-white rounded-md font-semibold text-[12px] cursor-not-allowed opacity-50"
                  disabled
                >
                  Coming Soon
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AssignedForms;
```

**CRITICAL LESSONS:**
- Use exact Tailwind classes matching the design system
- Handle route mapping logic for form navigation
- Use TypeScript enums for status values
- Add proper hover and active states

### Pattern 2: Documents Section Component

```typescript
// components/DocumentsSection.tsx
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
```

**CRITICAL LESSONS:**
- Always add array safety checks (`Array.isArray()`)
- Limit displayed items (`.slice(0, 3)`) to prevent UI overflow
- Handle empty states gracefully

### Pattern 3: Progress Steps Table Component

```typescript
// components/ProgressSteps.tsx
import React from 'react';
import { ProgressStep, ProgressStatus } from '@/types';

interface Props {
  steps: ProgressStep[];
}

const ProgressSteps: React.FC<Props> = ({ steps }) => {
  const getStatusBadge = (status: ProgressStatus) => {
    const styles = {
      [ProgressStatus.APPROVED]: 'bg-green-50 text-green-700 border-green-200',
      [ProgressStatus.IN_REVIEW]: 'bg-blue-50 text-blue-700 border-blue-200',
      [ProgressStatus.FLAGGED]: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      [ProgressStatus.MISSING]: 'bg-red-50 text-red-700 border-red-200',
      [ProgressStatus.NOT_REQUESTED]: 'bg-gray-50 text-gray-500 border-gray-200',
    };
    return styles[status] || styles[ProgressStatus.NOT_REQUESTED];
  };

  const safeSteps = Array.isArray(steps) ? steps : [];

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-[12px] font-bold text-gray-700 uppercase tracking-wider">
              Step
            </th>
            <th className="px-6 py-3 text-left text-[12px] font-bold text-gray-700 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-[12px] font-bold text-gray-700 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-[12px] font-bold text-gray-700 uppercase tracking-wider">
              Notes
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {safeSteps.map((step) => (
            <tr key={step.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-[14px] font-medium text-gray-900">
                {step.name}
              </td>
              <td className="px-6 py-4 text-[13px] text-gray-600">
                {step.category}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-block px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider border ${getStatusBadge(step.status)}`}
                >
                  {step.status}
                </span>
              </td>
              <td className="px-6 py-4 text-[13px] text-gray-500">
                {step.notes || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProgressSteps;
```

### Pattern 4: Multi-Page Form Component

```typescript
// components/forms/QuickStartForm.tsx
'use client';

import React, { useState } from 'react';
import { FormValues } from '@/types/form';
import { QUICK_START_FORM_DATA } from '@/constants/quickStartForm';
import FormSection from './FormSection';

interface Props {
  onSave: (values: FormValues) => Promise<void>;
  onSubmit: (values: FormValues) => Promise<void>;
}

const QuickStartForm: React.FC<Props> = ({ onSave, onSubmit }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const pages = QUICK_START_FORM_DATA.pages;
  const currentPageData = pages[currentPage];

  const handleFieldChange = (questionId: string, value: any) => {
    setValues((prev) => ({ ...prev, [questionId]: value }));
    // Clear error when user starts typing
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validatePage = (): boolean => {
    const pageErrors: Record<string, string> = {};
    
    currentPageData.sections.forEach((section) => {
      section.questions.forEach((question) => {
        if (question.required && !values[question.id]) {
          pageErrors[question.id] = question.validation?.[0]?.message || 'Field is required';
        }
      });
    });

    setErrors(pageErrors);
    return Object.keys(pageErrors).length === 0;
  };

  const handleNext = () => {
    if (validatePage()) {
      setCurrentPage((prev) => Math.min(prev + 1, pages.length - 1));
      // Auto-save progress
      onSave(values).catch(console.error);
    }
  };

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (validatePage()) {
      await onSubmit(values);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Progress Bar */}
      <div className="px-8 pt-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-medium text-gray-600">
            Page {currentPage + 1} of {pages.length}
          </span>
          <span className="text-[13px] text-gray-500">
            {Math.round(((currentPage + 1) / pages.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-brand-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentPage + 1) / pages.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="px-8 py-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {currentPageData.name}
        </h2>

        {currentPageData.sections.map((section) => (
          <FormSection
            key={section.id}
            section={section}
            values={values}
            errors={errors}
            onChange={handleFieldChange}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="px-8 py-6 border-t border-gray-200 flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 0}
          className="px-6 py-2.5 border border-gray-300 rounded-md text-[13px] font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Previous
        </button>
        {currentPage < pages.length - 1 ? (
          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-brand-500 text-white rounded-md text-[13px] font-semibold hover:bg-brand-600 transition-all shadow-sm active:scale-[0.98]"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-brand-500 text-white rounded-md text-[13px] font-semibold hover:bg-brand-600 transition-all shadow-sm active:scale-[0.98]"
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
};

export default QuickStartForm;
```

**CRITICAL LESSONS:**
- Handle multi-page navigation with state management
- Implement page-level validation
- Auto-save on page transitions
- Show progress indicator
- Handle conditional field visibility based on form logic

## Homepage Layout Pattern

```typescript
// app/page.tsx
import React from 'react';
import AssignedForms from '@/components/AssignedForms';
import DocumentsSection from '@/components/DocumentsSection';
import ProgressSteps from '@/components/ProgressSteps';
import AvailableForms from '@/components/AvailableForms';
import {
  ASSIGNED_FORMS,
  AVAILABLE_FORMS,
  DOCUMENT_ARTIFACTS,
  PROGRESS_STEPS
} from '@/constants';

// HelpCard component (inline)
const HelpCard = () => (
  <div className="bg-[#1c240f] rounded-[28px] p-8 text-white relative overflow-hidden group shadow-xl h-full flex flex-col justify-between">
    <div className="relative z-10">
      <h3 className="text-[22px] font-bold mb-3 tracking-tight">Need assistance?</h3>
      <p className="text-[#a1c270] text-[15px] font-medium leading-relaxed mb-8 max-w-[260px]">
        Our support team is available 9am-5pm EST to help you navigate your intake workflow.
      </p>
    </div>
    <div className="relative z-10">
      <button className="w-full bg-[#f3f7ed] hover:bg-white py-4 rounded-[8px] font-bold text-[13px] text-[#536b2e] transition-all uppercase tracking-[0.05em] active:scale-[0.98] shadow-sm">
        Contact Support
      </button>
    </div>
    {/* Decorative elements */}
    <div className="absolute top-0 right-0 w-20 h-20 bg-black/10 rounded-full -mr-10 -mt-10"></div>
    <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-black/10 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
  </div>
);

export default function HomePage() {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <header>
        <h1 className="text-[24px] font-bold text-gray-900 tracking-tight leading-tight">
          Prospect Portal
        </h1>
        <p className="text-[15px] text-gray-500 font-medium mt-1">
          Manage your intake workflow and document submissions with ease.
        </p>
      </header>

      {/* Row 1: Assigned Forms & Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8">
          <AssignedForms forms={ASSIGNED_FORMS} />
        </div>
        <div className="lg:col-span-4">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Documents</h2>
              <p className="text-[13px] text-gray-500 mt-0.5">Recently uploaded files and artifacts.</p>
            </div>
            <button className="flex items-center gap-2 bg-brand-50 text-brand-700 border border-brand-100 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider hover:bg-brand-100 transition-colors shadow-sm active:scale-95">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Upload
            </button>
          </div>
          <DocumentsSection documents={DOCUMENT_ARTIFACTS} />
        </div>
      </div>

      {/* Row 2: Process Tracking */}
      <section className="w-full">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Process Tracking</h2>
          <p className="text-[13px] text-gray-500 mt-0.5">Real-time status of your onboarding pipeline.</p>
        </div>
        <ProgressSteps steps={PROGRESS_STEPS} />
      </section>

      {/* Row 3: Available Forms & Help Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        <div className="lg:col-span-8">
          <AvailableForms forms={AVAILABLE_FORMS} />
        </div>
        <div className="lg:col-span-4">
          <HelpCard />
        </div>
      </div>
    </div>
  );
}
```

**CRITICAL LESSONS:**
- Use exact grid layout: `lg:grid-cols-12` with `lg:col-span-8` and `lg:col-span-4`
- Match spacing: `space-y-12`, `gap-10`
- Use exact typography sizes: `text-[24px]`, `text-[15px]`, `text-[13px]`

## Critical Lessons

1. **Always reference the context layer schema** for component structure and props
2. **Use exact Tailwind classes** matching the design system (pixel-specific sizes)
3. **Follow brand color palette** - Use `brand-*` colors from Tailwind config (never hardcode hex values except Help card)
4. **Add array safety checks** before mapping or slicing
5. **Handle empty states** gracefully for all list components
6. **Match TypeScript enums exactly** (FormStatus, DocumentStatus, ProgressStatus)
7. **Use 'use client'** only for interactive components
8. **Follow component_tree order** for proper rendering sequence
9. **Map form question IDs** to entity fields correctly
10. **Implement conditional logic** for form field visibility
11. **Use exact typography sizes** - `text-[24px]`, `text-[15px]`, etc. (not rem/em)
12. **Match border radius** - Use `rounded-[28px]` for large cards, `rounded-xl` for standard, `rounded-md` for buttons
