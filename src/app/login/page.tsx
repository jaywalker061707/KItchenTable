"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-ghost px-6 py-16 dark:bg-void">
      <form
        action={formAction}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-hairline bg-linen p-6 dark:border-hairline-dark dark:bg-plum"
      >
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="text-sm text-muted dark:text-iris">
            Sign in to your household.
          </p>
        </div>

        <label className="flex flex-col gap-1 text-sm text-ink dark:text-ghost">
          Household name
          <input
            name="householdName"
            type="text"
            required
            autoComplete="off"
            className="rounded-md border border-hairline bg-transparent px-3 py-2 text-ink outline-none focus:border-signal dark:border-hairline-dark dark:text-ghost"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-ink dark:text-ghost">
          PIN
          <input
            name="pin"
            type="password"
            inputMode="numeric"
            required
            autoComplete="off"
            className="rounded-md border border-hairline bg-transparent px-3 py-2 text-ink outline-none focus:border-signal dark:border-hairline-dark dark:text-ghost"
          />
        </label>

        {state.error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-signal px-3 py-2 text-sm font-medium text-ghost transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? "Signing in..." : "Sign in"}
        </button>

        <Link
          href="/signup"
          className="text-center text-sm text-muted hover:text-ink dark:hover:text-ghost"
        >
          Need a household? Create one
        </Link>
      </form>
    </div>
  );
}
