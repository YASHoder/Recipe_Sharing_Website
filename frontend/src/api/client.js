/**
 * Thin API client that wraps fetch() with:
 *  - Base URL pointing to the Flask backend
 *  - Automatic JWT Authorization header injection
 *  - JSON request/response handling
 *  - Consistent error shape: { error: string }
 */

const BASE = import.meta.env.VITE_API_BASE_URL || "/api";

function getToken() {
  return localStorage.getItem("tt_token") || "";
}

export function setToken(token) {
  if (token) {
    localStorage.setItem("tt_token", token);
  } else {
    localStorage.removeItem("tt_token");
  }
}

async function request(method, path, body, opts = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  };

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  return data;
}

export const api = {
  get:    (path, opts)        => request("GET",    path, undefined, opts),
  post:   (path, body, opts)  => request("POST",   path, body,      opts),
  put:    (path, body, opts)  => request("PUT",    path, body,      opts),
  delete: (path, opts)        => request("DELETE", path, undefined, opts),
};
