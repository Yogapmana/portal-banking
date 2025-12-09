"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Phone, Loader2 } from "lucide-react";
import api from "@/lib/api";

const CALL_STATUS_OPTIONS = [
  { value: "TERTARIK", label: "Tertarik", color: "text-green-700" },
  { value: "TIDAK_TERTARIK", label: "Tidak Tertarik", color: "text-red-700" },
  { value: "TIDAK_TERSEDIA", label: "Tidak Diangkat", color: "text-gray-700" },
  { value: "SALAH_NOMOR", label: "Nomor Salah", color: "text-orange-700" },
  { value: "BERMINAT", label: "Minta Callback", color: "text-blue-700" },
];

export default function CallLogForm({ customerId, onSuccess }) {
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!status) {
      toast.warning("Pilih status panggilan terlebih dahulu");
      return;
    }

    try {
      setLoading(true);

      await api.callLogs.create(parseInt(customerId), {
        status,
        notes: notes.trim() || null,
      });

      const statusLabel =
        CALL_STATUS_OPTIONS.find((o) => o.value === status)?.label || status;
      toast.success("Catatan panggilan tersimpan!", {
        description: `Status: ${statusLabel}`,
      });

      // Reset form
      setStatus("");
      setNotes("");

      // Notify parent component
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      toast.error("Gagal menyimpan catatan panggilan", {
        description: err.message || "Silakan coba lagi.",
      });
      console.error("Error creating call log:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/50 shadow-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-[#034694]" />
          Catat Panggilan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="status">
              Status Panggilan <span className="text-red-500">*</span>
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Pilih status panggilan" />
              </SelectTrigger>
              <SelectContent>
                {CALL_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className={option.color}>{option.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              placeholder="Tulis catatan panggilan di sini..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Opsional: Tambahkan detail mengenai percakapan dengan customer
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !status}
            className="w-full bg-[#034694] hover:bg-[#023a7a]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Phone className="mr-2 h-4 w-4" />
                Simpan Catatan Panggilan
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
