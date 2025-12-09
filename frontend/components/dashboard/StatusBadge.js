import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG = {
  TERTARIK: {
    label: "Tertarik",
    variant: "default",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  TIDAK_TERTARIK: {
    label: "Tidak Tertarik",
    variant: "destructive",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  TIDAK_TERSEDIA: {
    label: "Tidak Diangkat",
    variant: "secondary",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
  SALAH_NOMOR: {
    label: "Nomor Salah",
    variant: "outline",
    className: "bg-orange-100 text-orange-700 border-orange-200",
  },
  BERMINAT: {
    label: "Minta Callback",
    variant: "outline",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
};

export function getStatusConfig(status) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.NO_ANSWER;
}

export function getStatusLabel(status) {
  return STATUS_CONFIG[status]?.label || status;
}

export function getStatusColor(status) {
  return STATUS_CONFIG[status]?.className || STATUS_CONFIG.NO_ANSWER.className;
}

export default function StatusBadge({ status, className = "" }) {
  const config = getStatusConfig(status);

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${className}`}
    >
      {config.label}
    </Badge>
  );
}
