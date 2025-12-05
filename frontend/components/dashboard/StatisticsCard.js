import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StatisticsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className = "",
  valueClassName = "",
}) {
  return (
    <Card
      className={`relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group ${className}`}
    >
      {/* Background accent decoration */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-[#56B9F1]/5 rounded-full -translate-y-8 translate-x-8 transition-transform duration-500 group-hover:scale-110"></div>

      <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6 relative z-10">
        <div className="flex items-center gap-3">
          {/* Icon container with elegant design */}
          <div className="relative">
            <div className="absolute inset-0 bg-[#56B9F1]/20 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
            <div className="relative p-3 bg-white border border-[#56B9F1]/10 rounded-xl shadow-sm">
              <Icon className="h-5 w-5 text-[#56B9F1]" />
            </div>
          </div>
          <CardTitle className="text-sm font-semibold text-gray-600">
            {title}
          </CardTitle>
        </div>

        {/* Trend indicator if available */}
        {trend && (
          <div
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              trend.includes("+")
                ? "bg-green-50 text-green-600 border border-green-100"
                : trend.includes("-")
                ? "bg-red-50 text-red-600 border border-red-100"
                : "bg-blue-50 text-blue-600 border border-blue-100"
            }`}
          >
            {trend}
          </div>
        )}
      </CardHeader>

      <CardContent className="px-6 pb-6 relative z-10">
        {/* Main value with elegant typography */}
        <div
          className={`text-3xl sm:text-4xl font-bold text-gray-900 mb-2 tracking-tight ${valueClassName}`}
          style={{
            background: "linear-gradient(135deg, #1e293b 0%, #56B9F1 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {value}
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-500 mb-3">{description}</p>
        )}

        {/* Decorative line */}
        <div className="relative pt-3">
          <div className="absolute left-0 top-0 w-12 h-0.5 bg-[#56B9F1] rounded-full"></div>
          <div className="absolute left-0 top-0 w-20 h-0.5 bg-[#56B9F1]/20 rounded-full ml-14"></div>
        </div>

        {/* Additional info container */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            <span>Updated now</span>
          </div>
        </div>
      </CardContent>

      {/* Hover effect border */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#56B9F1]/10 rounded-2xl transition-all duration-300 pointer-events-none"></div>
    </Card>
  );
}
