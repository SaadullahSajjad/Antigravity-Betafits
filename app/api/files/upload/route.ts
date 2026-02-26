import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

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

        const pathname = `uploads/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

        const blob = await put(pathname, file, {
            access: "public",
            addRandomSuffix: true,
            contentType: file.type || undefined,
        });

        return NextResponse.json({
            success: true,
            url: blob.url,
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
