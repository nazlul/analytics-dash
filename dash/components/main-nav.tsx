"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  email: string;
  name?: string;
}

const MainNav: React.FC = () => {
  const [showLogout, setShowLogout] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const logoutRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleLogout = async () => {
    localStorage.removeItem("access_token");
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    router.push("/users/signin");
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const fetchUser = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        const refresh = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh-token`, {
          method: "POST",
          credentials: "include",
        });
        if (refresh.ok) {
          const { access_token } = await refresh.json();
          localStorage.setItem("access_token", access_token);
          const retry = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${access_token}` },
          });
          if (retry.ok) {
            const data = await retry.json();
            setUser(data);
          }
        }
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAdmin = !!user?.email && user.email.endsWith("@example.com");

  return (
    <nav className="w-full bg-[#FFF5EE] text-blue-900 rounded-lg mb-4 px-4 lg:px-10 py-3">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center justify-center sm:justify-start">
          <img src="/assets/dotheal-logo.png" alt="Logo" className="h-10 mr-3" />
          <h1 className="text-xl font-semibold text-[#439B82]">Ads Analytics</h1>
        </div>
        <div
          className="relative flex flex-col sm:flex-row sm:items-center items-center gap-2 sm:gap-3"
          ref={logoutRef}
        >

          {isAdmin && (
            <button
              className="text-sm text-white bg-[#439B82] px-3 py-1.5 rounded cursor-pointer"
              onClick={() => router.push("/admin")}
            >
              Admin Panel
            </button>
          )}

          {user && (
            <div className="flex items-center gap-2 sm:gap-3 text-sm text-gray-700 font-medium">
              <span className="text-center sm:text-left break-all">
                USER: {user.name || user.email}
              </span>
              <button onClick={() => setShowLogout((prev) => !prev)} className="sm:ml-2 mt-2">
                <img
                  src="/assets/logout.svg"
                  alt="Logout"
                  className="h-16 w-16 cursor-pointer"
                />
              </button>
            </div>
          )}

          {showLogout && (
            <div
              className="absolute right-0 top-full -mt-1 bg-red-600 text-white text-sm px-4 py-2 rounded shadow-lg cursor-pointer hover:bg-red-700 transition"
              onClick={handleLogout}
            >
              Logout
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default MainNav;
