// Small fetch wrapper for the HR Horizon REST API.
const API_BASE = "/api";

async function apiRequest(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let msg = "Request failed";
    try {
      const body = await res.json();
      msg = body.error || msg;
    } catch (e) {}
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

const api = {
  get: (path) => apiRequest(path),
  post: (path, data) => apiRequest(path, { method: "POST", body: JSON.stringify(data) }),
  put: (path, data) => apiRequest(path, { method: "PUT", body: JSON.stringify(data) }),
  del: (path) => apiRequest(path, { method: "DELETE" }),
};
