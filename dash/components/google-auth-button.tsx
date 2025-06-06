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
    if (window.google && window.google.accounts && divRef.current) {
      initializeGoogle();
      setReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      initializeGoogle();
      setReady(true);
    };

    script.onerror = () => {
      console.error("Google Identity Services script failed to load.");
    };

    document.head.appendChild(script);
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  function initializeGoogle() {
    if (!window.google?.accounts || !divRef.current) return;

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      callback: async (response) => {
        const token = response.credential;

        try {
          const res = await fetch("http://localhost:8000/auth/google-login", {
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
        } catch {
          alert("Network error during Google login");
        }
      },
      ux_mode: "popup",
    });

    window.google.accounts.id.renderButton(divRef.current, {
      theme: "outline",
      size: "large",
    });
  }

  return (
    <div ref={divRef} className="w-full flex justify-center items-center">
      {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
    </div>
  );
}
