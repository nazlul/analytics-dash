'use client';

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [message, setMessage] = useState("Verifying...");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("No token provided.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/verify-email?token=${token}`);
        const data = await res.json();

        if (res.ok) {
          setMessage(data.message || "Email verified successfully!");
          setTimeout(() => {
            router.push(data.redirect_url || "/login");
          }, 3000);
        } else {
          setError(data.detail || "Verification failed");
        }
      } catch (e) {
        setError("An error occurred while verifying.");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-xl font-bold">
        {error ? "❌ " + error : "✅ " + message}
      </h1>
    </div>
  );
}
