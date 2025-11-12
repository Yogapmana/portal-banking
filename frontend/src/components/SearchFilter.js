"use client";

import { useState } from "react";

export default function SearchFilter({
  filters,
  filterOptions,
  onFilterChange,
  onSearch,
}) {
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    onSearch(value);
  };

  const handleFilterChange = (field, value) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const clearFilters = () => {
    setLocalSearch("");
    onFilterChange({
      search: "",
      minScore: "",
      maxScore: "",
      job: "",
      marital: "",
      education: "",
      housing: "",
      sortBy: "score",
      sortOrder: "desc",
    });
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Pencarian
          </label>
          <input
            type="text"
            id="search"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Cari nama, telepon, atau pekerjaan..."
            value={localSearch}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex items-end space-x-2">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {showAdvancedFilters ? "Sembunyikan" : "Filter"} Lanjutan
          </button>

          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Score Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skor Min (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                value={filters.minScore ? filters.minScore * 100 : ""}
                onChange={(e) =>
                  handleFilterChange(
                    "minScore",
                    e.target.value ? e.target.value / 100 : ""
                  )
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skor Max (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="100"
                value={filters.maxScore ? filters.maxScore * 100 : ""}
                onChange={(e) =>
                  handleFilterChange(
                    "maxScore",
                    e.target.value ? e.target.value / 100 : ""
                  )
                }
              />
            </div>

            {/* Job Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pekerjaan
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={filters.job}
                onChange={(e) => handleFilterChange("job", e.target.value)}
              >
                <option value="">Semua</option>
                {filterOptions.jobOptions.map((job) => (
                  <option key={job} value={job}>
                    {job}
                  </option>
                ))}
              </select>
            </div>

            {/* Marital Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status Pernikahan
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={filters.marital}
                onChange={(e) => handleFilterChange("marital", e.target.value)}
              >
                <option value="">Semua</option>
                {filterOptions.maritalOptions.map((marital) => (
                  <option key={marital} value={marital}>
                    {marital}
                  </option>
                ))}
              </select>
            </div>

            {/* Education Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pendidikan
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={filters.education}
                onChange={(e) => handleFilterChange("education", e.target.value)}
              >
                <option value="">Semua</option>
                {filterOptions.educationOptions.map((education) => (
                  <option key={education} value={education}>
                    {education}
                  </option>
                ))}
              </select>
            </div>

            {/* Housing Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Perumahan
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={filters.housing}
                onChange={(e) => handleFilterChange("housing", e.target.value)}
              >
                <option value="">Semua</option>
                {filterOptions.housingOptions.map((housing) => (
                  <option key={housing} value={housing}>
                    {housing}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Urutkan Berdasarkan
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              >
                <option value="score">Skor</option>
                <option value="age">Usia</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Urutan
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
              >
                <option value="desc">Menurun</option>
                <option value="asc">Menaik</option>
              </select>
            </div>
          </div>

          {/* Filter Summary */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {filters.minScore && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Skor Min: {(filters.minScore * 100).toFixed(1)}%
                </span>
              )}
              {filters.maxScore && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Skor Max: {(filters.maxScore * 100).toFixed(1)}%
                </span>
              )}
              {filters.job && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Pekerjaan: {filters.job}
                </span>
              )}
              {filters.marital && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Status: {filters.marital}
                </span>
              )}
              {filters.education && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Pendidikan: {filters.education}
                </span>
              )}
              {filters.housing && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Perumahan: {filters.housing}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}