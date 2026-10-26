"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { signupAction, type SignupState } from "./actions";

const initialState: SignupState = {};

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(
    signupAction,
    initialState,
  );
  const [timezone, setTimezone] = useState("");

  useEffect(() => {
    // The browser's timezone isn't knowable during server rendering, so
    // this has to run post-mount — a legitimate use of an effect, not a
    // derived-state anti-pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <form
        action={formAction}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
            Create your household
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            This is your own private space — dinners, groceries, and the
            freezer. Recipes you add are shared with every household.
          </p>
        </div>

        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          Your name
          <input
            name="memberName"
            type="text"
            required
            autoComplete="off"
            placeholder="So the household knows who added what"
            className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-zinc-500 dark:border-zinc-700 dark:text-zinc-50"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          Household name
          <input
            name="householdName"
            type="text"
            required
            autoComplete="off"
            className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-zinc-950 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:text-zinc-50"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          PIN
          <input
            name="pin"
            type="password"
            inputMode="numeric"
            required
            autoComplete="off"
            className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-zinc-950 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:text-zinc-50"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          Confirm PIN
          <input
            name="confirmPin"
            type="password"
            inputMode="numeric"
            required
            autoComplete="off"
            className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-zinc-950 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:text-zinc-50"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          Timezone
          <input
            name="timezone"
            type="text"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            autoComplete="off"
            className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-zinc-950 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:text-zinc-50"
          />
          <span className="text-xs text-zinc-500 dark:text-zinc-500">
            Detected automatically — change it if this is wrong.
          </span>
        </label>

        {state.error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-zinc-950 px-3 py-2 text-sm font-medium text-zinc-50 transition-opacity disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950"
        >
          {isPending ? "Creating..." : "Create household"}
        </button>

        <Link
          href="/login"
          className="text-center text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Already have a household? Sign in
        </Link>
      </form>
    </div>
  );
}
