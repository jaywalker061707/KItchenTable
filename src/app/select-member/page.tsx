import Link from "next/link";
import { requireSession } from "@/lib/auth/require-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { selectMemberAction } from "./actions";

export default async function SelectMemberPage() {
  const session = await requireSession();
  const supabase = createAdminClient();

  const { data: members } = await supabase
    .from("household_members")
    .select("id, display_name")
    .eq("household_id", session.householdId)
    .order("created_at", { ascending: true });

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-ghost px-6 py-16 dark:bg-void">
      <main className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-hairline bg-linen p-6 dark:border-hairline-dark dark:bg-plum">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-display text-ink dark:text-ghost">
            Who&apos;s this?
          </h1>
          <p className="text-sm text-muted dark:text-iris">
            {session.householdName}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {(members ?? []).map((member) => (
            <form key={member.id} action={selectMemberAction.bind(null, member.id)}>
              <button
                type="submit"
                className="w-full rounded-md border border-hairline px-3 py-2 text-left text-sm text-ink transition-colors hover:border-signal dark:border-hairline-dark dark:text-ghost dark:hover:border-signal"
              >
                {member.display_name}
              </button>
            </form>
          ))}
          {(!members || members.length === 0) && (
            <p className="text-sm text-muted dark:text-iris">
              No members yet.
            </p>
          )}
        </div>

        <Link
          href="/household/members"
          className="text-center text-sm text-muted hover:text-ink dark:hover:text-ghost"
        >
          Don&apos;t see your name? Manage members
        </Link>
      </main>
    </div>
  );
}
