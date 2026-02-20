import { configureStore } from "@reduxjs/toolkit";
import projectReducer from "./slices/project.slice";
import taskByProjectNameReducer from "./slices/taskByProjectName.slice";
import membersReducer from "./slices/members.slice";
import departmentTasksReducer from "./slices/departmentTasks.slice";

export const store = configureStore({
  reducer: {
    project: projectReducer,
    taskByProjectName: taskByProjectNameReducer,
    members: membersReducer,
    departmentTasks: departmentTasksReducer,
  },
});

// Types for hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
