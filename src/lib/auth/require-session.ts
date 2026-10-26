import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession, type Session } from "./session";

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireMember(): Promise<
  Session & { memberId: string; memberName: string }
> {
  const session = await requireSession();
  if (!session.memberId || !session.memberName) {
    redirect("/select-member");
  }

  // Re-verify the member still belongs to this household on every load —
  // if someone else removed them (moved out, etc.), bounce back to the
  // picker instead of trusting a stale cookie.
  const supabase = createAdminClient();
  const { data: member } = await supabase
    .from("household_members")
    .select("id")
    .eq("id", session.memberId)
    .eq("household_id", session.householdId)
    .maybeSingle();

  if (!member) {
    redirect("/select-member");
  }

  return session as Session & { memberId: string; memberName: string };
}
