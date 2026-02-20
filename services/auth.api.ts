import { api } from "./api";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  username: string;
  password: string;
  email: string;
  role: string;
  department: string;
}

export interface LoginResponse {
  access_token: string;
  username: string;
  name: string;
  department: string;
}

export async function loginUser(payload: LoginPayload) {
  const res = await api.post<LoginResponse>("user/login", {
    username: payload.username,
    password: payload.password,
  });

  if (!res.data.access_token) {
    throw new Error("Token not received from login API");
  }

  // Persist complete login payload and compatibility keys.
  localStorage.setItem("login_response", JSON.stringify(res.data));
  localStorage.setItem("access", res.data.access_token);
  localStorage.setItem("access_token", res.data.access_token);
  localStorage.setItem("UserId", res.data.username);
  localStorage.setItem("user_id", res.data.username);
  localStorage.setItem("username", res.data.username);
  localStorage.setItem("name", res.data.name);
  localStorage.setItem("department", res.data.department);

  return res.data;
}

export async function signupUser(payload: SignupPayload) {
  const res = await api.post("user/signup", payload);
  return res.data;
}
