"use client"

import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"

interface GoogleAuthButtonProps {
  isLoading?: boolean
}

export function GoogleAuthButton({ isLoading }: GoogleAuthButtonProps) {
  return (
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
  )
}
