import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";
import { hashPassword } from "@/lib/auth/password";
import { fetchAirtableRecords } from "@/lib/airtable/fetch";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { password } = await request.json();

        if (!password || password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters long" },
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

        // Hash the new password
        const passwordHash = await hashPassword(password);

        // Update user in Airtable
        // Note: Airtable API requires PATCH to update records
        const userId = (session.user as any).id;
        const updateUrl = `https://api.airtable.com/v0/${baseId}/${usersTableId}/${userId}`;

        const updateResponse = await fetch(updateUrl, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                fields: {
                    "Password Hash": passwordHash,
                    "Must Change Password": false,
                },
            }),
        });

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.error("[Set Password API] Airtable update error:", errorText);
            return NextResponse.json(
                { error: "Failed to update password" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Password set successfully",
        });
    } catch (error) {
        console.error("[Set Password API] Error:", error);
        return NextResponse.json(
            { error: "An error occurred" },
            { status: 500 }
        );
    }
}
