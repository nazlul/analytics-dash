"use client";

import { useEffect, useRef, useState } from "react";
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
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/users/signin");
      return;
    }

    const fetchAdmin = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          router.push("/users/signin");
          return;
        }

        const data = await res.json();
        const email = typeof data === "string" ? data : data.email;

        if (!email.endsWith("@example.com")) {
          router.push("/unauthorized");
          return;
        }

        setAdmin({ email, name: data.name || "Admin" });
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
    const token = localStorage.getItem("access_token");

    const fetchUsers = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/all-users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUsers(data.users);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    if (admin) fetchUsers();
  }, [admin]);

  const confirmDelete = (user: User) => {
    setUserToDelete(user);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/delete-user?email=${encodeURIComponent(userToDelete.email)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userToDelete && modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setUserToDelete(null);
      }
    };

    if (userToDelete) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userToDelete]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
        Loading...
      </div>
    );
  }

  return (
    <main className="relative p-8 bg-[#02ff2c2b] min-h-screen">
      <button
        onClick={() => router.push("/dashboard")}
        className="absolute top-4 left-4 bg-[#35204D] text-white px-4 py-2 cursor-pointer rounded hover:bg-[#281537]"
      >
        &lt;- 
      </button>
      <h1 className="text-3xl font-bold mb-4 mt-10 text-center text-[#35204D] uppercase">Admin Dashboard</h1>
      <p className="mb-6 text-center text-[#35204D]">Welcome, {admin?.email}</p>

      <section className="border p-4 rounded shadow-sm max-w-2xl mx-auto bg-[#439B82] text-white">
        <h2 className="font-semibold text-xl text-[#35204D] mb-4 uppercase">🧑‍💻 User Management</h2>
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <ul className="divide-y text-[#35204D] divide-gray-200">
            {users.map((user) => (
              <li key={user.email} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">{user.name || "Unnamed User"}</p>
                  <p className="text-sm text-[#35204D]">{user.email}</p>
                </div>
                <button
                  onClick={() => confirmDelete(user)}
                  className="bg-red-500 text-white text-sm px-3 py-1 rounded hover:bg-red-600 cursor-pointer"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {userToDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">
              Confirm Deletion
            </h3>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Are you sure you want to delete <span className="font-semibold">{userToDelete.email}</span>?
            </p>
            <div className="flex justify-center space-x-4">
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
