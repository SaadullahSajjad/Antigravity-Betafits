import { NextRequest, NextResponse } from "next/server";
import { storeFile } from "@/lib/fileStorage";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: "File size must be less than 10MB" },
                { status: 400 }
            );
        }

        // Generate unique file ID
        const fileId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
        
        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Store in memory (for development)
        // In production, upload to cloud storage and get URL
        storeFile(fileId, {
            buffer,
            filename: file.name,
            mimeType: file.type || "application/octet-stream",
        });

        // Return the file serving URL
        const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000";
        const fileUrl = `${baseUrl}/api/files/${fileId}`;

        return NextResponse.json({
            success: true,
            url: fileUrl,
            filename: file.name,
        });
    } catch (error) {
        console.error("[File Upload API] Error:", error);
        return NextResponse.json(
            { error: "An error occurred while uploading the file" },
            { status: 500 }
        );
    }
}
