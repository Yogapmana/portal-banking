"use client";

import { useState } from "react";
import useSWR from "swr";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Award } from "lucide-react";
import CustomerTable from "@/components/dashboard/CustomerTable";
import CustomerFilters from "@/components/dashboard/CustomerFilters";
import { TableSkeleton } from "@/components/ui/skeleton";

const fetcher = (params) => api.customers.getPending(params).then((res) => res);

export default function DashboardPage() {
  const [filters, setFilters] = useState({
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
  });

  const { data, error, isLoading, mutate } = useSWR(
    ["customers", filters],
    () => fetcher(filters),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  const handleFilterChange = (newFilters) => {
    setFilters({
      ...filters,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    });
  };

  const handlePageChange = (newPage) => {
    setFilters({
      ...filters,
      page: newPage,
    });
  };

  
  const stats = data?.stats || {
    totalCustomers: 0,
    avgScore: 0,
    maxScore: 0,
  };

  const pagination = data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalCustomers: 0,
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-[#034694] to-[#0575E6] bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Daftar nasabah yang belum ada riwayat panggilan
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="metric-card card-hover fade-in border-0 shadow-md hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">
              Total Nasabah
            </CardTitle>
            <div className="avatar-gradient-chelsea w-8 h-8 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold tabular-nums">
              {stats.totalCustomers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {pagination.totalCustomers !== stats.totalCustomers &&
                `${pagination.totalCustomers} filtered from total`}
            </p>
          </CardContent>
        </Card>

        <Card
          className="metric-card card-hover fade-in border-0 shadow-md hover:shadow-xl"
          style={{ animationDelay: "0.1s" }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">
              Skor Tertinggi
            </CardTitle>
            <div className="avatar-gradient-chelsea w-8 h-8 rounded-lg flex items-center justify-center">
              <Award className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold tabular-nums">
              {stats.maxScore ? (stats.maxScore * 100).toFixed(1) + "%" : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Maximum prediction score
            </p>
          </CardContent>
        </Card>

        <Card
          className="metric-card card-hover fade-in border-0 shadow-md hover:shadow-xl sm:col-span-2 lg:col-span-1"
          style={{ animationDelay: "0.2s" }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">
              Rata-rata Skor
            </CardTitle>
            <div className="avatar-gradient w-8 h-8 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold tabular-nums">
              {stats.avgScore ? (stats.avgScore * 100).toFixed(1) + "%" : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average prediction score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <CustomerFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Customer Table */}
      <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md fade-in">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <TableSkeleton rows={5} />
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Error Loading Data
              </h3>
              <p className="text-red-600 text-sm">
                {error.message || "Failed to load customers. Please try again."}
              </p>
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
      </Card>
    </div>
  );
}
