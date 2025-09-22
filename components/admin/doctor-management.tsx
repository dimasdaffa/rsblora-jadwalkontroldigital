"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { UserPlus, Edit, Trash2, Stethoscope, Mail, Phone, Calendar, Users, CheckCircle, X } from "lucide-react"
import { ScheduleManager } from "@/lib/schedule"

export interface DoctorProfile {
  id: string
  name: string
  email: string
  phone: string
  specialty: string
  license: string
  experience: number
  education: string
  bio: string
  status: "active" | "inactive"
  joinDate: string
  totalPatients: number
  rating: number
  avatar?: string
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

export function DoctorManagement() {
  const [doctors, setDoctors] = useState<DoctorProfile[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSpecialty, setFilterSpecialty] = useState("all")

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialty: "",
    license: "",
    experience: "",
    education: "",
    bio: "",
    username: "",
    password: "",
  })

  const [credentialFormData, setCredentialFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    loadDoctors()
  }, [])

  const loadDoctors = () => {
    const stored = localStorage.getItem("doctor_profiles")
    if (stored) {
      setDoctors(JSON.parse(stored))
    } else {
      // Initialize with empty array instead of mock data
      setDoctors([])
      localStorage.setItem("doctor_profiles", JSON.stringify([]))
    }
  }

  const saveDoctors = (updatedDoctors: DoctorProfile[]) => {
    setDoctors(updatedDoctors)
    localStorage.setItem("doctor_profiles", JSON.stringify(updatedDoctors))
  }

  const handleAddDoctor = () => {
    if (!formData.name || !formData.email || !formData.specialty || !formData.username || !formData.password) return

    const newDoctor: DoctorProfile = {
      id: `dr_${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      specialty: formData.specialty,
      license: formData.license,
      experience: Number.parseInt(formData.experience) || 0,
      education: formData.education,
      bio: formData.bio,
      status: "active",
      joinDate: new Date().toISOString().split("T")[0],
      totalPatients: 0,
      rating: 0,
    }

    const updatedDoctors = [...doctors, newDoctor]
    saveDoctors(updatedDoctors)

    const credentials = JSON.parse(localStorage.getItem("user_credentials") || "{}")
    credentials[formData.username] = {
      password: formData.password,
      email: formData.email,
      role: "doctor",
      name: formData.name,
      id: newDoctor.id,
    }
    localStorage.setItem("user_credentials", JSON.stringify(credentials))

    ScheduleManager.createSchedulesForDoctor(newDoctor.id, formData.name, formData.specialty)

    const existingDoctors = JSON.parse(localStorage.getItem("doctors") || "[]")
    const doctorForSchedule = {
      id: newDoctor.id,
      name: formData.name,
      specialty: formData.specialty,
      email: formData.email,
      phone: formData.phone,
      status: "active",
    }
    const updatedScheduleDoctors = [...existingDoctors.filter((d: any) => d.id !== newDoctor.id), doctorForSchedule]
    localStorage.setItem("doctors", JSON.stringify(updatedScheduleDoctors))

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      specialty: "",
      license: "",
      experience: "",
      education: "",
      bio: "",
      username: "",
      password: "",
    })
    setIsAddModalOpen(false)
  }

  const handleEditDoctor = () => {
    if (!selectedDoctor || !formData.name || !formData.email || !formData.specialty) return

    const updatedDoctor: DoctorProfile = {
      ...selectedDoctor,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      specialty: formData.specialty,
      license: formData.license,
      experience: Number.parseInt(formData.experience) || 0,
      education: formData.education,
      bio: formData.bio,
    }

    const updatedDoctors = doctors.map((d) => (d.id === selectedDoctor.id ? updatedDoctor : d))
    saveDoctors(updatedDoctors)
    setIsEditModalOpen(false)
    setSelectedDoctor(null)
  }

  const handleDeleteDoctor = (doctorId: string) => {
    const updatedDoctors = doctors.filter((d) => d.id !== doctorId)
    saveDoctors(updatedDoctors)

    const existingSchedules = ScheduleManager.getSchedules()
    const updatedSchedules = existingSchedules.filter((s) => s.doctorId !== doctorId)
    ScheduleManager.saveSchedules(updatedSchedules)

    // Remove from schedule doctors list
    const existingDoctors = JSON.parse(localStorage.getItem("doctors") || "[]")
    const updatedScheduleDoctors = existingDoctors.filter((d: any) => d.id !== doctorId)
    localStorage.setItem("doctors", JSON.stringify(updatedScheduleDoctors))

    // Remove from credentials
    const credentials = JSON.parse(localStorage.getItem("user_credentials") || "{}")
    const doctorToDelete = doctors.find((d) => d.id === doctorId)
    if (doctorToDelete) {
      // Find and remove credential by email
      Object.keys(credentials).forEach((username) => {
        if (credentials[username].email === doctorToDelete.email) {
          delete credentials[username]
        }
      })
      localStorage.setItem("user_credentials", JSON.stringify(credentials))
    }
  }

  const openEditModal = (doctor: DoctorProfile) => {
    setSelectedDoctor(doctor)
    setFormData({
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      specialty: doctor.specialty,
      license: doctor.license,
      experience: doctor.experience.toString(),
      education: doctor.education,
      bio: doctor.bio,
      username: "",
      password: "",
    })
    setIsEditModalOpen(true)
  }

  const openCredentialModal = (doctor: DoctorProfile) => {
    setSelectedDoctor(doctor)
    // Find existing username for this doctor
    const credentials = JSON.parse(localStorage.getItem("user_credentials") || "{}")
    const existingUsername = Object.keys(credentials).find((username) => credentials[username].email === doctor.email)
    setCredentialFormData({
      username: existingUsername || "",
      password: "",
      confirmPassword: "",
    })
    setIsCredentialModalOpen(true)
  }

  const handleUpdateCredentials = () => {
    if (!selectedDoctor || !credentialFormData.username || !credentialFormData.password) return
    if (credentialFormData.password !== credentialFormData.confirmPassword) {
      alert("Password dan konfirmasi password tidak cocok!")
      return
    }

    const credentials = JSON.parse(localStorage.getItem("user_credentials") || "{}")

    // Remove old credential if username changed
    const oldUsername = Object.keys(credentials).find(
      (username) => credentials[username].email === selectedDoctor.email,
    )
    if (oldUsername && oldUsername !== credentialFormData.username) {
      delete credentials[oldUsername]
    }

    // Add/update new credential
    credentials[credentialFormData.username] = {
      password: credentialFormData.password,
      email: selectedDoctor.email,
      role: "doctor",
      name: selectedDoctor.name,
      id: selectedDoctor.id,
    }

    localStorage.setItem("user_credentials", JSON.stringify(credentials))

    setCredentialFormData({ username: "", password: "", confirmPassword: "" })
    setIsCredentialModalOpen(false)
    setSelectedDoctor(null)
  }

  const toggleDoctorStatus = (doctorId: string) => {
    const updatedDoctors = doctors.map((d) => {
      if (d.id === doctorId) {
        return {
          ...d,
          status: d.status === "active" ? "inactive" : "active",
        }
      }
      return d
    })
    saveDoctors(updatedDoctors)
  }

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialty = filterSpecialty === "all" || doctor.specialty === filterSpecialty
    return matchesSearch && matchesSpecialty
  })

  const getStatusColor = (status: string) => {
    return status === "active" ? "default" : "secondary"
  }

  const getSpecialtyColor = (specialty: string) => {
    const colors = {
      Kardiologi: "bg-red-100 text-red-800",
      Dermatologi: "bg-green-100 text-green-800",
      Pediatri: "bg-blue-100 text-blue-800",
      Ortopedi: "bg-purple-100 text-purple-800",
      Neurologi: "bg-orange-100 text-orange-800",
      "Penyakit Dalam": "bg-indigo-100 text-indigo-800",
    }
    return colors[specialty as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Manajemen Dokter</h3>
          <p className="text-gray-600">Kelola profil dokter dan spesialisasi mereka</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Tambah Dokter
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tambah Dokter Baru</DialogTitle>
              <DialogDescription>Masukkan informasi dokter untuk membuat akun baru</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nama Lengkap *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Dr. Nama Dokter"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="dokter@rsbhayangkara.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+62 812-3456-7890"
                  />
                </div>
                <div>
                  <Label htmlFor="specialty">Spesialisasi *</Label>
                  <Select
                    value={formData.specialty}
                    onValueChange={(value) => setFormData({ ...formData, specialty: value })}
                  >
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="license">Nomor STR</Label>
                  <Input
                    id="license"
                    value={formData.license}
                    onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                    placeholder="STR-12345678"
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Pengalaman (tahun)</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="education">Pendidikan</Label>
                <Input
                  id="education"
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  placeholder="Universitas - Spesialisasi"
                />
              </div>

              <div>
                <Label htmlFor="bio">Biografi</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Deskripsi singkat tentang dokter..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username Login *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="username_dokter"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password Login *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Password untuk login"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleAddDoctor}>Tambah Dokter</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Cari dokter berdasarkan nama, email, atau spesialisasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter spesialisasi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Spesialisasi</SelectItem>
            {specializations.map((spec) => (
              <SelectItem key={spec} value={spec}>
                {spec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{doctors.length}</p>
                <p className="text-xs text-gray-600">Total Dokter</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {doctors.filter((d) => d.status === "active").length}
                </p>
                <p className="text-xs text-gray-600">Dokter Aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Stethoscope className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{new Set(doctors.map((d) => d.specialty)).size}</p>
                <p className="text-xs text-gray-600">Spesialisasi</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {doctors.reduce((sum, d) => sum + d.totalPatients, 0)}
                </p>
                <p className="text-xs text-gray-600">Total Pasien</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Doctor List */}
      <div className="space-y-4">
        {filteredDoctors.map((doctor) => (
          <Card
            key={doctor.id}
            className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300"
          >
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-3 rounded-full flex-shrink-0">
                    <Stethoscope className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900 text-lg">{doctor.name}</h4>
                      <div className="flex gap-2">
                        <Badge variant={getStatusColor(doctor.status)} className="text-xs">
                          {doctor.status === "active" ? "Aktif" : "Tidak Aktif"}
                        </Badge>
                        <Badge className={`text-xs ${getSpecialtyColor(doctor.specialty)}`}>{doctor.specialty}</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{doctor.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{doctor.phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{doctor.experience} tahun pengalaman</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{doctor.totalPatients} pasien</span>
                      </div>
                    </div>

                    {doctor.bio && <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">{doctor.bio}</p>}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(doctor)}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openCredentialModal(doctor)}
                    className="border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Login
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleDoctorStatus(doctor.id)}
                    className={
                      doctor.status === "active"
                        ? "border-orange-200 text-orange-600 hover:bg-orange-50"
                        : "border-green-200 text-green-600 hover:bg-green-50"
                    }
                  >
                    {doctor.status === "active" ? (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        Nonaktifkan
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Aktifkan
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteDoctor(doctor.id)}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Hapus
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Dokter</DialogTitle>
            <DialogDescription>Perbarui informasi dokter</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Nama Lengkap *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-phone">Nomor Telepon</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-specialty">Spesialisasi *</Label>
                <Select
                  value={formData.specialty}
                  onValueChange={(value) => setFormData({ ...formData, specialty: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
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
              <div>
                <Label htmlFor="edit-license">Nomor STR</Label>
                <Input
                  id="edit-license"
                  value={formData.license}
                  onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-experience">Pengalaman (tahun)</Label>
                <Input
                  id="edit-experience"
                  type="number"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-education">Pendidikan</Label>
              <Input
                id="edit-education"
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="edit-bio">Biografi</Label>
              <Textarea
                id="edit-bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleEditDoctor}>Simpan Perubahan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credential Editing Modal */}
      <Dialog open={isCredentialModalOpen} onOpenChange={setIsCredentialModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Login Credentials</DialogTitle>
            <DialogDescription>Ubah username dan password login untuk {selectedDoctor?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="credential-username">Username Login *</Label>
              <Input
                id="credential-username"
                value={credentialFormData.username}
                onChange={(e) => setCredentialFormData({ ...credentialFormData, username: e.target.value })}
                placeholder="username_dokter"
              />
            </div>
            <div>
              <Label htmlFor="credential-password">Password Baru *</Label>
              <Input
                id="credential-password"
                type="password"
                value={credentialFormData.password}
                onChange={(e) => setCredentialFormData({ ...credentialFormData, password: e.target.value })}
                placeholder="Password baru"
              />
            </div>
            <div>
              <Label htmlFor="credential-confirm">Konfirmasi Password *</Label>
              <Input
                id="credential-confirm"
                type="password"
                value={credentialFormData.confirmPassword}
                onChange={(e) => setCredentialFormData({ ...credentialFormData, confirmPassword: e.target.value })}
                placeholder="Ulangi password baru"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsCredentialModalOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleUpdateCredentials}>Simpan Credentials</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
