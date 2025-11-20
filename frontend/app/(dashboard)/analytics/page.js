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
import StatusBadge, { getStatusColor } from "@/components/dashboard/StatusBadge";

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
      const response =
        user?.role === "SALES"
          ? await api.callLogs.getMyStatistics()
          : await api.callLogs.getTeamStatistics();
      
      console.log("Analytics Response:", response);
      console.log("Top Performers:", response.data?.topPerformers);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      setError("Failed to load analytics data. Please try again later.");
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
        <div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-[#034694] to-[#0575E6] bg-clip-text text-transparent">
            Kinerja Saya
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
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
            className="fade-in"
          />
          <StatisticsCard
            title="Bulan Ini"
            value={stats.callsThisMonth || 0}
            icon={Calendar}
            description="Panggilan"
            className="fade-in"
          />
          <StatisticsCard
            title="Minggu Ini"
            value={stats.callsThisWeek || 0}
            icon={Activity}
            description="Panggilan"
            className="fade-in sm:col-span-2 lg:col-span-1"
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <StatisticsCard
            title="Success Rate"
            value={`${stats.successRate || 0}%`}
            icon={Target}
            description="Tertarik + Selesai"
            className="fade-in"
          />

          {/* Status Breakdown Card */}
          <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md fade-in sm:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <BarChart3 className="h-5 w-5 text-[#034694]" />
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
                        <StatusBadge status={status} />
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

  // Render for SALES_MANAGER
  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold bg-linear-to-r from-[#034694] to-[#0575E6] bg-clip-text text-transparent">
          Team Analytics
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Overview performa tim sales
        </p>
      </div>

      {/* Team Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatisticsCard
          title="Total Panggilan"
          value={stats.totalCalls || 0}
          icon={Phone}
          description="Seluruh tim"
          className="fade-in"
        />
        <StatisticsCard
          title="Total Sales"
          value={stats.totalSales || 0}
          icon={Users}
          description="Active members"
          className="fade-in"
        />
        <StatisticsCard
          title="Avg per Sales"
          value={stats.avgCallsPerSales || 0}
          icon={TrendingUp}
          description="Per sales"
          className="fade-in"
        />
        <StatisticsCard
          title="Success Rate"
          value={`${stats.successRate || 0}%`}
          icon={Target}
          description="Team average"
          className="fade-in"
        />
      </div>

      {/* Team Status Breakdown */}
      <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <BarChart3 className="h-5 w-5 text-[#034694]" />
            Team Status Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {Object.entries(stats.statusBreakdown || {}).map(
              ([status, count]) => (
                <div
                  key={status}
                  className="flex flex-col items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <StatusBadge status={status} className="mb-2" />
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Performers - Always show for SALES_MANAGER */}
      <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Users className="h-5 w-5 text-[#034694]" />
            Leaderboard - Top Sales Performers
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ranking berdasarkan total panggilan dan success rate
          </p>
        </CardHeader>
        <CardContent>
          {(() => {
            console.log("Rendering leaderboard, topPerformers:", stats.topPerformers);
            const performers = stats.topPerformers || stats.salesPerformance || [];
            
            if (!performers || performers.length === 0) {
              return (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Belum ada data performa sales</p>
                  <p className="text-sm mt-1">Data akan muncul setelah ada aktivitas panggilan</p>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {performers.map((performer, index) => (
                  <div
                    key={performer.salesId || performer.userId || index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {/* Rank Badge */}
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md ${
                          index === 0 ? 'bg-linear-to-br from-yellow-400 to-yellow-600' :
                          index === 1 ? 'bg-linear-to-br from-gray-300 to-gray-500' :
                          index === 2 ? 'bg-linear-to-br from-orange-400 to-orange-600' :
                          'bg-linear-to-br from-[#034694] to-[#0575E6]'
                        }`}
                      >
                        #{index + 1}
                      </div>
                      
                      {/* Sales Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base truncate">
                          {performer.salesEmail || performer.email || 'Unknown'}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            {performer.totalCalls || 0} panggilan
                          </span>
                          {(performer.interestedCount !== undefined || performer.interested !== undefined) && (
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                              {performer.interestedCount || performer.interested || 0} tertarik
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Success Rate Badge */}
                    <Badge 
                      className={`text-sm font-semibold px-3 py-1 ${
                        parseFloat(performer.successRate || 0) >= 50 ? 'bg-green-100 text-green-700' :
                        parseFloat(performer.successRate || 0) >= 30 ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {performer.successRate || 0}% success
                    </Badge>
                  </div>
                ))}
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}
