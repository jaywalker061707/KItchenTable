import Link from "next/link";

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

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-10">
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Kitchen Table
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            This project is scaffolded, not built yet. Each module below is a
            placeholder.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {modules.map((mod) => (
            <Link
              key={mod.href}
              href={mod.href}
              className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
            >
              <span className="font-medium text-zinc-950 dark:text-zinc-50">
                {mod.title}
              </span>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {mod.description}
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
