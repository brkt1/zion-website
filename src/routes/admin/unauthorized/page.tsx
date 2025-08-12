import AdminLayout from "@/Components/AdminLayout";

export default function UnauthorizedPage() {
  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6 text-red-600">Unauthorized</h1>
        <p className="text-gray-700">
          You do not have permission to access this page.
        </p>
      </div>
    </AdminLayout>
  );
}
