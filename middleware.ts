import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get admin login status from cookie or session
  // Since we're using client-side state management, we can't easily check server-side
  // This middleware will just protect against direct URL access
  
  const { pathname } = request.nextUrl
  
  // Protected admin routes
  const protectedRoutes = ['/config']
  
  if (protectedRoutes.includes(pathname)) {
    // For protected routes, we'll let the client-side check handle it
    // but could add server-side protection here if needed
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/config', '/admin']
}