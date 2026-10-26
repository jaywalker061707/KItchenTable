import Link from "next/link";
import { requireMember } from "@/lib/auth/require-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { HouseholdHeader } from "@/components/household-header";
import {
  addGroceryItemAction,
  setGroceryStatusAction,
  removeGroceryItemAction,
} from "./actions";

type GroceryItem = {
  id: string;
  store: string;
  name: string;
  quantity: string | null;
  status: "needed" | "out_of_stock" | "received";
};

export default async function GroceriesPage() {
  const session = await requireMember();
  const supabase = createAdminClient();

  const { data: items } = await supabase
    .from("grocery_items")
    .select("id, store, name, quantity, status")
    .eq("household_id", session.householdId)
    .order("store", { ascending: true })
    .order("created_at", { ascending: true });

  const byStore = new Map<string, GroceryItem[]>();
  for (const item of (items ?? []) as GroceryItem[]) {
    const list = byStore.get(item.store) ?? [];
    list.push(item);
    byStore.set(item.store, list);
  }
  const stores = Array.from(byStore.keys()).sort();

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
          Groceries
        </h1>

        <form
          action={addGroceryItemAction}
          className="flex flex-col gap-2 rounded-xl border border-hairline bg-linen p-4 dark:border-hairline-dark dark:bg-plum sm:flex-row"
        >
          <input
            name="store"
            type="text"
            list="store-options"
            required
            placeholder="Store"
            className="w-full rounded-md border border-hairline bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-signal dark:border-hairline-dark dark:text-ghost sm:w-36"
          />
          <datalist id="store-options">
            {stores.map((store) => (
              <option key={store} value={store} />
            ))}
          </datalist>
          <input
            name="name"
            type="text"
            required
            placeholder="Item"
            className="flex-1 rounded-md border border-hairline bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-signal dark:border-hairline-dark dark:text-ghost"
          />
          <input
            name="quantity"
            type="text"
            placeholder="Qty (optional)"
            className="w-full rounded-md border border-hairline bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-signal dark:border-hairline-dark dark:text-ghost sm:w-28"
          />
          <button
            type="submit"
            className="rounded-md bg-signal px-3 py-2 text-sm font-medium text-ghost hover:opacity-90"
          >
            Add
          </button>
        </form>

        {stores.length === 0 && (
          <p className="text-sm text-muted dark:text-iris">
            Nothing on the list yet.
          </p>
        )}

        <div className="flex flex-col gap-6">
          {stores.map((store) => (
            <div key={store} className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted dark:text-iris">
                {store}
              </h2>
              <div className="flex flex-col divide-y divide-hairline rounded-xl border border-hairline dark:divide-hairline-dark dark:border-hairline-dark">
                {byStore.get(store)!.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <form
                        action={setGroceryStatusAction.bind(
                          null,
                          item.id,
                          item.status === "received" ? "needed" : "received",
                        )}
                      >
                        <button
                          type="submit"
                          aria-label={
                            item.status === "received"
                              ? "Mark as needed"
                              : "Mark as received"
                          }
                          className={`flex h-5 w-5 items-center justify-center rounded border text-xs ${
                            item.status === "received"
                              ? "border-signal bg-signal text-ghost"
                              : "border-muted dark:border-iris"
                          }`}
                        >
                          {item.status === "received" ? "✓" : ""}
                        </button>
                      </form>
                      <div className="flex flex-col">
                        <span
                          className={`text-sm text-ink dark:text-ghost ${
                            item.status === "received"
                              ? "text-muted line-through"
                              : ""
                          }`}
                        >
                          {item.name}
                          {item.quantity ? ` — ${item.quantity}` : ""}
                        </span>
                        {item.status === "out_of_stock" && (
                          <span className="text-xs text-signal dark:text-iris">
                            Out of stock
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      {item.status !== "out_of_stock" ? (
                        <form
                          action={setGroceryStatusAction.bind(
                            null,
                            item.id,
                            "out_of_stock",
                          )}
                        >
                          <button
                            type="submit"
                            className="text-muted hover:text-ink dark:hover:text-ghost"
                          >
                            Out of stock
                          </button>
                        </form>
                      ) : (
                        <form
                          action={setGroceryStatusAction.bind(
                            null,
                            item.id,
                            "needed",
                          )}
                        >
                          <button
                            type="submit"
                            className="text-muted hover:text-ink dark:hover:text-ghost"
                          >
                            Back in stock
                          </button>
                        </form>
                      )}
                      <form action={removeGroceryItemAction.bind(null, item.id)}>
                        <button
                          type="submit"
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          ×
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
