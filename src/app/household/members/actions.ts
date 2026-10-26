"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-session";

export type AddMemberState = { error?: string };

export async function addMemberAction(
  _prevState: AddMemberState,
  formData: FormData,
): Promise<AddMemberState> {
  const session = await requireSession();
  const name = String(formData.get("displayName") ?? "").trim();

  if (!name) {
    return { error: "Enter a name." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("household_members")
    .insert({ household_id: session.householdId, display_name: name });

  if (error) {
    return { error: "Something went wrong adding that member." };
  }

  revalidatePath("/household/members");
  revalidatePath("/select-member");
  return {};
}

export async function removeMemberAction(memberId: string) {
  const session = await requireSession();
  const supabase = createAdminClient();

  await supabase
    .from("household_members")
    .delete()
    .eq("id", memberId)
    .eq("household_id", session.householdId);

  revalidatePath("/household/members");
  revalidatePath("/select-member");
}
