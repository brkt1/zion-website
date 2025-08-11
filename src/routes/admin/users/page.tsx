import AdminLayout from "@/Components/AdminLayout";
import UsersTable from "@/Components/admin/UsersTable";
import { createClient } from "@/utils/supabase/server";

export default async function UsersPage() {
  const supabase = createClient();
  const { data: users, error } = await supabase
    .from("profiles")
    .select("*, cafe_owners(cafe_id)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
  }

  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Administration</h1>
          <a
            href="/admin/users/invite"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Invite New Admin
          </a>
        </div>
        <UsersTable users={users || []} />
      </div>
    </AdminLayout>
  );
}
