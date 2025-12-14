"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Loader2 } from "lucide-react";
import api from "@/lib/api";

export default function DeleteCustomerDialog({
  customer,
  open,
  onOpenChange,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.customers.delete(customer.id);
      toast.success("Customer berhasil dihapus", {
        description: `Data ${customer.name} telah dihapus dari sistem.`,
      });
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      toast.error("Gagal menghapus customer", {
        description: err.message || "Terjadi kesalahan saat menghapus data",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">Hapus Customer</DialogTitle>
              <DialogDescription className="mt-1">
                Tindakan ini tidak dapat dibatalkan
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-700">
            Apakah Anda yakin ingin menghapus data customer{" "}
            <span className="font-semibold text-gray-900">{customer?.name}</span>?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Semua data termasuk riwayat panggilan akan ikut terhapus.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menghapus...
              </>
            ) : (
              "Hapus Customer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
