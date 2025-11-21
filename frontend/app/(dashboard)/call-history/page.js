"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Users, Award, AlertCircle, Loader2 } from "lucide-react";
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

export default function CallHistoryPage() {
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statistics, setStatistics] = useState(null);
  const [filters, setFilters] = useState({
    status: "ALL",
    search: "",
    startDate: "",
    endDate: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

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
    setFilters({
      status: "ALL",
      search: "",
      startDate: "",
      endDate: "",
    });
    setPage(1);
  };

  const handleUpdateCallLog = async (callLogId, updateData) => {
    await api.callLogs.update(callLogId, updateData);
    await Promise.all([fetchCallLogs(), fetchStatistics()]);
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-linear-to-r from-[#034694] to-[#0575E6] bg-clip-text text-transparent">
          Riwayat Panggilan
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Daftar semua panggilan yang telah dilakukan
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <StatisticsCard
          title="Total Panggilan"
          value={statistics?.totalCalls?.toLocaleString() || "0"}
          icon={Phone}
          description="Total call records"
          className="fade-in"
        />
        <StatisticsCard
          title="Tertarik"
          value={statistics?.byStatus?.INTERESTED?.toLocaleString() || "0"}
          icon={Users}
          description="Interested customers"
          className="fade-in"
        />
        <StatisticsCard
          title="Selesai"
          value={statistics?.byStatus?.COMPLETED?.toLocaleString() || "0"}
          icon={Award}
          description="Completed transactions"
          className="fade-in sm:col-span-2 lg:col-span-1"
        />
      </div>

      {/* Filters */}
      <CallLogFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Table */}
      {/* Call Logs Table */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 mb-4 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="text-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  Memuat riwayat panggilan...
                </p>
              </div>
            </div>
          ) : callLogs.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                <Phone className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">
                Belum ada riwayat panggilan
              </p>
              <p className="text-sm text-muted-foreground">
                Riwayat panggilan akan muncul di sini setelah Anda melakukan
                panggilan
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-linear-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-100 hover:from-blue-50 hover:to-indigo-50">
                        <TableHead className="font-bold text-gray-700 h-12 pl-6">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-4 bg-blue-600 rounded"></div>
                            Waktu Panggilan
                          </div>
                        </TableHead>
                        <TableHead className="font-bold text-gray-700 pl-6">
                          Informasi Nasabah
                        </TableHead>
                        <TableHead className="font-bold text-gray-700 pl-6">
                          Status
                        </TableHead>
                        <TableHead className="font-bold text-gray-700 pl-6">
                          Catatan
                        </TableHead>
                        <TableHead className="font-bold text-gray-700 pl-6">
                          Penanggung Jawab
                        </TableHead>
                        <TableHead className="font-bold text-gray-700 text-right pr-6">
                          Aksi
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
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

              {/* Pagination */}
              <div className="mt-4">
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
      </Card>
    </div>
  );
}
