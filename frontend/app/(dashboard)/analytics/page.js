"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  TrendingUp,
  Target,
  Award,
  Calendar,
  Users,
  BarChart3,
  Activity,
} from "lucide-react";
import api from "@/lib/api";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchStatistics();
    }
  }, [user?.role]);

  const fetchStatistics = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      if (user?.role === "SALES") {
        const response = await api.callLogs.getMyStatistics();
        console.log("SALES stats:", response);
        setStats(response.data);
      } else if (user?.role === "SALES_MANAGER") {
        const response = await api.callLogs.getTeamStatistics();
        console.log("MANAGER stats:", response);
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
      setError("Failed to load analytics data. Please try again later.");
      // Set default stats to prevent UI crashes
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

  const getStatusLabel = (status) => {
    const labels = {
      INTERESTED: "Tertarik",
      NOT_INTERESTED: "Tidak Tertarik",
      NO_ANSWER: "Tidak Angkat",
      WRONG_NUMBER: "Nomor Salah",
      CALLBACK: "Callback",
      COMPLETED: "Selesai",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      INTERESTED: "bg-green-100 text-green-800",
      COMPLETED: "bg-blue-100 text-blue-800",
      CALLBACK: "bg-yellow-100 text-yellow-800",
      NOT_INTERESTED: "bg-red-100 text-red-800",
      NO_ANSWER: "bg-gray-100 text-gray-800",
      WRONG_NUMBER: "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">
            Loading statistics...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-lg font-semibold">
            Error Loading Statistics
          </div>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={fetchStatistics}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">No data available</p>
          <p className="text-sm text-muted-foreground">
            {user?.role === "SALES"
              ? "Mulai melakukan panggilan untuk melihat statistik"
              : "Belum ada aktivitas panggilan dari tim"}
          </p>
        </div>
      </div>
    );
  }

  // Render for SALES
  if (user?.role === "SALES") {
    return (
      <div className="space-y-6 fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-[#034694] to-[#0575E6] bg-clip-text text-transparent">
              Kinerja Saya
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Pantau performa dan aktivitas panggilan Anda
            </p>
          </div>
        </div>

        {/* Main Stats Cards */}
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
                {stats.totalCalls || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Sepanjang waktu
              </p>
            </CardContent>
          </Card>

          <Card
            className="metric-card card-hover fade-in border-0 shadow-md hover:shadow-xl"
            style={{ animationDelay: "0.1s" }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">
                Bulan Ini
              </CardTitle>
              <div className="avatar-gradient-chelsea w-8 h-8 rounded-lg flex items-center justify-center">
                <Calendar className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold tabular-nums">
                {stats.callsThisMonth || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Panggilan</p>
            </CardContent>
          </Card>

          <Card
            className="metric-card card-hover fade-in border-0 shadow-md hover:shadow-xl sm:col-span-2 lg:col-span-1"
            style={{ animationDelay: "0.2s" }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">
                Minggu Ini
              </CardTitle>
              <div className="avatar-gradient w-8 h-8 rounded-lg flex items-center justify-center">
                <Activity className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold tabular-nums">
                {stats.callsThisWeek || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Panggilan</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Performance Metrics */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="metric-card card-hover fade-in border-0 shadow-md hover:shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">
                Success Rate
              </CardTitle>
              <div className="avatar-gradient-chelsea w-8 h-8 rounded-lg flex items-center justify-center">
                <Target className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold tabular-nums">
                {stats.successRate || 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Tertarik + Selesai
              </p>
            </CardContent>
          </Card>

          {/* Status Breakdown */}
          <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md fade-in sm:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <div className="avatar-gradient-chelsea w-8 h-8 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
                {Object.entries(stats.statusBreakdown || {}).map(
                  ([status, count]) => (
                    <div
                      key={status}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <Badge className={getStatusColor(status)}>
                          {getStatusLabel(status)}
                        </Badge>
                        <p className="text-2xl font-bold">{count}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stats.totalCalls > 0
                          ? `${((count / stats.totalCalls) * 100).toFixed(1)}%`
                          : "0%"}
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tren 7 Hari Terakhir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.dailyCalls && stats.dailyCalls.length > 0 ? (
                stats.dailyCalls.map((day, index) => {
                  const maxCalls = Math.max(
                    ...stats.dailyCalls.map((d) => d.count)
                  );
                  const percentage =
                    maxCalls > 0 ? (day.count / maxCalls) * 100 : 0;

                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {new Date(day.date).toLocaleDateString("id-ID", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                        <span className="font-medium">
                          {day.count} panggilan
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Belum ada data panggilan
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render for SALES_MANAGER
  if (user?.role === "SALES_MANAGER") {
    return (
      <div className="space-y-6 fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-[#034694] to-[#0575E6] bg-clip-text text-transparent">
              Kinerja Tim
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Monitor performa dan aktivitas panggilan tim sales
            </p>
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="metric-card card-hover fade-in border-0 shadow-md hover:shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">
                Total Panggilan Tim
              </CardTitle>
              <div className="avatar-gradient-chelsea w-8 h-8 rounded-lg flex items-center justify-center">
                <Phone className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold tabular-nums">
                {stats.totalCalls || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Semua sales</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Success Rate Tim
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Rata-rata tim
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Anggota Tim</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.salesPerformance?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Sales aktif</p>
            </CardContent>
          </Card>
        </div>

        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Status Breakdown Tim
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
              {Object.entries(stats.statusBreakdown || {}).map(
                ([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <Badge className={getStatusColor(status)}>
                        {getStatusLabel(status)}
                      </Badge>
                      <p className="text-2xl font-bold">{count}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stats.totalCalls > 0
                        ? `${((count / stats.totalCalls) * 100).toFixed(1)}%`
                        : "0%"}
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sales Performance Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Leaderboard Performa Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Desktop View */}
            <div className="hidden md:block">
              <div className="space-y-3">
                {stats.salesPerformance && stats.salesPerformance.length > 0 ? (
                  stats.salesPerformance.map((sales, index) => (
                    <div
                      key={sales.userId}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      {/* Rank */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 font-bold text-primary">
                        #{index + 1}
                      </div>

                      {/* Avatar & Name */}
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold">
                          {sales.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{sales.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {sales.role}
                          </p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold">
                            {sales.totalCalls}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Panggilan
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">
                            {sales.successRate}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Success
                          </p>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex gap-2">
                        {Object.entries(sales.statusBreakdown || {})
                          .filter(([_, count]) => count > 0)
                          .slice(0, 3)
                          .map(([status, count]) => (
                            <Badge
                              key={status}
                              variant="outline"
                              className="text-xs"
                            >
                              {getStatusLabel(status)}: {count}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Belum ada data performa sales
                  </p>
                )}
              </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-3">
              {stats.salesPerformance && stats.salesPerformance.length > 0 ? (
                stats.salesPerformance.map((sales, index) => (
                  <div
                    key={sales.userId}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 font-bold text-primary text-sm">
                        #{index + 1}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold">
                        {sales.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{sales.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {sales.role}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <p className="text-xl font-bold">{sales.totalCalls}</p>
                        <p className="text-xs text-muted-foreground">
                          Panggilan
                        </p>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <p className="text-xl font-bold text-green-600">
                          {sales.successRate}%
                        </p>
                        <p className="text-xs text-muted-foreground">Success</p>
                      </div>
                    </div>

                    {/* Status Breakdown */}
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(sales.statusBreakdown || {})
                        .filter(([_, count]) => count > 0)
                        .map(([status, count]) => (
                          <Badge
                            key={status}
                            variant="outline"
                            className="text-xs"
                          >
                            {getStatusLabel(status)}: {count}
                          </Badge>
                        ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Belum ada data performa sales
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Daily Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tren Panggilan Tim (7 Hari Terakhir)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.dailyCalls && stats.dailyCalls.length > 0 ? (
                stats.dailyCalls.map((day, index) => {
                  const maxCalls = Math.max(
                    ...stats.dailyCalls.map((d) => d.count)
                  );
                  const percentage =
                    maxCalls > 0 ? (day.count / maxCalls) * 100 : 0;

                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {new Date(day.date).toLocaleDateString("id-ID", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                        <span className="font-medium">
                          {day.count} panggilan
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Belum ada data panggilan
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)] items-center justify-center">
      <p className="text-muted-foreground">
        Analytics not available for your role
      </p>
    </div>
  );
}
