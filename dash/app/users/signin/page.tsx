"use client"

import Link from "next/link"
import { UserAuthForm } from "@/components/user-auth-form"
import { GoogleAuthButton } from "@/components/google-auth-button"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-l from-[#439B82] to-[#35204D] bg-[length:200%_200%] animate-[gradientMove_6s_ease-in-out_infinite] px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-center">Sign In</h2>

        <UserAuthForm type="signin" />

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex-1 border-t" />
          Or
          <div className="flex-1 border-t" />
        </div>

        <GoogleAuthButton />

        <p className="text-sm text-center text-muted-foreground">
          Don&apos;t have an account yet?{" "}
          <Link href="/users/signup" className="text-blue-600 underline underline-offset-4 hover:text-primary">
            New Account
          </Link>
        </p>
      </div>
      
      <style jsx global>{`
        @keyframes gradientMove {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  )
}
