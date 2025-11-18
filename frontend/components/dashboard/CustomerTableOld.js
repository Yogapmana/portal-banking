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
import CustomerDetailDialog from "./CustomerDetailDialog";

export default function CustomerTable({
  customers,
  pagination,
  onPageChange,
  onRefresh,
}) {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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

  return (
    <div className="space-y-4">
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

      {/* Customer Detail Dialog with Call Log Form */}
      <CustomerDetailDialog
        customer={selectedCustomer}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onCallLogCreated={onRefresh}
      />
    </div>
  );
}
