import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST() {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to sign out", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
