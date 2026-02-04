import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";
import { generateMagicToken, storeMagicToken } from "@/lib/auth/magicToken";
import { fetchAirtableRecords } from "@/lib/airtable/fetch";

export const dynamic = "force-dynamic";

/**
 * Generate a magic link for a user
 * This endpoint is for Ops/Admin use to generate access links
 * In production, add role-based access control
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // TODO: Add role check - only allow ops/admin
        // if (session?.user?.role !== "admin" && session?.user?.role !== "ops") {
        //     return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        // }

        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        const token = process.env.AIRTABLE_API_KEY;
        const baseId = "appdqgKk1fmhfaJoT";
        const usersTableId = "tblU9oY6xmTcCuACh";

        if (!token) {
            return NextResponse.json(
                { error: "Server configuration error" },
                { status: 500 }
            );
        }

        // Find user by email
        const records = await fetchAirtableRecords(usersTableId, {
            apiKey: token,
            filterByFormula: `{Email} = '${email}'`,
            maxRecords: 1,
        });

        if (!records || records.length === 0) {
            // Don't reveal if user exists for security
            return NextResponse.json({
                success: true,
                message: "If user exists, magic link generated",
            });
        }

        const record = records[0];
        const userId = record.id;

        // Generate magic token
        const magicToken = generateMagicToken();
        storeMagicToken(magicToken, userId, email.toLowerCase(), 24); // 24 hour expiry (in-memory backup)

        // Generate magic link URL
        const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000";
        const magicLink = `${baseUrl}/access?token=${magicToken}`;

        // Store token in Airtable for persistence across server contexts
        // Always store token for validation (Magic Link field is separate and won't be overwritten)
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now
        const updateUrl = `https://api.airtable.com/v0/${baseId}/${usersTableId}/${userId}`;
        
        try {
            const updateResponse = await fetch(updateUrl, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fields: {
                        "Magic Token": magicToken,
                        "Magic Token Expires": expiresAt,
                        // Note: We're NOT updating "Magic Link" field to preserve existing values
                    },
                }),
            });

            if (!updateResponse.ok) {
                const errorText = await updateResponse.text();
                console.error("[Generate Magic Link API] Airtable update error:", errorText);
                // Still return the link even if update fails
            } else {
                console.log(`[Generate Magic Link API] Token stored in Airtable for ${email}`);
            }
        } catch (updateError) {
            console.error("[Generate Magic Link API] Error updating Airtable:", updateError);
            // Still return the link
        }

        console.log(`[MAGIC LINK] Generated for ${email}: ${magicLink}`);

        return NextResponse.json({
            success: true,
            magicLink,
            message: "Magic link generated",
        });
    } catch (error) {
        console.error("[Generate Magic Link API] Error:", error);
        return NextResponse.json(
            { error: "An error occurred" },
            { status: 500 }
        );
    }
}
