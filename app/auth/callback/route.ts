import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const returnTo = url.searchParams.get("returnTo") ?? "/";
  const redirectUrl = new URL(returnTo, url.origin);

  if (!code) {
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  } catch (error) {
    console.error("Failed to exchange auth code for session", error);
  }

  return NextResponse.redirect(redirectUrl);
}
