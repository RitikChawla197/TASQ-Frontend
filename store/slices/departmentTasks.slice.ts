import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { taskApi } from "@/services/task.api";
import type { Task } from "@/types/task";

interface DepartmentTasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  department: string | null;
}

const initialState: DepartmentTasksState = {
  tasks: [],
  loading: false,
  error: null,
  department: null,
};

export const fetchDepartmentTasks = createAsyncThunk(
  "departmentTasks/fetchDepartmentTasks",
  async (department: string, { rejectWithValue }) => {
    try {
      const tasks = await taskApi.getTasksByDepartment(department);
      return { department, tasks };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch department tasks"
      );
    }
  }
);

const departmentTasksSlice = createSlice({
  name: "departmentTasks",
  initialState,
  reducers: {
    clearDepartmentTasks: (state) => {
      state.tasks = [];
      state.loading = false;
      state.error = null;
      state.department = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartmentTasks.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.department = action.meta.arg;
      })
      .addCase(fetchDepartmentTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks;
        state.department = action.payload.department;
      })
      .addCase(fetchDepartmentTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDepartmentTasks } = departmentTasksSlice.actions;
export default departmentTasksSlice.reducer;
