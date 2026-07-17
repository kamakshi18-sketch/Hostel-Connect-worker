const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function getToken() {
  // each portal keeps its own storage prefix, but the token itself works
  // against any endpoint since the backend trusts the JWT's embedded role
  for (const key of Object.keys(localStorage)) {
    if (key.endsWith("_token")) return localStorage.getItem(key);
  }
  return null;
}

async function request(path, { method = "GET", body, token } = {}) {
  const authToken = token || getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export const api = {
  login: (email, password, role) =>
    request("/api/auth/login", { method: "POST", body: { email, password, role } }),

  getNotices: (token) => request("/api/notices", { token }),
  postNotice: (notice, token) =>
    request("/api/notices", { method: "POST", body: notice, token }),
  markNoticeRead: (id, token) =>
    request(`/api/notices/${id}/read`, { method: "PATCH", token }),

  getAttendance: (date, token) =>
    request(`/api/attendance${date ? `?date=${date}` : ""}`, { token }),
  getAttendanceHistory: (studentId, token) =>
    request(`/api/attendance/history/${studentId}`, { token }),
  markAttendance: (payload, token) =>
    request("/api/attendance/mark", { method: "POST", body: payload, token }),
  toggleAttendance: (id, token) =>
    request(`/api/attendance/${id}/toggle`, { method: "PATCH", token }),
};

export default api;
