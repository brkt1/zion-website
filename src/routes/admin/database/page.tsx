import AdminLayout from "@/Components/AdminLayout";
import DatabaseManager from "@/Components/admin/DatabaseManager";

export default function DatabasePage() {
  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Database Management</h1>
        <DatabaseManager />
      </div>
    </AdminLayout>
  );
}
