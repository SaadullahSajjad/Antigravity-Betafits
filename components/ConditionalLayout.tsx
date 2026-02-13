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
        <div className="flex h-screen bg-white font-sans text-gray-900 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-white p-8 lg:p-12">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
