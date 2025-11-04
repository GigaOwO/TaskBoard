"use client";

import Image from "next/image";
import type { ComponentProps } from "react";
import { useAuthActions } from "../hooks/use-auth-actions";
import { useAuthState } from "../hooks/use-auth-state";

interface AuthPanelProps {
  isUnauthorized: boolean;
  isLoading: boolean;
  counts: {
    todo: number;
    inProgress: number;
    done: number;
  };
  refresh: () => void;
}

function Avatar({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={name}
        width={40}
        height={40}
        unoptimized
        className="h-10 w-10 rounded-full border border-zinc-200 object-cover dark:border-zinc-700"
      />
    );
  }

  const initials = name
    .trim()
    .split(/\s+/)
    .map((token) => token[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-sm font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
      {initials || "U"}
    </div>
  );
}

function AuthButton({ children, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-amber-600 dark:text-amber-200 dark:hover:bg-amber-900/40"
      {...props}
    >
      {children}
    </button>
  );
}

/** Displays Supabase auth status with call-to-action buttons. */
export function AuthPanel({
  isUnauthorized,
  isLoading,
  counts,
  refresh,
}: AuthPanelProps) {
  const { user, isLoading: authLoading } = useAuthState();
  const { signInWithGitHub, signOut, isProcessing } = useAuthActions();

  if (authLoading && isLoading) {
    return null;
  }

  if (!user) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
        <div className="space-y-1">
          <p className="font-semibold">
            Supabase にサインインするとタスクを保存できます。
          </p>
          {isUnauthorized ? (
            <p className="text-xs opacity-80">
              ログイン後に画面を再読み込みして操作を続けましょう。
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              void refresh();
            }}
            className="rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/40"
          >
            再読み込み
          </button>
          <button
            type="button"
            onClick={() => {
              void signInWithGitHub();
            }}
            disabled={isProcessing}
            className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-amber-300"
          >
            GitHubでサインイン
          </button>
        </div>
      </div>
    );
  }

  const displayName =
    (user.user_metadata?.name as string | undefined) ??
    (user.user_metadata?.full_name as string | undefined) ??
    user.email ??
    "ログイン中";

  const avatarUrl =
    (user.user_metadata?.avatar_url as string | undefined) ??
    (user.user_metadata?.picture as string | undefined);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-center gap-3">
        <Avatar name={displayName} avatarUrl={avatarUrl} />
        <div className="text-sm">
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">
            {displayName}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            未着手 {counts.todo}・進行中 {counts.inProgress}・完了 {counts.done}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <AuthButton
          onClick={() => {
            void refresh();
          }}
        >
          更新
        </AuthButton>
        <AuthButton
          onClick={() => {
            void signOut();
          }}
          disabled={isProcessing}
        >
          サインアウト
        </AuthButton>
      </div>
    </div>
  );
}
