"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, CheckCircle, User, MapPin, Heart, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"

interface PatientRegistrationData {
  // Personal Information
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  dateOfBirth: string
  gender: string
  nik: string

  // Address Information
  address: string
  city: string
  province: string
  postalCode: string

  // Medical Information
  bloodType: string
  allergies: string
  medicalHistory: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelation: string

  // Insurance Information
  insuranceProvider: string
  insuranceNumber: string
  bpjsNumber: string
}

interface PatientProfile extends PatientRegistrationData {
  id: string
  registrationDate: string
  status: "active" | "pending" | "inactive"
}

export function PatientRegistrationForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState<PatientRegistrationData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    nik: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    bloodType: "",
    allergies: "",
    medicalHistory: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    insuranceProvider: "",
    insuranceNumber: "",
    bpjsNumber: "",
  })

  const updateFormData = (field: keyof PatientRegistrationData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (
          !formData.firstName ||
          !formData.lastName ||
          !formData.email ||
          !formData.password ||
          !formData.confirmPassword
        ) {
          setError("Semua field wajib diisi")
          return false
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Password tidak cocok")
          return false
        }
        if (formData.password.length < 6) {
          setError("Password minimal 6 karakter")
          return false
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
          setError("Format email tidak valid")
          return false
        }
        break
      case 2:
        if (!formData.phone || !formData.dateOfBirth || !formData.gender || !formData.nik) {
          setError("Semua field wajib diisi")
          return false
        }
        if (formData.nik.length !== 16 || !/^\d+$/.test(formData.nik)) {
          setError("NIK harus berupa 16 digit angka")
          return false
        }
        break
      case 3:
        if (!formData.address || !formData.city || !formData.province) {
          setError("Alamat, kota, dan provinsi wajib diisi")
          return false
        }
        break
      case 4:
        if (!formData.emergencyContactName || !formData.emergencyContactPhone || !formData.emergencyContactRelation) {
          setError("Informasi kontak darurat wajib diisi")
          return false
        }
        break
    }
    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1)
      setError("")
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1)
    setError("")
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) return

    setIsLoading(true)
    setError("")

    try {
      // Check if email already exists
      const existingPatients = JSON.parse(localStorage.getItem("patient_profiles") || "[]")
      if (existingPatients.some((p: PatientProfile) => p.email === formData.email)) {
        setError("Email sudah terdaftar")
        setIsLoading(false)
        return
      }

      if (existingPatients.some((p: PatientProfile) => p.nik === formData.nik)) {
        setError("NIK sudah terdaftar")
        setIsLoading(false)
        return
      }

      // Create patient profile
      const newPatient: PatientProfile = {
        ...formData,
        id: `patient_${Date.now()}`,
        registrationDate: new Date().toISOString(),
        status: "active",
      }

      // Save to localStorage
      const updatedPatients = [...existingPatients, newPatient]
      localStorage.setItem("patient_profiles", JSON.stringify(updatedPatients))

      const existingUsers = JSON.parse(localStorage.getItem("users") || "[]")
      const newUser = {
        id: newPatient.id,
        email: formData.email,
        password: formData.password, // In real app, this should be hashed
        role: "patient" as const,
        name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        status: "active" as const,
        createdAt: new Date().toISOString(),
        department: "Patient",
      }
      const updatedUsers = [...existingUsers, newUser]
      localStorage.setItem("users", JSON.stringify(updatedUsers))

      // Create user account for authentication
      const userData = {
        email: formData.email,
        role: "patient" as const,
        name: `${formData.firstName} ${formData.lastName}`,
        id: newPatient.id,
      }

      localStorage.setItem("user", JSON.stringify(userData))
      const encodedUserData = encodeURIComponent(JSON.stringify(userData))
      document.cookie = `user=${encodedUserData}; path=/; max-age=86400; SameSite=Lax`

      setSuccess(true)
      setTimeout(() => {
        router.push("/patient")
      }, 2000)
    } catch (err) {
      setError("Terjadi kesalahan saat mendaftar. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Registrasi Berhasil!</h3>
            <p className="text-muted-foreground mb-4">
              Akun Anda telah berhasil dibuat. Anda akan diarahkan ke dashboard pasien.
            </p>
            <p className="text-sm text-muted-foreground">Selamat datang di RS. Bhayangkara Blora!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <User className="h-12 w-12 text-blue-600 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Informasi Pribadi</h3>
              <p className="text-sm text-muted-foreground">Masukkan data pribadi Anda</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Nama Depan *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateFormData("firstName", e.target.value)}
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nama Belakang *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateFormData("lastName", e.target.value)}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                placeholder="john.doe@email.com"
              />
            </div>

            <div>
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => updateFormData("password", e.target.value)}
                  placeholder="Minimal 6 karakter"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Konfirmasi Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                  placeholder="Ulangi password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <CreditCard className="h-12 w-12 text-blue-600 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Data Identitas</h3>
              <p className="text-sm text-muted-foreground">Data kontak dan identitas pribadi</p>
            </div>

            <div>
              <Label htmlFor="nik">NIK (Nomor Induk Kependudukan) *</Label>
              <Input
                id="nik"
                value={formData.nik}
                onChange={(e) => updateFormData("nik", e.target.value.replace(/\D/g, "").slice(0, 16))}
                placeholder="1234567890123456"
                maxLength={16}
              />
              <p className="text-xs text-muted-foreground mt-1">16 digit angka sesuai KTP</p>
            </div>

            <div>
              <Label htmlFor="phone">Nomor Telepon *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => updateFormData("phone", e.target.value)}
                placeholder="+62 812-3456-7890"
              />
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Tanggal Lahir *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="gender">Jenis Kelamin *</Label>
              <Select value={formData.gender} onValueChange={(value) => updateFormData("gender", value)}>
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
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Alamat</h3>
              <p className="text-sm text-muted-foreground">Informasi alamat tempat tinggal</p>
            </div>

            <div>
              <Label htmlFor="address">Alamat Lengkap *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => updateFormData("address", e.target.value)}
                placeholder="Jl. Contoh No. 123, RT/RW 01/02"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Kota *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => updateFormData("city", e.target.value)}
                  placeholder="Blora"
                />
              </div>
              <div>
                <Label htmlFor="province">Provinsi *</Label>
                <Input
                  id="province"
                  value={formData.province}
                  onChange={(e) => updateFormData("province", e.target.value)}
                  placeholder="Jawa Tengah"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="postalCode">Kode Pos</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => updateFormData("postalCode", e.target.value)}
                placeholder="58219"
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Heart className="h-12 w-12 text-blue-600 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Informasi Medis & Asuransi</h3>
              <p className="text-sm text-muted-foreground">Data kesehatan, asuransi, dan kontak darurat</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bloodType">Golongan Darah</Label>
                <Select value={formData.bloodType} onValueChange={(value) => updateFormData("bloodType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih golongan darah" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="insuranceProvider">Jenis Asuransi</Label>
                <Select
                  value={formData.insuranceProvider}
                  onValueChange={(value) => updateFormData("insuranceProvider", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis asuransi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BPJS">BPJS Kesehatan</SelectItem>
                    <SelectItem value="Swasta">Asuransi Swasta</SelectItem>
                    <SelectItem value="Tidak Ada">Tidak Ada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.insuranceProvider === "BPJS" && (
              <div>
                <Label htmlFor="bpjsNumber">Nomor BPJS</Label>
                <Input
                  id="bpjsNumber"
                  value={formData.bpjsNumber}
                  onChange={(e) => updateFormData("bpjsNumber", e.target.value.replace(/\D/g, "").slice(0, 13))}
                  placeholder="0001234567890"
                  maxLength={13}
                />
                <p className="text-xs text-muted-foreground mt-1">13 digit nomor BPJS Kesehatan</p>
              </div>
            )}

            {formData.insuranceProvider === "Swasta" && (
              <div>
                <Label htmlFor="insuranceNumber">Nomor Polis Asuransi</Label>
                <Input
                  id="insuranceNumber"
                  value={formData.insuranceNumber}
                  onChange={(e) => updateFormData("insuranceNumber", e.target.value)}
                  placeholder="Nomor polis asuransi swasta"
                />
              </div>
            )}

            <div>
              <Label htmlFor="allergies">Alergi</Label>
              <Textarea
                id="allergies"
                value={formData.allergies}
                onChange={(e) => updateFormData("allergies", e.target.value)}
                placeholder="Sebutkan alergi obat atau makanan (jika ada)"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="medicalHistory">Riwayat Penyakit</Label>
              <Textarea
                id="medicalHistory"
                value={formData.medicalHistory}
                onChange={(e) => updateFormData("medicalHistory", e.target.value)}
                placeholder="Riwayat penyakit atau operasi (jika ada)"
                rows={2}
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Kontak Darurat *</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="emergencyContactName">Nama Kontak Darurat *</Label>
                  <Input
                    id="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={(e) => updateFormData("emergencyContactName", e.target.value)}
                    placeholder="Nama lengkap"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContactPhone">Nomor Telepon *</Label>
                    <Input
                      id="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => updateFormData("emergencyContactPhone", e.target.value)}
                      placeholder="+62 812-3456-7890"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContactRelation">Hubungan *</Label>
                    <Select
                      value={formData.emergencyContactRelation}
                      onValueChange={(value) => updateFormData("emergencyContactRelation", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih hubungan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spouse">Suami/Istri</SelectItem>
                        <SelectItem value="parent">Orang Tua</SelectItem>
                        <SelectItem value="child">Anak</SelectItem>
                        <SelectItem value="sibling">Saudara</SelectItem>
                        <SelectItem value="friend">Teman</SelectItem>
                        <SelectItem value="other">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Registrasi Pasien Baru</CardTitle>
        <CardDescription className="text-center">
          Langkah {currentStep} dari 4 - Lengkapi informasi Anda
        </CardDescription>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          ></div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {renderStep()}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
            Sebelumnya
          </Button>

          {currentStep < 4 ? (
            <Button onClick={handleNext}>Selanjutnya</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Mendaftar..." : "Daftar Sekarang"}
            </Button>
          )}
        </div>

        <div className="text-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Button variant="link" className="p-0 h-auto" onClick={() => router.push("/login")}>
              Masuk di sini
            </Button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
