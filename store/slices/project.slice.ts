import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { projectApi } from "@/services/project.api";
import type { Project } from "@/services/project.api";

/* ---------- State Type ---------- */

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  loading: boolean;
  error: string | null;
}

/* ---------- Initial State ---------- */

const initialState: ProjectState = {
  projects: [],
  selectedProject: null,
  loading: false,
  error: null,
};

/* ---------- Async Thunk ---------- */

export const fetchProjects = createAsyncThunk(
  "project/fetchProjects",
  async (_, { rejectWithValue }) => {
    try {
      const response = await projectApi.getAllProjects();
      return response.PROJECT_NAME;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch projects"
      );
    }
  }
);

/* ---------- Slice ---------- */

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    clearProjects: (state) => {
      state.projects = [];
      state.selectedProject = null;
      state.error = null;
    },
    setSelectedProject: (state, action: PayloadAction<Project>) => {
      state.selectedProject = action.payload;
    },

    // ✅ Optional: clear selected project
    clearSelectedProject: (state) => {
      state.selectedProject = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔄 Pending
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      // ✅ Success
      .addCase(
        fetchProjects.fulfilled,
        (state, action: PayloadAction<Project[]>) => {
          state.loading = false;
          state.projects = action.payload;
        }
      )

      // ❌ Error
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearProjects,
  setSelectedProject, // ✅ export
  clearSelectedProject,
} = projectSlice.actions;
export default projectSlice.reducer;
