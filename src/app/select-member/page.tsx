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
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <main className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
            Who&apos;s this?
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {session.householdName}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {(members ?? []).map((member) => (
            <form key={member.id} action={selectMemberAction.bind(null, member.id)}>
              <button
                type="submit"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-left text-sm text-zinc-950 transition-colors hover:border-zinc-500 dark:border-zinc-700 dark:text-zinc-50 dark:hover:border-zinc-500"
              >
                {member.display_name}
              </button>
            </form>
          ))}
          {(!members || members.length === 0) && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No members yet.
            </p>
          )}
        </div>

        <Link
          href="/household/members"
          className="text-center text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Don&apos;t see your name? Manage members
        </Link>
      </main>
    </div>
  );
}
