import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { access_token, refresh_token, redirect } = await req.json()
    if (!access_token || !refresh_token) {
      return NextResponse.json({ error: 'Missing tokens' }, { status: 400 })
    }

    const res = NextResponse.json({ ok: true })
    const isProd = process.env.NODE_ENV === 'production'

    res.cookies.set('sb-access-token', access_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 // 1 hour
    })
    res.cookies.set('sb-refresh-token', refresh_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    if (redirect) {
      const r = NextResponse.redirect(new URL(redirect, req.url))
      r.cookies.set('sb-access-token', access_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60
      })
      r.cookies.set('sb-refresh-token', refresh_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7
      })
      return r
    }

    return res
  } catch (e) {
    return NextResponse.json({ error: 'Failed to set session' }, { status: 500 })
  }
}


