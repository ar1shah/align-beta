import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  // Use the request URL to determine the origin dynamically
  const redirectUrl = new URL('/login', request.url);
  return NextResponse.redirect(redirectUrl);
}

