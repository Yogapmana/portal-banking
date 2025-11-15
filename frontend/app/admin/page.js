"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import UserManagement from "../../components/UserManagement";

export default function AdminPage() {
  const { isAuthenticated, isLoading: authLoading, role } = useAuth();
  const router = useRouter();

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || role !== "ADMIN")) {
      router.push("/dashboard");
      return;
    }
  }, [isAuthenticated, role, authLoading, router]);

  // Show loading while checking auth
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Manajemen Akun
        </h1>
        <p className="text-gray-600">
          Kelola akun pengguna untuk tim sales
        </p>
      </div>

      <UserManagement />
    </div>
  );
}