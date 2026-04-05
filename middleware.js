import { NextResponse } from 'next/server'

const protectedRoutes = ['/dashboard', '/articles', '/depenses', '/profil']

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    const token = request.cookies.get('sb-access-token')?.value

    // If no token, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|login|signup).*)'],
}
