"use client"

import { useState } from "react"
import Link from "next/link"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff } from "lucide-react"

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [passwordValid, setPasswordValid] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  })

  function validatePassword(password: string) {
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[^A-Za-z0-9]/.test(password),
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target
    const updatedForm = { ...form, [name]: type === "checkbox" ? checked : value }
    setForm(updatedForm)
    if (name === "password") {
      setPasswordValid(validatePassword(value))
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const allPasswordChecksPassed = Object.values(passwordValid).every(Boolean)
    if (!allPasswordChecksPassed) {
      alert("Password does not meet all requirements.")
      return
    }
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match.")
      return
    }
    if (!form.agree) {
      alert("You must agree to the terms and privacy policy.")
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      alert("Account created successfully!")
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter Your Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            placeholder="Enter Your Email"
            value={form.email}
            onChange={handleChange}
            type="email"
            required
          />
        </div>
        <div className="relative">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            placeholder="********"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="absolute right-2 top-6 text-gray-500"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
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
            <li className="flex items-center gap-2">
              <Checkbox checked={passwordValid.hasSpecialChar} disabled className="w-3 h-3" />
              One Special Character
            </li>
          </ul>
        </div>
        <div className="relative">
          <Label htmlFor="confirmPassword">Password confirmation</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            placeholder="********"
            type={showConfirmPassword ? "text" : "password"}
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="absolute right-2 top-6 text-gray-500"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
          >
            {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <Checkbox
            id="agree"
            name="agree"
            checked={form.agree}
            onCheckedChange={(checked) => setForm({ ...form, agree: !!checked })}
            required
          />
          <label htmlFor="agree" className="leading-5">
            By creating an account you agree to the{" "}
            <a href="#" className="text-purple-600 underline">terms of use</a> and our{" "}
            <a href="#" className="text-purple-600 underline">privacy policy</a>.
          </label>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Create account
        </Button>
      </form>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="flex-1 border-t" />
        Or
        <div className="flex-1 border-t" />
      </div>
      <Button
        variant="outline"
        className="w-full"
        type="button"
        disabled={isLoading}
        onClick={() => (window.location.href = "/auth/login")}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}
        Google
      </Button>
      <p className="text-sm text-center text-muted-foreground">
        Already have an account?{" "}
        <Link href="/signin" className=" text-blue-600 underline underline-offset-4 hover:text-primary">
          Sign in
        </Link>
      </p>
    </div>
  )
}
