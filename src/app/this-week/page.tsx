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

  // Shift by 7, not 9: the anchor is always a Saturday, and the next
  // Saturday is 7 days later. Each 9-day view deliberately overlaps the
  // next by one weekend (the shared boundary), so navigation lands on
  // consecutive Saturdays rather than skipping — a 9-day jump would
  // overshoot past the next Saturday entirely.
  const prevStart = formatISODate(addDays(anchor, -7));
  const nextStart = formatISODate(addDays(anchor, 7));
  const todayStr = todayInTimezone(timezone);

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

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-2xl font-display text-ink dark:text-ghost">
              This Week
            </h1>
            <span className="text-xs text-muted dark:text-iris">
              {formatDayLabel(days[0])} &ndash;{" "}
              {formatDayLabel(days[days.length - 1])}
            </span>
          </div>
          <div className="flex gap-3 text-sm">
            <Link
              href={`/this-week?start=${prevStart}`}
              className="text-muted hover:text-ink dark:hover:text-ghost"
            >
              &larr; Prev
            </Link>
            <Link
              href={`/this-week?start=${nextStart}`}
              className="text-muted hover:text-ink dark:hover:text-ghost"
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
                className={`rounded-xl border bg-linen p-4 dark:bg-plum ${
                  isToday
                    ? "border-signal dark:border-signal"
                    : "border-hairline dark:border-hairline-dark"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-ink dark:text-ghost">
                    {formatDayLabel(date)}
                    {isToday && (
                      <span className="ml-2 text-xs font-normal text-muted dark:text-iris">
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
                    className="flex-1 rounded-md border border-hairline bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-signal dark:border-hairline-dark dark:text-ghost"
                  />
                  <input
                    name="note"
                    type="text"
                    defaultValue={entry?.note ?? ""}
                    placeholder="Note (side, missing ingredient...)"
                    className="flex-1 rounded-md border border-hairline bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-signal dark:border-hairline-dark dark:text-ghost"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-signal px-3 py-2 text-sm font-medium text-ghost hover:opacity-90"
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
