import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  // Performance headers for images with mobile optimization
  if (pathname.startsWith('/images/') || pathname.startsWith('/api/images/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('Accept-Ranges', 'bytes'); // Enable range requests for large images
  }

  // Static assets caching with compression
  if (pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('Vary', 'Accept-Encoding'); // Enable compression
  }

  // Mobile-specific optimizations
  const userAgent = request.headers.get('user-agent') || '';
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
  
  if (isMobile) {
    response.headers.set('X-Mobile-Optimized', 'true');
    // Hint to browsers to prioritize critical resources on mobile
    response.headers.set('Critical-CH', 'Viewport-Width, Device-Memory');
  }

  // ONLY apply authentication logic to admin routes
  if (!pathname.startsWith("/admin")) {
    return response;
  }

  // Allow access to API routes
  if (pathname.startsWith("/api/auth/")) {
    return response;
  }

  // Check for authentication cookie
  const authCookie = request.cookies.get("admin_auth");
  let isAuthenticated = false;

  if (authCookie) {
    try {
      const token = authCookie.value;
      const decoded = Buffer.from(token, "base64").toString();
      const [user, password] = decoded.split(":");

      const validUser = process.env.ADMIN_USER;
      const validPass = process.env.ADMIN_PASS;

      if (user === validUser && password === validPass) {
        isAuthenticated = true;
      }
    } catch (e) {
      return NextResponse.json(`INVALID TOKEN ${e}`);
    }
  }

  // If user is authenticated and trying to access login page, redirect to admin
  if (pathname === "/admin/login" && isAuthenticated) {
    const adminUrl = new URL("/admin", request.url);
    return NextResponse.redirect(adminUrl);
  }

  // Allow access to login page if not authenticated
  if (pathname === "/admin/login") {
    return response;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // User is authenticated, allow access
  return response;
}

export const config = {
  matcher: [
    "/admin/:path*", // Protect admin pages
    "/((?!_next/static|_next/image|favicon.ico).*)", // Apply headers to all routes except Next.js internals
  ],
};
