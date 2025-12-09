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
    item.name === "Customers"
      ? pathname.includes("customer")
      : item.roles.includes(user?.role)
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
          "fixed lg:relative flex flex-col transition-all duration-500 ease-in-out z-50 h-full border-r border-blue-300",
          "bg-[#56B9F1] rounded-r-[20px]",
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "lg:w-20 w-64" : "lg:w-64 w-64"
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
                    "group flex items-center rounded-xl py-3 text-sm font-medium transition-all duration-500 ease-in-out overflow-hidden whitespace-nowrap",
                    isActive
                      ? "bg-white text-black shadow-md"
                      : "text-white/90 hover:bg-white/20",
                    isCollapsed
                      ? "lg:justify-center lg:px-0 lg:gap-0 px-3 gap-3"
                      : "px-3 gap-3"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon
                    className={cn(
                      "transition-all duration-500 ease-in-out shrink-0",
                      isActive ? "text-black" : "text-white",
                      "h-7 w-7"
                    )}
                  />

                  {/* Desktop Text with Smooth Transition */}
                  <span
                    className={cn(
                      "text-base font-medium hidden lg:block transition-all duration-500 ease-in-out",
                      isActive ? "text-black" : "text-white",
                      isCollapsed
                        ? "max-w-0 opacity-0 translate-x-2.5"
                        : "max-w-[200px] opacity-100 translate-x-0"
                    )}
                  >
                    {item.name}
                  </span>

                  {/* Mobile Text - Always Visible */}
                  <span
                    className={cn(
                      "text-base font-medium block lg:hidden transition-all",
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
