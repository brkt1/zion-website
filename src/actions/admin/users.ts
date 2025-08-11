"use server";

import { createClient } from "@/utils/supabase/server";

export async function updateUserRole(formData: FormData) {
  const id = formData.get("id");
  const role = formData.get("role");

  if (!id || !role) return { error: "ID and Role are required" };

  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", id);

  // If promoting to cafe owner, add to cafe_owners table
  if (role === "CAFE_OWNER") {
    await supabase.from("cafe_owners").upsert({ id });
  }

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function deleteUser(formData: FormData) {
  const id = formData.get("id");
  if (!id) return { error: "No ID provided" };

  const supabase = createClient();
  // First delete from auth.users
  const { error: authError } = await supabase.auth.admin.deleteUser(id);
  if (authError) {
    return { error: authError.message };
  }
  // Then delete from profiles
  const { error } = await supabase.from("profiles").delete().eq("id", id);
  if (error) {
    return { error: error.message };
  }
  return { success: true };
}
