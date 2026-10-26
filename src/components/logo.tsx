import { KitchenTableMark } from "./kitchen-table-mark";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <KitchenTableMark className="h-7 w-7 text-signal" />
      <span className="font-display text-xl text-ink dark:text-ghost">
        Kitchen Table
      </span>
    </div>
  );
}
