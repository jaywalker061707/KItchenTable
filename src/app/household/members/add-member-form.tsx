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
      className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
        Add a member
        <input
          name="displayName"
          type="text"
          required
          autoComplete="off"
          className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-zinc-950 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:text-zinc-50"
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
        className="rounded-md bg-zinc-950 px-3 py-2 text-sm font-medium text-zinc-50 transition-opacity disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950"
      >
        {isPending ? "Adding..." : "Add member"}
      </button>
    </form>
  );
}
