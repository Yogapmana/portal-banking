"use client";

import { useState } from "react";
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
  { value: "INTERESTED", label: "Tertarik", color: "text-green-700" },
  { value: "NOT_INTERESTED", label: "Tidak Tertarik", color: "text-red-700" },
  { value: "NO_ANSWER", label: "Tidak Diangkat", color: "text-gray-700" },
  { value: "WRONG_NUMBER", label: "Nomor Salah", color: "text-orange-700" },
  { value: "CALLBACK", label: "Minta Callback", color: "text-blue-700" },
];

export default function CallLogForm({ customerId, onSuccess }) {
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!status) {
      setError("Silakan pilih status panggilan");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.callLogs.create(parseInt(customerId), {
        status,
        notes: notes.trim() || null,
      });

      // Reset form
      setStatus("");
      setNotes("");

      // Notify parent component
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || "Gagal menyimpan catatan panggilan");
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

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

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
