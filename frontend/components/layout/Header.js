"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { LogOut, Menu, Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, logout } = useAuth();
  const { toggleMobileSidebar, toggleSidebar } = useSidebar();

  return (
    <header className="border-b bg-white shadow-sm sticky top-0 z-40">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex p-2 rounded-xl hover:bg-[#56B9F115] transition-all border border-transparent hover:border-[#56B9F1]/30"
          >
            <Menu className="h-5 w-5 text-[#56B9F1]" />
          </button>

          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl hover:bg-[#56B9F115] transition-all border border-transparent hover:border-[#56B9F1]/30"
          >
            <Menu className="h-5 w-5 text-[#56B9F1]" />
          </button>

          <h1 className="text-xl font-bold bg-[#56B9F1] bg-clip-text text-transparent">
            SalesLead
          </h1>
        </div>

        {/* <div className="hidden md:flex flex-1 max-w-xl mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search anything..."
              className="w-full h-10 pl-10 pr-4 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#56B9F1] focus:bg-white transition-all"
            />
          </div>
        </div> */}

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 h-10 px-3 rounded-xl hover:bg-[#56B9F115] transition-all border border-transparent hover:border-[#56B9F1]/30"
              >
                <div className="w-8 h-8 rounded-xl bg-[#56B9F1]/10 flex items-center justify-center text-[#56B9F1] font-semibold">
                  {user?.email?.charAt(0)?.toUpperCase() || "U"}
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-64 shadow-lg rounded-xl border border-gray-200"
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold text-gray-800">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role?.replace("_", " ")}
                  </p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={logout}
                className="text-red-600 cursor-pointer rounded-lg"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
