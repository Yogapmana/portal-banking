"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Save, X, Loader2, ExternalLink, Phone } from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function CallLogTableRow({ log, onUpdate }) {
  const router = useRouter();
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

  const handleViewCustomer = (e) => {
    e.stopPropagation();
    if (log.customerId) {
      router.push(`/customers/${log.customerId}`);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes} menit yang lalu`;
    } else if (diffInHours < 24) {
      return `${diffInHours} jam yang lalu`;
    }

    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <TableRow className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors duration-150">
      <TableCell className="py-4 pl-6">
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">
            {formatDate(log.callDate)}
          </span>
          <span className="text-xs text-muted-foreground mt-0.5">
            {new Date(log.callDate).toLocaleDateString("id-ID", {
              weekday: "long",
            })}
          </span>
        </div>
      </TableCell>

      <TableCell className="py-4 pl-6">
        <button
          onClick={handleViewCustomer}
          className="flex items-center gap-3 text-left hover:opacity-80 transition-all group w-full"
          disabled={!log.customerId}
        >
          <div className="w-11 h-11 rounded-full bg-linear-to-br from-[#034694] to-[#0575E6] flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0 group-hover:scale-105 transition-transform">
            {(log.customer?.name || "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 flex items-center gap-1.5 truncate">
              {log.customer?.name || "Unknown"}
              {log.customerId && (
                <ExternalLink className="h-3.5 w-3.5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {log.customer?.phoneNumber || "N/A"}
            </p>
          </div>
        </button>
      </TableCell>

      <TableCell className="py-4 pl-6">
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
              <SelectItem value="INTERESTED" color="text-green-700">
                Tertarik
              </SelectItem>
              <SelectItem value="NOT_INTERESTED" color="text-red-700">
                Tidak Tertarik
              </SelectItem>
              <SelectItem value="NO_ANSWER" color="text-yellow-700">
                Tidak Angkat
              </SelectItem>
              <SelectItem value="WRONG_NUMBER" color="text-orange-700">
                Nomor Salah
              </SelectItem>
              <SelectItem value="CALLBACK" color="text-blue-700">
                Minta Dihubungi Lagi
              </SelectItem>
              <SelectItem value="COMPLETED" color="text-gray-700">
                Selesai
              </SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <StatusBadge status={log.status} className="font-medium" />
        )}
      </TableCell>

      <TableCell className="py-4 max-w-md pl-6">
        {isEditing ? (
          <textarea
            className="w-full p-3 border-2 border-blue-200 rounded-lg text-sm resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            rows={3}
            value={editForm.notes}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                notes: e.target.value,
              })
            }
            placeholder="Tulis catatan panggilan..."
          />
        ) : (
          <div className="space-y-1">
            <p
              className="text-sm text-gray-700 line-clamp-2"
              title={log.notes || "-"}
            >
              {log.notes || (
                <span className="text-muted-foreground italic">
                  Tidak ada catatan
                </span>
              )}
            </p>
          </div>
        )}
      </TableCell>

      <TableCell className="py-4 pl-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold text-xs">
            {(log.user?.email || "?").charAt(0).toUpperCase()}
          </div>
          <p className="text-sm text-gray-700 font-medium">
            {log.user?.email || "N/A"}
          </p>
        </div>
      </TableCell>

      <TableCell className="py-4 text-right pr-6">
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
