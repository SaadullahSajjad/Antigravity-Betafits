import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";
import { getCurrentUserId } from "@/lib/auth/getUserId";
import { getCompanyId } from "@/lib/auth/getCompanyId";

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
        
        // Get company ID if available (optional - not required for upload)
        const companyId = await getCompanyId();

        const formData = await request.formData();
        const file = formData.get("file") as File;
        const name = formData.get("name") as string;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        const token = process.env.AIRTABLE_API_KEY;
        const baseId = "appdqgKk1fmhfaJoT";
        const tableId = "tblBgAZKJln76anVn"; // Documents / Intake - Document Upload

        if (!token) {
            return NextResponse.json(
                { error: "Server configuration error" },
                { status: 500 }
            );
        }

        // Step 1: Upload file to get a public URL
        // Instead of making an HTTP call, directly use the file storage
        const { storeFile } = await import("@/lib/fileStorage");
        
        // Generate unique file ID
        const fileId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
        
        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Store file directly
        storeFile(fileId, {
            buffer,
            filename: file.name,
            mimeType: file.type || "application/octet-stream",
        });

        // Generate the file URL
        const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000";
        const fileUrl = `${baseUrl}/api/files/${fileId}`;
        const fileName = file.name;

        // Step 2: Create Airtable record with file attachment
        const uploadUrl = `https://api.airtable.com/v0/${baseId}/${tableId}`;
        
        const response = await fetch(uploadUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                fields: {
                    // Link to company if available (optional)
                    ...(companyId ? {
                        "Link to Intake - Group Data": Array.isArray(companyId) ? companyId : [String(companyId)]
                    } : {}),
                    // Attach file - Airtable expects array of attachment objects
                    "File": [{
                        url: fileUrl,
                        filename: fileName,
                    }],
                    // Store user email for filtering (if there's a field for it)
                    // Note: You may need to add a "User Email" or "Uploaded By" field in Airtable
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[Document Upload API] Airtable error:", errorText);
            return NextResponse.json(
                { error: "Failed to create document record in Airtable" },
                { status: 500 }
            );
        }

        const record = await response.json();

        console.log(`[Document Upload API] Successfully created document record: ${record.id} for user: ${userEmail}${companyId ? ` (company: ${companyId})` : ' (no company linked)'}`);
        console.log(`[Document Upload API] File URL: ${fileUrl}`);

        return NextResponse.json({
            success: true,
            message: "Document uploaded successfully",
            recordId: record.id,
        });
    } catch (error) {
        console.error("[Document Upload API] Error:", error);
        return NextResponse.json(
            { error: "An error occurred while uploading the document" },
            { status: 500 }
        );
    }
}
