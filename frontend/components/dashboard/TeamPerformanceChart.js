"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Users,
  Phone,
  Target,
} from "lucide-react";
import { useState } from "react";

const COLORS = {
  BERMINAT: "#10b981",
  TERTARIK: "#3b82f6",
  TIDAK_TERSEDIA: "#ef4444",
  TERTUNDA: "#f59e0b",
  SELESAI: "#8b5cf6",
  GAGAL: "#6b7280",
};

const CHART_TYPES = {
  BAR_CHART: "bar",
  PIE_CHART: "pie",
  LINE_CHART: "line",
  AREA_CHART: "area",
};

export default function TeamPerformanceChart({ teamStats, topPerformers }) {
  const [chartType, setChartType] = useState(CHART_TYPES.BAR_CHART);

  // Prepare data for different chart types
  const prepareStatusBreakdownData = () => {
    if (!teamStats?.statusBreakdown) return [];

    return Object.entries(teamStats.statusBreakdown).map(([status, count]) => ({
      name: status.replace(/_/g, " "),
      value: count,
      color: COLORS[status] || "#6b7280",
    }));
  };

  const prepareTopPerformersData = () => {
    if (!topPerformers || topPerformers.length === 0) return [];

    return topPerformers.slice(0, 10).map((performer, index) => ({
      name: performer.salesEmail?.split("@")[0] || performer.email?.split("@")[0] || `Sales ${index + 1}`,
      totalCalls: performer.totalCalls || 0,
      successRate: parseFloat(performer.successRate || 0),
      interested: performer.interestedCount || performer.interested || 0,
      rank: index + 1,
    }));
  };

  const preparePerformanceMetricsData = () => {
    if (!teamStats) return [];

    return [
      {
        metric: "Total Calls",
        value: teamStats.totalCalls || 0,
        target: 1000, // Example target
        icon: Phone,
      },
      {
        metric: "Success Rate",
        value: parseFloat(teamStats.successRate || 0),
        target: 75, // Example target percentage
        icon: Target,
      },
      {
        metric: "Avg per Sales",
        value: teamStats.avgCallsPerSales || 0,
        target: 50, // Example target
        icon: Users,
      },
    ];
  };

  const statusData = prepareStatusBreakdownData();
  const performersData = prepareTopPerformersData();
  const metricsData = preparePerformanceMetricsData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const TopPerformersTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          <p className="text-sm text-blue-600">
            Calls: {payload[0]?.value || 0}
          </p>
          <p className="text-sm text-green-600">
            Success: {payload[1]?.value || 0}%
          </p>
          <p className="text-sm text-purple-600">
            Interested: {payload[2]?.value || 0}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderBarChart = () => (
    <div className="space-y-6">
      {/* Top Performers Bar Chart */}
      {performersData.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#034694]" />
            Top Performers Comparison
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performersData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip content={<TopPerformersTooltip />} />
              <Legend />
              <Bar dataKey="totalCalls" fill="#3b82f6" name="Total Calls" />
              <Bar dataKey="interested" fill="#10b981" name="Interested" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );

  const renderPieChart = () => (
    <div className="space-y-6">
      {statusData.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-[#034694]" />
            Status Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {statusData.map((entry) => (
              <Badge key={entry.name} variant="outline" className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderLineChart = () => (
    <div className="space-y-6">
      {performersData.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#034694]" />
            Success Rate Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performersData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="successRate"
                stroke="#10b981"
                strokeWidth={2}
                name="Success Rate (%)"
              />
              <Line
                type="monotone"
                dataKey="interested"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Interested Count"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );

  const renderAreaChart = () => (
    <div className="space-y-6">
      {performersData.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#034694]" />
            Performance Overview
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performersData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip content={<TopPerformersTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="totalCalls"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
                name="Total Calls"
              />
              <Area
                type="monotone"
                dataKey="interested"
                stackId="2"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
                name="Interested"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );

  const renderChart = () => {
    switch (chartType) {
      case CHART_TYPES.PIE_CHART:
        return renderPieChart();
      case CHART_TYPES.LINE_CHART:
        return renderLineChart();
      case CHART_TYPES.AREA_CHART:
        return renderAreaChart();
      case CHART_TYPES.BAR_CHART:
      default:
        return renderBarChart();
    }
  };

  if ((!teamStats && !topPerformers) ||
      (statusData.length === 0 && performersData.length === 0)) {
    return (
      <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <BarChart3 className="h-5 w-5 text-[#034694]" />
            Team Performance Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Belum ada data performa untuk ditampilkan</p>
            <p className="text-sm mt-1">
              Data grafik akan muncul setelah ada aktivitas tim
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <BarChart3 className="h-5 w-5 text-[#034694]" />
            Team Performance Chart
          </CardTitle>

          {/* Chart Type Selector */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={chartType === CHART_TYPES.BAR_CHART ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType(CHART_TYPES.BAR_CHART)}
              className="flex items-center gap-1"
            >
              <BarChart3 className="h-3 w-3" />
              Bar
            </Button>
            <Button
              variant={chartType === CHART_TYPES.PIE_CHART ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType(CHART_TYPES.PIE_CHART)}
              className="flex items-center gap-1"
            >
              <PieChartIcon className="h-3 w-3" />
              Pie
            </Button>
            <Button
              variant={chartType === CHART_TYPES.LINE_CHART ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType(CHART_TYPES.LINE_CHART)}
              className="flex items-center gap-1"
            >
              <TrendingUp className="h-3 w-3" />
              Line
            </Button>
            <Button
              variant={chartType === CHART_TYPES.AREA_CHART ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType(CHART_TYPES.AREA_CHART)}
              className="flex items-center gap-1"
            >
              <BarChart3 className="h-3 w-3" />
              Area
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {renderChart()}

        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t">
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {teamStats?.totalCalls || 0}
              </p>
              <p className="text-sm text-muted-foreground">Total Calls</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {teamStats?.successRate || 0}%
              </p>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {topPerformers?.length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Team Members</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {teamStats?.avgCallsPerSales || 0}
              </p>
              <p className="text-sm text-muted-foreground">Avg/Sales</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}