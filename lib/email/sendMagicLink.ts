import { Resend } from "resend";

/**
 * Get or create Resend client instance (lazy initialization)
 */
function getResendClient(): Resend | null {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        return null;
    }
    return new Resend(apiKey);
}

interface SendMagicLinkOptions {
    email: string;
    magicLink: string;
    userName?: string;
}

/**
 * Send a magic link email to the user
 */
export async function sendMagicLinkEmail({
    email,
    magicLink,
    userName,
}: SendMagicLinkOptions): Promise<{ success: boolean; error?: string }> {
    try {
        // Validate API key and get client
        const resend = getResendClient();
        if (!resend) {
            console.error("[Email] RESEND_API_KEY is not configured");
            return {
                success: false,
                error: "Email service is not configured",
            };
        }

        // Get the from email address (default to noreply if not set)
        const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@betafits.com";
        
        // Ensure from email is in the format "Name <email@domain.com>"
        const from = fromEmail.includes("<") 
            ? fromEmail 
            : `Betafits <${fromEmail}>`;

        // Send email
        const { data, error } = await resend.emails.send({
            from,
            to: email,
            subject: "Your Betafits Login Link",
            html: getMagicLinkEmailTemplate({
                magicLink,
                userName: userName || email.split("@")[0],
            }),
        });

        if (error) {
            console.error("[Email] Resend API error:", error);
            return {
                success: false,
                error: error.message || "Failed to send email",
            };
        }

        console.log(`[Email] Magic link email sent successfully to ${email}, ID: ${data?.id}`);
        return { success: true };
    } catch (error: any) {
        console.error("[Email] Error sending magic link email:", error);
        return {
            success: false,
            error: error.message || "Failed to send email",
        };
    }
}

/**
 * Generate HTML email template for magic link
 */
function getMagicLinkEmailTemplate({
    magicLink,
    userName,
}: {
    magicLink: string;
    userName: string;
}): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Betafits Login Link</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #111827;">Welcome back, ${userName}!</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #374151;">
                                Click the button below to securely log in to your Betafits account. This link will expire in 24 hours.
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                                <tr>
                                    <td align="center" style="padding: 0;">
                                        <a href="${magicLink}" 
                                           style="display: inline-block; padding: 14px 32px; background-color: #111827; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                            Log In to Betafits
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Alternative Link -->
                            <p style="margin: 30px 0 0; font-size: 14px; line-height: 20px; color: #6b7280;">
                                If the button doesn't work, copy and paste this link into your browser:
                            </p>
                            <p style="margin: 10px 0 0; font-size: 12px; line-height: 18px; color: #9ca3af; word-break: break-all;">
                                ${magicLink}
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #f0f0f0; border-radius: 0 0 12px 12px;">
                            <p style="margin: 0; font-size: 12px; line-height: 18px; color: #6b7280; text-align: center;">
                                This link will expire in 24 hours. If you didn't request this login link, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}
