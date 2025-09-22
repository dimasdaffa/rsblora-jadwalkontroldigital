"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FileText, Calendar, AlertCircle, CheckCircle, Clock, Pill, Search } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"

interface PatientHealthUpdate {
  id: string
  appointmentId: string
  patientName: string
  doctorName: string
  doctorSpecialty: string
  date: string
  diagnosis: string
  treatment: string
  notes: string
  followUpRequired: boolean
  followUpDate?: string
  medications: string[]
  status: "draft" | "completed" | "sent"
  createdAt: string
  updatedAt?: string
}

export function PatientHealthUpdates() {
  const [healthUpdates, setHealthUpdates] = useState<PatientHealthUpdate[]>([])
  const [filteredUpdates, setFilteredUpdates] = useState<PatientHealthUpdate[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "recent" | "follow-up">("all")
  const [selectedUpdate, setSelectedUpdate] = useState<PatientHealthUpdate | null>(null)

  const currentUser = getCurrentUser()

  useEffect(() => {
    loadHealthUpdates()
  }, [])

  useEffect(() => {
    filterHealthUpdates()
  }, [healthUpdates, searchTerm, filterStatus])

  const loadHealthUpdates = () => {
    const stored = localStorage.getItem("patient_health_updates")
    if (stored && currentUser) {
      const allUpdates = JSON.parse(stored) as PatientHealthUpdate[]
      const userUpdates = allUpdates.filter(
        (update) => update.patientName.toLowerCase() === currentUser.name?.toLowerCase(),
      )
      setHealthUpdates(userUpdates.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    }
  }

  const filterHealthUpdates = () => {
    let filtered = healthUpdates

    if (searchTerm) {
      filtered = filtered.filter(
        (update) =>
          update.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
          update.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          update.treatment.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    switch (filterStatus) {
      case "recent":
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        filtered = filtered.filter((update) => new Date(update.date) >= thirtyDaysAgo)
        break
      case "follow-up":
        filtered = filtered.filter((update) => update.followUpRequired)
        break
    }

    setFilteredUpdates(filtered)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">Update Kesehatan</h3>
          <p className="text-sm sm:text-lg text-blue-600/70">
            Lihat update kesehatan dari dokter dan pantau perkembangan Anda
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-green-200 text-green-600">
            {healthUpdates.length} Total Update
          </Badge>
          <Badge variant="outline" className="border-orange-200 text-orange-600">
            {healthUpdates.filter((u) => u.followUpRequired).length} Follow-up
          </Badge>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari diagnosis, dokter, atau pengobatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("all")}
                className="min-w-[80px]"
              >
                Semua
              </Button>
              <Button
                variant={filterStatus === "recent" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("recent")}
                className="min-w-[80px]"
              >
                Terbaru
              </Button>
              <Button
                variant={filterStatus === "follow-up" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("follow-up")}
                className="min-w-[100px]"
              >
                Follow-up
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Updates List */}
      <div className="space-y-4">
        {filteredUpdates.length > 0 ? (
          filteredUpdates.map((update) => (
            <Card
              key={update.id}
              className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedUpdate(update)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-2 rounded-full">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{update.doctorName}</h4>
                      <p className="text-sm text-blue-600/70">{update.doctorSpecialty}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{new Date(update.date).toLocaleDateString("id-ID")}</span>
                    {update.followUpRequired && (
                      <Badge variant="outline" className="border-orange-200 text-orange-600">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Follow-up
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h5 className="font-medium text-gray-700 mb-1">Diagnosis</h5>
                    <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded">{update.diagnosis}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-700 mb-1">Pengobatan</h5>
                    <p className="text-sm text-gray-600 bg-green-50 p-2 rounded">{update.treatment}</p>
                  </div>
                </div>

                {update.notes && (
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-700 mb-1">Catatan Medis</h5>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{update.notes}</p>
                  </div>
                )}

                {update.followUpRequired && update.followUpDate && (
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 text-orange-800">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Follow-up dijadwalkan:</span>
                      <span>{new Date(update.followUpDate).toLocaleDateString("id-ID")}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">Belum Ada Update Kesehatan</h3>
              <p className="text-gray-600">Update kesehatan dari dokter akan muncul di sini setelah konsultasi Anda.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detailed Health Update Modal */}
      {selectedUpdate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Detail Update Kesehatan</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedUpdate.doctorName} - {selectedUpdate.doctorSpecialty}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedUpdate(null)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Diagnosis
                  </h4>
                  <p className="text-gray-800 bg-blue-50 p-3 rounded-lg">{selectedUpdate.diagnosis}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Pill className="h-4 w-4" />
                    Pengobatan
                  </h4>
                  <p className="text-gray-800 bg-green-50 p-3 rounded-lg">{selectedUpdate.treatment}</p>
                </div>
              </div>

              {selectedUpdate.notes && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Catatan Medis Lengkap
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedUpdate.notes}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Tanggal Konsultasi
                  </h4>
                  <p className="text-gray-800">{new Date(selectedUpdate.date).toLocaleDateString("id-ID")}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Status Update
                  </h4>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Selesai
                  </Badge>
                </div>
              </div>

              {selectedUpdate.followUpRequired && (
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Follow-up Diperlukan
                  </h4>
                  {selectedUpdate.followUpDate && (
                    <p className="text-orange-700">
                      Jadwal follow-up: {new Date(selectedUpdate.followUpDate).toLocaleDateString("id-ID")}
                    </p>
                  )}
                  <p className="text-sm text-orange-600 mt-2">
                    Silakan buat janji temu baru untuk follow-up konsultasi Anda.
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    // Print or download functionality
                    window.print()
                  }}
                >
                  Cetak Update
                </Button>
                <Button className="flex-1" onClick={() => setSelectedUpdate(null)}>
                  Tutup
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
