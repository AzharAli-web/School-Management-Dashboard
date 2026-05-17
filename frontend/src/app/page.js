"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function Home() {
  const router = useRouter();
  const { token, user, fetchProfile } = useAuthStore();

  useEffect(() => {
    if (!token) {
      router.push("/login");
    } else if (!user) {
      fetchProfile();
    } else {
      router.push(`/${user.role}/dashboard`);
    }
  }, [token, user, router, fetchProfile]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
