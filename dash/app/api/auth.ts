
export async function fetchProtectedData(): Promise<any> {
  let accessToken = localStorage.getItem("access_token");

  let res = await fetch("http://localhost:8000/api/protected", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      throw new Error("Session expired. Please login again.");
    }

    accessToken = localStorage.getItem("access_token");

    res = await fetch("http://localhost:8000/api/protected", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  if (!res.ok) throw new Error("Request failed");

  return res.json();
}

export async function refreshAccessToken(): Promise<boolean> {
  const res = await fetch("http://localhost:8000/api/refresh-token", {
    method: "POST",
    credentials: "include", 
  });

  if (!res.ok) return false;

  const data = await res.json();
  localStorage.setItem("access_token", data.access_token);
  return true;
}
