import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Prevents FOIT (Flash of Invisible Text)
});

export const metadata = {
  title: "Portal Banking - Customer Management",
  description: "Customer Management System for Banking",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} antialiased overflow-x-hidden overflow-y-hidden`}
      >
        <ErrorBoundary>
          <AuthProvider>{children}</AuthProvider>
        </ErrorBoundary>
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: "12px",
            },
          }}
        />
      </body>
    </html>
  );
}
