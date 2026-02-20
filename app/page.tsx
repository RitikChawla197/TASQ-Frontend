"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname(); 

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      router.push("/home"); // already logged in
      // router.push("/dashboard"); // already logged in
    } else {
      router.push("/login"); // not logged in
    }
  }, [router, pathname]);

  return null;
}
