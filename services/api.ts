import axios from "axios";
import { toast } from "sonner";

declare module "axios" {
  interface AxiosRequestConfig {
    skipErrorToast?: boolean;
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");

if (!API_BASE_URL) {
  throw new Error(
    "Missing NEXT_PUBLIC_API_BASE_URL. Set it in your .env.local file."
  );
}

export const api = axios.create({
  baseURL: `${API_BASE_URL}/`,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Attach token ONLY if it exists
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("access") ||
        localStorage.getItem("access_token");

      const url = config.url ?? "";
      const isLoginApi =
        url.includes("/login") ||
        url.includes("/user/login") ||
        url.includes("/user/signup");

      if (token && !isLoginApi) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const config = error?.config as { skipErrorToast?: boolean } | undefined;
    const shouldSkipToast = config?.skipErrorToast;
    const status = error?.response?.status;
    const data = error?.response?.data;

    let message = "Something went wrong";
    if (typeof data === "string" && data.trim()) {
      message = data;
    } else if (data && typeof data === "object") {
      const obj = data as Record<string, unknown>;
      if (typeof obj.message === "string" && obj.message.trim()) {
        message = obj.message;
      } else if (typeof obj.detail === "string" && obj.detail.trim()) {
        message = obj.detail;
      } else if (typeof obj.error === "string" && obj.error.trim()) {
        message = obj.error;
      }
    } else if (typeof error?.message === "string" && error.message.trim()) {
      message = error.message;
    }

    if (!shouldSkipToast && typeof window !== "undefined") {
      toast.error(status ? `${message} (${status})` : message);
    }

    return Promise.reject(error);
  }
);
