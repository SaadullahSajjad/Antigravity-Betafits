"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";
    const isAccessPage = pathname === "/access";
    const isSetPasswordPage = pathname === "/set-password";
    const isAdminPage = pathname?.startsWith("/admin");

    // Auth pages and admin pages should not have sidebar
    if (isLoginPage || isAccessPage || isSetPasswordPage || isAdminPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {children}
                </div>
            </main>
        </div>
    );
}
