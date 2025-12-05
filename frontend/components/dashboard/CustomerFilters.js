"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  X,
  Filter,
  ChevronDown,
  ChevronUp,
  Zap,
  Settings,
  Sparkles,
} from "lucide-react";

export default function CustomerFilters({ filters, onFilterChange }) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  const { data: filterOptions } = useSWR("filter-options", () =>
    api.customers.getFilterOptions()
  );

  useEffect(() => {
    setLocalFilters(filters);
    // Count active filters
    const count = Object.entries(filters).filter(
      ([key, value]) =>
        !["page", "limit", "sortBy", "sortOrder"].includes(key) &&
        value &&
        value !== ""
    ).length;
    setActiveFilterCount(count);
  }, [filters]);

  const handleInputChange = (field, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
  };

  const resetFilters = () => {
    const resetValues = {
      search: "",
      minScore: "",
      maxScore: "",
      job: "",
      marital: "",
      education: "",
      housing: "",
      sortBy: "score",
      sortOrder: "desc",
    };
    setLocalFilters((prev) => ({
      ...prev,
      ...resetValues,
    }));
    onFilterChange(resetValues);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      applyFilters();
    }
  };

  return (
    <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden">
      <CardContent className="p-6">
        {/* Search Bar dengan Filter Toggle */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="flex-1 relative group">
              <div className="absolute inset-0 bg-linear-to-r from-[#56B9F1]/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-[#56B9F1] transition-colors duration-300" />
              <Input
                placeholder="Cari nasabah berdasarkan nama, telepon, atau pekerjaan..."
                value={localFilters.search}
                onChange={(e) => handleInputChange("search", e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-12 h-12 border-gray-200 focus:border-[#56B9F1] focus:ring-2 focus:ring-[#56B9F1]/20 rounded-xl text-base shadow-sm hover:border-gray-300 transition-all duration-300 bg-white/90 backdrop-blur-sm"
              />
              {localFilters.search && (
                <button
                  onClick={() => handleInputChange("search", "")}
                  className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Filter Toggle Button */}
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="h-12 px-5 border-gray-200 hover:border-[#56B9F1] hover:bg-[#56B9F1]/5 transition-all duration-300 group"
            >
              <Settings className="h-4 w-4 mr-2 text-gray-500 group-hover:text-[#56B9F1] transition-colors duration-300" />
              {showFilters ? "Sembunyikan Filter" : "Tampilkan Filter"}
              {showFilters ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </Button>

            {/* Apply Button */}
            <Button
              onClick={applyFilters}
              className="h-12 px-6 bg-linear-to-r from-[#56B9F1] to-blue-500 hover:from-[#4AA8E0] hover:to-blue-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group"
            >
              <Sparkles className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              Terapkan
            </Button>
          </div>

          {/* Search Hint & Active Filters */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Zap className="h-3 w-3" />
              <span>Tekan Enter atau klik Terapkan untuk mencari</span>
            </div>

            {/* Active Filters Badge */}
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-sm">
                  <div className="w-2 h-2 rounded-full bg-[#56B9F1] animate-pulse"></div>
                  <span className="text-gray-600">
                    {activeFilterCount} filter aktif
                  </span>
                </div>
                <Button
                  onClick={resetFilters}
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-gray-500 hover:text-red-600 hover:bg-red-50"
                >
                  <X className="h-3 w-3" />
                  <span className="ml-1 text-xs">Reset</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Advanced Filters Section */}
        {showFilters && (
          <div className="space-y-6 animate-in fade-in-50 slide-in-from-top-2 animation-out fade-out-50 slide-out-to-top-2 duration-300 border-t border-gray-100 pt-6">
            {/* Filter Categories Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Score Range */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-[#56B9F1]/10 rounded-lg">
                    <span className="text-sm font-semibold text-[#56B9F1]">
                      1
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-800">Rentang Skor</h4>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Skor Minimum
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        placeholder="0.0"
                        value={localFilters.minScore}
                        onChange={(e) =>
                          handleInputChange("minScore", e.target.value)
                        }
                        className="border-gray-200 focus:border-[#56B9F1] focus:ring-2 focus:ring-[#56B9F1]/20 rounded-lg h-10 bg-gray-50/50"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                        %
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Skor Maksimum
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        placeholder="1.0"
                        value={localFilters.maxScore}
                        onChange={(e) =>
                          handleInputChange("maxScore", e.target.value)
                        }
                        className="border-gray-200 focus:border-[#56B9F1] focus:ring-2 focus:ring-[#56B9F1]/20 rounded-lg h-10 bg-gray-50/50"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                        %
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Demografi */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <span className="text-sm font-semibold text-emerald-600">
                      2
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-800">Demografi</h4>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Pekerjaan
                    </Label>
                    <Select
                      value={localFilters.job || "all"}
                      onValueChange={(value) =>
                        handleInputChange("job", value === "all" ? "" : value)
                      }
                    >
                      <SelectTrigger className="border-gray-200 focus:border-[#56B9F1] focus:ring-2 focus:ring-[#56B9F1]/20 rounded-lg h-10 bg-gray-50/50">
                        <SelectValue placeholder="Semua Pekerjaan" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border border-gray-200 shadow-lg max-h-60">
                        <SelectItem value="all" className="rounded-lg">
                          Semua Pekerjaan
                        </SelectItem>
                        {filterOptions?.jobOptions?.map((job) => (
                          <SelectItem
                            key={job}
                            value={job}
                            className="rounded-lg"
                          >
                            {job}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Status Pernikahan
                    </Label>
                    <Select
                      value={localFilters.marital || "all"}
                      onValueChange={(value) =>
                        handleInputChange(
                          "marital",
                          value === "all" ? "" : value
                        )
                      }
                    >
                      <SelectTrigger className="border-gray-200 focus:border-[#56B9F1] focus:ring-2 focus:ring-[#56B9F1]/20 rounded-lg h-10 bg-gray-50/50">
                        <SelectValue placeholder="Semua Status" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border border-gray-200 shadow-lg max-h-60">
                        <SelectItem value="all" className="rounded-lg">
                          Semua Status
                        </SelectItem>
                        {filterOptions?.maritalOptions?.map((status) => (
                          <SelectItem
                            key={status}
                            value={status}
                            className="rounded-lg"
                          >
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Latar Belakang */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <span className="text-sm font-semibold text-amber-600">
                      3
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-800">Latar Belakang</h4>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Pendidikan
                    </Label>
                    <Select
                      value={localFilters.education || "all"}
                      onValueChange={(value) =>
                        handleInputChange(
                          "education",
                          value === "all" ? "" : value
                        )
                      }
                    >
                      <SelectTrigger className="border-gray-200 focus:border-[#56B9F1] focus:ring-2 focus:ring-[#56B9F1]/20 rounded-lg h-10 bg-gray-50/50">
                        <SelectValue placeholder="Semua Pendidikan" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border border-gray-200 shadow-lg max-h-60">
                        <SelectItem value="all" className="rounded-lg">
                          Semua Pendidikan
                        </SelectItem>
                        {filterOptions?.educationOptions?.map((edu) => (
                          <SelectItem
                            key={edu}
                            value={edu}
                            className="rounded-lg"
                          >
                            {edu}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Perumahan
                    </Label>
                    <Select
                      value={localFilters.housing || "all"}
                      onValueChange={(value) =>
                        handleInputChange(
                          "housing",
                          value === "all" ? "" : value
                        )
                      }
                    >
                      <SelectTrigger className="border-gray-200 focus:border-[#56B9F1] focus:ring-2 focus:ring-[#56B9F1]/20 rounded-lg h-10 bg-gray-50/50">
                        <SelectValue placeholder="Semua Tipe" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border border-gray-200 shadow-lg max-h-60">
                        <SelectItem value="all" className="rounded-lg">
                          Semua Tipe
                        </SelectItem>
                        {filterOptions?.housingOptions?.map((housing) => (
                          <SelectItem
                            key={housing}
                            value={housing}
                            className="rounded-lg"
                          >
                            {housing}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Pengurutan */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <span className="text-sm font-semibold text-purple-600">
                      4
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-800">Pengurutan</h4>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Urutkan Berdasarkan
                    </Label>
                    <Select
                      value={localFilters.sortBy}
                      onValueChange={(value) =>
                        handleInputChange("sortBy", value)
                      }
                    >
                      <SelectTrigger className="border-gray-200 focus:border-[#56B9F1] focus:ring-2 focus:ring-[#56B9F1]/20 rounded-lg h-10 bg-gray-50/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border border-gray-200 shadow-lg">
                        <SelectItem value="score" className="rounded-lg">
                          Skor (Prediksi)
                        </SelectItem>
                        <SelectItem value="age" className="rounded-lg">
                          Usia
                        </SelectItem>
                        <SelectItem value="balance" className="rounded-lg">
                          Saldo
                        </SelectItem>
                        <SelectItem value="duration" className="rounded-lg">
                          Durasi
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Urutan
                    </Label>
                    <Select
                      value={localFilters.sortOrder}
                      onValueChange={(value) =>
                        handleInputChange("sortOrder", value)
                      }
                    >
                      <SelectTrigger className="border-gray-200 focus:border-[#56B9F1] focus:ring-2 focus:ring-[#56B9F1]/20 rounded-lg h-10 bg-gray-50/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border border-gray-200 shadow-lg">
                        <SelectItem value="asc" className="rounded-lg">
                          <div className="flex items-center gap-2">
                            <span>Naik (A-Z)</span>
                            <span className="text-gray-400">↑</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="desc" className="rounded-lg">
                          <div className="flex items-center gap-2">
                            <span>Turun (Z-A)</span>
                            <span className="text-gray-400">↓</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons Footer */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 rounded-full bg-[#56B9F1]/60"></div>
                <span>Atur filter untuk menyempurnakan hasil pencarian</span>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  size="lg"
                  className="h-11 px-5 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all duration-300"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reset Semua
                </Button>
                <Button
                  onClick={applyFilters}
                  size="lg"
                  className="h-11 px-6 bg-gradient-to-r from-[#56B9F1] to-blue-500 hover:from-[#4AA8E0] hover:to-blue-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group"
                >
                  <Filter className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  Terapkan Filter
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
