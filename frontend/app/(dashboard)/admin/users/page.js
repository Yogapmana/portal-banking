"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2, Shield, AlertCircle, Users } from "lucide-react";
import CreateUserForm from "@/components/dashboard/CreateUserForm";
import StatisticsCard from "@/components/dashboard/StatisticsCard";

const ROLE_CONFIG = {
  ADMIN: {
    label: "Admin",
    className: "bg-purple-100 text-purple-800 border border-purple-200",
  },
  SALES_MANAGER: {
    label: "Sales Manager",
    className: "bg-blue-100 text-blue-800 border border-blue-200",
  },
  SALES: {
    label: "Sales",
    className: "bg-green-100 text-green-800 border border-green-200",
  },
};

export default function UserManagementPage() {
  const { isAdmin, user: currentUser } = useAuth();
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    data: users,
    error: usersError,
    isLoading,
    mutate,
  } = useSWR("users", () => api.auth.getUsers().then((res) => res.data), {
    revalidateOnFocus: false,
  });

  if (!isAdmin()) {
    router.push("/dashboard");
    return null;
  }

  const handleCreateUser = async (formData) => {
    const response = await api.auth.register(
      formData.email,
      formData.password,
      formData.role
    );
    if (response.success) {
      setSuccess(`User ${formData.role} berhasil dibuat`);
      setTimeout(() => setSuccess(""), 3000);
      mutate();
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setError("");
    try {
      await api.users.delete(userToDelete.id);
      setSuccess(`User ${userToDelete.email} berhasil dihapus`);
      setTimeout(() => setSuccess(""), 3000);
      mutate();
    } catch (err) {
      setError(err.message || "Gagal menghapus user");
    } finally {
      setShowDeleteDialog(false);
      setUserToDelete(null);
    }
  };

  const getRoleStats = () => {
    if (!users) return { ADMIN: 0, SALES_MANAGER: 0, SALES: 0 };
    return users.reduce(
      (acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      },
      { ADMIN: 0, SALES_MANAGER: 0, SALES: 0 }
    );
  };

  const roleStats = getRoleStats();

  return (
    <div className="space-y-8 fade-in px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Manajemen User
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Kelola akun pengguna
          </p>
        </div>
      </div>

      {/* Success/Error */}
      {success && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800">
          {success}
        </div>
      )}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatisticsCard
          title="Total Users"
          value={users?.length || 0}
          icon={Users}
          description="All users"
        />
        <StatisticsCard
          title="Admin"
          value={roleStats.ADMIN}
          icon={Shield}
          description="Administrator"
          valueClassName="text-purple-800"
        />
        <StatisticsCard
          title="Sales Manager"
          value={roleStats.SALES_MANAGER}
          icon={Users}
          description="Manager"
          valueClassName="text-blue-800"
        />
        <StatisticsCard
          title="Sales"
          value={roleStats.SALES}
          icon={Users}
          description="Sales staff"
          valueClassName="text-green-800"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Create User Form */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-blue-700" />
                <CardTitle>Buat User Baru</CardTitle>
              </div>
              <CardDescription className="mb-4 text-gray-500">
                Tambahkan user baru ke sistem
              </CardDescription>
            </CardContent>
          </Card>
          <CreateUserForm onSuccess={handleCreateUser} />
        </div>

        {/* User Table */}
        <div className="lg:col-span-2">
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-blue-700" />
                <CardTitle>Daftar User</CardTitle>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-700"></div>
                </div>
              ) : usersError ? (
                <div className="text-center py-12 text-red-600">
                  Error loading users
                </div>
              ) : !users || users.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  Tidak ada user
                </div>
              ) : (
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold text-gray-700">
                          Email
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Role
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 text-right">
                          Aksi
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => {
                        const roleConfig =
                          ROLE_CONFIG[user.role] || ROLE_CONFIG.SALES;
                        const isCurrentUser = currentUser?.id === user.id;
                        return (
                          <TableRow
                            key={user.id}
                            className="hover:bg-gray-100 transition-colors"
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">
                                  {user.email}
                                </span>
                                {isCurrentUser && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-blue-50 text-blue-700 border border-blue-200"
                                  >
                                    You
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={roleConfig.className}>
                                {roleConfig.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setUserToDelete(user);
                                  setShowDeleteDialog(true);
                                }}
                                disabled={isCurrentUser}
                                className="text-red-600 hover:text-white hover:bg-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus User?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus user{" "}
              <strong>{userToDelete?.email}</strong>? Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
