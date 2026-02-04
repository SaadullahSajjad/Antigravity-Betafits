import { NextRequest, NextResponse } from "next/server";
import { getFile } from "@/lib/fileStorage";

export const dynamic = "force-dynamic";

export async function GET(
    request: NextRequest,
    { params }: { params: { fileId: string } }
) {
    try {
        const { fileId } = params;
        const fileData = getFile(fileId);

        if (!fileData) {
            return new NextResponse("File not found", { status: 404 });
        }

        return new NextResponse(fileData.buffer as any, {
            headers: {
                "Content-Type": fileData.mimeType,
                "Content-Disposition": `inline; filename="${fileData.filename}"`,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("[File Serve API] Error:", error);
        return new NextResponse("Error serving file", { status: 500 });
    }
}
