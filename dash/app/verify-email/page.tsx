"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    async function verifyEmail() {
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/auth/verify-email?token=${token}`, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("access_token", data.access_token);
        router.push(data.redirect_url || "/dashboard");
      } else {
        router.push("/error?reason=email_verification_failed");
      }
    }

    verifyEmail();
  }, [token, router]);

  return <p>Verifying email...</p>;
}
