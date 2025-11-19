"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import CustomerDetailDialog from "./CustomerDetailDialog";
import BulkAssignDialog from "./BulkAssignDialog";
import { useAuth } from "@/contexts/AuthContext";

export default function CustomerTable({
  customers,
  pagination,
  onPageChange,
  onRefresh,
}) {
  const { user } = useAuth();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);

  const formatScore = (score) => {
    if (score === null || score === undefined) return "N/A";
    return `${(score * 100).toFixed(1)}%`;
  };

  const handleViewDetail = (customer) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
  };

  const toggleCustomerSelection = (customerId) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleRowClick = (customer, event) => {
    // Don't select if clicking on checkbox, button, or link
    if (
      event.target.type === "checkbox" ||
      event.target.tagName === "BUTTON" ||
      event.target.tagName === "A" ||
      event.target.closest("button") ||
      event.target.closest("a")
    ) {
      return;
    }

    // Only allow selection for SALES_MANAGER and ADMIN roles
    if (user?.role === "SALES_MANAGER" || user?.role === "ADMIN") {
      toggleCustomerSelection(customer.id);
    }
  };

  const toggleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map((c) => c.id));
    }
  };

  const handleBulkAssignSuccess = () => {
    setSelectedCustomers([]);
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="px-4 md:px-6 lg:px-8 py-4 space-y-4 fade-in">
      {/* Bulk Actions Bar - Only for SALES_MANAGER */}
      {user?.role === "SALES_MANAGER" && selectedCustomers.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4 slide-up">
          <div className="text-sm font-medium">
            {selectedCustomers.length} customer(s) selected
          </div>
          <Button onClick={() => setIsBulkAssignOpen(true)} size="sm">
            Assign ke Sales
          </Button>
        </div>
      )}

      {customers.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Customers Found
          </h3>
          <p className="text-muted-foreground">
            No customers match your current filters.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-lg border border-border/50 overflow-hidden shadow-elevated fade-in bg-white">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-linear-to-r from-[#034694]/5 to-[#0575E6]/5 border-b border-border/50">
                    {user?.role === "SALES_MANAGER" && (
                      <TableHead className="w-12 font-semibold text-foreground">
                        <Checkbox
                          checked={
                            selectedCustomers.length === customers.length &&
                            customers.length > 0
                          }
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                    )}
                    <TableHead className="font-bold text-foreground py-5 px-4 text-left">
                      Customer Info
                    </TableHead>
                    <TableHead className="font-bold text-foreground py-5 px-4 text-left">
                      Contact
                    </TableHead>
                    <TableHead className="font-bold text-foreground py-5 px-4 text-center">
                      Score
                    </TableHead>
                    <TableHead className="font-bold text-foreground py-5 px-4 text-left">
                      Status
                    </TableHead>
                    {user?.role === "SALES_MANAGER" && (
                      <TableHead className="font-bold text-foreground py-5 px-4 text-left">
                        Assigned To
                      </TableHead>
                    )}
                    <TableHead className="font-bold text-foreground py-5 px-4 text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      className={`hover:bg-[#034694]/5 transition-all duration-200 border-b border-border/30 cursor-pointer ${
                        selectedCustomers.includes(customer.id)
                          ? "bg-[#034694]/10"
                          : ""
                      }`}
                      style={
                        selectedCustomers.includes(customer.id)
                          ? { boxShadow: "inset 4px 0 0 0 #034694" }
                          : {}
                      }
                      onClick={(e) => handleRowClick(customer, e)}
                    >
                      {user?.role === "SALES_MANAGER" && (
                        <TableCell
                          className="py-4 px-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={selectedCustomers.includes(customer.id)}
                            onCheckedChange={() =>
                              toggleCustomerSelection(customer.id)
                            }
                          />
                        </TableCell>
                      )}
                      <TableCell className="py-6 px-4">
                        <div className="flex items-center gap-3">
                          <div className="avatar-gradient-chelsea w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-lg">
                            {(customer.name || "?").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-foreground text-base truncate">
                              {customer.name || "-"}
                            </p>
                            <p className="text-sm text-muted-foreground font-medium">
                              {customer.age} tahun • {customer.marital}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">
                            {customer.phoneNumber || "-"}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {customer.job}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-4 text-center">
                        <div className="flex justify-center">
                          <div
                            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-md ${
                              customer.score >= 0.7
                                ? "bg-gradient-success text-green-700 border-0"
                                : customer.score >= 0.4
                                ? "bg-gradient-warning text-orange-700 border-0"
                                : customer.score === null ||
                                  customer.score === undefined
                                ? "bg-gray-100 text-gray-600 border border-gray-200"
                                : "bg-gradient-danger text-red-700 border-0"
                            }`}
                          >
                            {formatScore(customer.score)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Education:
                            </span>
                            <span className="text-xs font-medium capitalize">
                              {customer.education?.replace(/\./g, " ")}
                            </span>
                          </div>
                          <div
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                              customer.housing === "yes"
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : "bg-gray-100 text-gray-600 border border-gray-200"
                            }`}
                          >
                            {customer.housing === "yes" ? (
                              <>
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                </svg>{" "}
                                House Owner
                              </>
                            ) : (
                              <>
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                </svg>{" "}
                                No House
                              </>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      {user?.role === "SALES_MANAGER" && (
                        <TableCell className="py-6 px-4">
                          {customer.assignedTo ? (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold text-xs shrink-0">
                                {(customer.assignedTo.email || "")
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-foreground text-sm truncate">
                                  {customer.assignedTo.email?.split("@")[0] ||
                                    "Unknown"}
                                </p>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {customer.assignedTo.role}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs shrink-0">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground italic">
                                  Unassigned
                                </p>
                              </div>
                            </div>
                          )}
                        </TableCell>
                      )}
                      <TableCell
                        className="py-6 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetail(customer)}
                          className="btn-enhanced group bg-linear-to-r from-[#034694]/10 to-[#0575E6]/10 hover:from-[#034694] hover:to-[#0575E6] hover:text-white hover:border-[#034694] hover:shadow-lg transition-all duration-300 font-medium"
                        >
                          <Eye className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className={`bg-white border border-border/50 rounded-xl shadow-md hover:shadow-xl hover:scale-[1.01] hover:border-[#034694]/30 transition-all duration-300 fade-in slide-up overflow-hidden cursor-pointer ${
                  selectedCustomers.includes(customer.id)
                    ? "bg-[#034694]/10 border-2 border-[#034694]/30"
                    : ""
                }`}
                onClick={(e) => handleRowClick(customer, e)}
              >
                {/* Header with Customer Info */}
                <div className="bg-linear-to-r from-[#034694]/5 to-[#0575E6]/5 p-4 border-b border-border/30">
                  <div className="flex items-start gap-3">
                    {user?.role === "SALES_MANAGER" && (
                      <Checkbox
                        checked={selectedCustomers.includes(customer.id)}
                        onCheckedChange={() =>
                          toggleCustomerSelection(customer.id)
                        }
                        className="mt-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                    <div className="avatar-gradient-chelsea w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-lg">
                      {(customer.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground text-lg truncate mb-1">
                        {customer.name || "-"}
                      </h3>
                      <p className="text-sm text-muted-foreground font-medium mb-2">
                        {customer.phoneNumber || "-"}
                      </p>
                      <div className="flex justify-center">
                        <div
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold shadow-md ${
                            customer.score >= 0.7
                              ? "bg-gradient-success text-green-700 border-0"
                              : customer.score >= 0.4
                              ? "bg-gradient-warning text-orange-700 border-0"
                              : customer.score === null ||
                                customer.score === undefined
                              ? "bg-gray-100 text-gray-600 border border-gray-200"
                              : "bg-gradient-danger text-red-700 border-0"
                          }`}
                        >
                          {formatScore(customer.score)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="p-4 space-y-3">
                  {/* Basic Info Grid */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground text-xs block mb-1 font-medium">
                        Age
                      </span>
                      <p className="font-bold text-foreground">
                        {customer.age} tahun
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block mb-1 font-medium">
                        Job
                      </span>
                      <p className="font-bold text-foreground capitalize truncate">
                        {customer.job}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block mb-1 font-medium">
                        Marital
                      </span>
                      <p className="font-bold text-foreground capitalize">
                        {customer.marital}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block mb-1 font-medium">
                        Education
                      </span>
                      <p className="font-bold text-foreground capitalize text-xs truncate">
                        {customer.education?.replace(/\./g, " ")}
                      </p>
                    </div>
                  </div>

                  {/* Housing Status */}
                  <div
                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      customer.housing === "yes"
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {customer.housing === "yes" ? (
                      <>
                        <svg
                          className="w-3 h-3 mr-1.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                        </svg>{" "}
                        House Owner
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-3 h-3 mr-1.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                        </svg>{" "}
                        No House
                      </>
                    )}
                  </div>

                  {/* Assignment Info */}
                  <div className="pt-3 border-t border-border/30">
                    <span className="text-muted-foreground text-xs block mb-2 font-medium">
                      Assignment
                    </span>
                    {customer.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold text-xs shrink-0">
                          {(customer.assignedTo.email || "")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground text-sm truncate">
                            {customer.assignedTo.email?.split("@")[0] ||
                              "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {customer.assignedTo.role}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs shrink-0">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground italic">
                            Unassigned
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="p-4 pt-0" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetail(customer)}
                    className="w-full btn-enhanced touch-target bg-linear-to-r from-[#034694]/10 to-[#0575E6]/10 hover:from-[#034694] hover:to-[#0575E6] hover:text-white hover:border-[#034694] hover:shadow-lg transition-all duration-300 font-bold h-11"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/30">
            <div className="text-sm text-muted-foreground text-center sm:text-left">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {(pagination.currentPage - 1) * 20 + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-foreground">
                {Math.min(
                  pagination.currentPage * 20,
                  pagination.totalCustomers
                )}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {pagination.totalCustomers}
              </span>{" "}
              customers
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="bg-linear-to-r from-[#034694]/10 to-[#0575E6]/10 hover:from-[#034694] hover:to-[#0575E6] hover:text-white hover:border-[#034694] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <div className="px-3 py-1.5 bg-linear-to-r from-[#034694]/5 to-[#0575E6]/5 rounded-lg border border-[#034694]/20">
                <span className="text-sm font-bold text-foreground">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="bg-linear-to-r from-[#034694]/10 to-[#0575E6]/10 hover:from-[#034694] hover:to-[#0575E6] hover:text-white hover:border-[#034694] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 sm:ml-2" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Customer Detail Dialog with Call Logs */}
      <CustomerDetailDialog
        customer={selectedCustomer}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onCallLogCreated={onRefresh}
      />

      {/* Bulk Assign Dialog - Only for SALES_MANAGER */}
      {user?.role === "SALES_MANAGER" && (
        <BulkAssignDialog
          isOpen={isBulkAssignOpen}
          onClose={() => setIsBulkAssignOpen(false)}
          selectedCustomers={selectedCustomers}
          customers={customers}
          onSuccess={handleBulkAssignSuccess}
        />
      )}
    </div>
  );
}
