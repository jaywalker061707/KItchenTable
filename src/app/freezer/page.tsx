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
    <div className="flex flex-1 flex-col items-center bg-ghost px-6 py-16 dark:bg-void">
      <main className="flex w-full max-w-3xl flex-col gap-6">
        <HouseholdHeader
          householdName={session.householdName}
          memberName={session.memberName}
        />
        <Link
          href="/"
          className="text-sm text-muted hover:text-ink dark:hover:text-ghost"
        >
          &larr; Back
        </Link>

        <h1 className="text-2xl font-display text-ink dark:text-ghost">
          Freezer
        </h1>

        <form method="get" className="flex gap-2">
          <input
            name="q"
            type="text"
            defaultValue={search}
            placeholder="Search the freezer..."
            className="flex-1 rounded-md border border-hairline bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-signal dark:border-hairline-dark dark:text-ghost"
          />
          <button
            type="submit"
            className="rounded-md border border-hairline px-3 py-2 text-sm text-ink hover:border-signal dark:border-hairline-dark dark:text-ghost"
          >
            Search
          </button>
          {search && (
            <Link
              href="/freezer"
              className="flex items-center text-sm text-muted hover:text-ink dark:hover:text-ghost"
            >
              Clear
            </Link>
          )}
        </form>

        <form
          action={addFreezerItemAction}
          className="flex flex-col gap-2 rounded-xl border border-hairline bg-linen p-4 dark:border-hairline-dark dark:bg-plum sm:flex-row sm:flex-wrap"
        >
          <input
            name="name"
            type="text"
            required
            placeholder="Item"
            className="flex-1 rounded-md border border-hairline bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-signal dark:border-hairline-dark dark:text-ghost"
          />
          <input
            name="label"
            type="text"
            list="label-options"
            placeholder="Label (optional)"
            className="w-full rounded-md border border-hairline bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-signal dark:border-hairline-dark dark:text-ghost sm:w-40"
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
            className="w-full rounded-md border border-hairline bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-signal dark:border-hairline-dark dark:text-ghost sm:w-40"
          />
          <input
            name="quantity"
            type="number"
            min="0"
            step="1"
            defaultValue={1}
            className="w-20 rounded-md border border-hairline bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-signal dark:border-hairline-dark dark:text-ghost"
          />
          <button
            type="submit"
            className="rounded-md bg-signal px-3 py-2 text-sm font-medium text-ghost hover:opacity-90"
          >
            Add
          </button>
        </form>

        <div className="flex flex-col divide-y divide-hairline rounded-xl border border-hairline dark:divide-hairline-dark dark:border-hairline-dark">
          {(items ?? []).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="flex flex-col">
                <span className="text-sm text-ink dark:text-ghost">
                  {item.name}
                </span>
                <span className="text-xs text-muted dark:text-iris">
                  {[item.label, item.location].filter(Boolean).join(" · ")}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <form action={adjustFreezerQuantityAction.bind(null, item.id, -1)}>
                  <button
                    type="submit"
                    aria-label="Decrease quantity"
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-hairline text-ink hover:border-signal dark:border-hairline-dark dark:text-ghost"
                  >
                    −
                  </button>
                </form>
                <span className="w-6 text-center text-sm text-ink dark:text-ghost">
                  {item.quantity}
                </span>
                <form action={adjustFreezerQuantityAction.bind(null, item.id, 1)}>
                  <button
                    type="submit"
                    aria-label="Increase quantity"
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-hairline text-ink hover:border-signal dark:border-hairline-dark dark:text-ghost"
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
            <p className="px-4 py-3 text-sm text-muted dark:text-iris">
              {search ? "No matches." : "Nothing in the freezer yet."}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
