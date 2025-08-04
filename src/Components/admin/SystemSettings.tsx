import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";
import ErrorComponent from "../utility/Error";
import LoadingSpinner from "../utility/LoadingSpinner";

interface SystemSetting {
  key: string;
  value: string;
  updated_at: string;
}

const SystemSettings: React.FC = () => {
  const { session, profile, loading } = useAuthStore();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!session || profile?.role !== "SUPER_ADMIN") {
      navigate("/access-denied");
      return;
    }
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/super-admin/settings`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data: SystemSetting[] = await res.json();
        setSettings(data);
        const initialDrafts: Record<string, string> = {};
        data.forEach((s) => {
          initialDrafts[s.key] = s.value;
        });
        setDrafts(initialDrafts);
      } catch (err: any) {
        setError(err.message || "Failed to fetch settings");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [session, profile, loading, navigate]);

  const handleChange = (key: string, value: string) => {
    setDrafts((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpdate = async (key: string) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/super-admin/settings/${encodeURIComponent(key)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ value: drafts[key] }),
        }
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      toast.success("Setting updated");
      setSettings((prev) =>
        prev.map((s) =>
          s.key === key
            ? { ...s, value: drafts[key], updated_at: new Date().toISOString() }
            : s
        )
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to update setting");
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorComponent message={error} />;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold text-gold-light mb-4">
        System Settings
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-black-secondary rounded-lg shadow-md">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left text-cream">Key</th>
              <th className="px-4 py-2 text-left text-cream">Value</th>
              <th className="px-4 py-2 text-left text-cream">Updated At</th>
              <th className="px-4 py-2 text-left text-cream">Action</th>
            </tr>
          </thead>
          <tbody>
            {settings.map((s) => (
              <tr
                key={s.key}
                className="border-b border-gray-600 last:border-b-0"
              >
                <td className="px-4 py-2 text-cream break-all">{s.key}</td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={drafts[s.key]}
                    onChange={(e) => handleChange(s.key, e.target.value)}
                    placeholder="Value"
                    className="w-full p-1 bg-black-primary border border-gray-600 rounded text-cream"
                    aria-label={`Value for ${s.key}`}
                  />
                </td>
                <td className="px-4 py-2 text-cream whitespace-nowrap">
                  {new Date(s.updated_at).toLocaleString()}
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleUpdate(s.key)}
                    className="px-3 py-1 bg-gold-primary text-black-primary rounded hover:bg-gold-light"
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SystemSettings;
