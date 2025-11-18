"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  UserCog,
  Phone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["ADMIN", "SALES_MANAGER", "SALES"],
    },
    {
      name: "Riwayat Panggilan",
      href: "/call-history",
      icon: Phone,
      roles: ["SALES_MANAGER", "SALES"],
    },
    {
      name: "User Management",
      href: "/admin/users",
      icon: UserCog,
      roles: ["ADMIN"],
    },
  ];

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role)
  );

  return (
    <aside
      className={cn(
        "relative border-r bg-white transition-all duration-300shrink-0",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-white shadow-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        type="button"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 p-4">
        {!isCollapsed && (
          <div className="mb-4 px-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Menu Utama
            </p>
          </div>
        )}

        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
