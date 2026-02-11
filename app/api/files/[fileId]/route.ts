import { NextRequest, NextResponse } from "next/server";
import { getFile } from "@/lib/fileStorage";

export const dynamic = "force-dynamic";

// This endpoint must be publicly accessible for Airtable to download files
export async function GET(
    request: NextRequest,
    { params }: { params: { fileId: string } }
) {
    try {
        const { fileId } = params;
        console.log(`[File Serve API] Requested file: ${fileId}`);
        
        const fileData = getFile(fileId);

        if (!fileData) {
            console.warn(`[File Serve API] File not found: ${fileId}`);
            return new NextResponse("File not found", { status: 404 });
        }

        console.log(`[File Serve API] Serving file: ${fileData.filename}, type: ${fileData.mimeType}, size: ${fileData.buffer.length}`);

        return new NextResponse(fileData.buffer as any, {
            headers: {
                "Content-Type": fileData.mimeType,
                "Content-Disposition": `inline; filename="${encodeURIComponent(fileData.filename)}"`,
                "Cache-Control": "public, max-age=31536000, immutable",
                "Access-Control-Allow-Origin": "*", // Allow Airtable to access the file
            },
        });
    } catch (error) {
        console.error("[File Serve API] Error:", error);
        return new NextResponse("Error serving file", { status: 500 });
    }
}
