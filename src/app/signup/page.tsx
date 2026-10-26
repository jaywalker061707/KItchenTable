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
  const [extraMembers, setExtraMembers] = useState<string[]>([]);

  useEffect(() => {
    // The browser's timezone isn't knowable during server rendering, so
    // this has to run post-mount — a legitimate use of an effect, not a
    // derived-state anti-pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-ghost px-6 py-16 dark:bg-void">
      <form
        action={formAction}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-hairline bg-linen p-6 dark:border-hairline-dark dark:bg-plum"
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-display text-ink dark:text-ghost">
            Create your household
          </h1>
          <p className="text-sm text-muted dark:text-iris">
            This is your own private space — dinners, groceries, and the
            freezer. Recipes you add are shared with every household.
          </p>
        </div>

        <label className="flex flex-col gap-1 text-sm text-ink dark:text-ghost">
          Your name
          <input
            name="memberName"
            type="text"
            required
            autoComplete="off"
            placeholder="So the household knows who added what"
            className="rounded-md border border-hairline bg-transparent px-3 py-2 text-ink outline-none placeholder:text-muted focus:border-signal dark:border-hairline-dark dark:text-ghost"
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-ink dark:text-ghost">
            Other household members{" "}
            <span className="text-muted dark:text-iris">
              (optional — can add more later)
            </span>
          </span>
          {extraMembers.map((_, index) => (
            <div key={index} className="flex gap-2">
              <input
                name="additionalMemberName"
                type="text"
                autoComplete="off"
                className="flex-1 rounded-md border border-hairline bg-transparent px-3 py-2 text-ink outline-none focus:border-signal dark:border-hairline-dark dark:text-ghost"
              />
              <button
                type="button"
                onClick={() =>
                  setExtraMembers((prev) =>
                    prev.filter((_, i) => i !== index),
                  )
                }
                className="px-2 text-sm text-muted hover:text-ink dark:hover:text-ghost"
                aria-label="Remove this member"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setExtraMembers((prev) => [...prev, ""])}
            className="text-left text-sm text-muted hover:text-ink dark:hover:text-ghost"
          >
            + Add another member
          </button>
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

        <label className="flex flex-col gap-1 text-sm text-ink dark:text-ghost">
          Confirm PIN
          <input
            name="confirmPin"
            type="password"
            inputMode="numeric"
            required
            autoComplete="off"
            className="rounded-md border border-hairline bg-transparent px-3 py-2 text-ink outline-none focus:border-signal dark:border-hairline-dark dark:text-ghost"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-ink dark:text-ghost">
          Timezone
          <input
            name="timezone"
            type="text"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            autoComplete="off"
            className="rounded-md border border-hairline bg-transparent px-3 py-2 text-ink outline-none focus:border-signal dark:border-hairline-dark dark:text-ghost"
          />
          <span className="text-xs text-muted dark:text-iris">
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
          className="rounded-md bg-signal px-3 py-2 text-sm font-medium text-ghost transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? "Creating..." : "Create household"}
        </button>

        <Link
          href="/login"
          className="text-center text-sm text-muted hover:text-ink dark:hover:text-ghost"
        >
          Already have a household? Sign in
        </Link>
      </form>
    </div>
  );
}
