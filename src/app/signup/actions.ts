"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { setSessionCookie } from "@/lib/auth/session";

export type SignupState = { error?: string };

const POSTGRES_UNIQUE_VIOLATION = "23505";

export async function signupAction(
  _prevState: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const householdName = String(formData.get("householdName") ?? "").trim();
  const pin = String(formData.get("pin") ?? "").trim();
  const confirmPin = String(formData.get("confirmPin") ?? "").trim();

  if (!householdName || !pin) {
    return { error: "Enter a household name and PIN." };
  }
  if (pin.length < 4) {
    return { error: "PIN must be at least 4 characters." };
  }
  if (pin !== confirmPin) {
    return { error: "PINs don't match." };
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("households")
    .select("id")
    .ilike("name", householdName)
    .maybeSingle();

  if (existing) {
    return { error: "That household name is already taken." };
  }

  const pinHash = await bcrypt.hash(pin, 10);

  const { data: household, error } = await supabase
    .from("households")
    .insert({ name: householdName, pin_hash: pinHash })
    .select("id, name")
    .single();

  if (error) {
    if (error.code === POSTGRES_UNIQUE_VIOLATION) {
      return { error: "That household name is already taken." };
    }
    return { error: "Something went wrong creating the household." };
  }

  await setSessionCookie({
    householdId: household.id,
    householdName: household.name,
  });
  redirect("/");
}
