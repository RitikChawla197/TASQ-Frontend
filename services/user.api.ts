import { api } from "./api";

export interface CreateUserPayload {
  name: string;
  username: string;
  password: string;
  email: string;
  role: string;
  department: string;
}

export interface DepartmentUser {
  id: number;
  name: string;
  username: string;
  email: string;
  department: string;
}

export async function createUser(payload: CreateUserPayload) {
  try {
    const res = await api.post("/register", payload, { skipErrorToast: true });
    return res.data;
  } catch (error: any) {
    if (error?.response?.status === 404 || error?.response?.status === 405) {
      const res = await api.post("/user/register", payload);
      return res.data;
    }
    throw error;
  }
}

export async function getUsersByDepartment(): Promise<DepartmentUser[]> {
  try {
    const res = await api.get("/user/by_department", { skipErrorToast: true });
    return Array.isArray(res.data) ? (res.data as DepartmentUser[]) : [];
  } catch (error: any) {
    if (error?.response?.status === 404 || error?.response?.status === 405) {
      const res = await api.get("/user/by_department");
      return Array.isArray(res.data) ? (res.data as DepartmentUser[]) : [];
    }
    throw error;
  }
}

export async function deleteUser(userId: number | string) {
  await api.delete(`/user/delete_user/${userId}`);
}
