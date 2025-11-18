"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Phone, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export default function CustomerDetailDialog({
  customer,
  isOpen,
  onClose,
  onCallLogCreated,
}) {
  const { user } = useAuth();
  const [callLogs, setCallLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Call log form
  const [callLogForm, setCallLogForm] = useState({
    status: "",
    notes: "",
  });

  // Fetch call history when dialog opens (skip for ADMIN)
  useEffect(() => {
    if (isOpen && customer && user?.role !== "ADMIN") {
      fetchCallHistory();
    }
  }, [isOpen, customer, user]);

  const fetchCallHistory = async () => {
    if (!customer || user?.role === "ADMIN") return;

    setLoadingLogs(true);
    try {
      const response = await api.callLogs.getByCustomer(customer.id);
      setCallLogs(response.data || []);
    } catch (err) {
      console.error("Error fetching call history:", err);
      console.error("Error details:", err.response?.data || err.message);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleSubmitCallLog = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!callLogForm.status) {
      setError("Status harus dipilih");
      return;
    }

    setSubmitting(true);

    try {
      await api.callLogs.create(
        customer.id,
        callLogForm.status,
        callLogForm.notes
      );

      setSuccess("Call log berhasil disimpan!");
      setCallLogForm({ status: "", notes: "" });

      // Refresh call history
      fetchCallHistory();

      // Notify parent to refresh customer list
      if (onCallLogCreated) {
        onCallLogCreated();
      }

      // Auto hide success message
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Gagal menyimpan call log");
    } finally {
      setSubmitting(false);
    }
  };

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

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "INTERESTED":
        return "default";
      case "COMPLETED":
        return "default";
      case "NOT_INTERESTED":
        return "destructive";
      case "NO_ANSWER":
        return "secondary";
      case "CALLBACK":
        return "outline";
      case "WRONG_NUMBER":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      INTERESTED: "Tertarik",
      NOT_INTERESTED: "Tidak Tertarik",
      NO_ANSWER: "Tidak Angkat",
      WRONG_NUMBER: "Nomor Salah",
      CALLBACK: "Minta Dihubungi Lagi",
      COMPLETED: "Transaksi Selesai",
    };
    return labels[status] || status;
  };

  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
          <DialogDescription>
            Informasi lengkap nasabah dan riwayat panggilan
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column - Customer Info */}
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="mb-3 font-semibold text-lg">Informasi Pribadi</h3>
              <div className="grid gap-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Nama
                  </label>
                  <p className="text-sm">{customer.name || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    No. Telepon
                  </label>
                  <p className="text-sm">{customer.phoneNumber || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Usia
                  </label>
                  <p className="text-sm">{customer.age} tahun</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Pekerjaan
                  </label>
                  <p className="text-sm capitalize">{customer.job}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status Pernikahan
                  </label>
                  <p className="text-sm capitalize">{customer.marital}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Pendidikan
                  </label>
                  <p className="text-sm capitalize">
                    {customer.education?.replace(/\./g, " ")}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Prediction Score
                  </label>
                  <div className="mt-1">
                    <Badge variant={getScoreBadgeVariant(customer.score)}>
                      {formatScore(customer.score)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Call History (Hidden for ADMIN) */}
            {user?.role !== "ADMIN" && (
              <div>
                <h3 className="mb-3 font-semibold text-lg">
                  Riwayat Panggilan
                </h3>
                {loadingLogs ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : callLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Belum ada riwayat panggilan
                  </p>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {callLogs.map((log) => (
                      <div
                        key={log.id}
                        className="rounded-lg border p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant={getStatusBadgeVariant(log.status)}>
                            {getStatusLabel(log.status)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.callDate).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                        {log.notes && (
                          <p className="text-sm text-muted-foreground">
                            {log.notes}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          oleh: {log.user?.email}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Call Log Form (Hidden for ADMIN) */}
          {user?.role !== "ADMIN" && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-3 font-semibold text-lg flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Catat Hasil Panggilan
                </h3>

                {error && (
                  <div className="mb-4 flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-4 flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmitCallLog} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status Panggilan *</Label>
                    <Select
                      value={callLogForm.status}
                      onValueChange={(value) =>
                        setCallLogForm({ ...callLogForm, status: value })
                      }
                      disabled={submitting}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Pilih status..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INTERESTED">✅ Tertarik</SelectItem>
                        <SelectItem value="NOT_INTERESTED">
                          ❌ Tidak Tertarik
                        </SelectItem>
                        <SelectItem value="NO_ANSWER">
                          📵 Tidak Angkat
                        </SelectItem>
                        <SelectItem value="WRONG_NUMBER">
                          ⚠️ Nomor Salah
                        </SelectItem>
                        <SelectItem value="CALLBACK">
                          🔄 Minta Dihubungi Lagi
                        </SelectItem>
                        <SelectItem value="COMPLETED">
                          🎉 Transaksi Selesai
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Catatan</Label>
                    <Textarea
                      id="notes"
                      placeholder="Tulis catatan panggilan di sini..."
                      rows={4}
                      value={callLogForm.notes}
                      onChange={(e) =>
                        setCallLogForm({
                          ...callLogForm,
                          notes: e.target.value,
                        })
                      }
                      disabled={submitting}
                    />
                    <p className="text-xs text-muted-foreground">
                      Opsional - Catatan tambahan tentang hasil panggilan
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Phone className="mr-2 h-4 w-4" />
                        Simpan Call Log
                      </>
                    )}
                  </Button>
                </form>
              </div>

              <Separator />

              {/* Additional Info */}
              <div>
                <h4 className="mb-2 font-medium text-sm">Informasi Tambahan</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Housing Loan:</span>
                    <span className="capitalize">{customer.housing}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Personal Loan:
                    </span>
                    <span className="capitalize">{customer.loan}</span>
                  </div>
                  {customer.assignedTo && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Assigned To:
                      </span>
                      <span>{customer.assignedTo.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
