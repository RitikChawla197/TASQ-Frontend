import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { taskApi } from "@/services/task.api";
import type { Task } from "@/types/task";

interface TaskByProjectNameState {
  projectName: string | null;
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TaskByProjectNameState = {
  projectName: null,
  tasks: [],
  loading: false,
  error: null,
};

export const fetchTasksByProjectName = createAsyncThunk(
  "taskByProjectName/fetchTasksByProjectName",
  async (projectName: string, { rejectWithValue }) => {
    try {
      const tasks = await taskApi.getTasksByProjectName(projectName);
      return { projectName, tasks };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch tasks by project name"
      );
    }
  }
);

const taskByProjectNameSlice = createSlice({
  name: "taskByProjectName",
  initialState,
  reducers: {
    clearTaskByProjectName: (state) => {
      state.projectName = null;
      state.tasks = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasksByProjectName.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.projectName = action.meta.arg;
      })
      .addCase(fetchTasksByProjectName.fulfilled, (state, action) => {
        state.loading = false;
        state.projectName = action.payload.projectName;
        state.tasks = action.payload.tasks;
      })
      .addCase(fetchTasksByProjectName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.tasks = [];
      });
  },
});

export const { clearTaskByProjectName } = taskByProjectNameSlice.actions;
export default taskByProjectNameSlice.reducer;
