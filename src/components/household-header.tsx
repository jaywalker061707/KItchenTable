import Link from "next/link";
import { signOutAction } from "@/lib/auth/actions";
import { KitchenTableMark } from "./kitchen-table-mark";

export function HouseholdHeader({
  householdName,
  memberName,
}: {
  householdName: string;
  memberName?: string;
}) {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3 border-b border-hairline pb-4 dark:border-hairline-dark">
      <div className="flex items-center gap-2">
        <KitchenTableMark className="h-5 w-5 shrink-0 text-signal" />
        <div className="flex flex-col">
          <span className="text-xs text-muted dark:text-iris">
            {householdName}
          </span>
          <span className="font-medium text-ink dark:text-ghost">
            {memberName ?? "Signed in"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm text-muted dark:text-iris">
        <Link
          href="/select-member"
          className="hover:text-ink dark:hover:text-ghost"
        >
          Switch
        </Link>
        <Link
          href="/household/members"
          className="hover:text-ink dark:hover:text-ghost"
        >
          Members
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            className="hover:text-ink dark:hover:text-ghost"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
