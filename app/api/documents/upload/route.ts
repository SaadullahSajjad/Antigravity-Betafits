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

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = file.name;

        // Generate unique file ID and store file
        const { storeFile } = await import("@/lib/fileStorage");
        const fileId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
        
        storeFile(fileId, {
            buffer,
            filename: file.name,
            mimeType: file.type || "application/octet-stream",
        });

        // Generate the file URL - must be publicly accessible
        // Use NEXTAUTH_URL or VERCEL_URL for production, or construct from request
        let baseUrl: string = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || '';
        
        // Check if we're in development (localhost)
        const isLocalhost = !baseUrl || 
                          baseUrl.includes('localhost') ||
                          baseUrl.includes('127.0.0.1');

        if (isLocalhost) {
            // For localhost, try to use ngrok if available, otherwise use localhost (will fail)
            const ngrokUrl = process.env.NGROK_URL;
            if (ngrokUrl) {
                baseUrl = ngrokUrl;
                console.log(`[Document Upload API] Using ngrok URL for localhost: ${baseUrl}`);
            } else {
                // Try to construct from request
                const host = request.headers.get('host');
                const protocol = request.headers.get('x-forwarded-proto') || 'http';
                if (host) {
                    baseUrl = `${protocol}://${host}`;
                } else {
                    baseUrl = "http://localhost:3000";
                }
                console.warn(`[Document Upload API] WARNING: Using localhost URL. Airtable cannot access this. Consider using ngrok or deploying to production.`);
            }
        }
        
        // Ensure baseUrl doesn't have trailing slash
        baseUrl = baseUrl.replace(/\/$/, '');
        const fileUrl = `${baseUrl}/api/files/${fileId}`;

        // Step 2: Create Airtable record with file attachment
        // Airtable can attach files via URL if the URL is publicly accessible
        const uploadUrl = `https://api.airtable.com/v0/${baseId}/${tableId}`;
        
        const response = await fetch(uploadUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                fields: {
                    // Link to company if available (required for Softr filtering)
                    ...(companyId ? {
                        "Link to Intake - Group Data": Array.isArray(companyId) ? companyId : [String(companyId)]
                    } : {}),
                    // Attach file - Airtable expects array of attachment objects with url and filename
                    "File": [{
                        url: fileUrl,
                        filename: fileName,
                    }],
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
        console.log(`[Document Upload API] File URL sent to Airtable: ${fileUrl}`);
        console.log(`[Document Upload API] Airtable record response:`, JSON.stringify(record.fields, null, 2));
        
        // Note: We don't store fileId in Airtable since those fields don't exist
        // Instead, we rely on Airtable's File attachment URL which should be available
        // after Airtable processes the file from the URL we provided

        return NextResponse.json({
            success: true,
            message: "Document uploaded successfully",
            recordId: record.id,
            fileUrl: fileUrl, // Return the file URL so frontend can use it immediately
            fileId: fileId, // Return fileId for fallback URL reconstruction
        });
    } catch (error) {
        console.error("[Document Upload API] Error:", error);
        return NextResponse.json(
            { error: "An error occurred while uploading the document" },
            { status: 500 }
        );
    }
}
