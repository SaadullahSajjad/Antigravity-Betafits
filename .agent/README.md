# Antigravity Skills for Prospect Portal

This folder contains Antigravity Skills and process documentation for generating Prospect Portal code from the Frontend+Backend Context Layer schema.

## Files Overview

### 1. `backend-skill.md`
**Purpose:** Skill definition for Antigravity to generate backend integration code.

**Use Cases:**
- Creating API routes (`/api/forms/assigned`, `/api/documents`, etc.)
- Mapping Airtable records to TypeScript interfaces
- Creating form submission handlers
- Generating data normalization functions

**Key Features:**
- Field mapping patterns
- API route templates
- Form submission handlers
- Mock data strategies
- Error handling patterns

### 2. `frontend-skill.md`
**Purpose:** Skill definition for Antigravity to generate frontend React components.

**Use Cases:**
- Creating page components (Homepage, Company Details, etc.)
- Building reusable UI components (AssignedForms, DocumentsSection, etc.)
- Implementing form components (QuickStartForm, FormField, etc.)
- Creating dashboard layouts

**Key Features:**
- Component patterns
- Styling requirements (exact Tailwind classes)
- TypeScript type definitions
- Form handling patterns
- Layout structures

### 3. `prospect-portal-generation-process.md`
**Purpose:** Complete step-by-step process for generating pages from the context layer.

**Use Cases:**
- Understanding the full generation workflow
- Learning from mistakes and lessons
- Standardizing the process across team members
- Troubleshooting common issues

**Key Sections:**
- Schema analysis
- Backend implementation
- Frontend implementation
- Integration & testing
- Documentation

## How to Use with Antigravity

### Step 1: Set Up Skills in Antigravity

1. Open Antigravity
2. Go to Skills section
3. Create new skill from `backend-skill.md`
4. Create new skill from `frontend-skill.md`
5. Save both skills

### Step 2: Prepare Context Layer

1. Ensure `frontend-backend-context-layer-v2.1.json` is accessible
2. Have the file path ready to reference in prompts

### Step 3: Generate Code

**For Backend (API Routes):**
```
@betafits-prospect-portal-backend

Generate API route for /api/forms/assigned based on the context layer schema.

Context Layer: [path to frontend-backend-context-layer-v2.1.json]

Requirements:
- Use entity: ent_assigned_forms
- API endpoint: api_get_assigned_forms
- Return type: AssignedForm[]
- Include mock data fallback
```

**For Frontend (Components):**
```
@betafits-prospect-portal-frontend

Generate AssignedForms component based on the context layer schema.

Context Layer: [path to frontend-backend-context-layer-v2.1.json]

Requirements:
- Component ID: cmp_assigned_forms
- Props: forms: AssignedForm[]
- Render strategy: ClientComponent
- Use exact Tailwind classes from design system
```

**For Full Portal (All Pages):**
```
@betafits-prospect-portal-frontend @betafits-prospect-portal-backend

Generate the COMPLETE Prospect Portal application with ALL pages based on the context layer schema.

Context Layer: [path to frontend-backend-context-layer-v2.1.json]

Follow the prospect-portal-generation-process.md workflow IN ORDER:

1. FIRST: Generate Sidebar component (components/Sidebar.tsx)
   - Navigation items from pages table
   - Collapsible functionality
   - Active route highlighting

2. SECOND: Generate Root Layout (app/layout.tsx)
   - Integrate Sidebar
   - Set up flex layout structure

3. Generate all required API routes
4. Generate all required components (AssignedForms, DocumentsSection, etc.)

5. CRITICAL: Generate ALL pages from the pages table:
   - app/page.tsx (Homepage/Dashboard)
   - app/company-details/page.tsx
   - app/benefit-plans/page.tsx
   - app/benefits-analysis/page.tsx
   - app/employee-feedback/page.tsx
   - app/faq/page.tsx
   - app/solutions-catalog/page.tsx
   - app/solutions/[id]/page.tsx
   - app/forms/quick-start/page.tsx (if defined)

Each page should use the appropriate component from the component_tree.
```

**CRITICAL:** 
- Always generate Sidebar and Layout FIRST, before any page components.
- You MUST generate ALL pages from the `pages` table, not just the homepage.
- Check the `pages` table in the context layer to see all required pages.

## Required Files to Provide

### Essential Files:
1. **`frontend-backend-context-layer-v2.1.json`** - The complete context layer schema
2. **`types.ts`** - TypeScript type definitions (if generating new components)
3. **`constants.tsx`** - Mock data constants (for reference)

### Optional but Helpful:
4. **Existing component examples** - For consistency
5. **`tailwind.config.js`** - For brand color references
6. **`package.json`** - For dependency verification

## Workflow Example

### Generating the Homepage:

1. **Backend First:**
   ```
   @betafits-prospect-portal-backend
   
   Generate API routes for Prospect Homepage:
   - /api/forms/assigned
   - /api/documents  
   - /api/forms/available
   
   Context Layer: frontend-backend-context-layer-v2.1.json
   ```

2. **Frontend Components:**
   ```
   @betafits-prospect-portal-frontend
   
   Generate components for Prospect Homepage:
   - AssignedForms (cmp_assigned_forms)
   - DocumentsSection (cmp_documents)
   - ProgressSteps (cmp_progress_steps)
   - AvailableForms (cmp_available_forms)
   
   Context Layer: frontend-backend-context-layer-v2.1.json
   ```

3. **Assemble Page:**
   ```
   @betafits-prospect-portal-frontend
   
   Generate app/page.tsx for Prospect Homepage following component_tree structure.
   
   Components already generated:
   - AssignedForms
   - DocumentsSection
   - ProgressSteps
   - AvailableForms
   
   Layout requirements:
   - Row 1: AssignedForms (8 cols) + DocumentsSection (4 cols)
   - Row 2: ProgressSteps (full width)
   - Row 3: AvailableForms (8 cols) + HelpCard (4 cols)
   ```

## Tips for Best Results

1. **Reference the Context Layer Explicitly:** Always include the path to `frontend-backend-context-layer-v2.1.json` in your prompts

2. **Use Component IDs:** Reference components by their `component_id` from the schema (e.g., `cmp_assigned_forms`)

3. **Follow the Process:** Reference `prospect-portal-generation-process.md` for step-by-step guidance

4. **Verify Field Names:** Always remind the AI to verify Airtable field names via inspection scripts

5. **Match Types Exactly:** Ensure TypeScript types match the `ts_type` from `entity_fields` exactly

6. **Use Exact Tailwind Classes:** Request exact pixel-specific sizes (`text-[24px]`) and brand colors

## Common Issues & Solutions

### Issue: Generated code doesn't match design
**Solution:** Explicitly request exact Tailwind classes and reference existing components

### Issue: API routes don't work
**Solution:** Verify field names match Airtable exactly, check base_id and table_id

### Issue: Types don't match
**Solution:** Reference `types.ts` and ensure enums match exactly (FormStatus, DocumentStatus, etc.)

## Next Steps

1. Test the skills with a simple component first
2. Generate the Homepage following the process document
3. Iterate and refine the skills based on results
4. Share improvements with the team
