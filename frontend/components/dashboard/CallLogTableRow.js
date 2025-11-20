"use client";

import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Save, X, Loader2 } from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function CallLogTableRow({ log, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    status: log.status,
    notes: log.notes || "",
  });
  const [loading, setLoading] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({
      status: log.status,
      notes: log.notes || "",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      status: log.status,
      notes: log.notes || "",
    });
  };

  const handleSave = async () => {
    if (!editForm.status) return;

    setLoading(true);
    try {
      await onUpdate(log.id, editForm);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating call log:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell>{formatDate(log.callDate)}</TableCell>
      
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="avatar-gradient-chelsea w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0">
            {(log.customer?.name || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-foreground">
              {log.customer?.name || "Unknown"}
            </p>
            <p className="text-xs text-muted-foreground">
              {log.customer?.phoneNumber || "N/A"}
            </p>
          </div>
        </div>
      </TableCell>

      <TableCell>
        {isEditing ? (
          <Select
            value={editForm.status}
            onValueChange={(value) =>
              setEditForm({ ...editForm, status: value })
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INTERESTED">✅ Tertarik</SelectItem>
              <SelectItem value="NOT_INTERESTED">❌ Tidak Tertarik</SelectItem>
              <SelectItem value="NO_ANSWER">📵 Tidak Angkat</SelectItem>
              <SelectItem value="WRONG_NUMBER">⚠️ Nomor Salah</SelectItem>
              <SelectItem value="CALLBACK">🔄 Minta Dihubungi Lagi</SelectItem>
              <SelectItem value="COMPLETED">🎉 Selesai</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <StatusBadge status={log.status} className="font-medium" />
        )}
      </TableCell>

      <TableCell className="max-w-xs">
        {isEditing ? (
          <textarea
            className="w-full p-2 border rounded-md text-sm resize-none"
            rows={2}
            value={editForm.notes}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                notes: e.target.value,
              })
            }
            placeholder="Tulis catatan..."
          />
        ) : (
          <div
            className="max-w-xs truncate text-sm text-foreground"
            title={log.notes || "-"}
          >
            {log.notes || "-"}
          </div>
        )}
      </TableCell>

      <TableCell>
        <p className="text-sm text-foreground">
          {log.user?.email || "N/A"}
        </p>
      </TableCell>

      <TableCell className="text-right">
        {isEditing ? (
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={loading}
              className="hover:bg-primary hover:text-primary-foreground"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleEdit}
            className="hover:bg-muted"
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
