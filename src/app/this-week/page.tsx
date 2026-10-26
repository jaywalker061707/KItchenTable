import Link from "next/link";
import { requireMember } from "@/lib/auth/require-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { HouseholdHeader } from "@/components/household-header";
import { saveMealAction, removeMealAction } from "./actions";
import {
  todayInTimezone,
  parseISODate,
  formatISODate,
  addDays,
  weekAnchor,
  formatDayLabel,
} from "@/lib/dates";

export default async function ThisWeekPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string }>;
}) {
  const session = await requireMember();
  const supabase = createAdminClient();

  const { data: household } = await supabase
    .from("households")
    .select("timezone")
    .eq("id", session.householdId)
    .single();

  const timezone = household?.timezone ?? "UTC";
  const { start } = await searchParams;

  const anchor = start
    ? weekAnchor(parseISODate(start))
    : weekAnchor(parseISODate(todayInTimezone(timezone)));

  const days = Array.from({ length: 9 }, (_, i) => addDays(anchor, i));
  const rangeStart = formatISODate(days[0]);
  const rangeEnd = formatISODate(days[days.length - 1]);

  const { data: entries } = await supabase
    .from("meal_plan_entries")
    .select("id, plan_date, meal_name, note")
    .eq("household_id", session.householdId)
    .gte("plan_date", rangeStart)
    .lte("plan_date", rangeEnd);

  const entryByDate = new Map(
    (entries ?? []).map((entry) => [entry.plan_date, entry]),
  );

  const prevStart = formatISODate(addDays(anchor, -9));
  const nextStart = formatISODate(addDays(anchor, 9));
  const todayStr = todayInTimezone(timezone);

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

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
              This Week
            </h1>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {formatDayLabel(days[0])} &ndash;{" "}
              {formatDayLabel(days[days.length - 1])}
            </span>
          </div>
          <div className="flex gap-3 text-sm">
            <Link
              href={`/this-week?start=${prevStart}`}
              className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              &larr; Prev
            </Link>
            <Link
              href={`/this-week?start=${nextStart}`}
              className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Next &rarr;
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {days.map((date) => {
            const dateStr = formatISODate(date);
            const entry = entryByDate.get(dateStr);
            const isToday = dateStr === todayStr;

            return (
              <div
                key={dateStr}
                className={`rounded-xl border bg-white p-4 dark:bg-zinc-950 ${
                  isToday
                    ? "border-zinc-400 dark:border-zinc-500"
                    : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                    {formatDayLabel(date)}
                    {isToday && (
                      <span className="ml-2 text-xs font-normal text-zinc-500 dark:text-zinc-400">
                        Today
                      </span>
                    )}
                  </span>
                  {entry && (
                    <form action={removeMealAction.bind(null, entry.id)}>
                      <button
                        type="submit"
                        className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        Clear
                      </button>
                    </form>
                  )}
                </div>
                <form
                  action={saveMealAction}
                  className="flex flex-col gap-2 sm:flex-row"
                >
                  <input type="hidden" name="planDate" value={dateStr} />
                  <input
                    name="mealName"
                    type="text"
                    defaultValue={entry?.meal_name ?? ""}
                    placeholder="Open night"
                    className="flex-1 rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:text-zinc-50"
                  />
                  <input
                    name="note"
                    type="text"
                    defaultValue={entry?.note ?? ""}
                    placeholder="Note (side, missing ingredient...)"
                    className="flex-1 rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:text-zinc-50"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-zinc-950 px-3 py-2 text-sm font-medium text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950"
                  >
                    Save
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
