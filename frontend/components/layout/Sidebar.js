"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import {
  LayoutDashboard,
  UserCog,
  Phone,
  BarChart3,
  Users,
  Settings,
  LogOut,
  X,
  Home,
  BarChart2,
  PhoneCall,
  Users2,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { isCollapsed, isMobileOpen, toggleSidebar, closeMobileSidebar } =
    useSidebar();

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      roles: ["ADMIN", "SALES_MANAGER", "SALES"],
    },
    {
      name: "Call History",
      href: "/call-history",
      icon: PhoneCall,
      roles: ["SALES_MANAGER", "SALES"],
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart2,
      roles: ["SALES_MANAGER", "SALES"],
    },
    {
      name: "Customers",
      href: "/customers",
      icon: Users2,
      roles: ["ADMIN", "SALES_MANAGER", "SALES"],
    },
    {
      name: "Settings",
      href: "/admin/users",
      icon: Settings2,
      roles: ["ADMIN"],
    },
  ];

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role)
  );

  const handleLogout = () => {
    // Implement logout logic
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative flex flex-col bg-white transition-all duration-300 z-50 border-r border-gray-200 h-full",
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: respect collapsed state, Mobile: always show full width
          isCollapsed ? "lg:w-16 w-64" : "lg:w-64 w-64"
        )}
      >
        {/* Header - Mobile Only Close Button */}
        <div className="flex h-14 items-center justify-between px-3 border-b border-gray-200 lg:hidden">
          <span className="font-semibold text-gray-900">Menu</span>
          <button
            onClick={closeMobileSidebar}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close sidebar"
            type="button"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-2">
            {filteredNavigation.map((item, index) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {/* Always show text on mobile, respect collapsed state on desktop */}
                  <span className="text-sm font-medium block lg:hidden">
                    {item.name}
                  </span>
                  {!isCollapsed && (
                    <span className="text-sm font-medium hidden lg:block">
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}
