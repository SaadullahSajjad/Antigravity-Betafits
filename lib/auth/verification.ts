// Verification code storage and management
// In production, use Redis or a database instead of in-memory storage

interface VerificationData {
    code: string;
    expiresAt: number;
    email: string;
}

const verificationCodes = new Map<string, VerificationData>();

// Generate 6-digit verification code
export function generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store verification code
export function storeCode(email: string, code: string, expiresInMinutes: number = 10): void {
    const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;
    verificationCodes.set(email.toLowerCase(), {
        code,
        expiresAt,
        email: email.toLowerCase(),
    });
}

// Verify code (doesn't delete - use clearCode after successful auth)
export function verifyCode(email: string, code: string): boolean {
    const stored = verificationCodes.get(email.toLowerCase());
    
    if (!stored) {
        return false;
    }

    if (Date.now() > stored.expiresAt) {
        verificationCodes.delete(email.toLowerCase());
        return false;
    }

    if (stored.code !== code) {
        return false;
    }

    // Code is valid, but don't delete yet (will be deleted after successful auth)
    return true;
}

// Clear verification code after successful authentication
export function clearCode(email: string): void {
    verificationCodes.delete(email.toLowerCase());
}

// Cleanup expired codes periodically
setInterval(() => {
    const now = Date.now();
    verificationCodes.forEach((data, email) => {
        if (now > data.expiresAt) {
            verificationCodes.delete(email);
        }
    });
}, 5 * 60 * 1000); // Clean every 5 minutes
