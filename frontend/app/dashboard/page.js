"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import CustomerTable from "../../components/CustomerTable";
import SearchFilter from "../../components/SearchFilter";

// Helper functions for session storage
const saveStateToSession = (pagination, filters) => {
  const state = {
    pagination: {
      currentPage: pagination.currentPage,
    },
    filters: filters,
  };
  sessionStorage.setItem("dashboardState", JSON.stringify(state));
};

const getStateFromSession = () => {
  try {
    const saved = sessionStorage.getItem("dashboardState");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Error reading session storage:", error);
  }
  return null;
};

export default function DashboardPage() {
  const { api } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Try to restore state from session storage, otherwise use defaults
  const savedState = getStateFromSession();
  const [pagination, setPagination] = useState({
    currentPage: savedState?.pagination?.currentPage || 1,
    totalPages: 0,
    totalCustomers: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [filters, setFilters] = useState({
    search: savedState?.filters?.search || "",
    minScore: savedState?.filters?.minScore || "",
    maxScore: savedState?.filters?.maxScore || "",
    job: savedState?.filters?.job || "",
    marital: savedState?.filters?.marital || "",
    education: savedState?.filters?.education || "",
    housing: savedState?.filters?.housing || "",
    sortBy: savedState?.filters?.sortBy || "score",
    sortOrder: savedState?.filters?.sortOrder || "desc",
  });
  const [filterOptions, setFilterOptions] = useState({
    jobOptions: [],
    maritalOptions: [],
    educationOptions: [],
    housingOptions: [],
    scoreRange: { min: 0, max: 1, avg: 0 },
  });

  // Fetch filter options on component mount
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Save state to session storage when filters or pagination change
  useEffect(() => {
    saveStateToSession(pagination, filters);
  }, [filters, pagination.currentPage]);

  // Fetch customers when filters or pagination change
  useEffect(() => {
    fetchCustomers();
  }, [filters, pagination.currentPage]);

  const fetchFilterOptions = async () => {
    try {
      const response = await api.get("/customers/filters/options");
      setFilterOptions(response.data);
    } catch (error) {
      console.error("Failed to fetch filter options:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: 20,
        ...filters,
      });

      // Remove empty filter values
      Object.keys(filters).forEach((key) => {
        if (!filters[key] || filters[key] === "") {
          params.delete(key);
        }
      });

      const response = await api.get(`/customers?${params.toString()}`);
      setCustomers(response.data.customers);
      setPagination(response.data.pagination);
      setError("");
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setError("Gagal memuat data nasabah");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  const handleSearch = (searchTerm) => {
    setFilters((prev) => ({ ...prev, search: searchTerm }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Dashboard Nasabah
        </h1>
        <p className="text-gray-600">
          Daftar nasabah yang diurutkan berdasarkan skor probabilitas
          berlangganan tertinggi
        </p>
      </div>

      {/* Search and Filter Section */}
      <SearchFilter
        filters={filters}
        filterOptions={filterOptions}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Nasabah
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {pagination.totalCustomers.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Rata-rata Skor
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {filterOptions.scoreRange.avg
                      ? (filterOptions.scoreRange.avg * 100).toFixed(1) + "%"
                      : "N/A"}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Skor Tertinggi
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {filterOptions.scoreRange.max
                      ? (filterOptions.scoreRange.max * 100).toFixed(1) + "%"
                      : "N/A"}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Daftar Nasabah
          </h3>
        </div>

        {error && (
          <div className="m-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <CustomerTable
          customers={customers}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
