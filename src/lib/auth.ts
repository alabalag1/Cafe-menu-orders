import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export function getSupabaseServer(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, service, { auth: { persistSession: false } })
}

export type SessionUser = {
  id: string
  role: string
  email: string
}

export async function getSessionUser(req: NextRequest): Promise<SessionUser | null> {
  const sb = getSupabaseServer(req)
  const auth = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!auth) return null
  const { data, error } = await sb.auth.getUser(auth)
  if (error || !data.user) return null
  return {
    id: data.user.id,
    role: (data.user as any).role || 'customer',
    email: data.user.email ?? '',
  }
}
