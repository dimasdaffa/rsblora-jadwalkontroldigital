"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

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

interface DoctorFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function DoctorForm({ onSubmit, onCancel }: DoctorFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialty: "",
    license: "",
    experience: "",
    education: "",
    bio: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.specialty) return

    onSubmit({
      ...formData,
      experience: Number.parseInt(formData.experience) || 0,
    })

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
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nama Lengkap *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Dr. Nama Dokter"
            required
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
            required
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
            required
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

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit">Tambah Dokter</Button>
      </div>
    </form>
  )
}
