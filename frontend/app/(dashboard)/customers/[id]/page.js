"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ConversationGuideBox from "@/components/dashboard/ConversationGuideBox";
import CallLogForm from "@/components/dashboard/CallLogForm";
import CallLogHistory from "@/components/dashboard/CallLogHistory";
import {
  ArrowLeft,
  Phone,
  Mail,
  Home,
  Briefcase,
  GraduationCap,
  Heart,
  Calendar,
  TrendingUp,
  User,
} from "lucide-react";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshCallLogs, setRefreshCallLogs] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchCustomerDetail();
    }
  }, [params.id]);

  const fetchCustomerDetail = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.customers.getById(params.id);
      // Backend returns customer directly, not wrapped in { data: customer }
      setCustomer(response);
    } catch (err) {
      setError(err.message || "Failed to load customer details");
      console.error("Error fetching customer:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatScore = (score) => {
    if (score === null || score === undefined) return "N/A";
    return `${(score * 100).toFixed(1)}%`;
  };

  const getScoreColor = (score) => {
    if (score >= 0.7) return "text-green-700 bg-gradient-success";
    if (score >= 0.4) return "text-orange-700 bg-gradient-warning";
    if (score === null || score === undefined)
      return "text-gray-600 bg-gray-100";
    return "text-red-700 bg-gradient-danger";
  };

  const handleCallLogSuccess = () => {
    // Trigger refresh of call logs
    setRefreshCallLogs((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
          <div>
            <Skeleton className="h-[600px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Customer Detail</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Error Loading Customer
              </h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => router.back()}>
                Kembali ke Daftar Customer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Detail</h1>
          <p className="text-sm text-muted-foreground">
            Informasi lengkap dan riwayat panggilan
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Header Card */}
          <Card className="border-border/50 shadow-elevated">
            <CardHeader className="bg-linear-to-r">
              <div className="flex items-start gap-4">
                <div className="avatar-gradient-chelsea w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl shrink-0 shadow-lg">
                  {(customer.name || "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-2xl mb-2">
                    {customer.name || "Unknown Customer"}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className="text-sm">
                      <User className="w-3 h-3 mr-1" />
                      {customer.age} tahun
                    </Badge>
                    <Badge variant="outline" className="text-sm capitalize">
                      <Heart className="w-3 h-3 mr-1" />
                      {customer.marital}
                    </Badge>
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold shadow-md ${getScoreColor(
                        customer.score
                      )}`}
                    >
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Score: {formatScore(customer.score)}
                    </div>
                  </div>
                  {user?.role === "SALES_MANAGER" && (
                    <div className="text-sm text-muted-foreground">
                      {customer.assignedTo ? (
                        <span>
                          Assigned to:{" "}
                          <span className="font-medium text-foreground">
                            {customer.assignedTo.email?.split("@")[0]}
                          </span>
                        </span>
                      ) : (
                        <span className="italic">Unassigned</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Contact Information */}
          <Card className="border-border/50 shadow-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#034694]" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone Number</p>
                  <p className="font-medium">{customer.phoneNumber || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Contact Method
                  </p>
                  <p className="font-medium capitalize">{customer.contact}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Demographic Information */}
          <Card className="border-border/50 shadow-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#034694]" />
                Demographic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4 text-[#034694]" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Occupation
                    </p>
                  </div>
                  <p className="font-semibold capitalize text-lg">
                    {customer.job}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-4 h-4 text-[#034694]" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Education
                    </p>
                  </div>
                  <p className="font-semibold capitalize text-lg">
                    {customer.education?.replace(/\./g, " ")}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Home className="w-4 h-4 text-[#034694]" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Housing Status
                    </p>
                  </div>
                  <div
                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold ${
                      customer.housing === "yes"
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {customer.housing === "yes" ? "House Owner" : "No House"}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-[#034694]" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Loan Status
                    </p>
                  </div>
                  <div
                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold ${
                      customer.loan === "yes"
                        ? "bg-orange-100 text-orange-700 border border-orange-200"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {customer.loan === "yes" ? "Has Loan" : "No Loan"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campaign Information */}
          <Card className="border-border/50 shadow-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#034694]" />
                Campaign Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-[#034694]">
                    {customer.campaign}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Campaigns
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-[#034694]">
                    {customer.previous}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Previous Contacts
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-[#034694]">
                    {customer.pdays}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Days Since Last Contact
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-[#034694]">
                    {customer.duration}s
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last Call Duration
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground mb-1">
                  Previous Outcome
                </p>
                <p className="font-semibold capitalize">{customer.poutcome}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right Side */}
        <div className="lg:col-span-1">
          {/* AI Conversation Guide Box */}
          <ConversationGuideBox customerId={customer.id} />

          {/* Call Log Form */}
          <div className="mt-6">
            <CallLogForm
              customerId={customer.id}
              onSuccess={handleCallLogSuccess}
            />
          </div>

          {/* Call Log History */}
          <div className="mt-6">
            <CallLogHistory
              customerId={customer.id}
              refreshTrigger={refreshCallLogs}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
