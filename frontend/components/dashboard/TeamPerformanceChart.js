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
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from "lucide-react";
import { useState } from "react";

const PRIMARY_COLOR = "#56B9F1";
const STATUS_COLORS = {
  TERTARIK: "#10b981",
  TIDAK_TERTARIK: "#ef4444",
  TIDAK_TERSEDIA: "#6b7280",
  SALAH_NOMOR: "#f59e0b",
  BERMINAT: "#3b82f6",
  SELESAI: "#8b5cf6",
};

const CHART_TYPES = {
  BAR: "bar",
  PIE: "pie",
  LINE: "line",
  AREA: "area",
};

export default function TeamPerformanceChart({ teamStats, topPerformers }) {
  const [chartType, setChartType] = useState(CHART_TYPES.BAR);

  const statusData = teamStats
    ? Object.entries(teamStats.statusBreakdown || {}).map(
        ([status, value]) => ({
          name: status.replace(/_/g, " "),
          value,
          color: STATUS_COLORS[status] || "#6b7280",
        })
      )
    : [];

  console.log(teamStats.statusBreakdown);
  console.log(statusData);

  const performersData =
    topPerformers?.slice(0, 10).map((p, i) => ({
      name:
        p.salesEmail?.split("@")[0] ||
        p.email?.split("@")[0] ||
        `Sales ${i + 1}`,
      totalCalls: p.totalCalls || 0,
      interested: p.interestedCount || 0,
      successRate: parseFloat(p.successRate || 0),
    })) || [];

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white p-3 border rounded-lg shadow-md text-sm">
        {payload.map((entry, i) => (
          <div key={i} className="flex justify-between">
            <span>{entry.name}</span>
            <span className="font-semibold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderChart = () => {
    switch (chartType) {
      case CHART_TYPES.PIE:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.name}: ${entry.value}`}
              >
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={CustomTooltip} />
            </PieChart>
          </ResponsiveContainer>
        );
      case CHART_TYPES.LINE:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performersData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={CustomTooltip} />
              <Legend />
              <Line
                type="monotone"
                dataKey="successRate"
                stroke={PRIMARY_COLOR}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="interested"
                stroke="#10b981"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case CHART_TYPES.AREA:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performersData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={CustomTooltip} />
              <Legend />
              <Area
                type="monotone"
                dataKey="totalCalls"
                stackId="1"
                stroke={PRIMARY_COLOR}
                fill={PRIMARY_COLOR}
                fillOpacity={0.5}
              />
              <Area
                type="monotone"
                dataKey="interested"
                stackId="2"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      case CHART_TYPES.BAR:
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performersData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-30} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip content={CustomTooltip} />
              <Legend />
              <Bar dataKey="totalCalls" fill={PRIMARY_COLOR} />
              <Bar dataKey="interested" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card className="rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border-0">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CardTitle className="flex items-center gap-2 text-foreground text-lg font-semibold">
          <BarChart3 className="h-5 w-5 text-[#56B9F1]" />
          Team Performance
        </CardTitle>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(CHART_TYPES).map(([key, type]) => (
            <Button
              key={key}
              variant={chartType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType(type)}
              className="flex items-center gap-1"
            >
              {type === CHART_TYPES.BAR && <BarChart3 className="h-3 w-3" />}
              {type === CHART_TYPES.PIE && <PieChartIcon className="h-3 w-3" />}
              {type === CHART_TYPES.LINE && <TrendingUp className="h-3 w-3" />}
              {type === CHART_TYPES.AREA && <BarChart3 className="h-3 w-3" />}
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderChart()}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
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
            <p className="text-2xl font-bold text-orange-500">
              {teamStats?.avgCallsPerSales || 0}
            </p>
            <p className="text-sm text-muted-foreground">Avg/Sales</p>
          </div>
        </div>

        {/* Status Badges */}
        {statusData.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {statusData.map((s) => (
              <Badge
                key={s.name}
                variant="outline"
                className="flex items-center gap-2"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                {s.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
