import Link from "next/link";
import { requireSession } from "@/lib/auth/require-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { HouseholdHeader } from "@/components/household-header";
import { removeMemberAction } from "./actions";
import { AddMemberForm } from "./add-member-form";

export default async function MembersPage() {
  const session = await requireSession();
  const supabase = createAdminClient();

  const { data: members } = await supabase
    .from("household_members")
    .select("id, display_name")
    .eq("household_id", session.householdId)
    .order("created_at", { ascending: true });

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <main className="flex w-full max-w-md flex-col gap-6">
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

        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
            Household members
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Add or remove people as they move in or out.
          </p>
        </div>

        <div className="flex flex-col divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {(members ?? []).map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <span className="text-zinc-950 dark:text-zinc-50">
                {member.display_name}
              </span>
              <form action={removeMemberAction.bind(null, member.id)}>
                <button
                  type="submit"
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  Remove
                </button>
              </form>
            </div>
          ))}
          {(!members || members.length === 0) && (
            <p className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
              No members yet.
            </p>
          )}
        </div>

        <AddMemberForm />
      </main>
    </div>
  );
}
