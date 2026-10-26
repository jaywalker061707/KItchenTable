import Link from "next/link";
import { requireMember } from "@/lib/auth/require-session";
import { HouseholdHeader } from "@/components/household-header";
import { Logo } from "@/components/logo";

const modules = [
  {
    href: "/this-week",
    title: "This Week",
    description: "The dinner plan for the household.",
  },
  {
    href: "/groceries",
    title: "Groceries",
    description: "One shared list, grouped by store.",
  },
  {
    href: "/freezer",
    title: "Freezer",
    description: "What's on hand, ready to pull.",
  },
  {
    href: "/prep",
    title: "Meal Prep",
    description: "Turn a batch into counted freezer packs.",
  },
  {
    href: "/recipes",
    title: "Recipes",
    description: "The shared recipe library, across every household.",
  },
];

export default async function Home() {
  const session = await requireMember();

  return (
    <div className="flex flex-1 flex-col items-center bg-ghost px-6 py-16 dark:bg-void">
      <main className="flex w-full max-w-3xl flex-col gap-10">
        <HouseholdHeader
          householdName={session.householdName}
          memberName={session.memberName}
        />

        <div className="flex flex-col gap-2">
          <Logo className="justify-center sm:justify-start" />
          <p className="text-center text-muted dark:text-iris sm:text-left">
            Signed in and ready.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {modules.map((mod) => (
            <Link
              key={mod.href}
              href={mod.href}
              className="flex flex-col gap-1 rounded-xl border border-hairline bg-linen p-5 transition-colors hover:border-signal dark:border-hairline-dark dark:bg-plum dark:hover:border-signal"
            >
              <span className="font-medium text-ink dark:text-ghost">
                {mod.title}
              </span>
              <span className="text-sm text-muted dark:text-iris">
                {mod.description}
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
