"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";
import { Eye, EyeOff } from "lucide-react";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  type: "signin" | "signup";
}

export function UserAuthForm({ className, type, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [agree, setAgree] = React.useState(false);
  const [errors, setErrors] = React.useState<{ email?: string; password?: string; checkbox?: string }>({});
  const [formMessage, setFormMessage] = React.useState<{ type: "error" | "success"; text: string } | null>(null);

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
    setFormMessage(null);
    return Object.keys(newErrors).length === 0;
  };

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setFormMessage(null);

    const res = await fetch(`http://localhost:8000/api/${type === "signin" ? "login" : "register"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      setFormMessage({ type: "success", text: `${type === "signin" ? "Login" : "Signup"} successful! Redirecting...` });
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } else {
      const newErrors: typeof errors = {};
      if (data.detail === "Incorrect password") newErrors.password = "Incorrect password";
      else if (data.detail === "Email not found") newErrors.email = "Email does not exist";
      else if (data.detail === "Email not verified") newErrors.email = "Email not verified. Please check your inbox.";
      else setFormMessage({ type: "error", text: data.detail || "An error occurred." });

      setErrors(newErrors);
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
              setFormMessage({ type: "success", text: "Google login successful! Redirecting..." });
              setTimeout(() => {
                window.location.href = "/dashboard";
              }, 1500);
            } else {
              setFormMessage({ type: "error", text: data.error || "Google login failed" });
            }

            setIsLoading(false);
          },
        });

        window.google.accounts.id.renderButton(document.getElementById("google-button"), {
          theme: "outline",
          size: "large",
        });
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
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                autoComplete={type === "signin" ? "current-password" : "new-password"}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="mt-2 pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {isSignup && (
            <ul className="text-sm mt-2 ml-1 space-y-1">
              <li className={passwordValid.minLength ? "text-green-600" : "text-gray-500"}>• At least 8 characters</li>
              <li className={passwordValid.hasUppercase ? "text-green-600" : "text-gray-500"}>• One uppercase letter</li>
              <li className={passwordValid.hasLowercase ? "text-green-600" : "text-gray-500"}>• One lowercase letter</li>
              <li className={passwordValid.hasNumber ? "text-green-600" : "text-gray-500"}>• One number</li>
              <li className={passwordValid.hasSpecialChar ? "text-green-600" : "text-gray-500"}>• One special character</li>
            </ul>
          )}

          {isSignup && (
            <div className="flex items-center space-x-2 mt-2">
              <input
                type="checkbox"
                id="agree"
                checked={agree}
                onChange={() => setAgree(!agree)}
                disabled={isLoading}
              />
              <Label htmlFor="agree">I agree to the terms and conditions</Label>
            </div>
          )}
          {errors.checkbox && <p className="text-red-500 text-sm">{errors.checkbox}</p>}

          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading && <Icons.spinner className="mr-2 h-4 animate-spin" />}
            {type === "signin" ? "Sign In" : "Sign Up"}
          </Button>

          {formMessage && (
            <p className={`text-sm mt-3 ${formMessage.type === "error" ? "text-red-600" : "text-green-600"}`}>
              {formMessage.text}
            </p>
          )}
        </div>
      </form>

      <div id="google-button" className="w-full flex justify-center mt-4" />
    </div>
  );
}
