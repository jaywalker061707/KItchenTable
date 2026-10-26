"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-session";
import { setSessionMember } from "@/lib/auth/session";

export async function selectMemberAction(memberId: string) {
  const session = await requireSession();
  const supabase = createAdminClient();

  const { data: member } = await supabase
    .from("household_members")
    .select("id, display_name")
    .eq("id", memberId)
    .eq("household_id", session.householdId)
    .maybeSingle();

  if (!member) {
    redirect("/select-member");
  }

  await setSessionMember({ id: member.id, name: member.display_name });
  redirect("/");
}
