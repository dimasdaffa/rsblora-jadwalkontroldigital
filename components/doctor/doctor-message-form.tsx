"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Message {
  id: string
  patientId: string
  fromId: string
  fromName: string
  toId: string
  toName: string
  subject: string
  content: string
  date: string
  unread: boolean
  type: "received" | "sent"
  createdAt: string
}

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
}

interface Patient {
  id: string
  name: string
  email: string
  age: number
  condition: string
  lastVisit: string
  nextAppointment: string
  priority: "high" | "medium" | "low"
  phone: string
  medicalHistory: string[]
}

interface DoctorMessageFormProps {
  replyTo?: Message | null
  doctorProfile: DoctorProfile | null
  patients: Patient[]
  onSubmit: (messageData: Omit<Message, "id" | "createdAt">) => void
  onCancel: () => void
}

export function DoctorMessageForm({ replyTo, doctorProfile, patients, onSubmit, onCancel }: DoctorMessageFormProps) {
  const [formData, setFormData] = useState({
    patientId: replyTo?.fromId || "",
    patientName: replyTo?.fromName || "",
    subject: replyTo ? `Re: ${replyTo.subject}` : "",
    content: replyTo ? `\n\n--- Pesan Asli ---\n${replyTo.content}` : "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!doctorProfile) return

    const selectedPatient = patients.find((p) => p.id === formData.patientId || p.name === formData.patientName)

    const messageData: Omit<Message, "id" | "createdAt"> = {
      patientId: formData.patientId,
      fromId: doctorProfile.id,
      fromName: doctorProfile.name,
      toId: selectedPatient?.id || formData.patientId,
      toName: formData.patientName,
      subject: formData.subject,
      content: formData.content,
      date: new Date().toLocaleDateString("id-ID"),
      unread: true,
      type: "sent",
    }

    onSubmit(messageData)
  }

  const handlePatientSelect = (patientId: string) => {
    const selectedPatient = patients.find((p) => p.id === patientId)
    if (selectedPatient) {
      setFormData({
        ...formData,
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!replyTo && (
        <div>
          <Label htmlFor="patient">Pilih Pasien</Label>
          <Select onValueChange={handlePatientSelect} value={formData.patientId}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih pasien..." />
            </SelectTrigger>
            <SelectContent>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.name} - {patient.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {replyTo && (
        <div>
          <Label>Kepada</Label>
          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{replyTo.fromName}</p>
        </div>
      )}

      <div>
        <Label htmlFor="subject">Subjek</Label>
        <Input
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="Subjek pesan..."
          required
        />
      </div>

      <div>
        <Label htmlFor="content">Pesan</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Tulis pesan Anda..."
          rows={6}
          required
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit">{replyTo ? "Kirim Balasan" : "Kirim Pesan"}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
      </div>
    </form>
  )
}
