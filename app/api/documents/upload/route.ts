import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";
import { getCurrentUserId } from "@/lib/auth/getUserId";
import { getCompanyId } from "@/lib/auth/getCompanyId";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        // Check if user is authenticated (has email)
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized - Please log in" },
                { status: 401 }
            );
        }

        const userEmail = session.user.email;
        
        // Get user ID from Airtable
        const userId = await getCurrentUserId();
        
        const companyId = await getCompanyId();
        if (!companyId) {
            return NextResponse.json(
                { error: "Your account is not linked to a company. Please contact support or complete onboarding first." },
                { status: 400 }
            );
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;
        const name = (formData.get("name") as string) || file?.name;
        const documentType = (formData.get("documentType") as string) || "";
        const documentTitle = (formData.get("documentTitle") as string) || name || "Untitled Document";

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        const token = process.env.AIRTABLE_API_KEY;
        const baseId = process.env.AIRTABLE_BASE_ID || "appdqgKk1fmhfaJoT";
        const tableId = "tblBgAZKJln76anVn"; // Documents / Intake - Document Upload

        if (!token) {
            return NextResponse.json(
                { error: "Server configuration error" },
                { status: 500 }
            );
        }

        const fileName = file.name;
        const pathname = `documents/${companyId}/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

        // Upload to Vercel Blob (persistent, works on serverless)
        const blob = await put(pathname, file, {
            access: "public", // Airtable needs to fetch the file via URL
            addRandomSuffix: true,
            contentType: file.type || undefined,
        });

        const fileUrl = blob.url;

        // Step 2: Create Airtable record with file attachment and metadata
        const uploadUrl = `https://api.airtable.com/v0/${baseId}/${tableId}`;
        const linkFieldNames = ["Link to Intake - Group Data", "Link to Intake Group Data"];

        const buildFields = (linkFieldName: string, minimal = false) => {
            const base: Record<string, unknown> = {
                [linkFieldName]: [String(companyId)],
                "File": [{ url: fileUrl, filename: fileName }],
            };
            if (!minimal) {
                base["Name"] = documentTitle;
                base["File URL"] = fileUrl;
                if (documentType) base["Document Type"] = documentType;
            }
            return base;
        };

        const postRecord = async (fields: Record<string, unknown>) => {
            const res = await fetch(uploadUrl, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ fields }),
            });
            return res;
        };

        let response = await postRecord(buildFields(linkFieldNames[0]));
        if (!response.ok) {
            const errText = await response.text();
            if (errText.includes("UNKNOWN_FIELD_NAME") || errText.includes("INVALID_VALUE")) {
                response = await postRecord(buildFields(linkFieldNames[1]));
            }
        }
        if (!response.ok) {
            const errText = await response.text();
            if (errText.includes("UNKNOWN_FIELD_NAME") || errText.includes("INVALID_VALUE")) {
                response = await postRecord(buildFields(linkFieldNames[0], true));
            }
        }
        if (!response.ok) {
            const errText = await response.text();
            if (errText.includes("UNKNOWN_FIELD_NAME") || errText.includes("INVALID_VALUE")) {
                response = await postRecord(buildFields(linkFieldNames[1], true));
            }
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[Document Upload API] Airtable error:", errorText);
            let message = "Failed to create document record in Airtable.";
            try {
                const err = JSON.parse(errorText);
                if (err?.error?.message) message = err.error.message;
            } catch {
                if (errorText && errorText.length < 200) message = errorText;
            }
            return NextResponse.json(
                { error: message },
                { status: 500 }
            );
        }

        const record = await response.json();

        console.log(`[Document Upload API] Successfully created document record: ${record.id} for user: ${userEmail}${companyId ? ` (company: ${companyId})` : ' (no company linked)'}`);
        console.log(`[Document Upload API] File URL sent to Airtable: ${fileUrl}`);
        console.log(`[Document Upload API] Airtable record response:`, JSON.stringify(record.fields, null, 2));
        
        // Note: We don't store fileId in Airtable since those fields don't exist
        // Instead, we rely on Airtable's File attachment URL which should be available
        // after Airtable processes the file from the URL we provided

        return NextResponse.json({
            success: true,
            message: "Document uploaded successfully",
            recordId: record.id,
            fileUrl,
            fileId: blob.pathname,
        });
    } catch (error) {
        console.error("[Document Upload API] Error:", error);
        return NextResponse.json(
            { error: "An error occurred while uploading the document" },
            { status: 500 }
        );
    }
}
