import Link from "next/link";
import { requireMember } from "@/lib/auth/require-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { HouseholdHeader } from "@/components/household-header";
import {
  addFreezerItemAction,
  adjustFreezerQuantityAction,
  removeFreezerItemAction,
} from "./actions";

export default async function FreezerPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await requireMember();
  const supabase = createAdminClient();
  const { q } = await searchParams;
  const search = (q ?? "").trim();

  let query = supabase
    .from("freezer_items")
    .select("id, name, label, quantity, location")
    .eq("household_id", session.householdId)
    .order("name", { ascending: true });

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data: items } = await query;

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-6">
        <HouseholdHeader
          householdName={session.householdName}
          memberName={session.memberName}
        />
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          &larr; Back
        </Link>

        <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
          Freezer
        </h1>

        <form method="get" className="flex gap-2">
          <input
            name="q"
            type="text"
            defaultValue={search}
            placeholder="Search the freezer..."
            className="flex-1 rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:text-zinc-50"
          />
          <button
            type="submit"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:border-zinc-500 dark:border-zinc-700 dark:text-zinc-300"
          >
            Search
          </button>
          {search && (
            <Link
              href="/freezer"
              className="flex items-center text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Clear
            </Link>
          )}
        </form>

        <form
          action={addFreezerItemAction}
          className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:flex-row sm:flex-wrap"
        >
          <input
            name="name"
            type="text"
            required
            placeholder="Item"
            className="flex-1 rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:text-zinc-50"
          />
          <input
            name="label"
            type="text"
            list="label-options"
            placeholder="Label (optional)"
            className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:text-zinc-50 sm:w-40"
          />
          <datalist id="label-options">
            <option value="prepared" />
            <option value="quick meal" />
            <option value="ingredient" />
            <option value="side" />
          </datalist>
          <input
            name="location"
            type="text"
            placeholder="Location (optional)"
            className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:text-zinc-50 sm:w-40"
          />
          <input
            name="quantity"
            type="number"
            min="0"
            step="1"
            defaultValue={1}
            className="w-20 rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:text-zinc-50"
          />
          <button
            type="submit"
            className="rounded-md bg-zinc-950 px-3 py-2 text-sm font-medium text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950"
          >
            Add
          </button>
        </form>

        <div className="flex flex-col divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {(items ?? []).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="flex flex-col">
                <span className="text-sm text-zinc-950 dark:text-zinc-50">
                  {item.name}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {[item.label, item.location].filter(Boolean).join(" · ")}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <form action={adjustFreezerQuantityAction.bind(null, item.id, -1)}>
                  <button
                    type="submit"
                    aria-label="Decrease quantity"
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-300 text-zinc-700 hover:border-zinc-500 dark:border-zinc-700 dark:text-zinc-300"
                  >
                    −
                  </button>
                </form>
                <span className="w-6 text-center text-sm text-zinc-950 dark:text-zinc-50">
                  {item.quantity}
                </span>
                <form action={adjustFreezerQuantityAction.bind(null, item.id, 1)}>
                  <button
                    type="submit"
                    aria-label="Increase quantity"
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-300 text-zinc-700 hover:border-zinc-500 dark:border-zinc-700 dark:text-zinc-300"
                  >
                    +
                  </button>
                </form>
                <form action={removeFreezerItemAction.bind(null, item.id)}>
                  <button
                    type="submit"
                    className="ml-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    ×
                  </button>
                </form>
              </div>
            </div>
          ))}
          {(!items || items.length === 0) && (
            <p className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
              {search ? "No matches." : "Nothing in the freezer yet."}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
