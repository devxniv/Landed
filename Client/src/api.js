import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/v1";
const api = axios.create({ baseURL, withCredentials: true });

let accessToken = null;
export const setAccessToken = (t) => {
  accessToken = t;
};

let refreshPromise = null;
export const refreshSession = () => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${baseURL}/auth/refresh`, null, { withCredentials: true })
      .then((res) => {
        accessToken = res.data.data.accessToken;
        return res.data.data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

api.interceptors.request.use((cfg) => {
  if (accessToken) cfg.headers.Authorization = `Bearer ${accessToken}`;
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const isAuthRoute = original?.url?.startsWith("/auth/");
    if (err.response?.status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true;
      try {
        await refreshSession();
        return api(original);
      } catch {
        accessToken = null;
        window.dispatchEvent(new Event("auth:logout"));
      }
    }
    return Promise.reject(err);
  },
);

export default api;
