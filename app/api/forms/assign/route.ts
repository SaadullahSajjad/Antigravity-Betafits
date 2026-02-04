import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";
import { getCompanyId } from "@/lib/auth/getCompanyId";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const companyId = await getCompanyId();

        if (!companyId) {
            return NextResponse.json(
                { error: "User must be linked to a company" },
                { status: 400 }
            );
        }

        const { formId } = await request.json();

        if (!formId) {
            return NextResponse.json(
                { error: "Form ID is required" },
                { status: 400 }
            );
        }

        const token = process.env.AIRTABLE_API_KEY;
        const baseId = "appdqgKk1fmhfaJoT";
        const availableFormsTableId = "tblZVnNaE4y8e56fa"; // Available Forms
        const assignedFormsTableId = "tblNeyKm9sKAKZq9n"; // Assigned Forms

        if (!token) {
            return NextResponse.json(
                { error: "Server configuration error" },
                { status: 500 }
            );
        }

        // Step 1: Fetch the available form details
        const getFormUrl = `https://api.airtable.com/v0/${baseId}/${availableFormsTableId}/${formId}`;
        const formResponse = await fetch(getFormUrl, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!formResponse.ok) {
            const errorText = await formResponse.text();
            console.error("[Assign Form API] Error fetching form:", errorText);
            return NextResponse.json(
                { error: "Form not found" },
                { status: 404 }
            );
        }

        const formRecord = await formResponse.json();
        const formFields = formRecord.fields;

        console.log(`[Assign Form API] Available form fields:`, Object.keys(formFields));
        console.log(`[Assign Form API] Company ID to link: ${companyId}`);

        // Step 2: Create a new record in Assigned Forms table
        const createUrl = `https://api.airtable.com/v0/${baseId}/${assignedFormsTableId}`;

        // Build fields object - only include fields that can be set (not computed)
        const fieldsToSet: Record<string, any> = {
            // Set initial status
            "Status": "Not Started",
            // Link to company (required field name from debug_tables.txt)
            "Link to Intake Group Data": [companyId],
        };

        // Try to link to the Available Form record so Airtable can compute the correct name
        // Try common field names for linking to Available Forms (in order of likelihood)
        // We'll try to set it, and if the field doesn't exist, Airtable will return an error
        // which we'll handle gracefully
        const availableFormLinkFields = [
            "Link to Available Forms",
            "Available Form",
            "Form",
            "Link to Form",
            "Source Form",
            "Original Form",
        ];
        
        // Try the first field name - if it fails, we'll know from the error
        // For now, we'll try "Link to Available Forms" as it's the most descriptive
        fieldsToSet["Link to Available Forms"] = [formId];
        console.log(`[Assign Form API] Attempting to link to available form ${formId} using field: "Link to Available Forms"`);
        
        // Note: "Name" and "Assigned Form URL" are computed fields and cannot be set directly
        // Airtable will compute them automatically based on linked records
        // If "Link to Available Forms" field doesn't exist, Airtable will return an error
        // and we can try other field names or proceed without the link

        console.log(`[Assign Form API] Fields to set:`, JSON.stringify(fieldsToSet, null, 2));

        const assignResponse = await fetch(createUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                fields: fieldsToSet,
            }),
        });

        if (!assignResponse.ok) {
            const errorText = await assignResponse.text();
            console.error("[Assign Form API] Airtable error response:", errorText);
            console.error("[Assign Form API] Status:", assignResponse.status);
            
            // Check if error is due to unknown field name for linking to Available Forms
            let errorData: any = {};
            try {
                errorData = JSON.parse(errorText);
            } catch {
                // Continue with empty errorData
            }
            
            // If the error is about unknown field "Link to Available Forms", try without it
            if (errorData.error?.message?.includes("Link to Available Forms") || 
                errorData.error?.message?.includes("Unknown field")) {
                console.log("[Assign Form API] Field 'Link to Available Forms' doesn't exist, retrying without it");
                
                // Remove the field and try again
                delete fieldsToSet["Link to Available Forms"];
                
                const retryResponse = await fetch(createUrl, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        fields: fieldsToSet,
                    }),
                });
                
                if (!retryResponse.ok) {
                    const retryErrorText = await retryResponse.text();
                    console.error("[Assign Form API] Retry error:", retryErrorText);
                    
                    let errorMessage = "Failed to assign form";
                    try {
                        const retryErrorData = JSON.parse(retryErrorText);
                        if (retryErrorData.error?.message) {
                            errorMessage = retryErrorData.error.message;
                        }
                    } catch {
                        // Use default message
                    }
                    
                    return NextResponse.json(
                        { error: errorMessage },
                        { status: 500 }
                    );
                }
                
                // Success on retry - use retryResponse
                const assignedRecord = await retryResponse.json();
                console.log(`[Assign Form API] Successfully assigned form (without Available Form link): ${formId} to company: ${companyId}`);
                console.log(`[Assign Form API] Created assigned form record: ${assignedRecord.id}`);
                
                return NextResponse.json({
                    success: true,
                    message: "Form assigned successfully",
                    assignedFormId: assignedRecord.id,
                    companyId: companyId,
                });
            }
            
            // Other errors - return as normal
            let errorMessage = "Failed to assign form";
            if (errorData.error?.message) {
                errorMessage = errorData.error.message;
                console.error("[Assign Form API] Error message:", errorData.error.message);
            }
            
            return NextResponse.json(
                { error: errorMessage },
                { status: 500 }
            );
        }

        const assignedRecord = await assignResponse.json();

        console.log(`[Assign Form API] Successfully assigned form: ${formId} to company: ${companyId}`);
        console.log(`[Assign Form API] Created assigned form record: ${assignedRecord.id}`);
        console.log(`[Assign Form API] Record fields:`, JSON.stringify(assignedRecord.fields, null, 2));
        
        // Verify the record was created with the correct company link
        const linkField = assignedRecord.fields['Link to Intake Group Data'];
        console.log(`[Assign Form API] Link field value:`, linkField);
        console.log(`[Assign Form API] Link field type:`, typeof linkField, Array.isArray(linkField));
        if (Array.isArray(linkField)) {
            console.log(`[Assign Form API] Link field contains company ID: ${linkField.includes(companyId)}`);
            console.log(`[Assign Form API] Link field array:`, linkField);
        }

        return NextResponse.json({
            success: true,
            message: "Form assigned successfully",
            assignedFormId: assignedRecord.id,
            companyId: companyId,
            linkField: linkField,
        });
    } catch (error) {
        console.error("[Assign Form API] Error:", error);
        return NextResponse.json(
            { error: "An error occurred while assigning the form" },
            { status: 500 }
        );
    }
}
