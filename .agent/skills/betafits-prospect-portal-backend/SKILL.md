---
name: betafits-prospect-portal-backend
description: Maps Airtable structures to Prospect Portal entities. Generates type-safe API routes, form handlers, and data normalization functions for the Prospect Portal context layer.
---

# Betafits Prospect Portal Backend Integration

You are the Lead Backend Integration Engineer for the Prospect Portal. Your mission is to create a "Translation Layer" that decouples the Frontend from Airtable using the Frontend+Backend Context Layer Schema.

## When to use this skill

- Use to create `lib/mappings/` files that translate Airtable JSON (Physical Layer) into Frontend Objects (Logical Layer) as defined in `entity_fields`.
- Use to implement Next.js API Routes (`/api/...`) as defined in the `api_endpoint` table.
- Use to generate form submission handlers for the Quick Start form and other forms.
- Use to create data-fetching utilities that match the `entity_operations` table.

## How to use it

1. **The Context Layer First Rule**: Always reference `frontend-backend-context-layer-v2.1.json`.
   - **DO NOT** use physical Airtable field names directly (e.g., "First Name").
   - **ALWAYS** use the `field_key` from `entity_fields` table (e.g., `first_name`).
   - Map using `entity_field_id` to ensure code is resilient to Airtable column renames.

2. **Entity Field Mapping**: For each entity in `entities`, create a mapping function.
   - Reference `entity_fields` for the correct `field_key` and `ts_type`.
   - Use `data_type` to handle Airtable field types correctly (singleLineText, number, singleSelect, etc.).
   - Map `ui_component` hints to appropriate transformations.

3. **API Route Generation**: Build handlers in `app/api/[route]/route.ts` based on `api_endpoint`.
   - Use `source_config` for `base_id` (always `appdqgKk1fmhfaJoT` for Prospect Portal).
   - Use `physical_table_id` from the `entities` table.
   - Implement the method defined (GET, POST, etc.).
   - Return types matching `return_schema`.

4. **Form Submission Handlers**: For form routes like `/api/forms/quick-start/submit`.
   - Map form question IDs (e.g., `q-first-name`) to `entity_field_id` (e.g., `efld_contact_first_name`).
   - Use the `form_definitions` structure if available, or map directly to `entity_fields`.
   - Handle validation based on `validation` rules in `entity_fields`.
   - Save to appropriate entity tables (e.g., `ent_intake_group_data` for company info).

5. **Mock Data Strategy**: Always include mock data fallback.
   - Use real Record IDs from sample data when available.
   - Match TypeScript interfaces exactly.
   - Return mock data when `AIRTABLE_API_KEY` is missing.

## Field Mapping Patterns

### CRITICAL: Always Verify Field Names First

Before implementing any mapping, inspect the actual Airtable structure:

```typescript
// scripts/inspect_airtable.ts
import Airtable from "airtable";

const token = process.env.AIRTABLE_API_KEY;
const baseId = "appdqgKk1fmhfaJoT"; // Prospect Portal base
const tableId = "tbliXJ7599ngxEriO"; // Intake - Group Data

async function inspect() {
  const base = new Airtable({ apiKey: token }).base(baseId);
  const records = await base(tableId).select({ maxRecords: 1 }).all();

  console.log("Field Names:", Object.keys(records[0].fields));
  console.log("Sample Record:", JSON.stringify(records[0].fields, null, 2));
}

inspect();
```

**WHY:** Context layer field names may not match actual Airtable field names exactly.

### Pattern 1: Type-Safe Entity Mapping

