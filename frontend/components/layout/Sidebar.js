"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { X, Home, BarChart2, PhoneCall, Users2, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { isCollapsed, isMobileOpen, closeMobileSidebar } = useSidebar();

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
    // May not be needed, since it's only shown when path is customers/id
    {
      name: "Customers",
      href: "",
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

  const filteredNavigation = navigation.filter((item) =>
    // disabling customers icon when not in usual path
    item.name === "Customers" ?
    pathname.includes('customer') :
    item.roles.includes(user?.role)
  );

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      <aside
        className={cn(
          "fixed lg:relative flex flex-col transition-all duration-300 z-50 h-full border-r border-blue-300",
          "bg-[#56B9F1] rounded-r-[40px]",
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "lg:w-16 w-64" : "lg:w-64 w-64"
        )}
      >
        <div className="flex h-14 items-center justify-between px-3 border-b border-blue-300/40 lg:hidden">
          <span className="font-semibold text-white">Menu</span>
          <button
            onClick={closeMobileSidebar}
            className="p-1.5 rounded-md transition-colors"
            aria-label="Close sidebar"
            type="button"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-2 px-2">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all",
                    isActive
                      ? "bg-white text-black shadow-md"
                      : "text-white/90 hover:bg-white/20",
                    isCollapsed && "justify-center px-0"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon
                    className={cn(
                      "transition-all",
                      isActive ? "text-black" : "text-white",
                      isCollapsed ? "h-7 w-7 mx-auto" : "h-6 w-6"
                    )}
                  />

                  {!isCollapsed && (
                    <span
                      className={cn(
                        "text-sm font-medium hidden lg:block",
                        isActive ? "text-black" : "text-white"
                      )}
                    >
                      {item.name}
                    </span>
                  )}

                  <span
                    className={cn(
                      "text-sm font-medium block lg:hidden",
                      isActive ? "text-black" : "text-white"
                    )}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}
