"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type SupabaseUser = NonNullable<
  Awaited<
    ReturnType<ReturnType<typeof createClient>["auth"]["getUser"]>
  >["data"]["user"]
>;

interface AuthState {
  user: SupabaseUser | null;
  isLoading: boolean;
}

/** Tracks Supabase auth session changes on the client. */
export function useAuthState(): AuthState {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    supabase.auth
      .getUser()
      .then(({ data, error }) => {
        if (!isMounted) {
          return;
        }

        if (error) {
          setUser(null);
        } else {
          setUser(data.user ?? null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) {
          return;
        }

        setUser(session?.user ?? null);
        setLoading(false);
      },
    );

    return () => {
      isMounted = false;
      listener?.subscription.unsubscribe();
    };
  }, [supabase]);

  return {
    user,
    isLoading,
  };
}
