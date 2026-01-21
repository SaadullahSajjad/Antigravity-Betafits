# Prospect Portal Page Generation Process - Complete Documentation

## Overview
This document captures the complete process used to generate Prospect Portal pages from the `frontend-backend-context-layer-v2.1.json` context layer schema. It includes the methodology, data flow patterns, lessons learned, and mistakes to avoid for future page generation.

---

## Phase 1: Schema Analysis & Planning

### 1.1 Initial Schema Review
**Goal:** Understand the page structure and data requirements

**Steps:**
1. Read `frontend-backend-context-layer-v2.1.json`
2. Identify the target page from the `pages` table (e.g., `pg_prospect_home`)
3. Review the `component_tree` to understand component hierarchy
4. Map out all entities and their fields from `entity_fields`
5. Note all API endpoints defined in `api_endpoint`
6. Identify any entity relationships from `entity_relationships`

**Key Questions to Answer:**
- What are the main sections of the page?
- Which components are common vs. page-specific?
- What data sources (Airtable tables) are needed?
- Are there any linked/lookup fields that require joins?
- What are the expected data transformations?

**Example for Homepage:**
- Page ID: `pg_prospect_home`
- Components: `cmp_assigned_forms`, `cmp_documents`, `cmp_progress_steps`, `cmp_available_forms`
- Entities: `ent_assigned_forms`, `ent_intake_document_upload`, `ent_available_forms`
- API Endpoints: `api_get_assigned_forms`, `api_get_documents`, `api_get_available_forms`

### 1.2 Component Tree Analysis
**Goal:** Understand component hierarchy and rendering order

**Steps:**
1. Filter `component_tree` by `page_id` (e.g., `pg_prospect_home`)
2. Identify parent-child relationships
3. Note the `order` property for rendering sequence
4. Check `render_strategy` (ServerComponent vs ClientComponent)

**Example Structure:**
```json
{
  "id": "node_home_assigned_forms",
  "page_id": "pg_prospect_home",
  "component_id": "cmp_assigned_forms",
  "slot": "main",
  "order": 0
}
```

### 1.3 Props & Types Analysis
**Goal:** Determine exact TypeScript interfaces needed

**Steps:**
1. Filter `props` by `component_id`
2. Map props to TypeScript types from `ts_type`
3. Check `types.ts` for existing enum definitions (FormStatus, DocumentStatus, ProgressStatus)
4. Verify all required props are present

**Example:**
- Component: `cmp_assigned_forms`
- Props: `forms: AssignedForm[]` (required)
- Type: `AssignedForm` with `id`, `name`, `status: FormStatus`, `description`

---

## Phase 2: Backend Implementation

### 2.1 Create Entity Mapping Functions
**Location:** `lib/mappings/`

**Steps:**
1. Create TypeScript interface matching `entity_fields` structure
2. Implement `map[Entity]` function that transforms Airtable records
3. Use helper functions for type safety
4. Handle linked record fields (arrays of Record IDs)

**Example Pattern:**
```typescript
// lib/mappings/mapAssignedForm.ts
import { Record } from "airtable";
import { AssignedForm, FormStatus } from "@/types";

export const mapAssignedForm = (record: Record<any>): AssignedForm => {
  const fields = record.fields;
  
  const getString = (val: any) => (typeof val === "string" ? val : "");
  
  return {
    id: record.id,
    name: getString(fields["Form Name"]),
    status: getString(fields["Status"]) as FormStatus,
    description: getString(fields["Description"]),
  };
};
```

**⚠️ CRITICAL LESSON:**
- **Always verify field names** via inspection scripts before implementing
- Schema field names may not match actual Airtable field names
- Linked record fields return arrays of IDs, not human-readable names

### 2.2 Create API Routes
**Location:** `app/api/[resource]/route.ts`

**Steps:**
1. Reference `api_endpoint` table for route structure
2. Use `source_config.base_id` (always `appdqgKk1fmhfaJoT` for Prospect Portal)
3. Use `physical_table_id` from `entities` table
4. Implement GET/POST handlers with mock data fallback
5. Return proper error status codes (500 for errors)

