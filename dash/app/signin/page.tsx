import Link from "next/link";
import { UserAuthForm } from "@/components/user-auth-form";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <UserAuthForm type="signin" />
      <p className="text-sm text-muted-foreground">
        Don&apos;t have an account yet?{" "}
        <Link href="/signup" className="text-blue-600 hover:underline">
          New Account
        </Link>
      </p>
    </div>
  );
}
