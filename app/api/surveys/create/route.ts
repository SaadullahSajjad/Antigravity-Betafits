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

        const { title, description, questions } = await request.json();

        const token = process.env.AIRTABLE_API_KEY;
        const baseId = "appdqgKk1fmhfaJoT";
        const surveysTableId = "tbl28XVUekjvl2Ujn"; // Pulse Surveys table

        if (!token) {
            return NextResponse.json(
                { error: "Server configuration error" },
                { status: 500 }
            );
        }

        // Create survey record in Airtable
        const createUrl = `https://api.airtable.com/v0/${baseId}/${surveysTableId}`;

        // Build fields object - match Softr's approach
        // Softr likely only sets the required link field, and other fields are handled by Airtable/Softr
        // "Name" field is computed in Airtable, so we can't set it directly
        const fields: Record<string, any> = {
            // Link to company (required) - this is the only field we know exists and can set
            "Link to Intake - Group Data": [companyId],
        };

        // Try to add description if provided (but don't set Name/Title as they're computed)
        if (description) {
            fields["Description"] = description;
        }

        let record;
        let fieldsToUpdate = { ...fields };
        const maxRetries = 3;
        let retryCount = 0;
        const skippedFields: string[] = [];

        // Try creating with retry logic for unknown or computed fields
        while (retryCount < maxRetries) {
            const response = await fetch(createUrl, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fields: fieldsToUpdate,
                }),
            });

            if (response.ok) {
                record = await response.json();
                console.log(`[Create Survey API] Successfully created survey: ${record.id} for company: ${companyId}`);
                if (retryCount > 0) {
                    console.log(`[Create Survey API] Successfully created after removing ${retryCount} invalid field(s): ${skippedFields.join(', ')}`);
                }
                break;
            } else {
                const errorText = await response.text();
                console.error(`[Create Survey API] Airtable error (attempt ${retryCount + 1}):`, errorText);
                
                let errorData: any = null;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    // If we can't parse the error, return it as-is
                    return NextResponse.json(
                        { error: "Failed to create survey in Airtable" },
                        { status: 500 }
                    );
                }

                // Handle unknown field names or computed fields
                if (errorData.error?.type === 'UNKNOWN_FIELD_NAME' || errorData.error?.type === 'INVALID_VALUE_FOR_COLUMN') {
                    // Extract the field name from error message
                    const fieldMatch = errorData.error.message.match(/"([^"]+)"/);
                    if (fieldMatch && fieldMatch[1]) {
                        const invalidField = fieldMatch[1];
                        console.warn(`[Create Survey API] Field "${invalidField}" is invalid (unknown or computed), removing it and retrying...`);
                        skippedFields.push(invalidField);
                        const { [invalidField]: removed, ...remainingFields } = fieldsToUpdate;
                        fieldsToUpdate = remainingFields;

                        // Always keep the required link field
                        if (!fieldsToUpdate["Link to Intake - Group Data"]) {
                            fieldsToUpdate["Link to Intake - Group Data"] = [companyId];
                        }

                        retryCount++;
                        continue;
                    }
                }
                
                // If error is not about unknown/computed fields, or we've exhausted retries, return error
                return NextResponse.json(
                    { error: errorData?.error?.message || "Failed to create survey in Airtable" },
                    { status: 500 }
                );
            }
        }

        if (!record) {
            return NextResponse.json(
                { error: "Failed to create survey after retrying with different field combinations" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Survey created successfully",
            surveyId: record.id,
        });
    } catch (error) {
        console.error("[Create Survey API] Error:", error);
        return NextResponse.json(
            { error: "An error occurred while creating the survey" },
            { status: 500 }
        );
    }
}
