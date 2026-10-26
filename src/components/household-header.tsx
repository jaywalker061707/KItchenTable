import Link from "next/link";
import { signOutAction } from "@/lib/auth/actions";

export function HouseholdHeader({
  householdName,
  memberName,
}: {
  householdName: string;
  memberName?: string;
}) {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-4 dark:border-zinc-800">
      <div className="flex flex-col">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {householdName}
        </span>
        <span className="font-medium text-zinc-950 dark:text-zinc-50">
          {memberName ?? "Signed in"}
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
        <Link
          href="/select-member"
          className="hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Switch
        </Link>
        <Link
          href="/household/members"
          className="hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Members
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            className="hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
