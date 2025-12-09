"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  TrendingUp,
  Target,
  Calendar,
  Activity,
  BarChart3,
  Users,
} from "lucide-react";
import api from "@/lib/api";
import StatisticsCard from "@/components/dashboard/StatisticsCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import TeamPerformanceChart from "@/components/dashboard/TeamPerformanceChart";

const primaryColor = "#56B9F1";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) fetchStatistics();
  }, [user?.role]);

  const fetchStatistics = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const response =
        user.role === "SALES"
          ? await api.callLogs.getMyStatistics()
          : await api.callLogs.getTeamStatistics();
      setStats(response.data);
    } catch (err) {
      setError("Gagal memuat data. Silakan coba lagi.");
      setStats({
        totalCalls: 0,
        avgScore: 0,
        interestedCount: 0,
        completedCount: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="text-center">
          <div
            className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"
            style={{ borderColor: primaryColor, borderTopColor: "transparent" }}
          ></div>
          <p className="mt-4 text-sm text-gray-500">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-600 text-lg font-semibold">
            Error Loading Statistics
          </div>
          <p className="text-gray-500">{error}</p>
          <button
            onClick={fetchStatistics}
            className="px-5 py-2 bg-[#56B9F1] text-white rounded-lg shadow hover:bg-[#3fa1e0] transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center text-center text-gray-500">
        <div>
          <p>Belum ada data</p>
          <p className="mt-2 text-sm">
            {user?.role === "SALES"
              ? "Mulai melakukan panggilan untuk melihat statistik"
              : "Belum ada aktivitas panggilan dari tim"}
          </p>
        </div>
      </div>
    );
  }

  const cardClasses =
    "rounded-xl shadow-lg hover:shadow-xl transition-shadow p-4 bg-white";

  if (user?.role === "SALES") {
    return (
      <div className="space-y-6 fade-in">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-[#56B9F1] ">
            Kinerja Saya
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Pantau performa dan aktivitas panggilan Anda
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <StatisticsCard
            title="Total Panggilan"
            value={stats.totalCalls || 0}
            icon={Phone}
            description="Sepanjang waktu"
            className={cardClasses}
          />
          <StatisticsCard
            title="Bulan Ini"
            value={stats.callsThisMonth || 0}
            icon={Calendar}
            description="Panggilan"
            className={cardClasses}
          />
          <StatisticsCard
            title="Minggu Ini"
            value={stats.callsThisWeek || 0}
            icon={Activity}
            description="Panggilan"
            className={`${cardClasses} sm:col-span-2 lg:col-span-1`}
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <StatisticsCard
            title="Success Rate"
            value={`${stats.successRate || 0}%`}
            icon={Target}
            description="Nasabah Tertarik"
            className={cardClasses}
          />

          {/* Status Breakdown Card */}
          <Card className={`${cardClasses} sm:col-span-2`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <BarChart3
                  className="h-5 w-5"
                  style={{ color: primaryColor }}
                />
                Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
                {Object.entries(stats.statusBreakdown || {}).map(
                  ([status, count]) => (
                    <div
                      key={status}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="space-y-1">
                        <StatusBadge
                          status={status}
                          primaryColor={primaryColor}
                        />
                        <p className="text-2xl font-bold">{count}</p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // SALES_MANAGER
  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-[#56B9F1] ">
          Team Analytics
        </h1>
        <p className="text-gray-500 text-sm sm:text-base">
          Overview performa tim sales
        </p>
      </div>

      {/* Team Performance Chart */}
      <TeamPerformanceChart
        teamStats={stats}
        topPerformers={stats.topPerformers || stats.salesPerformance || []}
      />

      {/* Top Performers */}
      <Card className={cardClasses}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-700">
            <Users className="h-5 w-5" style={{ color: primaryColor }} />
            Leaderboard - Top Sales Performers
          </CardTitle>
          <p className="text-sm text-gray-500">
            Ranking berdasarkan total panggilan dan success rate
          </p>
        </CardHeader>
        <CardContent>
          {stats.topPerformers && stats.topPerformers.length > 0 ? (
            <div className="space-y-3">
              {stats.topPerformers.map((p, idx) => (
                <div
                  key={p.salesId || p.userId || idx}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md`}
                      style={{ backgroundColor: primaryColor }}
                    >
                      #{idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base truncate">
                        {p.salesEmail || p.email || "Unknown"}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {p.totalCalls || 0} panggilan
                        </span>
                        {p.interestedCount !== undefined && (
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                            {p.interestedCount || 0} tertarik
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={`text-sm font-semibold px-3 py-1`}
                    style={{ backgroundColor: primaryColor, color: "white" }}
                  >
                    {p.successRate || 0}% success
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Belum ada data performa sales</p>
              <p className="text-sm mt-1">
                Data akan muncul setelah ada aktivitas panggilan
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