```typescript
// lib/mappings/mapIntakeGroupData.ts
import { Record } from "airtable";

export interface IntakeGroupData {
  id: string;
  companyName: string;
  ein: string;
  address: string;
  renewalMonth: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
  // ... other fields from entity_fields
}

export const mapIntakeGroupData = (record: Record<any>): IntakeGroupData => {
  const fields = record.fields;

  // Helper functions for type safety
  const getString = (val: any) => (typeof val === "string" ? val : "");
  const getNumber = (val: any) => (typeof val === "number" ? val : 0);
  const getArray = (val: any) => (Array.isArray(val) ? val : []);

  return {
    id: record.id,
    // Map using actual Airtable field names (verify via inspection)
    companyName: getString(fields["Company Name"]),
    ein: getString(fields["EIN"]),
    address: getString(fields["Address"]),
    renewalMonth: getString(fields["Renewal Month"]),
    contactFirstName: getString(fields["First Name"]),
    contactLastName: getString(fields["Last Name"]),
    contactEmail: getString(fields["Work Email"]),
    contactPhone: getString(fields["Phone"]),
  };
};
```

**CRITICAL:** Linked record fields return **arrays of Record IDs**, not strings.

### Pattern 2: Form Question to Entity Field Mapping

For form submissions, map question IDs to entity fields:

```typescript
// lib/mappings/formToEntity.ts
import { FormValues } from "@/types/form";

export const mapQuickStartFormToIntakeGroupData = (
  formValues: FormValues
): Partial<IntakeGroupData> => {
  return {
    // Map question IDs to entity fields
    contactFirstName: formValues["q-first-name"] || "",
    contactLastName: formValues["q-last-name"] || "",
    contactEmail: formValues["q-email"] || "",
    contactPhone: formValues["q-phone"] || "",
    companyName: formValues["q-company-name"] || "",
    ein: formValues["q-ein"] || "",
    address: formValues["q-address-1"] || "",
    // ... continue mapping all fields
  };
};
```

## API Route Patterns

### Pattern 1: Standard GET with Mock Data Fallback

```typescript
// app/api/forms/assigned/route.ts
import { NextResponse } from "next/server";
import Airtable from "airtable";
import { AssignedForm, FormStatus } from "@/types";

const MOCK_DATA: AssignedForm[] = [
  {
    id: "recMock1",
    name: "Betafits Quick Start",
    status: FormStatus.NOT_STARTED,
    description: "Initial onboarding form for company information and benefits.",
  },
  {
    id: "recMock2",
    name: "Employee Census",
    status: FormStatus.IN_PROGRESS,
    description: "Upload employee demographic and enrollment data.",
  },
];

export async function GET() {
  const token = process.env.AIRTABLE_API_KEY;
  const baseId = "appdqgKk1fmhfaJoT";
  const tableId = "tblNeyKm9sKAKZq9n"; // Assigned Forms table

  if (!token) {
    console.warn("Missing AIRTABLE_API_KEY, returning mock data");
    return NextResponse.json(MOCK_DATA);
  }

  try {
    const base = new Airtable({ apiKey: token }).base(baseId);
    const records = await base(tableId).select({}).all();

    const forms: AssignedForm[] = records.map((record) => ({
      id: record.id,
      name: String(record.fields["Form Name"] || ""),
      status: String(record.fields["Status"] || "Not Started") as FormStatus,
      description: String(record.fields["Description"] || ""),
    }));

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

**CRITICAL RULES:**

1. **Don't use view names** in `.select()` - causes 422 errors
2. **Return 500 status codes** on errors for proper error handling
3. **Use real Record IDs** in mock data when available
4. **Match TypeScript enums exactly** (e.g., `FormStatus.NOT_STARTED`)

### Pattern 2: Form Submission Handler

```typescript
// app/api/forms/quick-start/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import Airtable from "airtable";
import { mapQuickStartFormToIntakeGroupData } from "@/lib/mappings/formToEntity";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { values } = body;

    const token = process.env.AIRTABLE_API_KEY;
    const baseId = "appdqgKk1fmhfaJoT";
    const tableId = "tbliXJ7599ngxEriO"; // Intake - Group Data

    if (!token) {
      console.warn("Missing AIRTABLE_API_KEY, simulating submission");
      return NextResponse.json({
        success: true,
        message: "Form submitted successfully (mock mode)",
        submittedAt: new Date().toISOString(),
      });
    }

    // Map form values to entity fields
    const mappedFields = mapQuickStartFormToIntakeGroupData(values);

    // Create/update record in Airtable
    const base = new Airtable({ apiKey: token }).base(baseId);
    const records = await base(tableId).create([
      {
        fields: {
          "Company Name": mappedFields.companyName,
          "First Name": mappedFields.contactFirstName,
          "Last Name": mappedFields.contactLastName,
          "Work Email": mappedFields.contactEmail,
          "Phone": mappedFields.contactPhone,
          // ... map all fields
        },
      },
    ]);

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

