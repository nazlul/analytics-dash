"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  type: "signin" | "signup";
}

export function UserAuthForm({ className, type, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [agree, setAgree] = React.useState(false);
  const [errors, setErrors] = React.useState<{ email?: string; password?: string; checkbox?: string }>({});

  const isSignup = type === "signup";

  const [passwordValid, setPasswordValid] = React.useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  React.useEffect(() => {
    setPasswordValid({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [password]);

  const allChecksPassed = Object.values(passwordValid).every(Boolean);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";

    if (!password) newErrors.password = "Password is required";
    else if (isSignup && !allChecksPassed) newErrors.password = "Password must meet all requirements";

    if (isSignup && !agree) newErrors.checkbox = "You must agree to continue";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    const res = await fetch(`http://localhost:8000/api/${type === "signin" ? "manual-login" : "manual-register"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      alert(`${type === "signin" ? "Login" : "Signup"} successful!`);
      window.location.href = "/dashboard";
    } else {
      alert(data.error || "An error occurred");
    }

    setIsLoading(false);
  }

  React.useEffect(() => {
    const initializeGoogle = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: async (credentialResponse: any) => {
            setIsLoading(true);
            const googleToken = credentialResponse.credential;

            const res = await fetch("http://localhost:8000/api/google-login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: googleToken }),
            });

            const data = await res.json();
            if (res.ok) {
              alert("Google login successful!");
              window.location.href = "/dashboard";
            } else {
              alert(data.error || "Google login failed");
            }
            setIsLoading(false);
          },
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-button"),
          { theme: "outline", size: "large" }
        );
      }
    };

    if (typeof window !== "undefined" && window.google) {
      initializeGoogle();
    } else {
      window.addEventListener("load", initializeGoogle);
    }
  }, []);

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={onSubmit} noValidate>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              autoComplete={type === "signin" ? "email" : "username"}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="mt-2"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={type === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="mt-2"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>
          {errors.checkbox && <p className="text-red-500 text-sm">{errors.checkbox}</p>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Icons.spinner className="mr-2 h-4 animate-spin" />}
            {type === "signin" ? "Sign In" : "Sign Up"}
          </Button>
        </div>
      </form>
    </div>
  );
}
