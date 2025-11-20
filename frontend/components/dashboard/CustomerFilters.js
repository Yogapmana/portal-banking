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
import { Search, X, Filter } from "lucide-react";

export default function CustomerFilters({ filters, onFilterChange }) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [showFilters, setShowFilters] = useState(false);

  const { data: filterOptions } = useSWR("filter-options", () =>
    api.customers.getFilterOptions()
  );

  useEffect(() => {
    setLocalFilters(filters);
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
    <Card className="shadow-elevated fade-in border-0">
      <CardContent className="pt-6 px-4 md:px-6">
        <div className="space-y-4">
          {/* Search Bar - Always Visible */}
          <div className="flex gap-2">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, phone, or job..."
                  value={localFilters.search}
                  onChange={(e) => handleInputChange("search", e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 h-11 border-[#034694]/20 focus:border-[#034694] focus:ring-2 focus:ring-[#034694]/20 transition-all duration-300"
                />
              </div>
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="bg-linear-to-r from-[#034694]/10 to-[#0575E6]/10 hover:from-[#034694] hover:to-[#0575E6] hover:text-white hover:border-[#034694] transition-all duration-300"
            >
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
            <Button
              onClick={applyFilters}
              className="bg-linear-to-r from-[#034694] to-[#0575E6] hover:from-[#034694]/90 hover:to-[#0575E6]/90 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
            >
              Apply
            </Button>
          </div>

          {/* Advanced Filters - Collapsible */}
          {showFilters && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 slide-up space-y-4">
              {/* Score Range */}
              <div className="space-y-2">
                <Label className="font-semibold text-foreground">Min Score</Label>
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
                  onKeyPress={handleKeyPress}
                  className="border-[#034694]/20 focus:border-[#034694] focus:ring-2 focus:ring-[#034694]/20 transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-foreground">Max Score</Label>
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
                  onKeyPress={handleKeyPress}
                  className="border-[#034694]/20 focus:border-[#034694] focus:ring-2 focus:ring-[#034694]/20 transition-all duration-300"
                />
              </div>

              {/* Job Filter */}
              <div className="space-y-2">
                <Label className="font-semibold text-foreground">Job</Label>
                <Select
                  value={localFilters.job || "all"}
                  onValueChange={(value) =>
                    handleInputChange("job", value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger className="border-[#034694]/20 focus:border-[#034694] focus:ring-2 focus:ring-[#034694]/20 transition-all duration-300">
                    <SelectValue placeholder="All Jobs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Jobs</SelectItem>
                    {filterOptions?.jobOptions?.map((job) => (
                      <SelectItem key={job} value={job}>
                        {job}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Marital Status Filter */}
              <div className="space-y-2">
                <Label className="font-semibold text-foreground">Marital Status</Label>
                <Select
                  value={localFilters.marital || "all"}
                  onValueChange={(value) =>
                    handleInputChange("marital", value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger className="border-[#034694]/20 focus:border-[#034694] focus:ring-2 focus:ring-[#034694]/20 transition-all duration-300">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {filterOptions?.maritalOptions?.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Education Filter */}
              <div className="space-y-2">
                <Label className="font-semibold text-foreground">Education</Label>
                <Select
                  value={localFilters.education || "all"}
                  onValueChange={(value) =>
                    handleInputChange("education", value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger className="border-[#034694]/20 focus:border-[#034694] focus:ring-2 focus:ring-[#034694]/20 transition-all duration-300">
                    <SelectValue placeholder="All Education" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Education</SelectItem>
                    {filterOptions?.educationOptions?.map((edu) => (
                      <SelectItem key={edu} value={edu}>
                        {edu}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Housing Filter */}
              <div className="space-y-2">
                <Label className="font-semibold text-foreground">Housing</Label>
                <Select
                  value={localFilters.housing || "all"}
                  onValueChange={(value) =>
                    handleInputChange("housing", value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger className="border-[#034694]/20 focus:border-[#034694] focus:ring-2 focus:ring-[#034694]/20 transition-all duration-300">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {filterOptions?.housingOptions?.map((housing) => (
                      <SelectItem key={housing} value={housing}>
                        {housing}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <Label className="font-semibold text-foreground">Sort By</Label>
                <Select
                  value={localFilters.sortBy}
                  onValueChange={(value) => handleInputChange("sortBy", value)}
                >
                  <SelectTrigger className="border-[#034694]/20 focus:border-[#034694] focus:ring-2 focus:ring-[#034694]/20 transition-all duration-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="score">Score</SelectItem>
                    <SelectItem value="age">Age</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <Label className="font-semibold text-foreground">Sort Order</Label>
                <Select
                  value={localFilters.sortOrder}
                  onValueChange={(value) =>
                    handleInputChange("sortOrder", value)
                  }
                >
                  <SelectTrigger className="border-[#034694]/20 focus:border-[#034694] focus:ring-2 focus:ring-[#034694]/20 transition-all duration-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Filter Actions */}
          {showFilters && (
            <div className="flex justify-end gap-2 pt-4 border-t border-border/30 slide-up">
              <Button
                onClick={resetFilters}
                variant="outline"
                size="sm"
                className="bg-linear-to-r from-[#034694]/10 to-[#0575E6]/10 hover:from-[#034694] hover:to-[#0575E6] hover:text-white hover:border-[#034694] transition-all duration-300"
              >
                <X className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
              <Button
                onClick={applyFilters}
                size="sm"
                className="bg-linear-to-r from-[#034694] to-[#0575E6] hover:from-[#034694]/90 hover:to-[#0575E6]/90 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
              >
                Apply Filters
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