**Template:**
```typescript
// app/api/forms/assigned/route.ts
import { NextResponse } from "next/server";
import Airtable from "airtable";
import { AssignedForm, FormStatus } from "@/types";
import { mapAssignedForm } from "@/lib/mappings/mapAssignedForm";

const MOCK_DATA: AssignedForm[] = [
  {
    id: "recMock1",
    name: "Betafits Quick Start",
    status: FormStatus.NOT_STARTED,
    description: "Initial onboarding form for company information and benefits.",
  },
];

export async function GET() {
  const token = process.env.AIRTABLE_API_KEY;
  const baseId = "appdqgKk1fmhfaJoT";
  const tableId = "tblNeyKm9sKAKZq9n"; // From entities table

  if (!token) {
    console.warn("Missing AIRTABLE_API_KEY, returning mock data");
    return NextResponse.json(MOCK_DATA);
  }

  try {
    const base = new Airtable({ apiKey: token }).base(baseId);
    const records = await base(tableId).select({}).all();
    
    const forms = records.map(mapAssignedForm);
    return NextResponse.json(forms);
  } catch (error) {
    console.error("Airtable fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch assigned forms" },
      { status: 500 }
    );
  }
}
```

**⚠️ MISTAKES TO AVOID:**
- **Don't use view names in `.select()`** - causes 422 errors
- **Don't return error objects without status codes** - breaks error handling
- **Don't use fake IDs in mock data** - use real Record IDs when available

### 2.3 Create Form Submission Handlers
**Location:** `app/api/forms/quick-start/[action]/route.ts`

**Steps:**
1. Create mapping function from form question IDs to entity fields
2. Implement save handler (draft mode) - updates Assigned Forms table
3. Implement submit handler (final) - creates/updates Intake Group Data table
4. Handle validation based on `entity_fields.validation` rules

**Example:**
```typescript
// app/api/forms/quick-start/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import Airtable from "airtable";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { values } = body;

    const token = process.env.AIRTABLE_API_KEY;
    const baseId = "appdqgKk1fmhfaJoT";
    const tableId = "tbliXJ7599ngxEriO"; // Intake - Group Data

    if (!token) {
      return NextResponse.json({
        success: true,
        message: "Form submitted successfully (mock mode)",
        submittedAt: new Date().toISOString(),
      });
    }

    // Map form values to Airtable fields
    const mappedFields = {
      "Company Name": values["q-company-name"],
      "First Name": values["q-first-name"],
      "Last Name": values["q-last-name"],
      "Work Email": values["q-email"],
      "Phone": values["q-phone"],
      // ... map all fields
    };

    const base = new Airtable({ apiKey: token }).base(baseId);
    const records = await base(tableId).create([{ fields: mappedFields }]);

    return NextResponse.json({
      success: true,
      message: "Form submitted successfully",
      recordId: records[0].id,
      submittedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Form submission error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit form" },
      { status: 500 }
    );
  }
}
```

---

## Phase 3: Frontend Implementation

**CRITICAL ORDER:** Generate components in this exact order:
1. TypeScript Types
2. **Sidebar Component (MUST BE FIRST)**
3. Root Layout (integrates Sidebar)
4. Mock Constants
5. Common Components
6. Form Components
7. Page Assembly

### 3.1 Create TypeScript Types
**Location:** `types.ts` and `types/form.ts`

**Steps:**
1. Define enums matching context layer (FormStatus, DocumentStatus, ProgressStatus)
2. Create interfaces matching `props.ts_type` exactly
3. Ensure all types are exported and reusable

**Example:**
```typescript
// types.ts
export enum FormStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  SUBMITTED = 'Submitted',
  COMPLETED = 'Completed'
}

export interface AssignedForm {
  id: string;
  name: string;
  status: FormStatus;
  description: string;
}
```

### 3.2 Create Sidebar Component (CRITICAL - Layout Component)
**Location:** `components/Sidebar.tsx`

**Steps:**
1. **MUST generate first** - Sidebar is required for layout
2. Reference `pages` table from context layer for navigation items
3. Map each page's `route_path` to sidebar navigation
4. Implement collapsible functionality with state
5. Use `usePathname()` for active route highlighting
6. Include brand header and user profile footer

