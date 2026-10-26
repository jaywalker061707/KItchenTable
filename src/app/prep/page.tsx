import Link from "next/link";
import { requireMember } from "@/lib/auth/require-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { HouseholdHeader } from "@/components/household-header";
import {
  createBatchAction,
  toggleStepAction,
  finishBatchAction,
  deleteBatchAction,
} from "./actions";

type Step = { text: string; done: boolean };
type Batch = {
  id: string;
  name: string;
  steps: Step[];
  packs_produced: number | null;
  completed_at: string | null;
};

export default async function PrepPage() {
  const session = await requireMember();
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("prep_batches")
    .select("id, name, steps, packs_produced, completed_at")
    .eq("household_id", session.householdId)
    .order("created_at", { ascending: false });

  const batches = (data ?? []) as Batch[];
  const activeBatches = batches.filter((b) => !b.completed_at);
  const completedBatches = batches.filter((b) => b.completed_at);

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
          Meal Prep
        </h1>

        <form
          action={createBatchAction}
          className="flex flex-col gap-2 rounded-xl border border-hairline bg-linen p-4 dark:border-hairline-dark dark:bg-plum"
        >
          <input
            name="name"
            type="text"
            required
            placeholder="Batch name (e.g. Chicken taco packs)"
            className="rounded-md border border-hairline bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-signal dark:border-hairline-dark dark:text-ghost"
          />
          <textarea
            name="steps"
            rows={3}
            placeholder={"One step per line (optional)"}
            className="rounded-md border border-hairline bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-signal dark:border-hairline-dark dark:text-ghost"
          />
          <button
            type="submit"
            className="self-start rounded-md bg-signal px-3 py-2 text-sm font-medium text-ghost hover:opacity-90"
          >
            Start batch
          </button>
        </form>

        <div className="flex flex-col gap-4">
          {activeBatches.map((batch) => (
            <div
              key={batch.id}
              className="flex flex-col gap-3 rounded-xl border border-hairline bg-linen p-4 dark:border-hairline-dark dark:bg-plum"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink dark:text-ghost">
                  {batch.name}
                </span>
                <form action={deleteBatchAction.bind(null, batch.id)}>
                  <button
                    type="submit"
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    Delete
                  </button>
                </form>
              </div>

              {batch.steps.length > 0 && (
                <div className="flex flex-col gap-1">
                  {batch.steps.map((step, index) => (
                    <form
                      key={index}
                      action={toggleStepAction.bind(null, batch.id, index)}
                    >
                      <button
                        type="submit"
                        className="flex w-full items-center gap-2 text-left text-sm"
                      >
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
                            step.done
                              ? "border-signal bg-signal text-ghost"
                              : "border-muted dark:border-iris"
                          }`}
                        >
                          {step.done ? "✓" : ""}
                        </span>
                        <span
                          className={
                            step.done
                              ? "text-muted line-through"
                              : "text-ink dark:text-ghost"
                          }
                        >
                          {step.text}
                        </span>
                      </button>
                    </form>
                  ))}
                </div>
              )}

              <form
                action={finishBatchAction}
                className="flex items-center gap-2 border-t border-hairline pt-3 dark:border-hairline-dark"
              >
                <input type="hidden" name="batchId" value={batch.id} />
                <input
                  name="packsProduced"
                  type="number"
                  min="1"
                  step="1"
                  required
                  placeholder="Packs produced"
                  className="w-32 rounded-md border border-hairline bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-signal dark:border-hairline-dark dark:text-ghost"
                />
                <button
                  type="submit"
                  className="rounded-md bg-signal px-3 py-2 text-sm font-medium text-ghost hover:opacity-90"
                >
                  Finish batch &rarr; add to Freezer
                </button>
              </form>
            </div>
          ))}
          {activeBatches.length === 0 && (
            <p className="text-sm text-muted dark:text-iris">
              No batches in progress.
            </p>
          )}
        </div>

        {completedBatches.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted dark:text-iris">
              Finished
            </h2>
            <div className="flex flex-col divide-y divide-hairline rounded-xl border border-hairline dark:divide-hairline-dark dark:border-hairline-dark">
              {completedBatches.map((batch) => (
                <div
                  key={batch.id}
                  className="flex items-center justify-between px-4 py-3 text-sm"
                >
                  <span className="text-ink dark:text-ghost">
                    {batch.name}
                  </span>
                  <span className="text-muted dark:text-iris">
                    {batch.packs_produced} packs
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
