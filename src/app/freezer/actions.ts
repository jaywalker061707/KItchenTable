"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireMember } from "@/lib/auth/require-session";

export async function addFreezerItemAction(formData: FormData) {
  const session = await requireMember();
  const name = String(formData.get("name") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const quantityRaw = String(formData.get("quantity") ?? "1").trim();
  const quantity = Number.parseFloat(quantityRaw);

  if (!name) return;

  const supabase = createAdminClient();
  await supabase.from("freezer_items").insert({
    household_id: session.householdId,
    name,
    label: label || null,
    location: location || null,
    quantity: Number.isFinite(quantity) && quantity >= 0 ? quantity : 1,
  });

  revalidatePath("/freezer");
}

export async function adjustFreezerQuantityAction(
  itemId: string,
  delta: number,
) {
  const session = await requireMember();
  const supabase = createAdminClient();

  const { data: item } = await supabase
    .from("freezer_items")
    .select("quantity")
    .eq("id", itemId)
    .eq("household_id", session.householdId)
    .maybeSingle();

  if (!item) return;

  const nextQuantity = Math.max(0, Number(item.quantity) + delta);

  await supabase
    .from("freezer_items")
    .update({ quantity: nextQuantity, updated_at: new Date().toISOString() })
    .eq("id", itemId)
    .eq("household_id", session.householdId);

  revalidatePath("/freezer");
}

export async function removeFreezerItemAction(itemId: string) {
  const session = await requireMember();
  const supabase = createAdminClient();

  await supabase
    .from("freezer_items")
    .delete()
    .eq("id", itemId)
    .eq("household_id", session.householdId);

  revalidatePath("/freezer");
}
