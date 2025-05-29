"use client";

import React, { useEffect, useRef, useState } from "react";

interface User {
  email: string;
}

const MainNav: React.FC = () => {
  const [showLogout, setShowLogout] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const logoutRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        window.location.href = "/users/signin";
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

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
          setUser({ email: data });
        } else {
          console.error("Failed to fetch user");
        }
      } catch (error) {
        console.error("Error fetching user", error);
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

  return (
    <nav className="w-full flex justify-between items-center px-6 bg-[#FFF5EE] text-blue-900 rounded-lg mb-4 relative">
      <div className="flex items-center">
        <img src="/assets/dotheal-logo.png" alt="Logo" className="h-10 mr-3" />
        <h1 className="text-xl font-semibold text-[#439B82]">Ads Analytics</h1>
      </div>

      <div className="relative flex items-center gap-3" ref={logoutRef}>
        {user && (
          <span className="text-sm text-gray-700 font-medium">
            USER: {user.email}
          </span>
        )}
        <button onClick={() => setShowLogout(prev => !prev)} className="p-2 flex items-center">
          <img src="/assets/logout.svg" alt="Logout" className="h-20 w-20 cursor-pointer mt-3" />
        </button>
        {showLogout && (
          <div
            className="absolute right-0 mt-25 bg-red-600 text-white text-sm px-4 py-2 rounded shadow-lg cursor-pointer hover:bg-red-700 transition"
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
