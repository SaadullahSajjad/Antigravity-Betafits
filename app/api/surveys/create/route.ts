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

        // Build fields object - only include fields that are provided
        const fields: Record<string, any> = {
            // Link to company (required)
            "Link to Intake - Group Data": [companyId],
        };

        // Add title/name if provided (try common field names)
        if (title) {
            // Try "Name" first, which is the most common Airtable field
            fields["Name"] = title;
        }

        // Add description if provided
        if (description) {
            fields["Description"] = description;
        }

        const response = await fetch(createUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                fields,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[Create Survey API] Airtable error:", errorText);
            
            // Try to parse error message for better user feedback
            let errorMessage = "Failed to create survey in Airtable";
            try {
                const errorData = JSON.parse(errorText);
                if (errorData.error?.message) {
                    errorMessage = errorData.error.message;
                }
            } catch {
                // Use default message if parsing fails
            }
            
            return NextResponse.json(
                { error: errorMessage },
                { status: 500 }
            );
        }

        const record = await response.json();

        console.log(`[Create Survey API] Successfully created survey: ${record.id} for company: ${companyId}`);

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
