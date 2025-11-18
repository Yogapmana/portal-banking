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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {user?.role === "SALES_MANAGER" && (
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedCustomers.length === customers.length &&
                          customers.length > 0
                        }
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                  )}
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Marital</TableHead>
                  <TableHead>Education</TableHead>
                  <TableHead>Housing</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
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
                    <TableCell className="capitalize">
                      {customer.marital}
                    </TableCell>
                    <TableCell className="capitalize">
                      {customer.education?.replace(/\./g, " ")}
                    </TableCell>
                    <TableCell className="capitalize">
                      {customer.housing}
                    </TableCell>
                    <TableCell>
                      {customer.assignedTo ? (
                        <div className="text-sm">
                          <div>{customer.assignedTo.email}</div>
                          <Badge variant="outline" className="mt-1">
                            {customer.assignedTo.role}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
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
