"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"
import type { User } from "@/lib/data-manager"

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

interface UnifiedUserFormProps {
  user?: User | null
  onSubmit: (userData: any, doctorData?: any) => void
  onCancel: () => void
}

export function UnifiedUserForm({ user, onSubmit, onCancel }: UnifiedUserFormProps) {
  const [formData, setFormData] = useState({
    // Basic user data
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || ("patient" as "admin" | "doctor" | "patient"),
    status: user?.status || ("active" as "active" | "inactive"),

    password: "",
    confirmPassword: "",

    // Doctor-specific data
    phone: "",
    specialty: "",
    license: "",
    experience: "",
    education: "",
    bio: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")

    if (!user) {
      // Only validate passwords for new users
      if (!formData.password) {
        setPasswordError("Password wajib diisi")
        return
      }
      if (formData.password.length < 6) {
        setPasswordError("Password minimal 6 karakter")
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setPasswordError("Konfirmasi password tidak cocok")
        return
      }
    }

    // Basic user data
    const userData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: formData.status,
      department: formData.role === "doctor" ? formData.specialty : undefined,
      password: formData.password,
    }

    // If creating a doctor, prepare doctor-specific data
    let doctorData = null
    if (formData.role === "doctor") {
      doctorData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        specialty: formData.specialty,
        license: formData.license,
        experience: Number.parseInt(formData.experience) || 0,
        education: formData.education,
        bio: formData.bio,
      }
    }

    onSubmit(userData, doctorData)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (field === "password" || field === "confirmPassword") {
      setPasswordError("")
    }
  }

  const isDoctor = formData.role === "doctor"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic User Information */}
      <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">Informasi Dasar Pengguna</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">
                Nama Lengkap *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="bg-white/80 border-blue-100 focus:border-blue-300"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Masukkan alamat email"
                className="bg-white/80 border-blue-100 focus:border-blue-300"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-gray-700">
                Role *
              </Label>
              <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
                <SelectTrigger className="bg-white/80 border-blue-100">
                  <SelectValue placeholder="Pilih role pengguna" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="doctor">Dokter</SelectItem>
                  <SelectItem value="patient">Pasien</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-gray-700">
                Status
              </Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger className="bg-white/80 border-blue-100">
                  <SelectValue placeholder="Pilih status pengguna" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!user && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">
                  Password *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="bg-white/80 border-blue-100 focus:border-blue-300 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700">
                  Konfirmasi Password *
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    placeholder="Ulangi password"
                    className="bg-white/80 border-blue-100 focus:border-blue-300 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {passwordError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{passwordError}</div>
          )}
        </CardContent>
      </Card>

      {/* Doctor-specific Information */}
      {isDoctor && (
        <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">Informasi Dokter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700">
                  Nomor Telepon
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+62 812-3456-7890"
                  className="bg-white/80 border-blue-100 focus:border-blue-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty" className="text-gray-700">
                  Spesialisasi *
                </Label>
                <Select
                  value={formData.specialty}
                  onValueChange={(value) => handleChange("specialty", value)}
                  required={isDoctor}
                >
                  <SelectTrigger className="bg-white/80 border-blue-100">
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="license" className="text-gray-700">
                  Nomor STR
                </Label>
                <Input
                  id="license"
                  value={formData.license}
                  onChange={(e) => handleChange("license", e.target.value)}
                  placeholder="STR-12345678"
                  className="bg-white/80 border-blue-100 focus:border-blue-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience" className="text-gray-700">
                  Pengalaman (tahun)
                </Label>
                <Input
                  id="experience"
                  type="number"
                  value={formData.experience}
                  onChange={(e) => handleChange("experience", e.target.value)}
                  placeholder="5"
                  className="bg-white/80 border-blue-100 focus:border-blue-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="education" className="text-gray-700">
                Pendidikan
              </Label>
              <Input
                id="education"
                value={formData.education}
                onChange={(e) => handleChange("education", e.target.value)}
                placeholder="Universitas - Spesialisasi"
                className="bg-white/80 border-blue-100 focus:border-blue-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-gray-700">
                Biografi
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="Deskripsi singkat tentang dokter..."
                rows={3}
                className="bg-white/80 border-blue-100 focus:border-blue-300"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
        >
          Batal
        </Button>
        <Button
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
        >
          {user ? "Update" : "Tambah"} {isDoctor ? "Dokter" : "Pengguna"}
        </Button>
      </div>
    </form>
  )
}
