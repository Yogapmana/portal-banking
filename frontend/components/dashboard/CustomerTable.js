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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";

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

      {/* Customer Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              Detailed information about the customer
            </DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="grid gap-6">
              {/* Personal Information */}
              <div>
                <h3 className="mb-3 font-semibold text-lg">
                  Personal Information
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Name
                    </label>
                    <p className="text-sm">{selectedCustomer.name || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Phone Number
                    </label>
                    <p className="text-sm">
                      {selectedCustomer.phoneNumber || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Age
                    </label>
                    <p className="text-sm">{selectedCustomer.age}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Job
                    </label>
                    <p className="text-sm capitalize">{selectedCustomer.job}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Marital Status
                    </label>
                    <p className="text-sm capitalize">
                      {selectedCustomer.marital}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Education
                    </label>
                    <p className="text-sm capitalize">
                      {selectedCustomer.education?.replace(/\./g, " ")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div>
                <h3 className="mb-3 font-semibold text-lg">
                  Financial Information
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Prediction Score
                    </label>
                    <p className="text-sm">
                      <Badge
                        variant={getScoreBadgeVariant(selectedCustomer.score)}
                        className="mt-1"
                      >
                        {formatScore(selectedCustomer.score)}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Housing Loan
                    </label>
                    <p className="text-sm capitalize">
                      {selectedCustomer.housing}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Personal Loan
                    </label>
                    <p className="text-sm capitalize">
                      {selectedCustomer.loan || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Campaign Information */}
              <div>
                <h3 className="mb-3 font-semibold text-lg">
                  Campaign Information
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Contact Type
                    </label>
                    <p className="text-sm capitalize">
                      {selectedCustomer.contact || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Month
                    </label>
                    <p className="text-sm capitalize">
                      {selectedCustomer.month || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Day of Week
                    </label>
                    <p className="text-sm capitalize">
                      {selectedCustomer.dayOfWeek || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Duration (seconds)
                    </label>
                    <p className="text-sm">
                      {selectedCustomer.duration || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Campaign Contacts
                    </label>
                    <p className="text-sm">
                      {selectedCustomer.campaign || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Previous Contacts
                    </label>
                    <p className="text-sm">
                      {selectedCustomer.previous || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Previous Outcome
                    </label>
                    <p className="text-sm capitalize">
                      {selectedCustomer.poutcome || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Economic Indicators */}
              <div>
                <h3 className="mb-3 font-semibold text-lg">
                  Economic Indicators
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Employment Variation Rate
                    </label>
                    <p className="text-sm">
                      {selectedCustomer.empVarRate ?? "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Consumer Price Index
                    </label>
                    <p className="text-sm">
                      {selectedCustomer.consPriceIdx ?? "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Consumer Confidence Index
                    </label>
                    <p className="text-sm">
                      {selectedCustomer.consConfIdx ?? "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Euribor 3 Month Rate
                    </label>
                    <p className="text-sm">
                      {selectedCustomer.euribor3m ?? "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Number of Employees
                    </label>
                    <p className="text-sm">
                      {selectedCustomer.nrEmployed ?? "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Assignment Information */}
              {selectedCustomer.assignedTo && (
                <div>
                  <h3 className="mb-3 font-semibold text-lg">Assignment</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Assigned To
                      </label>
                      <p className="text-sm">
                        {selectedCustomer.assignedTo.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Role
                      </label>
                      <p className="text-sm">
                        <Badge variant="outline">
                          {selectedCustomer.assignedTo.role}
                        </Badge>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
