"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, Lock, Mail, Building } from "lucide-react";

const PRIMARY_COLOR = "#56B9F1";
const BUTTON_COLOR = "#0284C7"; // warna button matching

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsRateLimited(false);
    setLoading(true);

    try {
      const response = await api.auth.login(email, password);

      if (response.success) {
        login(response.data.user, response.data.accessToken);
        router.push("/dashboard");
      } else {
        setError(response.message || "Login gagal");
      }
    } catch (err) {
      if (err.status === 429) {
        setIsRateLimited(true);
        setError(
          err.message ||
            "Terlalu banyak percobaan login. Silakan tunggu 15 menit."
        );
      } else {
        setError(err.message || "Email atau password salah");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden"
      style={{ backgroundColor: PRIMARY_COLOR }}
    >
      <Card className="w-full max-w-md shadow-xl fade-in relative z-10 border-0 bg-white/95 backdrop-blur-sm rounded-2xl transition-all duration-300">
        <CardHeader className="space-y-4 pb-6 pt-6">
          <div className="flex justify-center mb-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              <Building className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="space-y-2 text-center">
            <CardTitle
              className="text-3xl font-bold"
              style={{ color: PRIMARY_COLOR }}
            >
              Portal Banking SalesLead
            </CardTitle>
            <p className="text-sm text-gray-500">
              Masuk untuk mengakses dashboard
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                className={`flex items-center gap-2 rounded-lg p-3 text-sm fade-in transition-all duration-300 ${
                  isRateLimited
                    ? "bg-orange-50 border border-orange-200 text-orange-700"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <div className="flex-1">
                  <span>{error}</span>
                  {isRateLimited && (
                    <p className="text-xs mt-1 opacity-90">
                      Silakan tunggu beberapa saat sebelum mencoba lagi.
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <Label
                htmlFor="email"
                className="text-sm font-semibold text-gray-700"
              >
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading || isRateLimited}
                  className="pl-10 h-12 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/30 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="password"
                className="text-sm font-semibold text-gray-700"
              >
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading || isRateLimited}
                  className="pl-10 h-12 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/30 rounded-xl"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-[#0284C7] text-white font-semibold shadow-lg hover:bg-[#056BB1] transition-all duration-300 flex items-center justify-center gap-2"
              disabled={loading || isRateLimited}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Signing In...</span>
                </div>
              ) : isRateLimited ? (
                <span className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Too Many Attempts
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Sign In
                </span>
              )}
            </Button>
          </form>

          <div className="text-center pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-800">
              © 2025 SalesLead. All rights reserved.
            </p>
            <p className="text-xs text-gray-800 mt-1">
              Customer Management Portal Banking
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
