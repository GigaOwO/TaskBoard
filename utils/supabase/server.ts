import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function ensureEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const supabaseUrl = ensureEnv(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL,
);
const supabaseKey = ensureEnv(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export function createClient() {
  const cookieStorePromise = Promise.resolve(cookies());

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      async getAll() {
        const store = await cookieStorePromise;
        return store.getAll();
      },
      async setAll(cookiesToSet) {
        const store = await cookieStorePromise;
        cookiesToSet.forEach(({ name, value, options }) => {
          store.set({
            name,
            value,
            ...options,
          });
        });
      },
    },
  });
}
