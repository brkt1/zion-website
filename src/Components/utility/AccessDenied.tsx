import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

const AccessDenied: React.FC = () => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuthStore();

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch("/api/profile_permissions", {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        });

        if (!response.ok && response.status !== 304) {
          throw new Error(
            `Failed to fetch permissions: ${response.status} ${response.statusText}`
          );
        }

        if (response.status !== 304) {
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Unexpected response format: Not JSON");
          }

          const data = await response.json();
          setPermissions(data.map((p: { name: string }) => p.name));
        }
      } catch (err: any) {
        console.error("Error fetching permissions:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchPermissions();
    } else {
      setLoading(false);
    }
  }, [session]);

  if (loading) {
    return <div className="text-center text-cream">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  const isAdmin = permissions.includes("ADMIN");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black-primary to-black-secondary">
      <div className="bg-black-secondary p-8 rounded-lg shadow-md text-center border border-gold-primary/20">
        <h1 className="text-4xl font-bold text-gold-primary mb-4">
          Access Denied
        </h1>
        {isAdmin ? (
          <>
            <p className="text-lg text-cream mb-6">
              You are logged in as an{" "}
              <span className="font-bold text-gold-secondary">ADMIN</span> but
              do not have permission to view this page.
              <br />
              Please contact your system administrator if you believe this is a
              mistake.
            </p>
            <Link
              to="/admin"
              className="inline-block bg-gold-primary hover:bg-gold-secondary text-black-primary font-bold py-2 px-4 rounded-full transition duration-300"
            >
              Go to Admin Home
            </Link>
          </>
        ) : (
          <>
            <p className="text-lg text-cream mb-6">
              You do not have permission to view this page.
            </p>
            <Link
              to="/"
              className="inline-block bg-gold-primary hover:bg-gold-secondary text-black-primary font-bold py-2 px-4 rounded-full transition duration-300"
            >
              Go to Home
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default AccessDenied;
