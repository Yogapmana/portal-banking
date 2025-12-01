"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Loader2, Mail, Lock } from "lucide-react";

const PRIMARY_COLOR = "#56B9F1";
const PRIMARY_COLOR_DARK = "#0284C7";

export default function CreateUserForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "SALES",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSuccess(formData);
      setFormData({
        email: "",
        password: "",
        role: "SALES",
      });
    } catch (err) {
      setError(err.message || "Gagal membuat user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className="border-0 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300"
      style={{ borderColor: PRIMARY_COLOR + "33" }}
    >
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="space-y-1 relative">
            <Label htmlFor="email" className="font-semibold text-gray-700">
              Email <span className="text-red-500">*</span>
            </Label>
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              className="rounded-xl border-gray-200 pl-10 h-12 focus:border-[PRIMARY_COLOR] focus:ring-2 focus:ring-[#56B9F133] transition-all"
            />
          </div>

          {/* Password */}
          <div className="space-y-1 relative">
            <Label htmlFor="password" className="font-semibold text-gray-700">
              Password <span className="text-red-500">*</span>
            </Label>
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              id="password"
              type="password"
              placeholder="Minimal 6 karakter"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              minLength={6}
              className="rounded-xl border-gray-200 pl-10 h-12 focus:border-[PRIMARY_COLOR] focus:ring-2 focus:ring-[#56B9F133] transition-all"
            />
          </div>

          {/* Role */}
          <div className="space-y-1">
            <Label htmlFor="role" className="font-semibold text-gray-700">
              Role
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger
                id="role"
                className="rounded-xl border-gray-200 h-12 focus:border-[PRIMARY_COLOR] focus:ring-2 focus:ring-[#56B9F133] transition-all"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="SALES_MANAGER">Sales Manager</SelectItem>
                <SelectItem value="SALES">Sales</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-[#56B9F1] text-white font-semibold shadow-md hover:shadow-lg hover:bg-[#0284C7] transition-all duration-300 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Membuat User...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Buat User
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
