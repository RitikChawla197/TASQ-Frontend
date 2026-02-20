import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getUsersByDepartment } from "@/services/user.api";
import type { DepartmentUser } from "@/services/user.api";

interface MembersState {
  members: DepartmentUser[];
  loading: boolean;
  error: string | null;
}

const initialState: MembersState = {
  members: [],
  loading: false,
  error: null,
};

export const fetchMembersByDepartment = createAsyncThunk(
  "members/fetchMembersByDepartment",
  async (_, { rejectWithValue }) => {
    try {
      return await getUsersByDepartment();
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch members"
      );
    }
  }
);

const membersSlice = createSlice({
  name: "members",
  initialState,
  reducers: {
    clearMembers: (state) => {
      state.members = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMembersByDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMembersByDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload;
      })
      .addCase(fetchMembersByDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMembers } = membersSlice.actions;
export default membersSlice.reducer;
