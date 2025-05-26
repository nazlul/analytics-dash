"use client";

import { useEffect, useState, useRef } from "react";
import { Icons } from "@/components/ui/icons";

interface GoogleAuthButtonProps {
  isLoading?: boolean;
}

export function GoogleAuthButton({ isLoading }: GoogleAuthButtonProps) {
  const divRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: async (response) => {
          const token = response.credential;
          const res = await fetch("http://localhost:8000/api/google-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
          const data = await res.json();
          if (res.ok) {
            localStorage.setItem("access_token", data.access_token);
            window.location.href = "/dashboard";
          } else {
            alert(data.detail || "Google login failed");
          }
        },
        ux_mode: "popup",
      });

      window.google.accounts.id.renderButton(divRef.current, {
        theme: "outline",
        size: "large",
      });

      setReady(true);
    };

    document.head.appendChild(script);
  }, []);

  return (
    <div ref={divRef} className="w-full flex justify-center items-center">
      {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
    </div>
  );
}
