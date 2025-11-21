"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { History, Calendar, User, Phone } from "lucide-react";
import api from "@/lib/api";

const CALL_STATUS_CONFIG = {
  INTERESTED: {
    label: "Tertarik",
    variant: "default",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  NOT_INTERESTED: {
    label: "Tidak Tertarik",
    variant: "destructive",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  NO_ANSWER: {
    label: "Tidak Diangkat",
    variant: "secondary",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
  WRONG_NUMBER: {
    label: "Nomor Salah",
    variant: "outline",
    className: "bg-orange-100 text-orange-700 border-orange-200",
  },
  CALLBACK: {
    label: "Minta Callback",
    variant: "outline",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
};

export default function CallLogHistory({ customerId, refreshTrigger }) {
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (customerId) {
      fetchCallLogs();
    }
  }, [customerId, refreshTrigger]);

  const fetchCallLogs = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.callLogs.getByCustomer(customerId);
      setCallLogs(response.data || []);
    } catch (err) {
      setError(err.message || "Gagal memuat riwayat panggilan");
      console.error("Error fetching call logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <Card className="border-border/50 shadow-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#034694]" />
            Riwayat Panggilan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 shadow-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#034694]" />
          Riwayat Panggilan
          {callLogs.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {callLogs.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
            {error}
          </div>
        )}

        {callLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Phone className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Belum ada catatan panggilan</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {callLogs.map((log) => {
              const statusConfig =
                CALL_STATUS_CONFIG[log.status] || CALL_STATUS_CONFIG.NO_ANSWER;

              return (
                <div
                  key={log.id}
                  className="p-4 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  {/* Header: Status and Date */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge
                      variant={statusConfig.variant}
                      className={statusConfig.className}
                    >
                      {statusConfig.label}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {formatDate(log.callDate)}
                    </div>
                  </div>

                  {/* Notes */}
                  {log.notes && (
                    <p className="text-sm text-foreground mb-2 whitespace-pre-wrap">
                      {log.notes}
                    </p>
                  )}

                  {/* Footer: User info */}
                  {log.user && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t border-border/30">
                      <User className="w-3 h-3" />
                      <span>
                        oleh {log.user.email?.split("@")[0] || "Unknown"}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