**Navigation Items Mapping:**
- Reference `pages` table from context layer
- Each `route_path` becomes a navigation link
- Use appropriate icons for each page type

**CRITICAL:** Sidebar must be integrated into `app/layout.tsx` as shown in Pattern 0 of frontend-skill.md

### 3.3 Create Mock Constants
**Location:** `constants.tsx`

**Steps:**
1. Create mock data arrays matching TypeScript interfaces
2. Use realistic sample data
3. Ensure enums match exactly

**Example:**
```typescript
// constants.tsx
import { AssignedForm, FormStatus } from '@/types';

export const ASSIGNED_FORMS: AssignedForm[] = [
  {
    id: 'form-1',
    name: 'Betafits Quick Start',
    status: FormStatus.NOT_STARTED,
    description: 'Initial onboarding form for company information and benefits.',
  },
  // ... more forms
];
```

### 3.4 Create Root Layout
**Location:** `app/layout.tsx`

**Steps:**
1. Import Sidebar component
2. Wrap children with Sidebar layout structure
3. Set up proper flex layout for sidebar + main content
4. Add global styles import
5. Include metadata export

**Layout Structure:**
```typescript
<div className="flex h-screen overflow-hidden">
  <Sidebar />
  <main className="flex-1 overflow-y-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {children}
    </div>
  </main>
</div>
```

### 3.5 Create Common Components
**Location:** `components/[ComponentName].tsx`

**Steps:**
1. Reference `components` table for component structure
2. Check `props` table for exact prop types
3. Use `render_strategy` to determine ServerComponent vs ClientComponent
4. Follow exact Tailwind class patterns from design system

**⚠️ NOTE:** Do NOT generate Sidebar here - it's already done in step 3.2

**Component Checklist:**
- [ ] Props match `props` table exactly
- [ ] TypeScript types imported correctly
- [ ] Render strategy applied (`'use client'` if ClientComponent)
- [ ] Tailwind classes match design system
- [ ] Array safety checks added
- [ ] Empty states handled
- [ ] Error states handled (if applicable)

**Example:**
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
  // ... implementation
};

export default AssignedForms;
```

### 3.6 Create Form Components (If Needed)
**Location:** `components/forms/`

**Steps:**
1. Reference `constants/quickStartForm.ts` for form structure
2. Implement multi-page navigation
3. Handle conditional field visibility
4. Implement validation based on `validation` rules
5. Map form question IDs to entity fields

**Form Component Checklist:**
- [ ] Multi-page navigation works
- [ ] Progress bar shows correct percentage
- [ ] Validation runs on page transitions
- [ ] Auto-save on page changes
- [ ] Conditional logic implemented
- [ ] Field types rendered correctly (Text, Email, Phone, Select, etc.)

### 3.7 Assemble the Page
**Location:** `app/[route]/page.tsx`

**Steps:**
1. Import all section components
2. Follow `component_tree` order
3. Use exact grid layout from design
4. Apply consistent spacing

**Page Checklist:**
- [ ] Sidebar is integrated in `app/layout.tsx` (not in individual pages)
- [ ] All components from `component_tree` are included
- [ ] Components rendered in correct `order`
- [ ] Grid layout matches design (`lg:grid-cols-12`, etc.)
- [ ] Typography sizes match exactly (`text-[24px]`, etc.)
- [ ] Spacing matches (`space-y-12`, `gap-10`, etc.)
- [ ] Mock data passed as props (will be replaced with API calls later)

**Example:**
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

export default function HomePage() {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* ... page content following component_tree order ... */}
    </div>
  );
}
```

---

## Phase 4: Integration & Testing

### 4.1 Connect Frontend to Backend
**Steps:**
1. Replace mock constants with API calls
2. Use Server Components for initial data fetching
3. Implement error handling
4. Add loading states

**Example:**
```typescript
// app/page.tsx (updated)
import { AssignedForm } from '@/types';

async function getAssignedForms(): Promise<AssignedForm[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/forms/assigned`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch assigned forms');
  }
  return res.json();
}

