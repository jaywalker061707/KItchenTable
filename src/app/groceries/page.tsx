import Link from "next/link";
import { requireMember } from "@/lib/auth/require-session";
import { HouseholdHeader } from "@/components/household-header";

export default async function GroceriesPage() {
  const session = await requireMember();

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
        <p className="text-zinc-600 dark:text-zinc-400">Not built yet.</p>
      </main>
    </div>
  );
}
