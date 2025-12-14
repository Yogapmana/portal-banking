"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  User,
  Phone,
  Briefcase,
  GraduationCap,
  Heart,
  Home,
  CreditCard,
  Plus,
  Sparkles,
} from "lucide-react";
import api from "@/lib/api";

const JOB_OPTIONS = [
  { value: "admin.", label: "Admin" },
  { value: "blue-collar", label: "Blue Collar" },
  { value: "entrepreneur", label: "Entrepreneur" },
  { value: "housemaid", label: "Housemaid" },
  { value: "management", label: "Management" },
  { value: "retired", label: "Retired" },
  { value: "self-employed", label: "Self Employed" },
  { value: "services", label: "Services" },
  { value: "student", label: "Student" },
  { value: "technician", label: "Technician" },
  { value: "unemployed", label: "Unemployed" },
  { value: "unknown", label: "Unknown" },
];

const EDUCATION_OPTIONS = [
  { value: "basic.4y", label: "Basic 4 Year" },
  { value: "basic.6y", label: "Basic 6 Year" },
  { value: "basic.9y", label: "Basic 9 Year" },
  { value: "high.school", label: "High School" },
  { value: "illiterate", label: "Illiterate" },
  { value: "professional.course", label: "Professional Course" },
  { value: "university.degree", label: "University Degree" },
  { value: "unknown", label: "Unknown" },
];

const MARITAL_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "divorced", label: "Divorced" },
  { value: "unknown", label: "Unknown" },
];

const HOUSING_OPTIONS = [
  { value: "yes", label: "Punya Rumah" },
  { value: "no", label: "Tidak Punya Rumah" },
  { value: "unknown", label: "Tidak Diketahui" },
];

const LOAN_OPTIONS = [
  { value: "yes", label: "Punya Pinjaman" },
  { value: "no", label: "Tidak Punya Pinjaman" },
  { value: "unknown", label: "Tidak Diketahui" },
];

const DEFAULT_OPTIONS = [
  { value: "no", label: "Tidak Ada Kredit Macet" },
  { value: "yes", label: "Ada Kredit Macet" },
  { value: "unknown", label: "Tidak Diketahui" },
];

const initialFormState = {
  name: "",
  phoneNumber: "",
  age: "",
  job: "",
  education: "",
  marital: "",
  housing: "",
  loan: "",
  default: "no",
};

export default function CreateCustomerDialog({ onSuccess, trigger }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.phoneNumber || !formData.age) {
      toast.error("Nama, nomor telepon, dan usia wajib diisi");
      return;
    }

    if (!formData.job || !formData.education || !formData.marital) {
      toast.error("Pekerjaan, pendidikan, dan status pernikahan wajib diisi");
      return;
    }

    if (!formData.housing || !formData.loan) {
      toast.error("Status rumah dan pinjaman wajib diisi");
      return;
    }

    const ageNum = parseInt(formData.age);
    if (isNaN(ageNum) || ageNum < 17 || ageNum > 100) {
      toast.error("Usia harus antara 17 - 100 tahun");
      return;
    }

    setLoading(true);

    try {
      const customerData = {
        ...formData,
        age: ageNum,
      };

      const response = await api.customers.create(customerData);

      toast.success("Nasabah berhasil ditambahkan!", {
        description: response.data?.score
          ? `Skor ML: ${(response.data.score * 100).toFixed(1)}%`
          : "Data telah disimpan",
      });

      // Reset form
      setFormData(initialFormState);
      setOpen(false);

      // Callback to parent
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      toast.error("Gagal menambahkan nasabah", {
        description: err.message || "Terjadi kesalahan saat menyimpan data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      // Reset form when closing
      setFormData(initialFormState);
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-[#056aa8] hover:bg-[#034e75] text-white">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Nasabah
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-[#056aa8]" />
            Tambah Nasabah Baru
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>
              Skor prioritas akan dihitung otomatis menggunakan ML model
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Informasi Dasar */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
              <User className="h-4 w-4" />
              Informasi Dasar
            </h3>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="create-name">
                Nama <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="create-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="pl-9"
                  placeholder="Nama lengkap nasabah"
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="create-phone">
                Nomor Telepon <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="create-phone"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  className="pl-9"
                  placeholder="08xxxxxxxxxx"
                  required
                />
              </div>
            </div>

            {/* Age */}
            <div className="space-y-2">
              <Label htmlFor="create-age">
                Usia <span className="text-red-500">*</span>
              </Label>
              <Input
                id="create-age"
                type="number"
                min="17"
                max="100"
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: e.target.value })
                }
                placeholder="Usia dalam tahun (17-100)"
                required
              />
            </div>
          </div>

          {/* Informasi Pekerjaan & Pendidikan */}
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Pekerjaan & Pendidikan
            </h3>

            {/* Job */}
            <div className="space-y-2">
              <Label htmlFor="create-job">
                Pekerjaan <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.job}
                onValueChange={(value) =>
                  setFormData({ ...formData, job: value })
                }
                required
              >
                <SelectTrigger className="w-full">
                  <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Pilih Pekerjaan" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_OPTIONS.map((job) => (
                    <SelectItem key={job.value} value={job.value}>
                      {job.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Education */}
            <div className="space-y-2">
              <Label htmlFor="create-education">
                Pendidikan <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.education}
                onValueChange={(value) =>
                  setFormData({ ...formData, education: value })
                }
                required
              >
                <SelectTrigger className="w-full">
                  <GraduationCap className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Pilih Pendidikan" />
                </SelectTrigger>
                <SelectContent>
                  {EDUCATION_OPTIONS.map((edu) => (
                    <SelectItem key={edu.value} value={edu.value}>
                      {edu.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Marital Status */}
            <div className="space-y-2">
              <Label htmlFor="create-marital">
                Status Pernikahan <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.marital}
                onValueChange={(value) =>
                  setFormData({ ...formData, marital: value })
                }
                required
              >
                <SelectTrigger className="w-full">
                  <Heart className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  {MARITAL_OPTIONS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Informasi Finansial */}
          <div className="space-y-4 p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Informasi Finansial
            </h3>

            {/* Housing */}
            <div className="space-y-2">
              <Label htmlFor="create-housing">
                Status Rumah <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.housing}
                onValueChange={(value) =>
                  setFormData({ ...formData, housing: value })
                }
                required
              >
                <SelectTrigger className="w-full">
                  <Home className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Pilih Status Rumah" />
                </SelectTrigger>
                <SelectContent>
                  {HOUSING_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Loan */}
            <div className="space-y-2">
              <Label htmlFor="create-loan">
                Status Pinjaman <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.loan}
                onValueChange={(value) =>
                  setFormData({ ...formData, loan: value })
                }
                required
              >
                <SelectTrigger className="w-full">
                  <CreditCard className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Pilih Status Pinjaman" />
                </SelectTrigger>
                <SelectContent>
                  {LOAN_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Default (Kredit Macet) */}
            <div className="space-y-2">
              <Label htmlFor="create-default">Status Kredit Macet</Label>
              <Select
                value={formData.default}
                onValueChange={(value) =>
                  setFormData({ ...formData, default: value })
                }
              >
                <SelectTrigger className="w-full">
                  <CreditCard className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#056aa8] hover:bg-[#034e75]"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Menyimpan..." : "Simpan Nasabah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
