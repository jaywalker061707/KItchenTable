"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireMember } from "@/lib/auth/require-session";

type Step = { text: string; done: boolean };

export async function createBatchAction(formData: FormData) {
  const session = await requireMember();
  const name = String(formData.get("name") ?? "").trim();
  const stepsRaw = String(formData.get("steps") ?? "");
  const steps: Step[] = stepsRaw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((text) => ({ text, done: false }));

  if (!name) return;

  const supabase = createAdminClient();
  await supabase.from("prep_batches").insert({
    household_id: session.householdId,
    name,
    steps,
  });

  revalidatePath("/prep");
}

export async function toggleStepAction(batchId: string, stepIndex: number) {
  const session = await requireMember();
  const supabase = createAdminClient();

  const { data: batch } = await supabase
    .from("prep_batches")
    .select("steps")
    .eq("id", batchId)
    .eq("household_id", session.householdId)
    .maybeSingle();

  if (!batch) return;

  const steps = (batch.steps as Step[]).map((step, index) =>
    index === stepIndex ? { ...step, done: !step.done } : step,
  );

  await supabase
    .from("prep_batches")
    .update({ steps })
    .eq("id", batchId)
    .eq("household_id", session.householdId);

  revalidatePath("/prep");
}

export async function finishBatchAction(formData: FormData) {
  const session = await requireMember();
  const batchId = String(formData.get("batchId") ?? "");
  const packsRaw = String(formData.get("packsProduced") ?? "").trim();
  const packs = Number.parseInt(packsRaw, 10);

  if (!batchId || !Number.isFinite(packs) || packs <= 0) return;

  const supabase = createAdminClient();

  const { data: batch } = await supabase
    .from("prep_batches")
    .select("name")
    .eq("id", batchId)
    .eq("household_id", session.householdId)
    .maybeSingle();

  if (!batch) return;

  await supabase
    .from("prep_batches")
    .update({ packs_produced: packs, completed_at: new Date().toISOString() })
    .eq("id", batchId)
    .eq("household_id", session.householdId);

  // Feed the finished batch into the freezer, matching an existing item
  // by name if there is one rather than creating a duplicate entry.
  const { data: existingFreezerItem } = await supabase
    .from("freezer_items")
    .select("id, quantity")
    .eq("household_id", session.householdId)
    .ilike("name", batch.name)
    .maybeSingle();

  if (existingFreezerItem) {
    await supabase
      .from("freezer_items")
      .update({
        quantity: Number(existingFreezerItem.quantity) + packs,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingFreezerItem.id);
  } else {
    await supabase.from("freezer_items").insert({
      household_id: session.householdId,
      name: batch.name,
      label: "prepared",
      quantity: packs,
    });
  }

  revalidatePath("/prep");
  revalidatePath("/freezer");
}

export async function deleteBatchAction(batchId: string) {
  const session = await requireMember();
  const supabase = createAdminClient();

  await supabase
    .from("prep_batches")
    .delete()
    .eq("id", batchId)
    .eq("household_id", session.householdId);

  revalidatePath("/prep");
}
