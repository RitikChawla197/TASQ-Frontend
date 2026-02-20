"use client";


import { useAppDispatch } from "@/store/hooks";
import { clearProjects } from "@/store/slices/project.slice";
import { clearDepartmentTasks } from "@/store/slices/departmentTasks.slice";
// import { clearUserProfile } from "@/app/features/profileSlice";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
// Import other "clear" actions if you have them
// import { clearUserList } from "@/appS/features/userSlice";

export const useAuthActions = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  /**
   * Clears all session data from Redux and localStorage,
   * then redirects to the login page.
   */
  const handleLogout = useCallback(() => {
    // 1. Clear Redux state
    // dispatch(clearUserProfile());
    // dispatch(clearUserList());
    // ... dispatch any other "clear" actions

    // 2. Clear localStorage
    localStorage.removeItem("access");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("UserId");
    localStorage.removeItem("user_id");
    localStorage.removeItem("member_id");
    localStorage.removeItem("username");
    localStorage.removeItem("name");
    localStorage.removeItem("department");
    localStorage.removeItem("login_response");
    dispatch(clearProjects());
    dispatch(clearDepartmentTasks());
    // 3. Redirect to login page
    router.push("/login");
  }, [dispatch, router]);

  /**
   * Navigates to the user's profile page.
   */
  const handleAccount = useCallback(() => {
    router.push("/profile");
  }, [router]);

  // Return the functions so components can use them
  return { handleLogout, handleAccount };
};

