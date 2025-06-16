export async function fetchProtectedData(): Promise<Record<string, unknown>> {
  let accessToken = localStorage.getItem("access_token");
  console.log("Using access token:", accessToken);

  let res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/protected`, {
    method: "GET",
    credentials: "include",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (res.status === 401) {
    console.warn("Access token expired or invalid, refreshing...");
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      console.error("Token refresh failed.");
      throw new Error("Session expired. Please login again.");
    }

    accessToken = localStorage.getItem("access_token");
    console.log("Refreshed access token:", accessToken);

    res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/protected`, {
      method: "GET",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  if (!res.ok) {
    console.error("Failed to fetch protected data. Status:", res.status);
    throw new Error("Request failed");
  }

  const data: Record<string, unknown> = await res.json();
  console.log("Protected data received:", data);
  return data;
}

export async function refreshAccessToken(): Promise<boolean> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh-token`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    console.error("Refresh token request failed. Status:", res.status);
    return false;
  }

  const data: { access_token: string } = await res.json();
  localStorage.setItem("access_token", data.access_token);
  console.log("Access token refreshed and stored.");
  return true;
}
