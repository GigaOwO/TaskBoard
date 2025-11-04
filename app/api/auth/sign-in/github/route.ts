import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const url = new URL(request.url);
  const origin = url.origin;
  const returnTo = url.searchParams.get("returnTo") ?? "/";
  const redirectHost = `${origin}/auth/callback?returnTo=${encodeURIComponent(returnTo)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: redirectHost,
    },
  });

  if (error || !data?.url) {
    console.error("GitHub sign-in initiation failed", error);
    return NextResponse.redirect(new URL(returnTo, origin), {
      status: 302,
    });
  }

  return NextResponse.redirect(data.url, {
    status: 302,
  });
}
