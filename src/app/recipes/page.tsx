import Link from "next/link";
import { requireMember } from "@/lib/auth/require-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { HouseholdHeader } from "@/components/household-header";
import {
  addRecipeAction,
  toggleFavoriteAction,
  deleteRecipeAction,
} from "./actions";

type Recipe = {
  id: string;
  title: string;
  source_url: string | null;
  ingredients: string[];
  instructions: string[];
  tags: string[];
  created_by_household_id: string | null;
  created_by_member_name: string | null;
};

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string; favorites?: string }>;
}) {
  const session = await requireMember();
  const supabase = createAdminClient();
  const { q, tag, favorites } = await searchParams;
  const search = (q ?? "").trim().toLowerCase();
  const favoritesOnly = favorites === "1";

  const { data: recipeRows } = await supabase
    .from("recipes")
    .select(
      "id, title, source_url, ingredients, instructions, tags, created_by_household_id, created_by_member_name",
    )
    .order("created_at", { ascending: false });

  const { data: favoriteRows } = await supabase
    .from("recipe_favorites")
    .select("recipe_id")
    .eq("household_id", session.householdId);

  const favoritedIds = new Set(
    (favoriteRows ?? []).map((row) => row.recipe_id),
  );

  const allRecipes = (recipeRows ?? []) as Recipe[];
  const allTags = Array.from(
    new Set(allRecipes.flatMap((recipe) => recipe.tags)),
  ).sort();

  const recipes = allRecipes.filter((recipe) => {
    if (search && !recipe.title.toLowerCase().includes(search)) return false;
    if (tag && !recipe.tags.includes(tag)) return false;
    if (favoritesOnly && !favoritedIds.has(recipe.id)) return false;
    return true;
  });

  return (
    <div className="flex flex-1 flex-col items-center bg-ghost px-6 py-16 dark:bg-void">
      <main className="flex w-full max-w-3xl flex-col gap-6">
        <HouseholdHeader
          householdName={session.householdName}
          memberName={session.memberName}
        />
        <Link
          href="/"
          className="text-sm text-muted hover:text-ink dark:hover:text-ghost"
        >
          &larr; Back
        </Link>

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-display text-ink dark:text-ghost">
            Recipes
          </h1>
          <p className="text-sm text-muted dark:text-iris">
            Shared across every household — not just this one.
          </p>
        </div>

        <form
          method="get"
          className="flex flex-col gap-2 rounded-xl border border-hairline bg-linen p-4 dark:border-hairline-dark dark:bg-plum sm:flex-row sm:flex-wrap sm:items-center"
        >
          <input
            name="q"
            type="text"
            defaultValue={q ?? ""}
            placeholder="Search by name..."
            className="flex-1 rounded-md border border-hairline bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-signal dark:border-hairline-dark dark:text-ghost"
          />
          <select
            name="tag"
            defaultValue={tag ?? ""}
            className="rounded-md border border-hairline bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-signal dark:border-hairline-dark dark:text-ghost"
          >
            <option value="">All tags</option>
            {allTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-ink dark:text-ghost">
            <input
              type="checkbox"
              name="favorites"
              value="1"
              defaultChecked={favoritesOnly}
              className="h-4 w-4"
            />
            Favorites only
          </label>
          <button
            type="submit"
            className="rounded-md border border-hairline px-3 py-2 text-sm text-ink hover:border-signal dark:border-hairline-dark dark:text-ghost"
          >
            Filter
          </button>
          {(q || tag || favoritesOnly) && (
            <Link
              href="/recipes"
              className="text-sm text-muted hover:text-ink dark:hover:text-ghost"
            >
              Clear
            </Link>
          )}
        </form>

        <details className="rounded-xl border border-hairline bg-linen p-4 dark:border-hairline-dark dark:bg-plum">
          <summary className="cursor-pointer text-sm font-medium text-ink dark:text-ghost">
            Add a recipe
          </summary>
          <form
            action={addRecipeAction}
            className="mt-3 flex flex-col gap-2"
          >
            <input
              name="title"
              type="text"
              required
              placeholder="Title"
              className="rounded-md border border-hairline bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-signal dark:border-hairline-dark dark:text-ghost"
            />
            <input
              name="sourceUrl"
              type="url"
              placeholder="Source link (optional)"
              className="rounded-md border border-hairline bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-signal dark:border-hairline-dark dark:text-ghost"
            />
            <input
              name="tags"
              type="text"
              placeholder="Tags, comma separated (e.g. freezer-friendly, dessert)"
              className="rounded-md border border-hairline bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-signal dark:border-hairline-dark dark:text-ghost"
            />
            <textarea
              name="ingredients"
              rows={4}
              placeholder={"Ingredients, one per line"}
              className="rounded-md border border-hairline bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-signal dark:border-hairline-dark dark:text-ghost"
            />
            <textarea
              name="instructions"
              rows={4}
              placeholder={"Instructions, one step per line"}
              className="rounded-md border border-hairline bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-signal dark:border-hairline-dark dark:text-ghost"
            />
            <button
              type="submit"
              className="self-start rounded-md bg-signal px-3 py-2 text-sm font-medium text-ghost hover:opacity-90"
            >
              Save recipe
            </button>
          </form>
        </details>

        <div className="flex flex-col gap-3">
          {recipes.map((recipe) => {
            const isFavorited = favoritedIds.has(recipe.id);
            const isOwnHousehold =
              recipe.created_by_household_id === session.householdId;

            return (
              <div
                key={recipe.id}
                className="flex flex-col gap-2 rounded-xl border border-hairline bg-linen p-4 dark:border-hairline-dark dark:bg-plum"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="font-medium text-ink dark:text-ghost">
                      {recipe.title}
                    </span>
                    {recipe.created_by_member_name && (
                      <span className="text-xs text-muted dark:text-iris">
                        Added by {recipe.created_by_member_name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <form action={toggleFavoriteAction.bind(null, recipe.id)}>
                      <button
                        type="submit"
                        aria-label={
                          isFavorited
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                        className={
                          isFavorited
                            ? "text-lg text-signal"
                            : "text-lg text-muted/40 hover:text-signal"
                        }
                      >
                        ★
                      </button>
                    </form>
                    {isOwnHousehold && (
                      <form action={deleteRecipeAction.bind(null, recipe.id)}>
                        <button
                          type="submit"
                          className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          Delete
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                {recipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {recipe.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-linen px-2 py-0.5 text-xs text-muted dark:bg-plum dark:text-iris"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {recipe.source_url && (
                  <a
                    href={recipe.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted underline hover:text-ink dark:hover:text-ghost"
                  >
                    Source
                  </a>
                )}

                {(recipe.ingredients.length > 0 ||
                  recipe.instructions.length > 0) && (
                  <details>
                    <summary className="cursor-pointer text-sm text-muted hover:text-ink dark:text-iris dark:hover:text-ghost">
                      Ingredients &amp; instructions
                    </summary>
                    <div className="mt-2 flex flex-col gap-3 text-sm">
                      {recipe.ingredients.length > 0 && (
                        <ul className="list-inside list-disc text-ink dark:text-ghost">
                          {recipe.ingredients.map((ingredient, i) => (
                            <li key={i}>{ingredient}</li>
                          ))}
                        </ul>
                      )}
                      {recipe.instructions.length > 0 && (
                        <ol className="list-inside list-decimal text-ink dark:text-ghost">
                          {recipe.instructions.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>
                      )}
                    </div>
                  </details>
                )}
              </div>
            );
          })}
          {recipes.length === 0 && (
            <p className="text-sm text-muted dark:text-iris">
              {allRecipes.length === 0
                ? "No recipes yet — add the first one above."
                : "No matches."}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
