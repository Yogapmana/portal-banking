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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.auth.login(email, password);

      if (response.success) {
        login(response.data.user, response.data.token);
        router.push("/dashboard");
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-[#034694]/5 via-blue-50 to-[#0575E6]/5 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#034694]/10 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#0575E6]/10 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#034694]/5 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md shadow-elevated card-hover fade-in relative z-10 border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-4 pb-6">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-4">
            <div className="avatar-gradient-chelsea w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg">
              <Building className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="space-y-2 text-center">
            <CardTitle className="text-3xl font-bold bg-linear-to-r from-[#034694] to-[#0575E6] bg-clip-text text-transparent">
              Portal Banking
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Customer Management System
            </CardDescription>
            <p className="text-sm text-muted-foreground">
              Masuk untuk mengakses dashboard Anda
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 fade-in">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-10 h-12 border-gray-200 focus:border-[#034694] focus:ring-2 focus:ring-[#034694]/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-10 h-12 border-gray-200 focus:border-[#034694] focus:ring-2 focus:ring-[#034694]/20 transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 btn-enhanced bg-linear-to-r from-[#034694] to-[#0575E6] hover:from-[#034694]/90 hover:to-[#0575E6] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Sign In...</span>
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
            <p className="text-sm text-muted-foreground">
              © 2024 Bank Nazi. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Customer Management System v1.0
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
