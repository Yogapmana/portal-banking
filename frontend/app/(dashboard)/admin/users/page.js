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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { UserPlus, Trash2, Shield, AlertCircle } from "lucide-react";

export default function UserManagementPage() {
  const { isAdmin, user: currentUser } = useAuth();
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "SALES",
  });
  const [formLoading, setFormLoading] = useState(false);

  // Fetch users
  const {
    data: users,
    error: usersError,
    isLoading,
    mutate,
  } = useSWR("users", () => api.auth.getUsers().then((res) => res.data), {
    revalidateOnFocus: false,
  });

  // Redirect if not admin
  if (!isAdmin()) {
    router.push("/dashboard");
    return null;
  }

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFormLoading(true);

    try {
      const response = await api.auth.register(
        formData.email,
        formData.password,
        formData.role
      );

      if (response.success) {
        setSuccess(`User ${formData.role} berhasil dibuat`);
        setFormData({
          email: "",
          password: "",
          role: "SALES",
        });
        mutate(); // Refresh user list
      }
    } catch (err) {
      // Display backend validation error
      setError(err.message || "Failed to create user");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await api.users.delete(userToDelete.id);
      setSuccess(`User ${userToDelete.email} berhasil dihapus`);
      mutate(); // Refresh user list
      setShowDeleteDialog(false);
      setUserToDelete(null);
    } catch (err) {
      setError(err.message || "Failed to delete user");
      setShowDeleteDialog(false);
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case "ADMIN":
        return "destructive";
      case "SALES_MANAGER":
        return "default";
      case "SALES":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage user accounts and permissions
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 p-4 text-sm text-green-600">
          <AlertCircle className="h-4 w-4" />
          {success}
        </div>
      )}

      {/* Create User Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Tambah Akun Baru
          </CardTitle>
          <CardDescription>
            Create a new user account with specific role and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  disabled={formLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="e.g., Admin123!"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  minLength={8}
                  disabled={formLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Min 8 chars, must include: uppercase, lowercase, number &
                  special char (@$!%*?&)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                  disabled={formLoading}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SALES_MANAGER">Sales Manager</SelectItem>
                    <SelectItem value="SALES">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={formLoading}>
              {formLoading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Creating...
                </span>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create User
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Daftar Akun
          </CardTitle>
          <CardDescription>All registered users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : usersError ? (
            <div className="py-8 text-center text-red-600">
              Error loading users: {usersError.message}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block rounded-lg border border-border/50 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="font-semibold">User</TableHead>
                        <TableHead className="font-semibold">Email</TableHead>
                        <TableHead className="font-semibold">Role</TableHead>
                        <TableHead className="font-semibold">
                          Created At
                        </TableHead>
                        <TableHead className="font-semibold text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.map((user) => (
                        <TableRow
                          key={user.id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold shrink-0">
                                {user.email.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-foreground">
                                  User #{user.id}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {user.role}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-foreground">
                              {user.email}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getRoleBadgeVariant(user.role)}
                              className="font-medium"
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-foreground">
                                {new Date(user.createdAt).toLocaleDateString(
                                  "id-ID",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(user.createdAt).toLocaleTimeString(
                                  "id-ID",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setUserToDelete(user);
                                setShowDeleteDialog(true);
                              }}
                              disabled={user.id === currentUser?.id}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {users?.map((user) => (
                  <div
                    key={user.id}
                    className="bg-card border border-border/50 rounded-lg p-4 shadow-sm hover:shadow-md transition-all"
                  >
                    {/* Header with Avatar */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold shrink-0">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">
                          User #{user.id}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {user.email}
                        </p>
                        <div className="mt-2">
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Created At */}
                    <div className="mb-3 pb-3 border-t pt-3">
                      <span className="text-muted-foreground text-xs block mb-1">
                        Created At
                      </span>
                      <p className="text-sm text-foreground">
                        {new Date(user.createdAt).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(user.createdAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {/* Action Button */}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setUserToDelete(user);
                        setShowDeleteDialog(true);
                      }}
                      disabled={user.id === currentUser?.id}
                      className="w-full"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete User
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user account for{" "}
              <span className="font-semibold">{userToDelete?.email}</span>. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
