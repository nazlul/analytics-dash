import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = cookies();
  const refreshToken = (await cookieStore).get("refresh_token");
  if (!refreshToken) {
    return redirect("/users/signin");
  }
  
  const res = await fetch("http://localhost:8000/auth/refresh", {
    method: "POST",
    headers: {
      Cookie: `refresh_token=${refreshToken.value}`,
    },
    credentials: "include",
  });

  if (res.ok) {
    return redirect("/dashboard");
  } else {
    return redirect("/users/signin");
  }
}
