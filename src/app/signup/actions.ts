"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { setSessionMember, setSessionCookie } from "@/lib/auth/session";

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
    console.error("signup: household insert failed", error);
    return { error: "Something went wrong creating the household." };
  }

  const { data: creator, error: memberError } = await supabase
    .from("household_members")
    .insert({ household_id: household.id, display_name: memberName })
    .select("id, display_name")
    .single();

  if (memberError || !creator) {
    console.error("signup: member insert failed", memberError);
    return { error: "Something went wrong adding you as a member." };
  }

  const additionalNames = formData
    .getAll("additionalMemberName")
    .map((value) => String(value).trim())
    .filter((name) => name.length > 0);

  if (additionalNames.length > 0) {
    await supabase.from("household_members").insert(
      additionalNames.map((name) => ({
        household_id: household.id,
        display_name: name,
      })),
    );
  }

  await setSessionCookie({
    householdId: household.id,
    householdName: household.name,
  });
  await setSessionMember({ id: creator.id, name: creator.display_name });
  redirect("/");
}
