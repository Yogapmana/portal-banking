"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X } from "lucide-react";

const PRIMARY_COLOR = "#56B9F1";

export default function CallLogFilters({ filters, onFilterChange, onReset }) {
  return (
    <Card className="border border-gray-200 shadow-md rounded-lg">
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-gray-700 font-medium">
              Status
            </Label>
            <Select
              value={filters.status}
              onValueChange={(value) => onFilterChange("status", value)}
            >
              <SelectTrigger
                id="status"
                className="border border-gray-300 focus:border-[#56B9F1] focus:ring-1 focus:ring-[#56B9F1] rounded-lg"
              >
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Status</SelectItem>
                <SelectItem value="TERTARIK">Tertarik</SelectItem>
                <SelectItem value="TIDAK_TERTARIK">Tidak Tertarik</SelectItem>
                <SelectItem value="TIDAK_TERSEDIA">Tidak Diangkat</SelectItem>
                <SelectItem value="SALAH_NOMOR">Salah Nomor</SelectItem>
                <SelectItem value="BERMINAT">Minta Callback</SelectItem>
                <SelectItem value="SELESAI">Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Filter */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-gray-700 font-medium">
              Cari Customer
            </Label>
            <Input
              id="search"
              placeholder="Nama atau nomor telepon..."
              value={filters.search}
              onChange={(e) => onFilterChange("search", e.target.value)}
              className="border border-gray-300 focus:border-[#56B9F1] focus:ring-1 focus:ring-[#56B9F1] rounded-lg"
            />
          </div>

          {/* Start Date Filter */}
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-gray-700 font-medium">
              Dari Tanggal
            </Label>
            <Input
              id="startDate"
              type="date"
              value={filters.startDate}
              onChange={(e) => onFilterChange("startDate", e.target.value)}
              className="border border-gray-300 focus:border-[#56B9F1] focus:ring-1 focus:ring-[#56B9F1] rounded-lg"
            />
          </div>

          {/* End Date Filter */}
          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-gray-700 font-medium">
              Sampai Tanggal
            </Label>
            <Input
              id="endDate"
              type="date"
              value={filters.endDate}
              onChange={(e) => onFilterChange("endDate", e.target.value)}
              className="border border-gray-300 focus:border-[#56B9F1] focus:ring-1 focus:ring-[#56B9F1] rounded-lg"
            />
          </div>
        </div>

        {/* Reset Button */}
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="gap-2 border border-gray-300 text-gray-700 hover:bg-[#f0f8ff] hover:border-[#56B9F1] hover:text-[#56B9F1]"
          >
            <X className="h-4 w-4" />
            Reset Filter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
