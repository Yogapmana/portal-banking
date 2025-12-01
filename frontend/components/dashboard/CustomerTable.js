"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  User,
  Home,
  Phone,
} from "lucide-react";
import BulkAssignDialog from "./BulkAssignDialog";
import { useAuth } from "@/contexts/AuthContext";

export default function CustomerTable({
  customers,
  pagination,
  onPageChange,
  onRefresh,
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);

  const formatScore = (score) => {
    if (score === null || score === undefined) return "N/A";
    return `${(score * 100).toFixed(1)}%`;
  };

  const getScoreColor = (score) => {
    if (score >= 0.7) return "bg-green-600 text-white";
    if (score >= 0.4) return "bg-orange-500 text-white";
    if (score === null || score === undefined) return "bg-gray-400 text-white";
    return "bg-red-500 text-white";
  };

  const handleViewDetail = (customerId) => {
    router.push(`/customers/${customerId}`);
  };

  const toggleCustomerSelection = (customerId) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleRowClick = (customer, event) => {
    if (
      event.target.type === "checkbox" ||
      event.target.tagName === "BUTTON" ||
      event.target.tagName === "A" ||
      event.target.closest("button") ||
      event.target.closest("a")
    ) {
      return;
    }

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
    <div className="px-4 md:px-6 lg:px-8 py-4 space-y-6">
      {/** TOP BAR WHEN SELECTING ITEMS */}
      {user?.role === "SALES_MANAGER" && selectedCustomers.length > 0 && (
        <div className="flex items-center justify-between bg-[#56B9F1] p-4 rounded-xl shadow text-white">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-white" />
            <div className="font-semibold">
              {selectedCustomers.length} terpilih
            </div>
          </div>
          <Button
            onClick={() => setIsBulkAssignOpen(true)}
            size="sm"
            className="bg-white text-[#056aa8] hover:bg-gray-100 font-semibold"
          >
            Assign ke Sales
          </Button>
        </div>
      )}

      {/** EMPTY STATE */}
      {customers.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-28 h-28 bg-[#eaf6ff] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <User className="w-12 h-12 text-[#056aa8]" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Tidak ada customer
          </h3>
          <p className="text-gray-600 max-w-lg mx-auto">
            Belum ada data sesuai filter.
          </p>
        </div>
      ) : (
        <>
          {/** DESKTOP TABLE */}
          <div className="hidden md:block rounded-2xl overflow-hidden shadow bg-white border border-blue-100">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#f3f9ff] border-b border-blue-200">
                  {user?.role === "SALES_MANAGER" && (
                    <TableHead className="w-44 font-semibold text-[#034e75] pl-6">
                      <label className="flex items-center gap-3">
                        <Checkbox
                          checked={
                            selectedCustomers.length === customers.length &&
                            customers.length > 0
                          }
                          onCheckedChange={toggleSelectAll}
                          className="border-blue-300 data-[state=checked]:bg-[#56B9F1]"
                        />
                        <span>Pilih Semua</span>
                      </label>
                    </TableHead>
                  )}
                  <TableHead className="font-bold text-[#034e75]">
                    Customer
                  </TableHead>
                  <TableHead className="font-bold text-[#034e75]">
                    Contact
                  </TableHead>
                  <TableHead className="font-bold text-[#034e75] text-center">
                    Score
                  </TableHead>
                  <TableHead className="font-bold text-[#034e75]">
                    Info
                  </TableHead>
                  {user?.role === "SALES_MANAGER" && (
                    <TableHead className="font-bold text-[#034e75]">
                      Assigned
                    </TableHead>
                  )}
                  <TableHead className="font-bold text-[#034e75] text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {customers.map((customer, index) => (
                  <TableRow
                    key={customer.id}
                    className={`cursor-pointer ${
                      selectedCustomers.includes(customer.id)
                        ? "bg-[#eaf6ff]"
                        : index % 2 === 0
                        ? "bg-white"
                        : "bg-[#f9fcff]"
                    }`}
                    onClick={(e) => handleRowClick(customer, e)}
                  >
                    {/** CHECKBOX */}
                    {user?.role === "SALES_MANAGER" && (
                      <TableCell
                        className="pl-6"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <label className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedCustomers.includes(customer.id)}
                            onCheckedChange={() =>
                              toggleCustomerSelection(customer.id)
                            }
                            className="border-blue-300 data-[state=checked]:bg-[#56B9F1]"
                          />
                          <span className="text-sm">Pilih</span>
                        </label>
                      </TableCell>
                    )}

                    {/** CUSTOMER NAME */}
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-[#56B9F1] flex items-center justify-center text-white shadow font-semibold">
                          {(customer.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-lg">
                            {customer.name}
                          </p>
                          <p className="text-sm text-gray-600 capitalize">
                            {customer.marital}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/** CONTACT */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#56B9F1]" />
                        <p>{customer.phoneNumber || "-"}</p>
                      </div>
                      <p className="text-sm text-gray-600">{customer.job}</p>
                    </TableCell>

                    {/** SCORE */}
                    <TableCell className="text-center">
                      <span
                        className={`px-4 py-2 rounded-lg font-semibold ${getScoreColor(
                          customer.score
                        )}`}
                      >
                        {formatScore(customer.score)}
                      </span>
                    </TableCell>

                    {/** INFO */}
                    <TableCell>
                      <p className="font-medium capitalize">
                        {customer.education?.replace(/\./g, " ")}
                      </p>
                      <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-[#f2f9ff]">
                        <Home className="w-4 h-4 text-gray-600" />
                        {customer.housing === "yes" ? "Owner" : "No House"}
                      </div>
                    </TableCell>

                    {/** ASSIGNED */}
                    {user?.role === "SALES_MANAGER" && (
                      <TableCell>
                        {customer.assignedTo ? (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#56B9F1] text-white rounded-xl flex items-center justify-center">
                              {customer.assignedTo.email
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {customer.assignedTo.email.split("@")[0]}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">Unassigned</p>
                        )}
                      </TableCell>
                    )}

                    {/** ACTION */}
                    <TableCell
                      className="text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetail(customer.id)}
                        className="border-blue-200 text-[#056aa8] hover:bg-[#56B9F1] hover:text-white"
                      >
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/** PAGINATION */}
          <div className="flex items-center justify-between pt-6">
            <div className="text-sm text-gray-600">
              Showing{" "}
              <span className="text-[#056aa8] font-semibold">
                {(pagination.currentPage - 1) * 20 + 1}
              </span>{" "}
              to{" "}
              <span className="text-[#056aa8] font-semibold">
                {Math.min(
                  pagination.currentPage * 20,
                  pagination.totalCustomers
                )}
              </span>{" "}
              of{" "}
              <span className="text-[#056aa8] font-semibold">
                {pagination.totalCustomers}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrev}
                onClick={() => onPageChange(pagination.currentPage - 1)}
                className="border-blue-200 text-[#056aa8]"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </Button>

              <div className="px-4 py-2 border border-blue-200 bg-[#f3f9ff] rounded-lg">
                Page {pagination.currentPage} / {pagination.totalPages}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNext}
                onClick={() => onPageChange(pagination.currentPage + 1)}
                className="border-blue-200 text-[#056aa8]"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/** BULK ASSIGN DIALOG */}
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
