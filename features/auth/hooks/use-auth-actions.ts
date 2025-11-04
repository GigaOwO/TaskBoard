"use client";

import { useCallback, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface AuthActions {
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
  isProcessing: boolean;
}

/** Provides reusable Supabase auth actions for UI components. */
export function useAuthActions(): AuthActions {
  const supabase = useMemo(() => createClient(), []);
  const [isProcessing, setProcessing] = useState(false);

  const signInWithGitHub = useCallback(async () => {
    try {
      setProcessing(true);
      await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo:
            typeof window !== "undefined" ? window.location.href : undefined,
        },
      });
    } finally {
      setProcessing(false);
    }
  }, [supabase]);

  const signOut = useCallback(async () => {
    try {
      setProcessing(true);
      await supabase.auth.signOut();
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } finally {
      setProcessing(false);
    }
  }, [supabase]);

  return {
    signInWithGitHub,
    signOut,
    isProcessing,
  };
}
