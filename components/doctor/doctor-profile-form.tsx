"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Save, X } from "lucide-react"

interface DoctorProfile {
  id: string
  name: string
  email: string
  phone: string
  specialization: string
  license: string
  experience: string
  bio: string
  avatar?: string
  dateOfBirth?: string
  gender?: string
  address?: string
  city?: string
  province?: string
  postalCode?: string
  education?: string
  certifications?: string
  languages?: string
  consultationFee?: string
  emergencyContact?: string
  emergencyPhone?: string
}

interface DoctorProfileFormProps {
  profile: DoctorProfile
  onSubmit: (profileData: Partial<DoctorProfile>) => void
  onCancel: () => void
}

const specializations = [
  "Kardiologi",
  "Dermatologi",
  "Pediatri",
  "Ortopedi",
  "Neurologi",
  "Penyakit Dalam",
  "Bedah Umum",
  "Mata",
  "THT",
  "Psikiatri",
  "Radiologi",
  "Anestesi",
]

export function DoctorProfileForm({ profile, onSubmit, onCancel }: DoctorProfileFormProps) {
  const [formData, setFormData] = useState({
    name: profile.name || "",
    email: profile.email || "",
    phone: profile.phone || "",
    specialization: profile.specialization || "",
    license: profile.license || "",
    experience: profile.experience || "",
    bio: profile.bio || "",
    dateOfBirth: profile.dateOfBirth || "",
    gender: profile.gender || "",
    address: profile.address || "",
    city: profile.city || "",
    province: profile.province || "",
    postalCode: profile.postalCode || "",
    education: profile.education || "",
    certifications: profile.certifications || "",
    languages: profile.languages || "",
    consultationFee: profile.consultationFee || "",
    emergencyContact: profile.emergencyContact || "",
    emergencyPhone: profile.emergencyPhone || "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Basic validation
      if (!formData.name || !formData.email || !formData.specialization) {
        setError("Nama, email, dan spesialisasi wajib diisi")
        return
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError("Format email tidak valid")
        return
      }

      // Phone validation (Indonesian format)
      if (formData.phone && !/^(\+62|62|0)[0-9]{9,13}$/.test(formData.phone.replace(/[\s-]/g, ""))) {
        setError("Format nomor telepon tidak valid")
        return
      }

      onSubmit(formData)
      setSuccess("Profil berhasil diperbarui")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError("Gagal memperbarui profil")
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value })
    setError("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 border-b pb-2">Informasi Dasar</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nama Lengkap *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Dr. Nama Lengkap"
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="dokter@rsbhayangkara.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Nomor Telepon</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="+62 812-3456-7890"
            />
          </div>
          <div>
            <Label htmlFor="dateOfBirth">Tanggal Lahir</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => updateField("dateOfBirth", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="gender">Jenis Kelamin</Label>
            <Select value={formData.gender} onValueChange={(value) => updateField("gender", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis kelamin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Laki-laki</SelectItem>
                <SelectItem value="female">Perempuan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 border-b pb-2">Informasi Profesional</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="specialization">Spesialisasi *</Label>
            <Select value={formData.specialization} onValueChange={(value) => updateField("specialization", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih spesialisasi" />
              </SelectTrigger>
              <SelectContent>
                {specializations.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="license">Nomor STR</Label>
            <Input
              id="license"
              value={formData.license}
              onChange={(e) => updateField("license", e.target.value)}
              placeholder="STR-12345678"
            />
          </div>
          <div>
            <Label htmlFor="experience">Pengalaman</Label>
            <Input
              id="experience"
              value={formData.experience}
              onChange={(e) => updateField("experience", e.target.value)}
              placeholder="5 tahun"
            />
          </div>
          <div>
            <Label htmlFor="consultationFee">Tarif Konsultasi (Rp)</Label>
            <Input
              id="consultationFee"
              type="number"
              value={formData.consultationFee}
              onChange={(e) => updateField("consultationFee", e.target.value)}
              placeholder="150000"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="education">Pendidikan</Label>
          <Textarea
            id="education"
            value={formData.education}
            onChange={(e) => updateField("education", e.target.value)}
            placeholder="Universitas - Fakultas - Tahun lulus"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="certifications">Sertifikasi</Label>
          <Textarea
            id="certifications"
            value={formData.certifications}
            onChange={(e) => updateField("certifications", e.target.value)}
            placeholder="Daftar sertifikasi yang dimiliki"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="languages">Bahasa yang Dikuasai</Label>
          <Input
            id="languages"
            value={formData.languages}
            onChange={(e) => updateField("languages", e.target.value)}
            placeholder="Indonesia, Inggris, Jawa"
          />
        </div>
      </div>

      {/* Address Information */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 border-b pb-2">Alamat</h4>
        <div>
          <Label htmlFor="address">Alamat Lengkap</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => updateField("address", e.target.value)}
            placeholder="Jalan, RT/RW, Kelurahan"
            rows={2}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city">Kota</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => updateField("city", e.target.value)}
              placeholder="Blora"
            />
          </div>
          <div>
            <Label htmlFor="province">Provinsi</Label>
            <Input
              id="province"
              value={formData.province}
              onChange={(e) => updateField("province", e.target.value)}
              placeholder="Jawa Tengah"
            />
          </div>
          <div>
            <Label htmlFor="postalCode">Kode Pos</Label>
            <Input
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) => updateField("postalCode", e.target.value)}
              placeholder="58219"
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 border-b pb-2">Kontak Darurat</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="emergencyContact">Nama Kontak Darurat</Label>
            <Input
              id="emergencyContact"
              value={formData.emergencyContact}
              onChange={(e) => updateField("emergencyContact", e.target.value)}
              placeholder="Nama keluarga terdekat"
            />
          </div>
          <div>
            <Label htmlFor="emergencyPhone">Nomor Telepon Darurat</Label>
            <Input
              id="emergencyPhone"
              value={formData.emergencyPhone}
              onChange={(e) => updateField("emergencyPhone", e.target.value)}
              placeholder="+62 812-3456-7890"
            />
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 border-b pb-2">Biografi</h4>
        <div>
          <Label htmlFor="bio">Bio Profesional</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => updateField("bio", e.target.value)}
            placeholder="Ceritakan tentang pengalaman, keahlian, dan pendekatan medis Anda..."
            rows={4}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Batal
        </Button>
      </div>
    </form>
  )
}
