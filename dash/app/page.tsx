import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = cookies();
  const refreshToken = (await cookieStore).get("refresh_token");

  if (refreshToken) {
    redirect("/dashboard");
  } else {
    redirect("/users/signin");
  }
}
