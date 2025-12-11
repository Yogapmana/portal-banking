"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import api from "@/lib/api";

const JOB_OPTIONS = [
  "admin.",
  "blue-collar",
  "entrepreneur",
  "housemaid",
  "management",
  "retired",
  "self-employed",
  "services",
  "student",
  "technician",
  "unemployed",
  "unknown",
];

const EDUCATION_OPTIONS = [
  "basic.4y",
  "basic.6y",
  "basic.9y",
  "high.school",
  "illiterate",
  "professional.course",
  "university.degree",
  "unknown",
];

const MARITAL_OPTIONS = ["single", "married", "divorced", "unknown"];

export default function EditCustomerDialog({
  customer,
  open,
  onOpenChange,
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    age: "",
    job: "",
    education: "",
    marital: "",
    housing: "",
    loan: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        phoneNumber: customer.phoneNumber || "",
        age: customer.age?.toString() || "",
        job: customer.job || "",
        education: customer.education || "",
        marital: customer.marital || "",
        housing: customer.housing || "",
        loan: customer.loan || "",
      });
    }
  }, [customer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare update data (only send changed/non-empty fields)
      const updateData = {};

      if (formData.name !== customer.name) updateData.name = formData.name;
      if (formData.phoneNumber !== customer.phoneNumber)
        updateData.phoneNumber = formData.phoneNumber;
      if (formData.age && parseInt(formData.age) !== customer.age)
        updateData.age = parseInt(formData.age);
      if (formData.job !== customer.job) updateData.job = formData.job;
      if (formData.education !== customer.education)
        updateData.education = formData.education;
      if (formData.marital !== customer.marital)
        updateData.marital = formData.marital;
      if (formData.housing !== customer.housing)
        updateData.housing = formData.housing;
      if (formData.loan !== customer.loan) updateData.loan = formData.loan;

      if (Object.keys(updateData).length === 0) {
        toast.info("Tidak ada perubahan data");
        onOpenChange(false);
        return;
      }

      const response = await api.customers.update(customer.id, updateData);

      // Response berhasil jika tidak throw error - kirim data updated ke parent
      toast.success("Data nasabah berhasil diupdate!");
      onSuccess(response.data || { ...customer, ...updateData });
      onOpenChange(false);
    } catch (err) {
      toast.error("Gagal mengupdate data nasabah", {
        description: err.message || "Terjadi kesalahan saat mengupdate data.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Data Nasabah</DialogTitle>
          <DialogDescription>
            Ubah data nasabah. Hanya field yang diubah akan disimpan.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nama</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="edit-name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="pl-9"
                placeholder="Nama nasabah"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="edit-phone">Nomor Telepon</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="edit-phone"
                type="text"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                className="pl-9"
                placeholder="08xxxxxxxxxx"
              />
            </div>
          </div>

          {/* Age */}
          <div className="space-y-2">
            <Label htmlFor="edit-age">Usia</Label>
            <Input
              id="edit-age"
              type="number"
              min="17"
              max="100"
              value={formData.age}
              onChange={(e) =>
                setFormData({ ...formData, age: e.target.value })
              }
              placeholder="Usia dalam tahun"
            />
          </div>

          {/* Job */}
          <div className="space-y-2">
            <Label htmlFor="edit-job">Pekerjaan</Label>
            <Select
              value={formData.job}
              onValueChange={(value) =>
                setFormData({ ...formData, job: value })
              }
            >
              <SelectTrigger className="w-full">
                <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Pilih Pekerjaan" />
              </SelectTrigger>
              <SelectContent>
                {JOB_OPTIONS.map((job) => (
                  <SelectItem key={job} value={job} className="capitalize">
                    {job.replace(/\./g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Education */}
          <div className="space-y-2">
            <Label htmlFor="edit-education">Pendidikan</Label>
            <Select
              value={formData.education}
              onValueChange={(value) =>
                setFormData({ ...formData, education: value })
              }
            >
              <SelectTrigger className="w-full">
                <GraduationCap className="h-4 w-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Pilih Pendidikan" />
              </SelectTrigger>
              <SelectContent>
                {EDUCATION_OPTIONS.map((edu) => (
                  <SelectItem key={edu} value={edu} className="capitalize">
                    {edu.replace(/\./g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Marital Status */}
          <div className="space-y-2">
            <Label htmlFor="edit-marital">Status Pernikahan</Label>
            <Select
              value={formData.marital}
              onValueChange={(value) =>
                setFormData({ ...formData, marital: value })
              }
            >
              <SelectTrigger className="w-full">
                <Heart className="h-4 w-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Pilih Status" />
              </SelectTrigger>
              <SelectContent>
                {MARITAL_OPTIONS.map((status) => (
                  <SelectItem
                    key={status}
                    value={status}
                    className="capitalize"
                  >
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Housing */}
          <div className="space-y-2">
            <Label htmlFor="edit-housing">Status Rumah</Label>
            <Select
              value={formData.housing}
              onValueChange={(value) =>
                setFormData({ ...formData, housing: value })
              }
            >
              <SelectTrigger className="w-full">
                <Home className="h-4 w-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Pilih Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Punya Rumah</SelectItem>
                <SelectItem value="no">Tidak Punya Rumah</SelectItem>
                <SelectItem value="unknown">Tidak Diketahui</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Loan */}
          <div className="space-y-2">
            <Label htmlFor="edit-loan">Status Pinjaman</Label>
            <Select
              value={formData.loan}
              onValueChange={(value) =>
                setFormData({ ...formData, loan: value })
              }
            >
              <SelectTrigger className="w-full">
                <CreditCard className="h-4 w-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Pilih Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Punya Pinjaman</SelectItem>
                <SelectItem value="no">Tidak Punya Pinjaman</SelectItem>
                <SelectItem value="unknown">Tidak Diketahui</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
