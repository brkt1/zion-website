import { supabase } from "@/supabaseClient";
import { useEffect, useState } from "react";

interface Profile {
  id: string;
  email: string;
  role: string;
}

export default function SuperAdminPermissionManager() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      try {
        // Fetch all profiles
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, email, role");
        if (profileError) throw profileError;
        setProfiles(profileData || []);

        // Fetch all permissions using the actual database structure: user_permissions table
        let permMap: Record<string, string[]> = {};
        try {
          const { data: userPerms, error: userPermError } = await supabase
            .from("user_permissions")
            .select("user_id, permission_name");
          
          if (!userPermError && userPerms && userPerms.length > 0) {
            userPerms.forEach((p: any) => {
              if (!permMap[p.user_id]) permMap[p.user_id] = [];
              permMap[p.user_id].push(p.permission_name);
            });
          }
        } catch (error) {
          console.warn("Error fetching permissions, using empty permissions:", error);
        }
        setPermissions(permMap);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  const handleTogglePermission = async (
    profileId: string,
    permission: string,
    hasPermission: boolean
  ) => {
    setUpdating(profileId);
    try {
      if (hasPermission) {
        // Revoke permission
        await supabase
          .from("user_permissions")
          .delete()
          .match({ user_id: profileId, permission_name: permission });
      } else {
        // Grant permission
        await supabase
          .from("user_permissions")
          .insert({ user_id: profileId, permission_name: permission });
      }
      
      // Refresh permissions using the same logic as fetchProfiles
      let permMap: Record<string, string[]> = {};
      try {
        const { data: userPerms, error: userPermError } = await supabase
          .from("user_permissions")
          .select("user_id, permission_name");
        
        if (!userPermError && userPerms && userPerms.length > 0) {
          userPerms.forEach((p: any) => {
            if (!permMap[p.user_id]) permMap[p.user_id] = [];
            permMap[p.user_id].push(p.permission_name);
          });
        }
      } catch (error) {
        console.warn("Error refreshing permissions:", error);
      }
      setPermissions(permMap);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error)
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        Superadmin: Manage User Permissions
      </h2>
      <table className="min-w-full bg-black-secondary text-cream rounded-lg">
        <thead>
          <tr>
            <th className="p-2">Email</th>
            <th className="p-2">Role</th>
            <th className="p-2">Can Use Enhanced Card</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((profile) => (
            <tr key={profile.id} className="border-b border-yellow-500">
              <td className="p-2">{profile.email}</td>
              <td className="p-2">{profile.role}</td>
              <td className="p-2 text-center">
                <button
                  className={`px-3 py-1 rounded ${
                    permissions[profile.id]?.includes("CAN_USE_ENHANCED_CARD")
                      ? "bg-green-600 text-white"
                      : "bg-gray-600 text-gray-300"
                  }`}
                  disabled={updating === profile.id}
                  onClick={() =>
                    handleTogglePermission(
                      profile.id,
                      "CAN_USE_ENHANCED_CARD",
                      permissions[profile.id]?.includes(
                        "CAN_USE_ENHANCED_CARD"
                      ) || false
                    )
                  }
                >
                  {permissions[profile.id]?.includes("CAN_USE_ENHANCED_CARD")
                    ? "Revoke"
                    : "Grant"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
