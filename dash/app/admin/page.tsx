"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  email: string;
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          const email = typeof data === "string" ? data : data.email;
          setUser({ email });
          if (!email.endsWith("@example.com")) {
            router.push("/unauthorized");
          }
        } else {
          router.push("/users/signin");
        }
      } catch (error) {
        console.error("Auth error:", error);
        router.push("/users/signin");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return <div className="p-8 text-gray-600">Loading admin panel...</div>;
  }

  return (
    <main className="p-8 bg-white min-h-screen text-gray-900">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="mb-2">Welcome, {user?.email}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="border p-4 rounded shadow-sm">
          <h2 className="font-semibold text-lg mb-2">📊 Analytics</h2>
          <p>Placeholder for charts or metrics</p>
        </div>
        <div className="border p-4 rounded shadow-sm">
          <h2 className="font-semibold text-lg mb-2">🧑‍💻 User Management</h2>
          <p>Placeholder for managing users</p>
        </div>
      </div>
    </main>
  );
}
