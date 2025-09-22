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

interface AdminProfile {
  id: string
  name: string
  email: string
  phone: string
  department: string
  position: string
  bio: string
  avatar?: string
  dateOfBirth?: string
  gender?: string
  address?: string
  city?: string
  province?: string
  postalCode?: string
  employeeId?: string
  joinDate?: string
  education?: string
  certifications?: string
  emergencyContact?: string
  emergencyPhone?: string
  accessLevel?: string
  lastLogin?: string
}

interface ProfileFormProps {
  profile: AdminProfile
  onSubmit: (data: Partial<AdminProfile>) => void
  onCancel: () => void
}

const departments = [
  "IT & Administration",
  "Human Resources",
  "Finance & Accounting",
  "Medical Records",
  "Patient Services",
  "Quality Assurance",
  "Security",
  "Maintenance",
  "Pharmacy",
  "Laboratory",
]

const positions = [
  "System Administrator",
  "Database Administrator",
  "IT Support Specialist",
  "HR Manager",
  "Finance Manager",
  "Records Manager",
  "Patient Coordinator",
  "Quality Manager",
  "Security Officer",
  "Maintenance Supervisor",
]

const accessLevels = ["Super Admin", "Admin", "Manager", "Supervisor", "Staff"]

export function ProfileForm({ profile, onSubmit, onCancel }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    name: profile.name || "",
    email: profile.email || "",
    phone: profile.phone || "",
    department: profile.department || "",
    position: profile.position || "",
    bio: profile.bio || "",
    dateOfBirth: profile.dateOfBirth || "",
    gender: profile.gender || "",
    address: profile.address || "",
    city: profile.city || "",
    province: profile.province || "",
    postalCode: profile.postalCode || "",
    employeeId: profile.employeeId || "",
    joinDate: profile.joinDate || "",
    education: profile.education || "",
    certifications: profile.certifications || "",
    emergencyContact: profile.emergencyContact || "",
    emergencyPhone: profile.emergencyPhone || "",
    accessLevel: profile.accessLevel || "",
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
      if (!formData.name || !formData.email || !formData.department || !formData.position) {
        setError("Nama, email, departemen, dan posisi wajib diisi")
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

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Masukkan nama lengkap"
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="admin@rsbhayangkara.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Nomor Telepon</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+62 812-3456-7890"
            />
          </div>
          <div>
            <Label htmlFor="dateOfBirth">Tanggal Lahir</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="gender">Jenis Kelamin</Label>
            <Select value={formData.gender} onValueChange={(value) => handleChange("gender", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis kelamin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Laki-laki</SelectItem>
                <SelectItem value="female">Perempuan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="employeeId">ID Karyawan</Label>
            <Input
              id="employeeId"
              value={formData.employeeId}
              onChange={(e) => handleChange("employeeId", e.target.value)}
              placeholder="EMP-2024-001"
            />
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 border-b pb-2">Informasi Profesional</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="department">Departemen *</Label>
            <Select value={formData.department} onValueChange={(value) => handleChange("department", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih departemen" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="position">Posisi/Jabatan *</Label>
            <Select value={formData.position} onValueChange={(value) => handleChange("position", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih posisi" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((pos) => (
                  <SelectItem key={pos} value={pos}>
                    {pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="accessLevel">Level Akses</Label>
            <Select value={formData.accessLevel} onValueChange={(value) => handleChange("accessLevel", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih level akses" />
              </SelectTrigger>
              <SelectContent>
                {accessLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="joinDate">Tanggal Bergabung</Label>
            <Input
              id="joinDate"
              type="date"
              value={formData.joinDate}
              onChange={(e) => handleChange("joinDate", e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="education">Pendidikan</Label>
          <Textarea
            id="education"
            value={formData.education}
            onChange={(e) => handleChange("education", e.target.value)}
            placeholder="Universitas - Fakultas - Tahun lulus"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="certifications">Sertifikasi</Label>
          <Textarea
            id="certifications"
            value={formData.certifications}
            onChange={(e) => handleChange("certifications", e.target.value)}
            placeholder="Daftar sertifikasi yang dimiliki"
            rows={2}
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
            onChange={(e) => handleChange("address", e.target.value)}
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
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="Blora"
            />
          </div>
          <div>
            <Label htmlFor="province">Provinsi</Label>
            <Input
              id="province"
              value={formData.province}
              onChange={(e) => handleChange("province", e.target.value)}
              placeholder="Jawa Tengah"
            />
          </div>
          <div>
            <Label htmlFor="postalCode">Kode Pos</Label>
            <Input
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) => handleChange("postalCode", e.target.value)}
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
              onChange={(e) => handleChange("emergencyContact", e.target.value)}
              placeholder="Nama keluarga terdekat"
            />
          </div>
          <div>
            <Label htmlFor="emergencyPhone">Nomor Telepon Darurat</Label>
            <Input
              id="emergencyPhone"
              value={formData.emergencyPhone}
              onChange={(e) => handleChange("emergencyPhone", e.target.value)}
              placeholder="+62 812-3456-7890"
            />
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 border-b pb-2">Bio Profesional</h4>
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            placeholder="Deskripsi singkat tentang peran dan tanggung jawab Anda..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Batal
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>
    </form>
  )
}
