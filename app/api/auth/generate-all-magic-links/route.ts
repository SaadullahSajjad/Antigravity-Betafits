import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";
import { generateAllUsersMagicLinks } from "@/lib/auth/generateAllMagicLinks";

export const dynamic = "force-dynamic";

/**
 * Generate magic link URLs for all users
 * Protected endpoint - requires authentication
 * In production, add role-based access control (admin/ops only)
 */
export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // TODO: Add role check - only allow ops/admin
        // if (session.user?.role !== "admin" && session.user?.role !== "ops") {
        //     return NextResponse.json(
        //         { error: "Forbidden - Admin access required" },
        //         { status: 403 }
        //     );
        // }

        const body = await request.json().catch(() => ({}));
        const { onlyActive = true, batchSize = 10 } = body;

        console.log("[Generate All Magic Links API] Starting batch generation...");
        console.log(`[Generate All Magic Links API] Options: onlyActive=${onlyActive}, batchSize=${batchSize}`);

        const result = await generateAllUsersMagicLinks({
            onlyActive,
            batchSize,
        });

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: `Successfully generated magic links for ${result.updated} user(s)`,
                ...result,
            });
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: `Generated magic links with some errors. Updated: ${result.updated}, Failed: ${result.failed}`,
                    ...result,
                },
                { status: 207 } // 207 Multi-Status
            );
        }
    } catch (error: any) {
        console.error("[Generate All Magic Links API] Error:", error);
        return NextResponse.json(
            {
                error: "An error occurred while generating magic links",
                details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            },
            { status: 500 }
        );
    }
}

/**
 * GET endpoint to check status (without running the generation)
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        return NextResponse.json({
            message: "Generate All Magic Links API",
            endpoint: "POST /api/auth/generate-all-magic-links",
            description: "Generates and updates magic link URLs for all users in the Intake - Users table",
            options: {
                onlyActive: "boolean - Only process active users (default: true)",
                batchSize: "number - Number of users to process in parallel (default: 10)",
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: "An error occurred" },
            { status: 500 }
        );
    }
}
