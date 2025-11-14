"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";

export default function CustomerDetailPage() {
  const { api, isAuthenticated, isLoading: authLoading } = useAuth();
  const { id } = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  // Show loading or redirect if not authenticated
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchCustomer();
    }
  }, [id, isAuthenticated]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/customers/${id}`);
      setCustomer(response.data);
      setError("");
    } catch (error) {
      console.error("Failed to fetch customer:", error);
      setError("Gagal memuat data nasabah");
    } finally {
      setLoading(false);
    }
  };

  const formatScore = (score) => {
    if (score === null || score === undefined) return "Tidak tersedia";
    return `${(score * 100).toFixed(1)}%`;
  };

  const getScoreColor = (score) => {
    if (score === null || score === undefined) return "text-gray-500";
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-yellow-600";
    if (score >= 0.4) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBadgeColor = (score) => {
    if (score === null || score === undefined) return "bg-gray-100 text-gray-800";
    if (score >= 0.8) return "bg-green-100 text-green-800";
    if (score >= 0.6) return "bg-yellow-100 text-yellow-800";
    if (score >= 0.4) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {error || "Data nasabah tidak ditemukan"}
          </h3>
          <div className="mt-6">
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg
              className="mr-2 -ml-1 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Kembali
          </button>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Header */}
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Detail Nasabah
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Informasi lengkap nasabah dan probabilitas berlangganan
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Skor:</span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreBadgeColor(
                    customer.score
                  )}`}
                >
                  {formatScore(customer.score)}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">
                  Informasi Personal
                </h4>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">ID Nasabah</dt>
                    <dd className="mt-1 text-sm text-gray-900">#{customer.originalId}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Nama</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {customer.name || "Tidak tersedia"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">No. Telepon</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {customer.phoneNumber || "Tidak tersedia"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Usia</dt>
                    <dd className="mt-1 text-sm text-gray-900">{customer.age} tahun</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Pekerjaan</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">
                      {customer.job || "Tidak tersedia"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status Pernikahan</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">
                      {customer.marital || "Tidak tersedia"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Pendidikan</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {customer.education || "Tidak tersedia"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status Pinjaman</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          customer.default === "no"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {customer.default === "no" ? "Tidak Masalah" : "Bermasalah"}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Financial & Contact Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">
                  Informasi Finansial & Kontak
                </h4>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Perumahan</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">
                      {customer.housing || "Tidak tersedia"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Pinjaman Pribadi</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">
                      {customer.loan || "Tidak tersedia"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Jenis Kontak</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">
                      {customer.contact || "Tidak tersedia"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Bulan Kontak Terakhir</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">
                      {customer.month || "Tidak tersedia"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Durasi Kontak (detik)</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {customer.duration || 0}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Jumlah Kampanye</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {customer.campaign || 0}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Hari Sejak Kontak Terakhir</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {customer.pdays === 999 ? "Tidak ada kontak sebelumnya" : customer.pdays}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Kontak Sebelumnya</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {customer.previous || 0}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Economic Indicators */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-md font-semibold text-gray-900 mb-4">
                Indikator Ekonomi
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <dt className="text-sm font-medium text-gray-500">Variasi Employment</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    {customer.empVarRate || 0}
                  </dd>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dt className="text-sm font-medium text-gray-500">Indeks Harga Konsumen</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    {customer.consPriceIdx || 0}
                  </dd>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dt className="text-sm font-medium text-gray-500">Indeks Kepercayaan Konsumen</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    {customer.consConfIdx || 0}
                  </dd>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dt className="text-sm font-medium text-gray-500">Jumlah Tenaga Kerja</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    {customer.nrEmployed || 0}
                  </dd>
                </div>
              </div>
            </div>

            {/* Score Analysis */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-md font-semibold text-gray-900 mb-4">
                Analisis Skor Probabilitas
              </h4>
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h5 className="text-lg font-medium text-blue-900">Skor Probabilitas Berlangganan</h5>
                    <p className="text-sm text-blue-700">
                      Kemungkinan nasabah untuk berlangganan produk perbankan
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(customer.score)}`}>
                      {formatScore(customer.score)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {customer.score >= 0.8
                        ? "Probabilitas Sangat Tinggi"
                        : customer.score >= 0.6
                        ? "Probabilitas Tinggi"
                        : customer.score >= 0.4
                        ? "Probabilitas Sedang"
                        : "Probabilitas Rendah"}
                    </div>
                  </div>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(customer.score || 0) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}