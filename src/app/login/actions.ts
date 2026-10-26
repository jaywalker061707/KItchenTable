"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { setSessionCookie } from "@/lib/auth/session";
import { escapeLikePattern } from "@/lib/text";

export type LoginState = { error?: string };

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const householdName = String(formData.get("householdName") ?? "").trim();
  const pin = String(formData.get("pin") ?? "").trim();

  if (!householdName || !pin) {
    return { error: "Enter your household name and PIN." };
  }

  const supabase = createAdminClient();
  const { data: household } = await supabase
    .from("households")
    .select("id, name, pin_hash")
    .ilike("name", escapeLikePattern(householdName))
    .maybeSingle();

  if (!household) {
    return { error: "Household not found or PIN incorrect." };
  }

  const matches = await bcrypt.compare(pin, household.pin_hash);
  if (!matches) {
    return { error: "Household not found or PIN incorrect." };
  }

  await setSessionCookie({
    householdId: household.id,
    householdName: household.name,
  });
  redirect("/select-member");
}
