import crypto from "crypto";

/**
 * Magic token storage (in-memory for now)
 * In production, use Redis or a database
 */
interface MagicTokenData {
    token: string;
    userId: string;
    email: string;
    expiresAt: number;
    usedAt?: number;
}

export const magicTokens = new Map<string, MagicTokenData>();

/**
 * Generate a secure random token
 */
export function generateMagicToken(): string {
    return crypto.randomBytes(32).toString("hex");
}

/**
 * Store a magic token
 */
export function storeMagicToken(
    token: string,
    userId: string,
    email: string,
    expiresInHours: number = 24
): void {
    const expiresAt = Date.now() + expiresInHours * 60 * 60 * 1000;
    magicTokens.set(token, {
        token,
        userId,
        email,
        expiresAt,
    });
}

/**
 * Validate a magic token (does NOT mark as used - caller should handle that)
 * This allows the token to be validated from Airtable if not in memory
 */
export function validateMagicToken(token: string): MagicTokenData | null {
    const stored = magicTokens.get(token);

    if (!stored) {
        return null;
    }

    if (Date.now() > stored.expiresAt) {
        magicTokens.delete(token);
        return null;
    }

    // Don't check usedAt here - allow the token to be validated
    // The caller will decide when to mark it as used
    // This allows the token to work on first attempt
    return stored;
}

/**
 * Mark a magic token as used
 */
export function markMagicTokenAsUsed(token: string): void {
    const stored = magicTokens.get(token);
    if (stored && !stored.usedAt) {
        stored.usedAt = Date.now();
    }
}

/**
 * Get token data without consuming it (for validation)
 */
export function getMagicToken(token: string): MagicTokenData | null {
    const stored = magicTokens.get(token);

    if (!stored) {
        return null;
    }

    if (Date.now() > stored.expiresAt) {
        magicTokens.delete(token);
        return null;
    }

    if (stored.usedAt) {
        return null;
    }

    return stored;
}

/**
 * Cleanup expired tokens periodically
 */
setInterval(() => {
    const now = Date.now();
    const tokensToDelete: string[] = [];
    
    magicTokens.forEach((data, token) => {
        if (now > data.expiresAt) {
            tokensToDelete.push(token);
        }
    });
    
    tokensToDelete.forEach(token => {
        magicTokens.delete(token);
    });
}, 60 * 60 * 1000); // Clean every hour
