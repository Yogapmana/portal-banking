"use client";

import { useState, useMemo, useCallback } from "react";
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
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from "lucide-react";

// Constants
const PRIMARY_COLOR = "#56B9F1";
const STATUS_COLORS = {
  TERTARIK: "#10b981",
  TIDAK_TERTARIK: "#ef4444",
};

const SALES_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#ea580c",
  "#65a30d",
  "#0891b2",
  "#be185d",
  "#d97706",
  "#16a34a",
  "#4f46e5",
];

const CHART_TYPES = {
  BAR: "bar",
  PIE: "pie",
  LINE: "line",
};

// Chart button config
const CHART_BUTTONS = [
  { key: "BAR", type: CHART_TYPES.BAR, Icon: BarChart3, label: "Bar" },
  { key: "PIE", type: CHART_TYPES.PIE, Icon: PieChartIcon, label: "Pie" },
  { key: "LINE", type: CHART_TYPES.LINE, Icon: TrendingUp, label: "Line" },
];

// Custom Tooltip Component (outside to prevent re-creation)
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-sm p-4 border border-slate-100 rounded-xl shadow-xl text-sm ring-1 ring-black/5">
      <p className="font-medium text-slate-900 mb-2">{label}</p>
      <div className="space-y-1">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-3 justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: entry.color || entry.stroke || entry.fill,
                }}
              />
              <span className="text-slate-500">{entry.name}</span>
            </div>
            <span className="font-semibold text-slate-900">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function TeamPerformanceChart({ teamStats, topPerformers }) {
  const [chartType, setChartType] = useState(CHART_TYPES.BAR);

  // Memoized: Daily interested data for Line chart
  const dailyInterestedData = useMemo(() => {
    if (!teamStats?.dailyInterestedPerSales) return { data: [], salesList: [] };

    const salesSet = new Set();
    const grouped = {};

    teamStats.dailyInterestedPerSales.forEach((item) => {
      const d = new Date(item.date);
      const key = d.toISOString().split("T")[0];
      if (!grouped[key]) grouped[key] = { _dateObj: d };

      const salesName = item.salesEmail.split("@")[0];
      grouped[key][salesName] = item.count;
      salesSet.add(salesName);
    });

    const sortedData = Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, val]) => {
        const { _dateObj, ...rest } = val;
        return {
          date: _dateObj.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          }),
          ...rest,
        };
      });

    return { data: sortedData, salesList: Array.from(salesSet) };
  }, [teamStats?.dailyInterestedPerSales]);

  // Memoized: Status data for Pie chart
  const statusData = useMemo(() => {
    if (!teamStats?.statusBreakdown) return [];
    return Object.entries(teamStats.statusBreakdown)
      .filter(
        ([status]) => status === "TERTARIK" || status === "TIDAK_TERTARIK"
      )
      .map(([status, value]) => ({
        name: status === "TERTARIK" ? "Tertarik" : "Tidak Tertarik",
        value,
        color: STATUS_COLORS[status],
      }));
  }, [teamStats?.statusBreakdown]);

  // Memoized: Performers data for Bar chart
  const performersData = useMemo(() => {
    if (!topPerformers) return [];
    return topPerformers.slice(0, 10).map((p, i) => ({
      name:
        p.salesEmail?.split("@")[0] ||
        p.email?.split("@")[0] ||
        `Sales ${i + 1}`,
      totalCalls: p.totalCalls || 0,
      interested: p.interestedCount || 0,
    }));
  }, [topPerformers]);

  const renderChart = useCallback(() => {
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
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip content={CustomTooltip} />
            </PieChart>
          </ResponsiveContainer>
        );

      case CHART_TYPES.LINE:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={dailyInterestedData.data}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                dy={10}
                label={{
                  value: "Tanggal",
                  position: "insideBottom",
                  offset: -10,
                  style: { fill: "#64748b", fontSize: 12, fontWeight: 500 },
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                label={{
                  value: "Nasabah Tertarik",
                  angle: -90,
                  position: "insideLeft",
                  offset: 10,
                  style: { fill: "#64748b", fontSize: 12, fontWeight: 500 },
                }}
              />
              <Tooltip
                content={CustomTooltip}
                cursor={{
                  stroke: "#cbd5e1",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              {dailyInterestedData.salesList.map((salesName, index) => (
                <Line
                  key={salesName}
                  type="monotone"
                  dataKey={salesName}
                  stroke={SALES_COLORS[index % SALES_COLORS.length]}
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={performersData}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="name"
                angle={-30}
                textAnchor="end"
                height={60}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                label={{
                  value: "Nama Sales",
                  position: "insideBottom",
                  offset: -5,
                  style: { fill: "#64748b", fontSize: 12, fontWeight: 500 },
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                label={{
                  value: "Jumlah Panggilan",
                  angle: -90,
                  position: "insideLeft",
                  offset: 10,
                  style: { fill: "#64748b", fontSize: 12, fontWeight: 500 },
                }}
              />
              <Tooltip content={CustomTooltip} cursor={{ fill: "#f1f5f9" }} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar
                dataKey="totalCalls"
                name="Total Panggilan"
                fill={PRIMARY_COLOR}
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
              <Bar
                dataKey="interested"
                name="Tertarik"
                fill={STATUS_COLORS.TERTARIK}
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  }, [chartType, statusData, dailyInterestedData, performersData]);

  return (
    <Card className="rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border-0">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CardTitle className="flex items-center gap-2 text-foreground text-lg font-semibold">
          <BarChart3 className="h-5 w-5" style={{ color: PRIMARY_COLOR }} />
          Team Performance
        </CardTitle>
        <div className="flex gap-2 flex-wrap">
          {CHART_BUTTONS.map(({ key, type, Icon, label }) => (
            <Button
              key={key}
              variant={chartType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType(type)}
              className="flex items-center gap-1"
            >
              <Icon className="h-3 w-3" />
              {label}
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
      </CardContent>
    </Card>
  );
}
