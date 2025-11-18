"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Eye, UserPlus } from "lucide-react";
import CustomerDetailDialog from "./CustomerDetailDialog";
import BulkAssignDialog from "./BulkAssignDialog";

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

  const isSalesManager = user?.role === "SALES_MANAGER";

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

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedCustomers(customers);
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleSelectCustomer = (customer, checked) => {
    if (checked) {
      setSelectedCustomers([...selectedCustomers, customer]);
    } else {
      setSelectedCustomers(
        selectedCustomers.filter((c) => c.id !== customer.id)
      );
    }
  };

  const isSelected = (customerId) => {
    return selectedCustomers.some((c) => c.id === customerId);
  };

  const allSelected =
    customers.length > 0 && selectedCustomers.length === customers.length;
  const someSelected = selectedCustomers.length > 0 && !allSelected;

  const handleBulkAssignSuccess = () => {
    setSelectedCustomers([]);
    onRefresh?.();
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {isSalesManager && selectedCustomers.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border bg-blue-50 p-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {selectedCustomers.length} customer dipilih
            </span>
            <Button
              variant="link"
              size="sm"
              onClick={() => setSelectedCustomers([])}
              className="h-auto p-0 text-xs"
            >
              Batal
            </Button>
          </div>
          <Button
            size="sm"
            onClick={() => setIsBulkAssignOpen(true)}
            className="gap-2"
          >
            <UserPlus className="h-4 w-4" />
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {isSalesManager && (
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                        className={
                          someSelected ? "data-[state=checked]:bg-blue-500" : ""
                        }
                      />
                    </TableHead>
                  )}
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    {isSalesManager && (
                      <TableCell>
                        <Checkbox
                          checked={isSelected(customer.id)}
                          onCheckedChange={(checked) =>
                            handleSelectCustomer(customer, checked)
                          }
                          aria-label={`Select ${customer.name}`}
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-medium">
                      {customer.name || "-"}
                    </TableCell>
                    <TableCell>{customer.phoneNumber || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={getScoreBadgeVariant(customer.score)}>
                        {formatScore(customer.score)}
                      </Badge>
                    </TableCell>
                    <TableCell>{customer.age}</TableCell>
                    <TableCell className="capitalize">{customer.job}</TableCell>
                    <TableCell>
                      {customer.assignedTo ? (
                        <div className="text-sm">
                          <div className="font-medium">
                            {customer.assignedTo.email}
                          </div>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {customer.assignedTo.role}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Unassigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetail(customer)}
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

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
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
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="text-sm">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Customer Detail Dialog with Call Log Form */}
      <CustomerDetailDialog
        customer={selectedCustomer}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onCallLogCreated={onRefresh}
      />

      {/* Bulk Assign Dialog */}
      {isSalesManager && (
        <BulkAssignDialog
          selectedCustomers={selectedCustomers}
          isOpen={isBulkAssignOpen}
          onClose={() => setIsBulkAssignOpen(false)}
          onSuccess={handleBulkAssignSuccess}
        />
      )}
    </div>
  );
}
