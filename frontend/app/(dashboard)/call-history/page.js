"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Award } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Phone,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  Search,
  Edit,
  Save,
  X,
} from "lucide-react";
import api from "@/lib/api";

export default function CallHistoryPage() {
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statistics, setStatistics] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ status: "", notes: "" });
  const [updateLoading, setUpdateLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    status: "ALL",
    search: "",
    startDate: "",
    endDate: "",
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchCallLogs();
    fetchStatistics();
  }, [page, filters]);

  // Calculate statistics from callLogs if API doesn't return proper data
  useEffect(() => {
    if (callLogs.length > 0 && (!statistics || statistics.totalCalls === 0)) {
      const calculatedStats = {
        totalCalls: callLogs.length,
        byStatus: callLogs.reduce((acc, log) => {
          acc[log.status] = (acc[log.status] || 0) + 1;
          return acc;
        }, {})
      };
      console.log("Calculated stats from callLogs:", calculatedStats);
      setStatistics(calculatedStats);
    }
  }, [callLogs, statistics]);

  const fetchCallLogs = async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        page,
        limit: itemsPerPage,
        ...(filters.status &&
          filters.status !== "ALL" && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      };

      const response = await api.callLogs.getAll(params);
      setCallLogs(response.data || []);
      setTotalPages(
        Math.ceil(
          (response.pagination?.totalItems || response.total || 0) /
            itemsPerPage
        )
      );
    } catch (err) {
      setError(err.message || "Failed to load call logs");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.callLogs.getStatistics();
      console.log("Statistics response:", response); // Debug log
      setStatistics(response.data || response || null);
    } catch (err) {
      console.error("Error fetching statistics:", err);
      // If API fails, calculate statistics from current callLogs
      if (callLogs.length > 0) {
        const calculatedStats = {
          totalCalls: callLogs.length,
          byStatus: callLogs.reduce((acc, log) => {
            acc[log.status] = (acc[log.status] || 0) + 1;
            return acc;
          }, {})
        };
        setStatistics(calculatedStats);
      }
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page
  };

  const handleResetFilters = () => {
    setFilters({
      status: "ALL",
      search: "",
      startDate: "",
      endDate: "",
    });
    setPage(1);
  };

  const handleEdit = (callLog) => {
    setEditingId(callLog.id);
    setEditForm({
      status: callLog.status,
      notes: callLog.notes || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ status: "", notes: "" });
  };

  const handleUpdate = async (callLogId) => {
    if (!editForm.status) {
      setError("Status harus dipilih");
      return;
    }

    setUpdateLoading(true);
    setError("");

    try {
      await api.callLogs.update(callLogId, editForm);

      // Refresh both call logs and statistics
      await Promise.all([fetchCallLogs(), fetchStatistics()]);

      // Reset edit mode
      setEditingId(null);
      setEditForm({ status: "", notes: "" });

      // Show success message (you could add a toast notification here)
      console.log("Call log berhasil diupdate");
    } catch (err) {
      setError(err.message || "Gagal mengupdate call log");
    } finally {
      setUpdateLoading(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "INTERESTED":
        return "default";
      case "COMPLETED":
        return "default";
      case "NOT_INTERESTED":
        return "destructive";
      case "NO_ANSWER":
        return "secondary";
      case "CALLBACK":
        return "outline";
      case "WRONG_NUMBER":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      INTERESTED: "Tertarik",
      NOT_INTERESTED: "Tidak Tertarik",
      NO_ANSWER: "Tidak Angkat",
      WRONG_NUMBER: "Nomor Salah",
      CALLBACK: "Minta Dihubungi Lagi",
      COMPLETED: "Transaksi Selesai",
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-[#034694] to-[#0575E6] bg-clip-text text-transparent">
            Riwayat Panggilan
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Daftar semua panggilan yang telah dilakukan
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="metric-card card-hover fade-in border-0 shadow-md hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">
              Total Panggilan
            </CardTitle>
            <div className="avatar-gradient-chelsea w-8 h-8 rounded-lg flex items-center justify-center">
              <Phone className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold tabular-nums">
              {statistics?.totalCalls?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total call records
            </p>
          </CardContent>
        </Card>

        <Card
          className="metric-card card-hover fade-in border-0 shadow-md hover:shadow-xl"
          style={{ animationDelay: "0.1s" }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">
              Tertarik
            </CardTitle>
            <div className="avatar-gradient-chelsea w-8 h-8 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold tabular-nums">
              {statistics?.byStatus?.INTERESTED?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Interested customers
            </p>
          </CardContent>
        </Card>

        <Card
          className="metric-card card-hover fade-in border-0 shadow-md hover:shadow-xl sm:col-span-2 lg:col-span-1"
          style={{ animationDelay: "0.2s" }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">
              Selesai
            </CardTitle>
            <div className="avatar-gradient w-8 h-8 rounded-lg flex items-center justify-center">
              <Award className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold tabular-nums">
              {statistics?.byStatus?.COMPLETED?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Completed transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Riwayat Panggilan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Cari Nasabah</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nama atau nomor telepon..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Semua status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Status</SelectItem>
                  <SelectItem value="INTERESTED">Tertarik</SelectItem>
                  <SelectItem value="NOT_INTERESTED">Tidak Tertarik</SelectItem>
                  <SelectItem value="NO_ANSWER">Tidak Angkat</SelectItem>
                  <SelectItem value="WRONG_NUMBER">Nomor Salah</SelectItem>
                  <SelectItem value="CALLBACK">Callback</SelectItem>
                  <SelectItem value="COMPLETED">Selesai</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Dari Tanggal</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Sampai Tanggal</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4">
            <Button variant="outline" onClick={handleResetFilters}>
              Reset Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-2 m-2">
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : callLogs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Tidak ada riwayat panggilan
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block rounded-lg border border-border/50 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="font-semibold">Waktu</TableHead>
                        <TableHead className="font-semibold">Nasabah</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Catatan</TableHead>
                        <TableHead className="font-semibold">Oleh</TableHead>
                        <TableHead className="font-semibold text-right">
                          Aksi
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {callLogs.map((log) => (
                        <TableRow
                          key={log.id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-foreground">
                                {new Date(log.callDate).toLocaleDateString(
                                  "id-ID",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(log.callDate).toLocaleTimeString(
                                  "id-ID",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold shrink-0">
                                {(log.customer?.name || "?")
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-foreground truncate">
                                  {log.customer?.name || "N/A"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {log.customer?.phoneNumber || "N/A"}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {editingId === log.id ? (
                              <Select
                                value={editForm.status}
                                onValueChange={(value) =>
                                  setEditForm({ ...editForm, status: value })
                                }
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="INTERESTED">
                                    ✅ Tertarik
                                  </SelectItem>
                                  <SelectItem value="NOT_INTERESTED">
                                    ❌ Tidak Tertarik
                                  </SelectItem>
                                  <SelectItem value="NO_ANSWER">
                                    📵 Tidak Angkat
                                  </SelectItem>
                                  <SelectItem value="WRONG_NUMBER">
                                    ⚠️ Nomor Salah
                                  </SelectItem>
                                  <SelectItem value="CALLBACK">
                                    🔄 Minta Dihubungi Lagi
                                  </SelectItem>
                                  <SelectItem value="COMPLETED">
                                    🎉 Selesai
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge
                                variant={getStatusBadgeVariant(log.status)}
                                className="font-medium"
                              >
                                {getStatusLabel(log.status)}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            {editingId === log.id ? (
                              <textarea
                                className="w-full p-2 border rounded-md text-sm resize-none"
                                rows={2}
                                value={editForm.notes}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    notes: e.target.value,
                                  })
                                }
                                placeholder="Tulis catatan..."
                              />
                            ) : (
                              <div
                                className="max-w-xs truncate text-sm text-foreground"
                                title={log.notes || "-"}
                              >
                                {log.notes || "-"}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-foreground">
                              {log.user?.email || "N/A"}
                            </p>
                          </TableCell>
                          <TableCell className="text-right">
                            {editingId === log.id ? (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdate(log.id)}
                                  disabled={updateLoading}
                                  className="hover:bg-primary hover:text-primary-foreground"
                                >
                                  {updateLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Save className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                  disabled={updateLoading}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(log)}
                                className="hover:bg-primary hover:text-primary-foreground"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {callLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-card border border-border/50 rounded-lg p-4 shadow-sm hover:shadow-md transition-all"
                  >
                    {/* Header with Avatar and Name */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold shrink-0">
                        {(log.customer?.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {log.customer?.name || "N/A"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {log.customer?.phoneNumber || "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(log.callDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="mb-3">
                      <span className="text-muted-foreground text-xs block mb-1">
                        Status
                      </span>
                      {editingId === log.id ? (
                        <Select
                          value={editForm.status}
                          onValueChange={(value) =>
                            setEditForm({ ...editForm, status: value })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INTERESTED">Tertarik</SelectItem>
                            <SelectItem value="NOT_INTERESTED">
                              Tidak Tertarik
                            </SelectItem>
                            <SelectItem value="NO_ANSWER">
                              Tidak Angkat
                            </SelectItem>
                            <SelectItem value="WRONG_NUMBER">
                              Nomor Salah
                            </SelectItem>
                            <SelectItem value="CALLBACK">
                              Minta Dihubungi Lagi
                            </SelectItem>
                            <SelectItem value="COMPLETED">Selesai</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant={getStatusBadgeVariant(log.status)}>
                          {getStatusLabel(log.status)}
                        </Badge>
                      )}
                    </div>

                    {/* Notes */}
                    <div className="mb-3">
                      <span className="text-muted-foreground text-xs block mb-1">
                        Catatan
                      </span>
                      {editingId === log.id ? (
                        <textarea
                          className="w-full p-2 border rounded-md text-sm resize-none"
                          rows={3}
                          value={editForm.notes}
                          onChange={(e) =>
                            setEditForm({ ...editForm, notes: e.target.value })
                          }
                          placeholder="Tulis catatan..."
                        />
                      ) : (
                        <p className="text-sm text-foreground">
                          {log.notes || "-"}
                        </p>
                      )}
                    </div>

                    {/* Created By */}
                    <div className="mb-3 pb-3 border-t pt-3">
                      <span className="text-muted-foreground text-xs block mb-1">
                        Dibuat Oleh
                      </span>
                      <p className="text-sm text-foreground">
                        {log.user?.email || "N/A"}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    {editingId === log.id ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdate(log.id)}
                          disabled={updateLoading}
                          className="flex-1"
                        >
                          {updateLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Simpan
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          disabled={updateLoading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(log)}
                        className="w-full hover:bg-primary hover:text-primary-foreground"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t p-4">
                <div className="text-sm text-muted-foreground">
                  Halaman {page} dari {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>
                  <span className="text-sm px-2">{page}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4 sm:ml-2" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
