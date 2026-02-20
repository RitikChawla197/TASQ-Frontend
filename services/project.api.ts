import { api } from "./api";

/* ---------- Types ---------- */

export interface Project {
  id: number;
  name: string;
  description: string | null;
  department: string | null;
  owner_id: number;
  PROJECT_NAME: string;
  DATABASE: string;
  SERVER_TYPE: string;
  PROJECT_PROJECTION?: string;
  SQL_PROJECT_ZONE?: string;
  SQL_PROJECT_LONGITUTE?: string;
  SQL_PROJECT_LATITUDE?: string;
}

export interface ProjectApiResponse {
  PROJECT_NAME: Project[];
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
}

export interface UpdateProjectPayload {
  name: string;
  department: string;
  description?: string;
}

/* ---------- API ---------- */

type RawProject = {
  id: number;
  name: string;
  description: string | null;
  department: string | null;
  owner_id: number;
};

const asRawProject = (data: unknown): RawProject => {
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const nested = (obj.project ?? obj.item ?? obj.data) as
      | Record<string, unknown>
      | undefined;
    const candidate = (nested ?? obj) as Record<string, unknown>;

    if (
      typeof candidate.id === "number" &&
      typeof candidate.name === "string" &&
      typeof candidate.owner_id === "number"
    ) {
      return {
        id: candidate.id,
        name: candidate.name,
        description:
          typeof candidate.description === "string"
            ? candidate.description
            : null,
        department:
          typeof candidate.department === "string"
            ? candidate.department
            : null,
        owner_id: candidate.owner_id,
      };
    }
  }

  throw new Error("Unexpected create project response");
};

const toProject = (raw: RawProject): Project => ({
  id: raw.id,
  name: raw.name,
  description: raw.description,
  department: raw.department,
  owner_id: raw.owner_id,
  PROJECT_NAME: raw.name,
  DATABASE: String(raw.id),
  SERVER_TYPE: raw.department ?? "GENERAL",
});

const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access") || localStorage.getItem("access_token")
      : null;

  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

export const projectApi = {
  getAllProjects: async (): Promise<ProjectApiResponse> => {
    const headers = getAuthHeaders();

    let data: unknown;
    try {
      const res = await api.get("user/projects", {
        headers,
        skipErrorToast: true,
      });
      data = res.data;
    } catch (error: any) {
      if (error?.response?.status === 404 || error?.response?.status === 405) {
        const res = await api.get("user/projects/", { headers });
        data = res.data;
      } else {
        throw error;
      }
    }

    const typedData = data as
      | ProjectApiResponse
      | RawProject[]
      | { projects?: RawProject[]; items?: RawProject[] };

    if (Array.isArray(typedData)) {
      return { PROJECT_NAME: typedData.map(toProject) };
    }

    if (typedData && typeof typedData === "object") {
      const collectionData = typedData as {
        projects?: RawProject[];
        items?: RawProject[];
        PROJECT_NAME?: Project[];
      };

      if (Array.isArray(collectionData.projects)) {
        return { PROJECT_NAME: collectionData.projects.map(toProject) };
      }

      if (Array.isArray(collectionData.items)) {
        return { PROJECT_NAME: collectionData.items.map(toProject) };
      }

      if (Array.isArray(collectionData.PROJECT_NAME)) {
        return { PROJECT_NAME: collectionData.PROJECT_NAME };
      }
    }

    return { PROJECT_NAME: [] };
  },

  createProject: async (payload: CreateProjectPayload): Promise<Project> => {
    const headers = getAuthHeaders();

    let data: unknown;
    try {
      const res = await api.post("user/create_projects", payload, {
        headers,
        skipErrorToast: true,
      });
      data = res.data;
    } catch (error: any) {
      if (error?.response?.status === 404 || error?.response?.status === 405) {
        const res = await api.post("user/create_projects/", payload, {
          headers,
        });
        data = res.data;
      } else {
        throw error;
      }
    }

    return toProject(asRawProject(data));
  },

  updateProject: async (
    projectId: number | string,
    payload: UpdateProjectPayload
  ): Promise<void> => {
    const headers = getAuthHeaders();

    try {
      await api.put(`/user/update_project/${projectId}`, payload, {
        headers,
        skipErrorToast: true,
      });
    } catch (error: any) {
      if (error?.response?.status === 404 || error?.response?.status === 405) {
        await api.put(`/user/update_project/${projectId}/`, payload, {
          headers,
        });
      } else {
        throw error;
      }
    }
  },

  deleteProject: async (projectId: number | string): Promise<void> => {
    const headers = getAuthHeaders();

    try {
      await api.delete(`user/project_delete/${projectId}`, {
        headers,
        skipErrorToast: true,
      });
    } catch (error: any) {
      if (error?.response?.status === 404 || error?.response?.status === 405) {
        await api.delete(`user/project_delete/${projectId}/`, { headers });
      } else {
        throw error;
      }
    }
  },
};
