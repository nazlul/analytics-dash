"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  email: string;
  name: string;
}

export default function AdminPage() {
  const [admin, setAdmin] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const router = useRouter();

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          const email = typeof data === "string" ? data : data.email;
          setAdmin({ email, name: "Admin" });
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

    fetchAdmin();
  }, [router]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/all-users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUsers(data.users);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    if (admin) {
      fetchUsers();
    }
  }, [admin]);

  const confirmDelete = (user: User) => {
    setUserToDelete(user);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/delete-user?email=${encodeURIComponent(userToDelete.email)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.email !== userToDelete.email));
        setUserToDelete(null);
      } else {
        console.error("Failed to delete user");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  if (loading || !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
        Loading...
      </div>
    );
  }

  return (
    <main className="p-8 bg-white min-h-screen text-gray-900">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <p className="mb-6 text-gray-600">Welcome, {admin.email}</p>

      <section className="border p-4 rounded shadow-sm max-w-2xl mx-auto">
        <h2 className="font-semibold text-xl mb-4">🧑‍💻 User Management</h2>
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {users.map((user) => (
              <li key={user.email} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">{user.name || "Unnamed User"}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <button
                  onClick={() => confirmDelete(user)}
                  className="bg-red-500 text-white text-sm px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">
              Confirm Deletion
            </h3>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Are you sure you want to delete <span className="font-semibold">{userToDelete.email}</span>?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