### Pattern 3: Partial Save (Draft Mode)

```typescript
// app/api/forms/quick-start/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import Airtable from "airtable";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { values, formRecordId } = body; // formRecordId from Assigned Forms table

    const token = process.env.AIRTABLE_API_KEY;
    const baseId = "appdqgKk1fmhfaJoT";

    if (!token) {
      return NextResponse.json({
        success: true,
        message: "Form progress saved (mock mode)",
        savedAt: new Date().toISOString(),
      });
    }

    // Update the Assigned Forms record with draft data
    const base = new Airtable({ apiKey: token }).base(baseId);
    await base("tblNeyKm9sKAKZq9n").update([
      {
        id: formRecordId,
        fields: {
          "Draft Data": JSON.stringify(values),
          "Status": "In Progress",
          "Last Saved": new Date().toISOString(),
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Form progress saved successfully",
      savedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Save error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save form progress" },
      { status: 500 }
    );
  }
}
```

## Entity-Specific Patterns

### Pattern: Documents API

```typescript
// app/api/documents/route.ts
import { NextResponse } from "next/server";
import Airtable from "airtable";
import { DocumentArtifact, DocumentStatus } from "@/types";

const MOCK_DOCUMENTS: DocumentArtifact[] = [
  {
    id: "recDoc1",
    name: "Employee Census",
    status: DocumentStatus.UNDER_REVIEW,
    fileName: "census_2024.xlsx",
    date: "2024-01-15",
  },
];

export async function GET() {
  const token = process.env.AIRTABLE_API_KEY;
  const baseId = "appdqgKk1fmhfaJoT";
  const tableId = "tblK7H9dLxLqX3kR2Y"; // Intake - Document Upload

  if (!token) {
    return NextResponse.json(MOCK_DOCUMENTS);
  }

  try {
    const base = new Airtable({ apiKey: token }).base(baseId);
    const records = await base(tableId)
      .select({
        sort: [{ field: "Upload Date", direction: "desc" }],
        maxRecords: 10,
      })
      .all();

    const documents: DocumentArtifact[] = records.map((record) => ({
      id: record.id,
      name: String(record.fields["Document Name"] || ""),
      status: String(record.fields["Status"] || "Received") as DocumentStatus,
      fileName: String(record.fields["File Name"] || ""),
      date: String(record.fields["Upload Date"] || ""),
    }));

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Documents fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
```

## Critical Lessons

1. **Always verify field names** via inspection scripts before implementing
2. **Linked fields return arrays of Record IDs**, not strings
3. **Don't use view names** in Airtable `.select()` calls
4. **Return 500 status codes** on API errors for proper error handling
5. **Use real Record IDs** in mock data when available
6. **Map form question IDs to entity_field_id** for form submissions
7. **Handle partial saves** separately from final submissions
8. **Base ID is always `appdqgKk1fmhfaJoT`** for Prospect Portal
9. **Match TypeScript enums exactly** (FormStatus, DocumentStatus, ProgressStatus)

## Debugging Tools

### Inspection Script Template

```bash
# Run inspection script
npx tsx scripts/inspect_airtable.ts
```

### Sample Data Collection

```bash
# Save API response
curl http://localhost:3000/api/forms/assigned > docs/sample-data-assigned-forms.json
```
