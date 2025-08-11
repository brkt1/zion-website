"use server";

import { createClient } from "@/utils/supabase/server";

export async function deleteGameType(formData: FormData) {
  const id = formData.get("id");
  if (!id) return { error: "No ID provided" };

  const supabase = createClient();
  const { error } = await supabase.from("game_types").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function createGameType(formData: FormData) {
  const name = formData.get("name");
  const description = formData.get("description");

  if (!name) return { error: "Name is required" };

  const supabase = createClient();
  const { error } = await supabase
    .from("game_types")
    .insert([{ name, description }]);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function updateGameType(formData: FormData) {
  const id = formData.get("id");
  const name = formData.get("name");
  const description = formData.get("description");

  if (!id || !name) return { error: "ID and Name are required" };

  const supabase = createClient();
  const { error } = await supabase
    .from("game_types")
    .update({ name, description })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
