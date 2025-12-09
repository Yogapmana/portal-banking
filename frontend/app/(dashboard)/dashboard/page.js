"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  TrendingUp,
  Award,
  Activity,
  Target,
  Filter,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import CustomerTable from "@/components/dashboard/CustomerTable";
import CustomerFilters from "@/components/dashboard/CustomerFilters";
import { TableSkeleton } from "@/components/ui/skeleton";

const fetcher = (params) => api.customers.getPending(params).then((res) => res);

const STORAGE_KEY = "dashboard_filters_state";

// Load saved filters from sessionStorage
const loadSavedFilters = () => {
  if (typeof window === "undefined") return null;
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error("Error loading saved filters:", error);
    return null;
  }
};

// Save filters to sessionStorage
const saveFilters = (filters) => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch (error) {
    console.error("Error saving filters:", error);
  }
};

export default function DashboardPage() {
  const [filters, setFilters] = useState(() => {
    // Initialize with saved filters or defaults
    const saved = loadSavedFilters();
    return (
      saved || {
        page: 1,
        limit: 20,
        search: "",
        minScore: "",
        maxScore: "",
        job: "",
        marital: "",
        education: "",
        housing: "",
        sortBy: "score",
        sortOrder: "desc",
      }
    );
  });

  // Save filters whenever they change
  useEffect(() => {
    saveFilters(filters);
  }, [filters]);

  const { data, error, isLoading, mutate } = useSWR(
    ["customers", filters],
    () => fetcher(filters),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  const handleFilterChange = (newFilters) =>
    setFilters({ ...filters, ...newFilters, page: 1 });
  const handlePageChange = (newPage) =>
    setFilters({ ...filters, page: newPage });

  const stats = data?.stats || { totalCustomers: 0, avgScore: 0, maxScore: 0 };
  const pagination = data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalCustomers: 0,
  };

  const currentTime = new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formatScore = (score) => {
    return score ? (score * 100).toFixed(1) + "%" : "N/A";
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50/30 to-white fade-in px-4 sm:px-6 lg:px-8 py-8">
      {/* Header dengan desain modern */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  Customer Dashboard
                </h1>
                <p className="text-gray-600 mt-2">
                  Analisis dan kelola nasabah potensial yang belum dikontak
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards - Desain modern */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Nasabah */}
          <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#56B9F1]/5 rounded-full -translate-y-8 translate-x-8"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6">
              <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Total Nasabah
              </CardTitle>
              <div className="p-3 bg-linear-to-br from-blue-500 to-[#56B9F1] rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {stats.totalCustomers.toLocaleString()}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Target className="h-3 w-3" />
                  <span>{pagination.totalCustomers} hasil filter</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skor Tertinggi */}
          <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -translate-y-8 translate-x-8"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6">
              <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Skor Tertinggi
              </CardTitle>
              <div className="p-3 bg-linear-to-br from-amber-500 to-orange-400 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                <Award className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div
                className="text-4xl font-bold mb-2"
                style={{
                  background:
                    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {formatScore(stats.maxScore)}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Prediksi tertinggi</p>
                <div className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  <span className="text-xs font-medium text-amber-600">
                    Top Score
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-linear-to-r from-amber-400 to-orange-500 h-1.5 rounded-full transition-all duration-700"
                    style={{
                      width: stats.maxScore ? `${stats.maxScore * 100}%` : "0%",
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rata-rata Skor */}
          <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -translate-y-8 translate-x-8"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6">
              <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Rata-rata Skor
              </CardTitle>
              <div className="p-3 bg-linear-to-br from-emerald-500 to-green-400 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div
                className="text-4xl font-bold mb-2"
                style={{
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {formatScore(stats.avgScore)}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Performance</span>
                  <span className="font-medium text-emerald-600">
                    {stats.avgScore && stats.avgScore > 0.7
                      ? "Excellent"
                      : stats.avgScore && stats.avgScore > 0.5
                      ? "Good"
                      : "Needs Attention"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters Section dengan desain elegant */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-100 bg-linear-to-r from-gray-50/50 to-white">
          <div className="flex items-center justify-between transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-linear-to-br from-[#56B9F1] to-blue-500 rounded-lg shadow-sm">
                <Filter className="h-5 w-5 text-white transition-all" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Filter & Analisis
                </h2>
                <p className="text-sm text-gray-500">
                  Saring nasabah berdasarkan kriteria tertentu
                </p>
              </div>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Found</span>{" "}
              <span className="font-semibold text-[#56B9F1]">
                {pagination.totalCustomers}
              </span>
              <span className="text-gray-500"> potential customers</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          <CustomerFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>

      {/* Customer Table Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Customer Database
              </h2>
              <p className="text-sm text-gray-500">
                Daftar nasabah potensial yang siap dikontak
              </p>
            </div>

            {!isLoading && !error && (
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Page{" "}
                  <span className="font-semibold text-[#56B9F1]">
                    {pagination.currentPage}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-900">
                    {pagination.totalPages}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#56B9F1]"></div>
                  <span className="text-xs font-medium text-gray-600">
                    {data?.customers?.length || 0} items
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-gray-100 animate-pulse"></div>
                  <div className="h-4 w-32 bg-gray-100 animate-pulse rounded"></div>
                </div>
                <TableSkeleton rows={8} />
              </div>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-2xl mb-4">
                <Award className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Terjadi Kesalahan
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                {error.message ||
                  "Gagal memuat data nasabah. Silakan coba beberapa saat lagi."}
              </p>
              <button
                onClick={() => mutate()}
                className="px-5 py-2.5 bg-[#56B9F1] text-white font-medium rounded-xl hover:bg-[#4AA8E0] transition-colors duration-300 shadow-sm"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <CustomerTable
              customers={data?.customers || []}
              pagination={pagination}
              onPageChange={handlePageChange}
              onRefresh={mutate}
            />
          )}
        </CardContent>
      </div>

      {/* Footer Info */}
      <div className="text-center py-6">
        <div className="inline-flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#56B9F1]"></div>
            <span className="text-sm text-gray-600">
              Sistem berjalan normal
            </span>
          </div>
          <div className="w-px h-4 bg-gray-200"></div>
          <div className="text-xs text-gray-500">
            Last sync: {new Date().toLocaleDateString("id-ID")} {currentTime}
          </div>
        </div>
      </div>
    </div>
  );
}
