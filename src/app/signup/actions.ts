"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { setSessionCookie } from "@/lib/auth/session";

export type SignupState = { error?: string };

const POSTGRES_UNIQUE_VIOLATION = "23505";

function resolveTimezone(candidate: string): string {
  try {
    if (candidate && Intl.supportedValuesOf("timeZone").includes(candidate)) {
      return candidate;
    }
  } catch {
    // Intl.supportedValuesOf unsupported in this runtime — fall through.
  }
  return "UTC";
}

export async function signupAction(
  _prevState: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const householdName = String(formData.get("householdName") ?? "").trim();
  const memberName = String(formData.get("memberName") ?? "").trim();
  const pin = String(formData.get("pin") ?? "").trim();
  const confirmPin = String(formData.get("confirmPin") ?? "").trim();
  const timezone = resolveTimezone(
    String(formData.get("timezone") ?? "").trim(),
  );

  if (!householdName || !memberName || !pin) {
    return { error: "Enter your name, a household name, and a PIN." };
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
    .insert({ name: householdName, pin_hash: pinHash, timezone })
    .select("id, name")
    .single();

  if (error) {
    if (error.code === POSTGRES_UNIQUE_VIOLATION) {
      return { error: "That household name is already taken." };
    }
    return { error: "Something went wrong creating the household." };
  }

  const { error: memberError } = await supabase
    .from("household_members")
    .insert({ household_id: household.id, display_name: memberName });

  if (memberError) {
    // The household itself was created successfully; a failure to record
    // the first member's name isn't worth blocking signup over.
  }

  await setSessionCookie({
    householdId: household.id,
    householdName: household.name,
  });
  redirect("/");
}
