"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, User, FileText, CheckCircle, AlertCircle, Plus, Save, X } from "lucide-react"
import { ScheduleManager, type DoctorSchedule } from "@/lib/schedule"
import { AppointmentManager, type Appointment } from "@/lib/appointments"

interface PatientHealthUpdate {
  id: string
  appointmentId: string
  patientName: string
  date: string
  diagnosis: string
  treatment: string
  notes: string
  followUpRequired: boolean
  followUpDate?: string
  medications: string[]
  status: "draft" | "completed" | "sent"
}

export function DoctorScheduleManagement() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [schedule, setSchedule] = useState<DoctorSchedule | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [healthUpdates, setHealthUpdates] = useState<PatientHealthUpdate[]>([])
  const [editingUpdate, setEditingUpdate] = useState<string | null>(null)
  const [newUpdate, setNewUpdate] = useState<Partial<PatientHealthUpdate>>({})

  useEffect(() => {
    loadDoctorSchedule()
    loadAppointments()
    loadHealthUpdates()
  }, [selectedDate])

  const loadDoctorSchedule = () => {
    const doctorSchedule = ScheduleManager.getScheduleByDoctorAndDate("dr1", selectedDate)
    setSchedule(doctorSchedule || null)
  }

  const loadAppointments = () => {
    const doctorAppointments = AppointmentManager.getAppointmentsByDoctor("dr1").filter(
      (apt) => apt.date === selectedDate && apt.status === "approved",
    )
    setAppointments(doctorAppointments)
  }

  const loadHealthUpdates = () => {
    const stored = localStorage.getItem("patient_health_updates")
    if (stored) {
      const updates = JSON.parse(stored) as PatientHealthUpdate[]
      setHealthUpdates(updates.filter((update) => update.date === selectedDate))
    }
  }

  const saveHealthUpdate = (update: PatientHealthUpdate) => {
    const stored = localStorage.getItem("patient_health_updates")
    const allUpdates = stored ? JSON.parse(stored) : []

    const existingIndex = allUpdates.findIndex((u: PatientHealthUpdate) => u.id === update.id)
    if (existingIndex >= 0) {
      allUpdates[existingIndex] = update
    } else {
      allUpdates.push(update)
    }

    localStorage.setItem("patient_health_updates", JSON.stringify(allUpdates))
    loadHealthUpdates()
  }

  const createHealthUpdate = (appointment: Appointment) => {
    const newUpdate: PatientHealthUpdate = {
      id: `update_${Date.now()}`,
      appointmentId: appointment.id,
      patientName: appointment.patientName,
      date: appointment.date,
      diagnosis: "",
      treatment: "",
      notes: "",
      followUpRequired: false,
      medications: [],
      status: "draft",
    }
    setNewUpdate(newUpdate)
    setEditingUpdate(newUpdate.id)
  }

  const updateAppointmentStatus = (appointmentId: string, status: Appointment["status"]) => {
    AppointmentManager.updateAppointmentStatus(appointmentId, status)
    loadAppointments()
  }

  const navigateDate = (direction: "prev" | "next") => {
    const currentDate = new Date(selectedDate)
    currentDate.setDate(currentDate.getDate() + (direction === "next" ? 1 : -1))
    setSelectedDate(currentDate.toISOString().split("T")[0])
  }

  return (
    <div className="space-y-6 p-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Jadwal Kontrol Digital</h2>
          <p className="text-blue-600/70">Kelola jadwal dan berikan update kesehatan pasien</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateDate("prev")}>
            ← Kemarin
          </Button>
          <div className="px-4 py-2 bg-blue-50 rounded-lg">
            <span className="font-medium text-blue-800">
              {new Date(selectedDate).toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigateDate("next")}>
            Besok →
          </Button>
        </div>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-white border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Calendar className="h-5 w-5" />
            Jadwal Hari Ini
          </CardTitle>
        </CardHeader>
        <CardContent>
          {schedule ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schedule.timeSlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`p-4 rounded-lg border ${
                    slot.isAvailable ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">{slot.time}</span>
                    <Badge variant={slot.isAvailable ? "secondary" : "default"}>
                      {slot.isAvailable ? "Tersedia" : "Terjadwal"}
                    </Badge>
                  </div>
                  {!slot.isAvailable && slot.patientName && (
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {slot.patientName}
                      </div>
                      <div className="text-xs text-blue-600 mt-1">{slot.appointmentType}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Tidak ada jadwal untuk hari ini</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Janji Temu Hari Ini ({appointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments.map((appointment) => {
              const hasHealthUpdate = healthUpdates.some((update) => update.appointmentId === appointment.id)

              return (
                <div key={appointment.id} className="border rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{appointment.patientName}</h4>
                          <p className="text-sm text-gray-600">
                            {appointment.time} - {appointment.type}
                          </p>
                        </div>
                      </div>

                      {appointment.complaints && (
                        <div className="bg-yellow-50 p-3 rounded-lg mb-3">
                          <p className="text-sm text-gray-700">
                            <strong>Keluhan:</strong> {appointment.complaints}
                          </p>
                        </div>
                      )}

                      {appointment.notes && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-3">
                          <p className="text-sm text-gray-700">
                            <strong>Catatan:</strong> {appointment.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Badge variant={hasHealthUpdate ? "default" : "secondary"}>
                        {hasHealthUpdate ? "Update Tersedia" : "Menunggu Update"}
                      </Badge>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateAppointmentStatus(appointment.id, "completed")}
                          className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Selesai
                        </Button>

                        {!hasHealthUpdate && (
                          <Button
                            size="sm"
                            onClick={() => createHealthUpdate(appointment)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Update Kesehatan
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {appointments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Tidak ada janji temu untuk hari ini</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Update Kesehatan Pasien
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* New update form */}
            {editingUpdate && newUpdate.id === editingUpdate && (
              <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                <h4 className="font-semibold text-blue-800 mb-4">Update Kesehatan - {newUpdate.patientName}</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
                    <Input
                      value={newUpdate.diagnosis || ""}
                      onChange={(e) => setNewUpdate({ ...newUpdate, diagnosis: e.target.value })}
                      placeholder="Masukkan diagnosis..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pengobatan</label>
                    <Input
                      value={newUpdate.treatment || ""}
                      onChange={(e) => setNewUpdate({ ...newUpdate, treatment: e.target.value })}
                      placeholder="Masukkan pengobatan..."
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Medis</label>
                  <Textarea
                    value={newUpdate.notes || ""}
                    onChange={(e) => setNewUpdate({ ...newUpdate, notes: e.target.value })}
                    placeholder="Catatan detail tentang kondisi pasien..."
                    rows={4}
                  />
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newUpdate.followUpRequired || false}
                      onChange={(e) => setNewUpdate({ ...newUpdate, followUpRequired: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Perlu follow-up</span>
                  </label>

                  {newUpdate.followUpRequired && (
                    <Input
                      type="date"
                      value={newUpdate.followUpDate || ""}
                      onChange={(e) => setNewUpdate({ ...newUpdate, followUpDate: e.target.value })}
                      className="w-auto"
                    />
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      const completeUpdate = {
                        ...newUpdate,
                        status: "completed" as const,
                      } as PatientHealthUpdate
                      saveHealthUpdate(completeUpdate)
                      setEditingUpdate(null)
                      setNewUpdate({})
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Simpan Update
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingUpdate(null)
                      setNewUpdate({})
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Batal
                  </Button>
                </div>
              </div>
            )}

            {/* Existing health updates */}
            {healthUpdates.map((update) => (
              <div key={update.id} className="border rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">{update.patientName}</h4>
                    <p className="text-sm text-gray-600">{new Date(update.date).toLocaleDateString("id-ID")}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={update.status === "completed" ? "default" : "secondary"}>
                      {update.status === "completed" ? "Selesai" : "Draft"}
                    </Badge>

                    {update.followUpRequired && (
                      <Badge variant="outline" className="border-orange-200 text-orange-600">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Follow-up
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Diagnosis:</p>
                    <p className="text-sm text-gray-600">{update.diagnosis}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">Pengobatan:</p>
                    <p className="text-sm text-gray-600">{update.treatment}</p>
                  </div>
                </div>

                {update.notes && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700">Catatan:</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{update.notes}</p>
                  </div>
                )}

                {update.followUpRequired && update.followUpDate && (
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <strong>Follow-up dijadwalkan:</strong>{" "}
                      {new Date(update.followUpDate).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {healthUpdates.length === 0 && !editingUpdate && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada update kesehatan untuk hari ini</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
