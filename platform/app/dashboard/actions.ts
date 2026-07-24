"use server";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * Records an already-uploaded chart image (the browser uploads directly to
 * Storage; this just writes the DB row). Re-verifies auth independently of
 * proxy.ts, and re-verifies the path actually belongs to this user before
 * inserting -- defense in depth, on top of the RLS policies that are the
 * real boundary (see supabase/migrations/0001_init.sql).
 */
export async function createChartRecord(imagePath: string) {
  const user = await requireUser();

  if (!imagePath.startsWith(`${user.id}/`)) {
    throw new Error("Chart path does not belong to the current user.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("charts")
    .insert({ user_id: user.id, image_path: imagePath, status: "pending" })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.id as string;
}
