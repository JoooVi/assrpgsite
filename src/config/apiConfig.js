export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://assrpgsite-be-production.up.railway.app";
export const API_URL = `${API_BASE_URL}/api`;

export const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

export const jsonAuthHeaders = (token) => ({
  ...authHeaders(token),
  "Content-Type": "application/json",
});
