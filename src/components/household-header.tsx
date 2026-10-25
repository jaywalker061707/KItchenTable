import { signOutAction } from "@/lib/auth/actions";

export function HouseholdHeader({
  householdName,
}: {
  householdName: string;
}) {
  return (
    <div className="flex w-full max-w-3xl items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
      <div className="flex flex-col">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Signed in as
        </span>
        <span className="font-medium text-zinc-950 dark:text-zinc-50">
          {householdName}
        </span>
      </div>
      <form action={signOutAction}>
        <button
          type="submit"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
