"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireMember } from "@/lib/auth/require-session";

export async function addGroceryItemAction(formData: FormData) {
  const session = await requireMember();
  const store = String(formData.get("store") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const quantity = String(formData.get("quantity") ?? "").trim();

  if (!store || !name) return;

  const supabase = createAdminClient();
  await supabase.from("grocery_items").insert({
    household_id: session.householdId,
    store,
    name,
    quantity: quantity || null,
  });

  revalidatePath("/groceries");
}

export async function setGroceryStatusAction(
  itemId: string,
  status: "needed" | "out_of_stock" | "received",
) {
  const session = await requireMember();
  const supabase = createAdminClient();

  await supabase
    .from("grocery_items")
    .update({ status })
    .eq("id", itemId)
    .eq("household_id", session.householdId);

  revalidatePath("/groceries");
}

export async function removeGroceryItemAction(itemId: string) {
  const session = await requireMember();
  const supabase = createAdminClient();

  await supabase
    .from("grocery_items")
    .delete()
    .eq("id", itemId)
    .eq("household_id", session.householdId);

  revalidatePath("/groceries");
}
