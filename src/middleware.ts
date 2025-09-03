import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protect staff/admin routes with a simple session cookie check
export async function middleware(req: NextRequest) {
  const url = req.nextUrl
  const path = url.pathname

  const protectedPrefixes = ['/admin', '/kitchen', '/orders']
  const isProtected = protectedPrefixes.some(p => path.startsWith(p))
  if (!isProtected) return NextResponse.next()

  // Supabase sets a cookie sb-access-token when authenticated in the browser SDK
  const hasSb = req.cookies.get('sb-access-token') || req.cookies.get('sb-access-token')?.value
  if (!hasSb) {
    url.pathname = '/login'
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/kitchen', '/orders']
}


