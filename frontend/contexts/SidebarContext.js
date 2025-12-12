"use client";

import { createContext, useContext, useState, useEffect } from "react";

const SidebarContext = createContext(undefined);

export function SidebarProvider({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(true); // Default collapsed for SSR
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Auto expand/collapse based on screen width
  useEffect(() => {
    const handleResize = () => {
      // Expand sidebar on large screens (>= 1280px), collapse on smaller
      if (window.innerWidth >= 1280) {
        setIsCollapsed(false); // Expanded
      } else {
        setIsCollapsed(true); // Collapsed
      }
    };

    // Set initial state
    handleResize();

    // Listen for resize events
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        isMobileOpen,
        toggleSidebar,
        toggleMobileSidebar,
        closeMobileSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
