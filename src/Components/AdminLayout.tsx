import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!["ADMIN", "SUPER_ADMIN"].includes(profile?.role)) {
    return redirect("/unauthorized");
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-black-secondary text-white p-4">
        <h1 className="text-2xl font-bold mb-8">Admin Portal</h1>
        <nav>
          <ul className="space-y-2">
            <li>
              <Link
                href="/admin/dashboard"
                className="block p-2 rounded hover:bg-black-secondary"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/admin/game-types"
                className="block p-2 rounded hover:bg-black-secondary"
              >
                Game Types
              </Link>
            </li>
            <li>
              <Link
                href="/admin/cards"
                className="block p-2 rounded hover:bg-black-secondary"
              >
                Card Management
              </Link>
            </li>
            <li>
              <Link
                href="/admin/users"
                className="block p-2 rounded hover:bg-black-secondary"
              >
                User Administration
              </Link>
            </li>
            {profile?.role === "SUPER_ADMIN" && (
              <>
                <li>
                  <Link
                    href="/admin/permissions"
                    className="block p-2 rounded hover:bg-black-secondary"
                  >
                    Permissions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/audit-logs"
                    className="block p-2 rounded hover:bg-black-secondary"
                  >
                    Audit Logs
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Admin Dashboard</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm">Logged in as {user.email}</span>
            <form action="/auth/signout" method="POST">
              <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                Logout
              </button>
            </form>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
