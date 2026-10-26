"use client";

import { useActionState } from "react";
import { addMemberAction, type AddMemberState } from "./actions";

const initialState: AddMemberState = {};

export function AddMemberForm() {
  const [state, formAction, isPending] = useActionState(
    addMemberAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="flex flex-col gap-2 rounded-xl border border-hairline bg-linen p-4 dark:border-hairline-dark dark:bg-plum"
    >
      <label className="flex flex-col gap-1 text-sm text-ink dark:text-ghost">
        Add a member
        <input
          name="displayName"
          type="text"
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
        {isPending ? "Adding..." : "Add member"}
      </button>
    </form>
  );
}
