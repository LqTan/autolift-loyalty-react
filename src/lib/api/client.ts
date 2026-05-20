export const getAuthToken = () => localStorage.getItem("auth_token");

export const setAuthToken = (token: string) => {
  localStorage.setItem("auth_token", token);
};

export const clearAuthToken = () => {
  localStorage.removeItem("auth_token");
};