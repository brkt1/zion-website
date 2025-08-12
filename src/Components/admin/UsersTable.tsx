import { deleteUser, updateUserRole } from "@/actions/admin/users";
import { Link } from "react-router-dom";

export default function UsersTable({ users }: { users: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Joined
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900">{user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <form action={updateUserRole} className="inline">
                  <input type="hidden" name="id" value={user.id} />
                  <select
                    name="role"
                    defaultValue={user.role}
                    className="border rounded px-2 py-1"
                    title="Change user role"
                    onChange={(e) => e.target.form?.requestSubmit()}
                  >
                    <option value="PLAYER">Player</option>
                    <option value="CAFE_OWNER">Cafe Owner</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </form>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                {new Date(user.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Link
                  to={`/admin/users/${user.id}`}
                  className="text-indigo-600 hover:text-indigo-900 mr-3"
                >
                  View
                </Link>
                <form action={deleteUser} className="inline">
                  <input type="hidden" name="id" value={user.id} />
                  <button
                    type="submit"
                    className="text-red-600 hover:text-red-900"
                    onClick={(e) => {
                      if (
                        !confirm("Are you sure you want to delete this user?")
                      ) {
                        e.preventDefault();
                      }
                    }}
                  >
                    Delete
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
