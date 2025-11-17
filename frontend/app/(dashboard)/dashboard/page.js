"use client";

import { useState } from "react";
import useSWR from "swr";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Award } from "lucide-react";
import CustomerTable from "@/components/dashboard/CustomerTable";
import CustomerFilters from "@/components/dashboard/CustomerFilters";

const fetcher = (params) => api.customers.getAll(params).then((res) => res);

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of customer data and statistics
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nasabah</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalCustomers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {pagination.totalCustomers !== stats.totalCustomers &&
                `${pagination.totalCustomers} filtered from total`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Skor Tertinggi
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.maxScore ? (stats.maxScore * 100).toFixed(1) + "%" : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum prediction score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rata-rata Skor
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgScore ? (stats.avgScore * 100).toFixed(1) + "%" : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              Average prediction score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <CustomerFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Customer Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Nasabah</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-red-600">
              Error loading customers: {error.message}
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
