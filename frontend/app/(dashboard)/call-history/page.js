"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Phone,
  Users,
  Award,
  AlertCircle,
  Loader2,
  TrendingUp,
  Calendar,
  Filter,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/api";
import StatisticsCard from "@/components/dashboard/StatisticsCard";
import CallLogFilters from "@/components/dashboard/CallLogFilters";
import CallLogTableRow from "@/components/dashboard/CallLogTableRow";
import PaginationControls from "@/components/dashboard/PaginationControls";

const STORAGE_KEY = "call_history_state";

// Load saved state from sessionStorage
const loadSavedState = () => {
  if (typeof window === "undefined") return null;
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error("Error loading saved state:", error);
    return null;
  }
};

// Save state to sessionStorage
const saveState = (filters, page) => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ filters, page }));
  } catch (error) {
    console.error("Error saving state:", error);
  }
};

export default function CallHistoryPage() {
  const savedState = loadSavedState();

  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statistics, setStatistics] = useState(null);
  const [filters, setFilters] = useState(
    savedState?.filters || {
      status: "ALL",
      search: "",
      startDate: "",
      endDate: "",
    }
  );
  const [page, setPage] = useState(savedState?.page || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  // Save state whenever filters or page changes
  useEffect(() => {
    saveState(filters, page);
  }, [filters, page]);

  useEffect(() => {
    fetchCallLogs();
    fetchStatistics();
  }, [page, filters]);

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
      const total = response.pagination?.totalItems || response.total || 0;
      setTotalItems(total);
      setTotalPages(Math.ceil(total / itemsPerPage));
    } catch (err) {
      setError(err.message || "Failed to load call logs");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.callLogs.getStatistics();
      setStatistics(response.data || response || null);
    } catch (err) {
      console.error("Error fetching statistics:", err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      status: "ALL",
      search: "",
      startDate: "",
      endDate: "",
    };
    setFilters(defaultFilters);
    setPage(1);
    // Clear from sessionStorage
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleUpdateCallLog = async (callLogId, updateData) => {
    await api.callLogs.update(callLogId, updateData);
    await Promise.all([fetchCallLogs(), fetchStatistics()]);
  };

  return (
    <div className="space-y-8 fade-in min-h-screen bg-linear-to-b from-gray-50/50 to-white p-4 md:p-6">
      {/* Header dengan gradien elegan */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#56B9F1] to-[#3A8FD9] p-6 md:p-8 shadow-lg">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-8"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
              <Phone className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Riwayat Panggilan
            </h1>
          </div>
          <p className="text-white/90 text-base md:text-lg max-w-2xl">
            Pantau dan kelola semua catatan penawaran
          </p>

          {/* Quick Stats Bar */}
          <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-white/20">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-white/80" />
              <span className="text-white/90 text-sm">
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="hidden md:block w-px h-4 bg-white/30"></div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-white/80" />
              <span className="text-white/90 text-sm">
                {totalItems.toLocaleString()} total panggilan
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards dengan desain modern */}
      <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <StatisticsCard
          title="Total Panggilan"
          value={statistics?.totalCalls?.toLocaleString() || "0"}
          icon={Phone}
          description="Semua catatan panggilan"
          iconBgColor="bg-gradient-to-br from-[#56B9F1] to-[#3A8FD9]"
          iconColor="text-white"
          className="fade-in shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100"
          trend={statistics?.trends?.totalCalls}
        />
        <StatisticsCard
          title="Tertarik"
          value={statistics?.byStatus?.TERTARIK?.toLocaleString() || "0"}
          icon={Users}
          description="Nasabah tertarik"
          iconBgColor="bg-gradient-to-br from-emerald-500 to-emerald-600"
          iconColor="text-white"
          className="fade-in shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100"
          trend={statistics?.trends?.interested}
        />
        <StatisticsCard
          title="Berminat"
          value={statistics?.byStatus?.BERMINAT?.toLocaleString() || "0"}
          icon={Award}
          description="Minta callback"
          iconBgColor="bg-gradient-to-br from-blue-500 to-blue-600"
          iconColor="text-white"
          className="fade-in shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100"
        />
      </div>

      {/* Filters Section */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#56B9F1] rounded-lg">
                <Filter className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Filter & Pencarian
                </h2>
                <p className="text-sm text-gray-500">
                  Saring data berdasarkan kriteria tertentu
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {totalItems > 0 && `${totalItems} data ditemukan`}
            </div>
          </div>
        </div>
        <div className="p-6">
          <CallLogFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </div>
      </div>

      {/* Main Table Section */}
      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-lg">
        <div className="bg-linear-to-r from-[#56B9F1]/10 to-[#3A8FD9]/5 border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Daftar Panggilan
              </h2>
              <p className="text-sm text-gray-600">
                Detail lengkap semua riwayat panggilan
              </p>
            </div>
            <div className="px-3 py-1.5 bg-[#56B9F1] rounded-lg text-white text-sm font-medium">
              Halaman {page} dari {totalPages}
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          {error && (
            <div className="m-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700 backdrop-blur-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">Terjadi Kesalahan</p>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-gray-200"></div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Loader2 className="h-8 w-8 animate-spin text-[#56B9F1]" />
                </div>
              </div>
              <p className="mt-4 text-lg font-medium text-gray-700">
                Memuat riwayat panggilan...
              </p>
              <p className="text-sm text-gray-500">Harap tunggu sebentar</p>
            </div>
          ) : callLogs.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-gray-100 to-gray-200">
                <Phone className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-xl font-semibold text-gray-700 mb-2">
                Belum ada riwayat panggilan
              </p>
              <p className="text-gray-500 max-w-md mx-auto">
                Data akan muncul di sini setelah Anda melakukan panggilan atau
                sesuaikan filter untuk menemukan data yang diinginkan.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-linear-to-r from-[#56B9F1]/5 to-[#3A8FD9]/5 hover:bg-linear-to-r hover:from-[#56B9F1]/10 hover:to-[#3A8FD9]/10">
                        <TableHead className="font-bold text-gray-700 h-14 pl-8 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-linear-to-b from-[#56B9F1] to-[#3A8FD9] rounded-full"></div>
                            <div>
                              <div className="font-bold">Waktu Panggilan</div>
                              <div className="text-xs font-normal text-gray-500">
                                Tanggal & Jam
                              </div>
                            </div>
                          </div>
                        </TableHead>
                        <TableHead className="font-bold text-gray-700 pl-8 py-3">
                          <div>
                            <div className="font-bold">Informasi Nasabah</div>
                            <div className="text-xs font-normal text-gray-500">
                              Nama & Kontak
                            </div>
                          </div>
                        </TableHead>
                        <TableHead className="font-bold text-gray-700 pl-8 py-3">
                          <div>
                            <div className="font-bold">Status</div>
                            <div className="text-xs font-normal text-gray-500">
                              Hasil Panggilan
                            </div>
                          </div>
                        </TableHead>
                        <TableHead className="font-bold text-gray-700 pl-8 py-3">
                          <div>
                            <div className="font-bold">Catatan</div>
                            <div className="text-xs font-normal text-gray-500">
                              Ringkasan percakapan
                            </div>
                          </div>
                        </TableHead>
                        <TableHead className="font-bold text-gray-700 pl-8 py-3">
                          <div>
                            <div className="font-bold">Penanggung Jawab</div>
                            <div className="text-xs font-normal text-gray-500">
                              Agent/PIC
                            </div>
                          </div>
                        </TableHead>
                        <TableHead className="font-bold text-gray-700 text-right pr-8 py-3">
                          <div>
                            <div className="font-bold">Aksi</div>
                            <div className="text-xs font-normal text-gray-500">
                              Edit/Update
                            </div>
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100">
                      {callLogs.map((log, index) => (
                        <CallLogTableRow
                          key={log.id}
                          log={log}
                          onUpdate={handleUpdateCallLog}
                          index={index}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Pagination dengan style baru */}
              <div className="border-t border-gray-100 px-6 py-5 bg-linear-to-r from-gray-50/50 to-white">
                <PaginationControls
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </CardContent>
      </div>

      {/* Footer Note */}
      <div className="text-center py-6 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          Data diperbarui secara real-time • Terakhir diperbarui:{" "}
          {new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
