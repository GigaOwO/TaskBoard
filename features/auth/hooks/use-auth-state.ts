"use client";

import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";

interface SessionResponse {
  user: User | null;
}

/** Fetches the Supabaseセッション情報を Route Handler 経由で取得するフック。 */
export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/session", {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const payload = (await res.json()) as SessionResponse;
      setUser(payload.user ?? null);
    } catch (error) {
      console.error("Failed to fetch session", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();

    function handleFocus() {
      void refresh();
    }

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [refresh]);

  return {
    user,
    isLoading,
    refresh,
  };
}
