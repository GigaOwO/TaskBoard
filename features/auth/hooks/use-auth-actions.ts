"use client";

import { useCallback, useState } from "react";

interface AuthActions {
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
  isProcessing: boolean;
}

/** Provides reusable Supabase auth actions for UI components. */
export function useAuthActions(): AuthActions {
  const [isProcessing, setProcessing] = useState(false);

  const signInWithGitHub = useCallback(async () => {
    try {
      setProcessing(true);
      if (typeof window === "undefined") {
        return;
      }

      const currentUrl = window.location.href;
      const returnTo = encodeURIComponent(currentUrl);
      window.location.href = `/api/auth/sign-in/github?returnTo=${returnTo}`;
    } finally {
      setProcessing(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setProcessing(true);
      await fetch("/api/auth/sign-out", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } finally {
      setProcessing(false);
    }
  }, []);

  return {
    signInWithGitHub,
    signOut,
    isProcessing,
  };
}
