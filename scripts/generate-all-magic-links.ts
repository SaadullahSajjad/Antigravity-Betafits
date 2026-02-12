/**
 * Script to generate magic link URLs for all users
 * Run with: npx tsx scripts/generate-all-magic-links.ts
 * Or: npm run generate-magic-links (if added to package.json)
 */

// Load environment variables from .env.local
import * as fs from "fs";
import * as path from "path";

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith("#")) {
            const [key, ...valueParts] = trimmedLine.split("=");
            if (key && valueParts.length > 0) {
                const value = valueParts.join("=").replace(/^["']|["']$/g, "");
                process.env[key.trim()] = value.trim();
            }
        }
    });
}

import { generateAllUsersMagicLinks } from "../lib/auth/generateAllMagicLinks";

async function main() {
    console.log("🚀 Starting magic link generation for all users...\n");

    try {
        const result = await generateAllUsersMagicLinks({
            onlyActive: true, // Only process active users
            batchSize: 10, // Process 10 users at a time
        });

        console.log("\n" + "=".repeat(60));
        console.log("📊 RESULTS SUMMARY");
        console.log("=".repeat(60));
        console.log(`Total Users Found: ${result.totalUsers}`);
        console.log(`✅ Successfully Updated: ${result.updated}`);
        console.log(`❌ Failed: ${result.failed}`);
        console.log(`⏭️  Skipped: ${result.skipped}`);
        console.log("=".repeat(60));

        if (result.errors.length > 0) {
            console.log("\n⚠️  ERRORS:");
            result.errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        }

        if (result.success) {
            console.log("\n✅ All magic links generated successfully!");
        } else {
            console.log("\n⚠️  Some errors occurred during generation.");
        }

        process.exit(result.success ? 0 : 1);
    } catch (error: any) {
        console.error("\n❌ Fatal error:", error.message);
        process.exit(1);
    }
}

main();
