"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireMember } from "@/lib/auth/require-session";

export async function saveMealAction(formData: FormData) {
  const session = await requireMember();
  const planDate = String(formData.get("planDate") ?? "");
  const mealName = String(formData.get("mealName") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (!planDate) return;

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("meal_plan_entries")
    .select("id")
    .eq("household_id", session.householdId)
    .eq("plan_date", planDate)
    .maybeSingle();

  if (!mealName) {
    if (existing) {
      await supabase.from("meal_plan_entries").delete().eq("id", existing.id);
    }
  } else if (existing) {
    await supabase
      .from("meal_plan_entries")
      .update({ meal_name: mealName, note: note || null })
      .eq("id", existing.id);
  } else {
    await supabase.from("meal_plan_entries").insert({
      household_id: session.householdId,
      plan_date: planDate,
      meal_name: mealName,
      note: note || null,
    });
  }

  revalidatePath("/this-week");
}

export async function removeMealAction(entryId: string) {
  const session = await requireMember();
  const supabase = createAdminClient();

  await supabase
    .from("meal_plan_entries")
    .delete()
    .eq("id", entryId)
    .eq("household_id", session.householdId);

  revalidatePath("/this-week");
}