export default async function HomePage() {
  const forms = await getAssignedForms();
  
  return (
    <div className="space-y-12">
      <AssignedForms forms={forms} />
      {/* ... */}
    </div>
  );
}
```

### 4.2 Test with Mock Data
**Steps:**
1. Verify all components render correctly
2. Check prop types match
3. Test form submission flow
4. Verify error handling

### 4.3 Test with Real Airtable Data
**Steps:**
1. Set `AIRTABLE_API_KEY` environment variable
2. Verify field mappings work correctly
3. Test form submission creates records
4. Verify data displays correctly

---

## Phase 5: Documentation & Handoff

### 5.1 Document Field Mappings
**Location:** `docs/field-mappings.md`

**Steps:**
1. Document form question ID → entity field mappings
2. Document Airtable field name → entity field mappings
3. Note any discrepancies or special handling

### 5.2 Update Context Layer (If Needed)
**Steps:**
1. Add any new components to `components` table
2. Update `component_tree` if structure changed
3. Document any deviations from schema

---

## Common Patterns & Best Practices

### Pattern 1: Status Badge Styling
Always use consistent status badge patterns:
```typescript
const getStatusStyle = (status: FormStatus) => {
  switch (status) {
    case FormStatus.COMPLETED:
      return 'bg-brand-50 text-brand-700 border-brand-100';
    case FormStatus.IN_PROGRESS:
      return 'bg-blue-50 text-blue-700 border-blue-100';
    // ... other cases
  }
};
```

### Pattern 2: Array Safety
Always add array safety checks:
```typescript
const safeData = Array.isArray(data) ? data : [];
const limitedData = safeData.slice(0, 5);
```

### Pattern 3: Route Mapping
Implement route mapping logic for forms:
```typescript
const getFormRoute = (formId: string, formName: string): string => {
  if (formName.toLowerCase().includes('quick start')) {
    return '/forms/quick-start';
  }
  return '#';
};
```

### Pattern 4: Color Scheme Application
Always use the brand color palette from Tailwind config:

**Primary Actions:**
- Buttons: `bg-brand-500 text-white hover:bg-brand-600`
- Active states: `bg-brand-50 text-brand-700 border-brand-100`
- Brand elements: `bg-brand-500` for logos/headers

**Help Card (Special Exception):**
- Use hardcoded hex values: `bg-[#1c240f]`, `text-[#a1c270]`, `bg-[#f3f7ed]`
- This is the ONLY component that uses hardcoded hex values

**Status Badges:**
- Completed/Approved: `bg-green-50 text-green-700`
- In Progress: `bg-blue-50 text-blue-700`
- Flagged: `bg-yellow-50 text-yellow-700`
- Missing/Rejected: `bg-red-50 text-red-700`

**CRITICAL:** Never hardcode brand colors - Always use Tailwind `brand-*` classes (except Help card).

---

## Critical Lessons Learned

1. **Always verify Airtable field names** via inspection scripts before implementing
2. **Linked fields return arrays of Record IDs**, not strings
3. **Don't use view names** in Airtable `.select()` calls
4. **Return 500 status codes** on API errors for proper error handling
5. **Use real Record IDs** in mock data when available
6. **Match TypeScript enums exactly** (FormStatus, DocumentStatus, ProgressStatus)
7. **Follow component_tree order** for proper rendering sequence
8. **Use exact Tailwind classes** matching the design system
9. **Add array safety checks** before mapping or slicing
10. **Handle empty states** gracefully for all list components

---

## Troubleshooting Guide

### Issue: Component not rendering
- Check `render_strategy` (ServerComponent vs ClientComponent)
- Verify props match `props` table
- Check component_tree order

### Issue: API route returning errors
- Verify field names match Airtable exactly
- Check base_id and table_id are correct
- Ensure proper error status codes (500)

### Issue: Form submission failing
- Verify form question ID → entity field mapping
- Check validation rules match entity_fields
- Ensure Airtable field names are correct

---

## Next Steps

After generating a page:
1. Test with mock data
2. Test with real Airtable data
3. Document any deviations from schema
4. Update context layer if structure changed
5. Share process improvements with team
