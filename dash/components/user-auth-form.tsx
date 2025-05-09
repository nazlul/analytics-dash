"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
          client_id: "YOUR_GOOGLE_CLIENT_ID",
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

            {isSignup && (
              <ul className="grid grid-cols-2 text-xs text-muted-foreground mt-2 space-y-1">
                <li className="flex items-center gap-2">
                  <Checkbox checked={passwordValid.minLength} disabled className="w-3 h-3" />
                  8 Characters Minimum
                </li>
                <li className="flex items-center gap-2">
                  <Checkbox checked={passwordValid.hasUppercase} disabled className="w-3 h-3" />
                  One Uppercase Character
                </li>
                <li className="flex items-center gap-2">
                  <Checkbox checked={passwordValid.hasLowercase} disabled className="w-3 h-3" />
                  One Lowercase Character
                </li>
                <li className="flex items-center gap-2">
                  <Checkbox checked={passwordValid.hasNumber} disabled className="w-3 h-3" />
                  One Numeric Number
                </li>
                <li className="flex items-center gap-2 col-span-2">
                  <Checkbox checked={passwordValid.hasSpecialChar} disabled className="w-3 h-3" />
                  One Special Character
                </li>
              </ul>
            )}
          </div>

          {isSignup && (
            <div className="flex items-center space-x-2">
              <Checkbox id="agree" checked={agree} onCheckedChange={(val) => setAgree(Boolean(val))} />
              <Label htmlFor="agree" className="text-sm">
                I agree to the terms and conditions
              </Label>
            </div>
          )}
          {errors.checkbox && <p className="text-red-500 text-sm">{errors.checkbox}</p>}

          <Button type="submit" disabled={isLoading}>
            {isLoading && <Icons.spinner className="mr-2 h-4 animate-spin" />}
            {type === "signin" ? "Sign In" : "Sign Up"}
          </Button>
        </div>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div id="google-button" className="flex justify-center" />
    </div>
  );
}
