import AdminLayout from "@/Components/AdminLayout";
import GameTypesTable from "@/Components/admin/GameTypesTable";
import { createClient } from "@/utils/supabase/server";

export default async function GameTypesPage() {
  const supabase = createClient();
  const { data: gameTypes, error } = await supabase
    .from("game_types")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching game types:", error);
  }

  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Game Types Management</h1>
          <a
            href="/admin/game-types/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Add New Game Type
          </a>
        </div>
        <GameTypesTable gameTypes={gameTypes || []} />
      </div>
    </AdminLayout>
  );
}
