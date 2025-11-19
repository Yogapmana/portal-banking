"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  UserCog,
  Phone,
  ChevronLeft,
  Settings,
  BarChart3,
  Users,
  Search,
  Bell,
  HelpCircle,
  LogOut,
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
      name: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      roles: ["SALES_MANAGER", "SALES"],
    },
    {
      name: "Riwayat Panggilan",
      href: "/call-history",
      icon: Phone,
      roles: ["SALES_MANAGER", "SALES"],
    },
    {
      name: "Customers",
      href: "/customers",
      icon: Users,
      roles: ["ADMIN", "SALES_MANAGER", "SALES"],
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

  const handleLogout = () => {
    // Implement logout logic
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col bg-background transition-all duration-300 shrink-0 border-r",
        isCollapsed ? "w-16" : "w-72"
      )}
    >
      {/* Search Bar */}
      <div className="flex h-16 items-center border-b px-4">
        {/* <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search..."
            className={cn(
              "w-full rounded-md border bg-background pl-10 pr-4 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              isCollapsed && "hidden"
            )}
          />
        </div> */}
        {!isCollapsed && (
          <button className="p-2 hover:bg-muted rounded-md transition-colors">
            <Bell className="h-5 w-5" />
          </button>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-4 p-2 hover:bg-muted rounded-md transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          type="button"
        >
          <ChevronLeft
            className={cn(
              "h-5 w-5 transition-transform",
              !isCollapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-6">
          {/* Main Navigation */}
          <div className="space-y-1">
            {/* {!isCollapsed && (
              <div className="px-3 py-2">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Main
                </h2>
              </div>
            )} */}
            {filteredNavigation.slice(0, 3).map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Admin Section */}
          {user?.role === "ADMIN" && !isCollapsed && (
            <div className="px-3 py-2">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Admin
              </h2>
            </div>
          )}
          {user?.role === "ADMIN" && (
            <div className="space-y-1">
              {filteredNavigation.slice(3).map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {!isCollapsed && (
                      <span className="text-sm font-medium">{item.name}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* User Menu */}
      <div className="border-t">
        <div className="p-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="avatar-gradient-chelsea w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              {user?.email?.charAt(0)?.toUpperCase() || "U"}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {user?.email || "User"}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.role?.replace("_", " ") || "Staff"}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-1 mt-2">
            <button className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors">
              <Settings className="h-4 w-4" />
              {!isCollapsed && <span>Settings</span>}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
