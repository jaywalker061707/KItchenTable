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
          Groceries
        </h1>

        <form
          action={addGroceryItemAction}
          className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:flex-row"
        >
          <input
            name="store"
            type="text"
            list="store-options"
            required
            placeholder="Store"
            className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:text-zinc-50 sm:w-36"
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
            className="flex-1 rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:text-zinc-50"
          />
          <input
            name="quantity"
            type="text"
            placeholder="Qty (optional)"
            className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:text-zinc-50 sm:w-28"
          />
          <button
            type="submit"
            className="rounded-md bg-zinc-950 px-3 py-2 text-sm font-medium text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950"
          >
            Add
          </button>
        </form>

        {stores.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Nothing on the list yet.
          </p>
        )}

        <div className="flex flex-col gap-6">
          {stores.map((store) => (
            <div key={store} className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {store}
              </h2>
              <div className="flex flex-col divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
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
                              ? "border-zinc-900 bg-zinc-900 text-zinc-50 dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-950"
                              : "border-zinc-400 dark:border-zinc-600"
                          }`}
                        >
                          {item.status === "received" ? "✓" : ""}
                        </button>
                      </form>
                      <div className="flex flex-col">
                        <span
                          className={`text-sm text-zinc-950 dark:text-zinc-50 ${
                            item.status === "received"
                              ? "text-zinc-400 line-through dark:text-zinc-600"
                              : ""
                          }`}
                        >
                          {item.name}
                          {item.quantity ? ` — ${item.quantity}` : ""}
                        </span>
                        {item.status === "out_of_stock" && (
                          <span className="text-xs text-amber-600 dark:text-amber-400">
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
                            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
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
                            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
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
