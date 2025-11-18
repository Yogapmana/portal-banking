"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserPlus, AlertCircle, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";

export default function BulkAssignDialog({
  selectedCustomers,
  isOpen,
  onClose,
  onSuccess,
}) {
  const [salesList, setSalesList] = useState([]);
  const [selectedSales, setSelectedSales] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSales, setLoadingSales] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch sales list when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchSalesList();
      setSelectedSales("");
      setError("");
      setSuccess("");
    }
  }, [isOpen]);

  const fetchSalesList = async () => {
    setLoadingSales(true);
    try {
      const response = await api.auth.getSalesList();
      setSalesList(response.data || []);
    } catch (err) {
      console.error("Error fetching sales list:", err);
      setError("Gagal memuat daftar sales");
    } finally {
      setLoadingSales(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedSales) {
      setError("Pilih sales terlebih dahulu");
      return;
    }

    if (selectedCustomers.length === 0) {
      setError("Tidak ada customer yang dipilih");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const customerIds = selectedCustomers.map((c) => c.id);
      const response = await api.customers.bulkAssign(
        customerIds,
        parseInt(selectedSales)
      );

      setSuccess(response.message || "Customer berhasil di-assign");

      // Wait a bit to show success message, then close and refresh
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || "Gagal assign customer");
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async () => {
    if (selectedCustomers.length === 0) {
      setError("Tidak ada customer yang dipilih");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const customerIds = selectedCustomers.map((c) => c.id);
      const response = await api.customers.bulkUnassign(customerIds);

      setSuccess(response.message || "Customer berhasil di-unassign");

      // Wait a bit to show success message, then close and refresh
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || "Gagal unassign customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Customer ke Sales</DialogTitle>
          <DialogDescription>
            Assign {selectedCustomers.length} customer yang dipilih ke sales
            team
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-600">
              <CheckCircle className="h-4 w-4 shrink-0" />
              {success}
            </div>
          )}

          <div className="rounded-lg border p-3 bg-gray-50">
            <p className="text-sm font-medium mb-2">Customer yang dipilih:</p>
            <div className="flex flex-wrap gap-2">
              {selectedCustomers.slice(0, 5).map((customer) => (
                <Badge key={customer.id} variant="secondary">
                  {customer.name || `ID: ${customer.id}`}
                </Badge>
              ))}
              {selectedCustomers.length > 5 && (
                <Badge variant="outline">
                  +{selectedCustomers.length - 5} lainnya
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sales">Pilih Sales</Label>
            {loadingSales ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading sales list...
              </div>
            ) : (
              <Select
                value={selectedSales}
                onValueChange={setSelectedSales}
                disabled={loading || success}
              >
                <SelectTrigger id="sales">
                  <SelectValue placeholder="Pilih sales..." />
                </SelectTrigger>
                <SelectContent>
                  {salesList.map((sales) => (
                    <SelectItem key={sales.id} value={sales.id.toString()}>
                      {sales.email}
                    </SelectItem>
                  ))}
                  {salesList.length === 0 && (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      Tidak ada sales tersedia
                    </div>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleUnassign}
            disabled={loading || loadingSales || success}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Unassign Semua
          </Button>
          <Button
            onClick={handleAssign}
            disabled={loading || loadingSales || !selectedSales || success}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="mr-2 h-4 w-4" />
            )}
            Assign ke Sales
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
