"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireMember } from "@/lib/auth/require-session";

function linesToArray(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export async function addRecipeAction(formData: FormData) {
  const session = await requireMember();
  const title = String(formData.get("title") ?? "").trim();
  const sourceUrl = String(formData.get("sourceUrl") ?? "").trim();
  const ingredients = linesToArray(String(formData.get("ingredients") ?? ""));
  const instructions = linesToArray(
    String(formData.get("instructions") ?? ""),
  );
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

  if (!title) return;

  const supabase = createAdminClient();
  await supabase.from("recipes").insert({
    title,
    source_url: sourceUrl || null,
    ingredients,
    instructions,
    tags,
    created_by_household_id: session.householdId,
    created_by_member_name: session.memberName,
  });

  revalidatePath("/recipes");
}

export async function toggleFavoriteAction(recipeId: string) {
  const session = await requireMember();
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("recipe_favorites")
    .select("id")
    .eq("recipe_id", recipeId)
    .eq("household_id", session.householdId)
    .maybeSingle();

  if (existing) {
    await supabase.from("recipe_favorites").delete().eq("id", existing.id);
  } else {
    await supabase.from("recipe_favorites").insert({
      recipe_id: recipeId,
      household_id: session.householdId,
    });
  }

  revalidatePath("/recipes");
}

export async function deleteRecipeAction(recipeId: string) {
  const session = await requireMember();
  const supabase = createAdminClient();

  // Only the household that added a recipe can remove it — it's a shared
  // library, not a free-for-all, so one household can't delete another's
  // contribution.
  await supabase
    .from("recipes")
    .delete()
    .eq("id", recipeId)
    .eq("created_by_household_id", session.householdId);

  revalidatePath("/recipes");
}
