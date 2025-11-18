"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
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

  const getScoreBadgeVariant = (score) => {
    if (score === null || score === undefined) return "secondary";
    if (score >= 0.7) return "default";
    if (score >= 0.4) return "secondary";
    return "destructive";
  };

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
    <div className="space-y-4">
      {/* Bulk Actions Bar - Only for SALES_MANAGER */}
      {user?.role === "SALES_MANAGER" && selectedCustomers.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
          <div className="text-sm font-medium">
            {selectedCustomers.length} customer(s) selected
          </div>
          <Button onClick={() => setIsBulkAssignOpen(true)} size="sm">
            Assign ke Sales
          </Button>
        </div>
      )}

      {customers.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          No customers found
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-lg border border-border/50 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    {user?.role === "SALES_MANAGER" && (
                      <TableHead className="w-12 font-semibold">
                        <Checkbox
                          checked={
                            selectedCustomers.length === customers.length &&
                            customers.length > 0
                          }
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                    )}
                    <TableHead className="font-semibold">Nasabah</TableHead>
                    <TableHead className="font-semibold">No. Telepon</TableHead>
                    <TableHead className="font-semibold">Score</TableHead>
                    <TableHead className="font-semibold">Info</TableHead>
                    <TableHead className="font-semibold text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      {user?.role === "SALES_MANAGER" && (
                        <TableCell>
                          <Checkbox
                            checked={selectedCustomers.includes(customer.id)}
                            onCheckedChange={() =>
                              toggleCustomerSelection(customer.id)
                            }
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold shrink-0">
                            {(customer.name || "?").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {customer.name || "-"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {customer.age} tahun • {customer.marital}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-foreground">
                          {customer.phoneNumber || "-"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getScoreBadgeVariant(customer.score)}
                          className="font-medium"
                        >
                          {formatScore(customer.score)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Job:</span>
                            <span className="font-medium capitalize">
                              {customer.job}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {customer.education?.replace(/\./g, " ")}
                          </div>
                          <Badge
                            variant={
                              customer.housing === "yes"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              customer.housing === "yes"
                                ? "bg-green-100 text-green-800 hover:bg-green-200 text-xs"
                                : "text-xs"
                            }
                          >
                            {customer.housing === "yes"
                              ? "Punya Rumah"
                              : "Belum"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetail(customer)}
                          className="hover:bg-primary hover:text-primary-foreground"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="bg-card border border-border/50 rounded-lg p-4 shadow-sm hover:shadow-md transition-all"
              >
                {/* Header with Checkbox and Avatar */}
                <div className="flex items-start gap-3 mb-3">
                  {user?.role === "SALES_MANAGER" && (
                    <Checkbox
                      checked={selectedCustomers.includes(customer.id)}
                      onCheckedChange={() =>
                        toggleCustomerSelection(customer.id)
                      }
                      className="mt-1"
                    />
                  )}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold shrink-0">
                    {(customer.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {customer.name || "-"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {customer.phoneNumber || "-"}
                    </p>
                    <div className="mt-1">
                      <Badge
                        variant={getScoreBadgeVariant(customer.score)}
                        className="text-xs"
                      >
                        {formatScore(customer.score)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs">Umur</span>
                    <p className="font-medium">{customer.age} tahun</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">
                      Pekerjaan
                    </span>
                    <p className="font-medium capitalize truncate">
                      {customer.job}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">
                      Status
                    </span>
                    <p className="font-medium capitalize">{customer.marital}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">
                      Pendidikan
                    </span>
                    <p className="font-medium capitalize text-xs truncate">
                      {customer.education?.replace(/\./g, " ")}
                    </p>
                  </div>
                </div>

                {/* Assigned To */}
                <div className="mb-3 pb-3 border-t pt-3">
                  <span className="text-muted-foreground text-xs block mb-1">
                    Assigned To
                  </span>
                  {customer.assignedTo ? (
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate flex-1">
                        {customer.assignedTo.email}
                      </p>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {customer.assignedTo.role}
                      </Badge>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Unassigned
                    </span>
                  )}
                </div>

                {/* Action Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetail(customer)}
                  className="w-full hover:bg-primary hover:text-primary-foreground"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Lihat Detail
                </Button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <div className="text-sm text-muted-foreground text-center sm:text-left">
              Showing {(pagination.currentPage - 1) * 20 + 1} to{" "}
              {Math.min(pagination.currentPage * 20, pagination.totalCustomers)}{" "}
              of {pagination.totalCustomers} customers
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
              >
                <ChevronLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <div className="text-sm px-2">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
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
