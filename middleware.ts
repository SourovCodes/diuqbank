import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Add any additional public paths that require authentication here
const PROTECTED_PUBLIC_PATHS = [
    "/contact",
];

function isProtectedPath(pathname: string): boolean {
    if (pathname.startsWith("/admin")) return true;
    return PROTECTED_PUBLIC_PATHS.includes(pathname);
}

export async function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl;

    // Skip if not a protected path
    if (!isProtectedPath(pathname)) {
        return NextResponse.next();
    }

    // Avoid redirect loop when already on login
    if (pathname === "/login") {
        return NextResponse.next();
    }

    // Check session using Better Auth
    const session = await auth.api.getSession({
        headers: request.headers,
    });

    if (!session) {
        const intended = `${pathname}${search || ""}`;
        const redirectUrl = new URL(`/login`, request.url);
        redirectUrl.searchParams.set("redirect", intended);
        return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
}

export const config = {
    runtime: "nodejs",
    // Must be statically analyzable; don't spread variables here
    matcher: [
        "/admin/:path*",
        "/contact",
    ],
};


