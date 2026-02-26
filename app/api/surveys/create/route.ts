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

        const body = await request.json().catch(() => ({}));
        const { title, description, questions } = body;

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

        // Only set fields that are writable. Never set "Name" or "Title" - they are computed in Airtable.
        const COMPUTED_OR_READONLY_FIELDS = ["Name", "Title", "name", "title"];
        const linkFieldName = "Link to Intake - Group Data"; // Primary; fallback: "Link to Intake Group Data"
        const fields: Record<string, unknown> = {
            [linkFieldName]: [companyId],
        };
        if (description && typeof description === "string" && description.trim()) {
            fields["Description"] = description.trim();
        }
        // Ensure we never send computed/primary formula fields
        for (const key of Object.keys(fields)) {
            if (COMPUTED_OR_READONLY_FIELDS.includes(key)) {
                delete fields[key];
            }
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

                const errMsg = (errorData?.error?.message || "").toLowerCase();
                const isComputedOrInvalid =
                    errorData.error?.type === "UNKNOWN_FIELD_NAME" ||
                    errorData.error?.type === "INVALID_VALUE_FOR_COLUMN" ||
                    errMsg.includes("computed") ||
                    errMsg.includes("formula") ||
                    errMsg.includes("name is computed") ||
                    errMsg.includes("cannot set");

                if (isComputedOrInvalid) {
                    // Try to extract the field name from the error message (e.g. "Name is computed")
                    let invalidField: string | null = null;
                    const quotedMatch = errorData.error?.message?.match(/"([^"]+)"/);
                    if (quotedMatch?.[1]) {
                        invalidField = quotedMatch[1];
                    } else if (errMsg.includes("name")) {
                        invalidField = "Name";
                    }
                    if (invalidField) {
                        console.warn(`[Create Survey API] Field "${invalidField}" is invalid (unknown or computed), removing and retrying...`);
                        skippedFields.push(invalidField);
                        const { [invalidField]: _removed, ...remaining } = fieldsToUpdate as Record<string, unknown>;
                        fieldsToUpdate = remaining as Record<string, any>;
                    }
                    // Also strip any known computed fields before retry
                    for (const key of COMPUTED_OR_READONLY_FIELDS) {
                        if (key in fieldsToUpdate) {
                            delete fieldsToUpdate[key];
                            skippedFields.push(key);
                        }
                    }
                    if (!fieldsToUpdate[linkFieldName] && !fieldsToUpdate["Link to Intake Group Data"]) {
                        fieldsToUpdate[linkFieldName] = [companyId];
                    }
                    retryCount++;
                    continue;
                }

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
