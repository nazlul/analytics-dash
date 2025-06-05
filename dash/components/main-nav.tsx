"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  email: string;
}

const MainNav: React.FC = () => {
  const [showLogout, setShowLogout] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const logoutRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      localStorage.removeItem("access_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        router.push("/users/signin"); 
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const fetchUser = async () => {
      try {
        if (!token) return;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (typeof data === "string") setUser({ email: data });
          else if (data?.email) setUser({ email: data.email });
        } else {
          console.error("Failed to fetch user info");
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (logoutRef.current && !logoutRef.current.contains(event.target as Node)) {
        setShowLogout(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isAdmin = !!user?.email && user.email.endsWith("@example.com");

  return (
    <nav className="w-full flex justify-between items-center px-6 bg-[#FFF5EE] text-blue-900 rounded-lg mb-4 relative">
      <div className="flex items-center">
        <img src="/assets/dotheal-logo.png" alt="Logo" className="h-10 mr-3" />
        <h1 className="text-xl font-semibold text-[#439B82]">Ads Analytics</h1>
      </div>
      <div className="relative flex items-center gap-3" ref={logoutRef}>
        {user?.email && <span className="text-sm text-gray-700 font-medium">USER: {user.email}</span>}
        {isAdmin && (
          <button
            className="text-sm text-white bg-[#439B82] cursor-pointer font-semibold px-2 py-2 rounded"
            onClick={() => router.push("/admin")}
          >
            Admin Panel
          </button>
        )}
        <button onClick={() => setShowLogout((prev) => !prev)} className="p-2 flex items-center">
          <img src="/assets/logout.svg" alt="Logout" className="h-16 w-16 cursor-pointer" />
        </button>
        {showLogout && (
          <div
            className="absolute right-0 top-14 bg-red-600 text-white text-sm px-4 py-2 rounded shadow-lg cursor-pointer hover:bg-red-700 transition"
            onClick={handleLogout}
          >
            Logout
          </div>
        )}
      </div>
    </nav>
  );
};

export default MainNav;
