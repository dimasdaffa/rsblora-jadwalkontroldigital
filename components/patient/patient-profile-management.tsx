"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Edit, Save, X, User, MapPin, Heart, Shield } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"

interface PatientProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  nik: string
  bpjsNumber: string
  address: string
  city: string
  province: string
  postalCode: string
  bloodType: string
  allergies: string
  medicalHistory: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelation: string
  insuranceProvider: string
  insuranceNumber: string
  registrationDate: string
  status: "active" | "pending" | "inactive"
}

export function PatientProfileManagement() {
  const [profile, setProfile] = useState<PatientProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<PatientProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const currentUser = getCurrentUser()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = () => {
    if (!currentUser) return

    const profiles = JSON.parse(localStorage.getItem("patient_profiles") || "[]")
    const userProfile = profiles.find((p: PatientProfile) => p.email === currentUser.email)

    if (userProfile) {
      setProfile(userProfile)
      setEditedProfile(userProfile)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setError("")
    setSuccess("")
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedProfile(profile)
    setError("")
  }

  const handleSave = async () => {
    if (!editedProfile || !profile) return

    setIsLoading(true)
    setError("")

    try {
      const profiles = JSON.parse(localStorage.getItem("patient_profiles") || "[]")
      const updatedProfiles = profiles.map((p: PatientProfile) => (p.id === profile.id ? editedProfile : p))

      localStorage.setItem("patient_profiles", JSON.stringify(updatedProfiles))
      setProfile(editedProfile)
      setIsEditing(false)
      setSuccess("Profil berhasil diperbarui")

      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError("Gagal memperbarui profil")
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = (field: keyof PatientProfile, value: string) => {
    if (editedProfile) {
      setEditedProfile({ ...editedProfile, [field]: value })
    }
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Profil tidak ditemukan</p>
        </CardContent>
      </Card>
    )
  }

  const displayProfile = isEditing ? editedProfile! : profile

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Profil Pasien</h3>
          <p className="text-gray-600">Kelola informasi pribadi dan medis Anda</p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profil
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Batal
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            </>
          )}
        </div>
      </div>

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

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informasi Pribadi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nama Depan</Label>
              {isEditing ? (
                <Input value={displayProfile.firstName} onChange={(e) => updateField("firstName", e.target.value)} />
              ) : (
                <p className="text-sm text-gray-600 mt-1">{displayProfile.firstName}</p>
              )}
            </div>
            <div>
              <Label>Nama Belakang</Label>
              {isEditing ? (
                <Input value={displayProfile.lastName} onChange={(e) => updateField("lastName", e.target.value)} />
              ) : (
                <p className="text-sm text-gray-600 mt-1">{displayProfile.lastName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <p className="text-sm text-gray-600 mt-1">{displayProfile.email}</p>
              <p className="text-xs text-muted-foreground">Email tidak dapat diubah</p>
            </div>
            <div>
              <Label>Nomor Telepon</Label>
              {isEditing ? (
                <Input value={displayProfile.phone} onChange={(e) => updateField("phone", e.target.value)} />
              ) : (
                <p className="text-sm text-gray-600 mt-1">{displayProfile.phone}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>NIK (Nomor Induk Kependudukan)</Label>
              {isEditing ? (
                <Input
                  value={displayProfile.nik || ""}
                  onChange={(e) => updateField("nik", e.target.value)}
                  placeholder="16 digit NIK"
                  maxLength={16}
                />
              ) : (
                <p className="text-sm text-gray-600 mt-1">{displayProfile.nik || "Belum diisi"}</p>
              )}
            </div>
            <div>
              <Label>Nomor BPJS</Label>
              {isEditing ? (
                <Input
                  value={displayProfile.bpjsNumber || ""}
                  onChange={(e) => updateField("bpjsNumber", e.target.value)}
                  placeholder="13 digit nomor BPJS"
                  maxLength={13}
                />
              ) : (
                <p className="text-sm text-gray-600 mt-1">{displayProfile.bpjsNumber || "Belum diisi"}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tanggal Lahir</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={displayProfile.dateOfBirth}
                  onChange={(e) => updateField("dateOfBirth", e.target.value)}
                />
              ) : (
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(displayProfile.dateOfBirth).toLocaleDateString("id-ID")}
                </p>
              )}
            </div>
            <div>
              <Label>Jenis Kelamin</Label>
              {isEditing ? (
                <Select value={displayProfile.gender} onValueChange={(value) => updateField("gender", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Laki-laki</SelectItem>
                    <SelectItem value="female">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-gray-600 mt-1">
                  {displayProfile.gender === "male" ? "Laki-laki" : "Perempuan"}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Alamat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Alamat Lengkap</Label>
            {isEditing ? (
              <Textarea
                value={displayProfile.address}
                onChange={(e) => updateField("address", e.target.value)}
                rows={3}
              />
            ) : (
              <p className="text-sm text-gray-600 mt-1">{displayProfile.address}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Kota</Label>
              {isEditing ? (
                <Input value={displayProfile.city} onChange={(e) => updateField("city", e.target.value)} />
              ) : (
                <p className="text-sm text-gray-600 mt-1">{displayProfile.city}</p>
              )}
            </div>
            <div>
              <Label>Provinsi</Label>
              {isEditing ? (
                <Input value={displayProfile.province} onChange={(e) => updateField("province", e.target.value)} />
              ) : (
                <p className="text-sm text-gray-600 mt-1">{displayProfile.province}</p>
              )}
            </div>
            <div>
              <Label>Kode Pos</Label>
              {isEditing ? (
                <Input value={displayProfile.postalCode} onChange={(e) => updateField("postalCode", e.target.value)} />
              ) : (
                <p className="text-sm text-gray-600 mt-1">{displayProfile.postalCode || "-"}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Informasi Medis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Golongan Darah</Label>
              {isEditing ? (
                <Select value={displayProfile.bloodType} onValueChange={(value) => updateField("bloodType", value)}>
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
              ) : (
                <p className="text-sm text-gray-600 mt-1">{displayProfile.bloodType || "-"}</p>
              )}
            </div>
            <div>
              <Label>Status</Label>
              <div className="mt-1">
                <Badge variant={displayProfile.status === "active" ? "default" : "secondary"}>
                  {displayProfile.status === "active" ? "Aktif" : "Tidak Aktif"}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <Label>Alergi</Label>
            {isEditing ? (
              <Textarea
                value={displayProfile.allergies}
                onChange={(e) => updateField("allergies", e.target.value)}
                placeholder="Sebutkan alergi obat atau makanan"
                rows={2}
              />
            ) : (
              <p className="text-sm text-gray-600 mt-1">{displayProfile.allergies || "Tidak ada"}</p>
            )}
          </div>

          <div>
            <Label>Riwayat Penyakit</Label>
            {isEditing ? (
              <Textarea
                value={displayProfile.medicalHistory}
                onChange={(e) => updateField("medicalHistory", e.target.value)}
                placeholder="Riwayat penyakit atau operasi"
                rows={2}
              />
            ) : (
              <p className="text-sm text-gray-600 mt-1">{displayProfile.medicalHistory || "Tidak ada"}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Kontak Darurat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nama Kontak Darurat</Label>
              {isEditing ? (
                <Input
                  value={displayProfile.emergencyContactName}
                  onChange={(e) => updateField("emergencyContactName", e.target.value)}
                />
              ) : (
                <p className="text-sm text-gray-600 mt-1">{displayProfile.emergencyContactName}</p>
              )}
            </div>
            <div>
              <Label>Nomor Telepon</Label>
              {isEditing ? (
                <Input
                  value={displayProfile.emergencyContactPhone}
                  onChange={(e) => updateField("emergencyContactPhone", e.target.value)}
                />
              ) : (
                <p className="text-sm text-gray-600 mt-1">{displayProfile.emergencyContactPhone}</p>
              )}
            </div>
          </div>

          <div>
            <Label>Hubungan</Label>
            {isEditing ? (
              <Select
                value={displayProfile.emergencyContactRelation}
                onValueChange={(value) => updateField("emergencyContactRelation", value)}
              >
                <SelectTrigger>
                  <SelectValue />
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
            ) : (
              <p className="text-sm text-gray-600 mt-1">
                {displayProfile.emergencyContactRelation === "spouse"
                  ? "Suami/Istri"
                  : displayProfile.emergencyContactRelation === "parent"
                    ? "Orang Tua"
                    : displayProfile.emergencyContactRelation === "child"
                      ? "Anak"
                      : displayProfile.emergencyContactRelation === "sibling"
                        ? "Saudara"
                        : displayProfile.emergencyContactRelation === "friend"
                          ? "Teman"
                          : "Lainnya"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Insurance Information - Enhanced */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Informasi Asuransi & BPJS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Penyedia Asuransi</Label>
              {isEditing ? (
                <Select
                  value={displayProfile.insuranceProvider || ""}
                  onValueChange={(value) => updateField("insuranceProvider", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih penyedia asuransi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BPJS">BPJS Kesehatan</SelectItem>
                    <SelectItem value="Prudential">Prudential</SelectItem>
                    <SelectItem value="Allianz">Allianz</SelectItem>
                    <SelectItem value="AXA">AXA Mandiri</SelectItem>
                    <SelectItem value="Cigna">Cigna</SelectItem>
                    <SelectItem value="Great Eastern">Great Eastern</SelectItem>
                    <SelectItem value="Sinarmas">Sinarmas MSIG</SelectItem>
                    <SelectItem value="Other">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-gray-600 mt-1">{displayProfile.insuranceProvider || "Belum diisi"}</p>
              )}
            </div>
            <div>
              <Label>Nomor Asuransi</Label>
              {isEditing ? (
                <Input
                  value={displayProfile.insuranceNumber || ""}
                  onChange={(e) => updateField("insuranceNumber", e.target.value)}
                  placeholder="Nomor polis asuransi"
                />
              ) : (
                <p className="text-sm text-gray-600 mt-1">{displayProfile.insuranceNumber || "Belum diisi"}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Registrasi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tanggal Registrasi</Label>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(displayProfile.registrationDate).toLocaleDateString("id-ID")}
              </p>
            </div>
            <div>
              <Label>ID Pasien</Label>
              <p className="text-sm text-gray-600 mt-1 font-mono">{displayProfile.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
