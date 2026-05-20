import createClient from "openapi-fetch";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const api = createClient<any>({ baseUrl: baseURL });

export const getAuthToken = () => localStorage.getItem("auth_token");

export const setAuthToken = (token: string) => {
  localStorage.setItem("auth_token", token);
};

export const clearAuthToken = () => {
  localStorage.removeItem("auth_token");
};

export function getAuthorizedClient() {
  const token = getAuthToken();
  const client = createClient<any>({ baseUrl: baseURL });
  if (token) {
    client.use({
      onRequest: ({ request }) => {
        request.headers.set("Authorization", `Bearer ${token}`);
      },
    });
  }
  return client;
}