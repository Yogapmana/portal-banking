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
    <Card className={`border-border/50 shadow-elevated ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueClassName}`}>
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2 text-xs">
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
