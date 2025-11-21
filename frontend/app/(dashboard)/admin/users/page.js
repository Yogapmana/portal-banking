"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
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
  ADMIN: { label: "Admin", className: "bg-purple-100 text-purple-700 border-purple-200" },
  SALES_MANAGER: { label: "Sales Manager", className: "bg-blue-100 text-blue-700 border-blue-200" },
  SALES: { label: "Sales", className: "bg-green-100 text-green-700 border-green-200" },
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
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-[#034694] to-[#0575E6] bg-clip-text text-transparent">
            Manajemen User
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Kelola akun pengguna sistem
          </p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700">
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
          className="fade-in"
        />
        <StatisticsCard
          title="Admin"
          value={roleStats.ADMIN}
          icon={Shield}
          description="Administrator"
          className="fade-in"
          valueClassName="text-purple-700"
        />
        <StatisticsCard
          title="Sales Manager"
          value={roleStats.SALES_MANAGER}
          icon={Users}
          description="Manager"
          className="fade-in"
          valueClassName="text-blue-700"
        />
        <StatisticsCard
          title="Sales"
          value={roleStats.SALES}
          icon={Users}
          description="Sales staff"
          className="fade-in"
          valueClassName="text-green-700"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Create User Form */}
        <div className="lg:col-span-1">
          <Card className="border-border/50 shadow-elevated mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-[#034694]" />
                <CardTitle>Buat User Baru</CardTitle>
              </div>
              <CardDescription className="mb-4">
                Tambahkan user baru ke sistem
              </CardDescription>
            </CardContent>
          </Card>
          <CreateUserForm onSuccess={handleCreateUser} />
        </div>

        {/* User List Table */}
        <div className="lg:col-span-2">
          <Card className="border-border/50 shadow-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-[#034694]" />
                <CardTitle>Daftar User</CardTitle>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : usersError ? (
                <div className="text-center py-12 text-red-500">
                  Error loading users
                </div>
              ) : !users || users.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Tidak ada user
                </div>
              ) : (
                <div className="rounded-lg border border-border/50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="font-semibold">Email</TableHead>
                        <TableHead className="font-semibold">Role</TableHead>
                        <TableHead className="font-semibold text-right">
                          Aksi
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => {
                        const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.SALES;
                        const isCurrentUser = currentUser?.id === user.id;

                        return (
                          <TableRow
                            key={user.id}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {user.email}
                                </span>
                                {isCurrentUser && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-blue-50 text-blue-700 border-blue-200"
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
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setUserToDelete(user);
                                  setShowDeleteDialog(true);
                                }}
                                disabled={isCurrentUser}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

      {/* Delete Confirmation Dialog */}
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
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
