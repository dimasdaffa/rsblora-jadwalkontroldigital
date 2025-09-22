"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { UserNav } from "@/components/auth/user-nav"
import { Calendar, Clock, FileText, MessageSquare, Plus, Phone, User, Menu, X, Save, Send } from "lucide-react"
import { BookAppointmentModal } from "./book-appointment-modal"
import { DoctorScheduleView } from "./doctor-schedule-view"
import { PatientProfileManagement } from "./patient-profile-management"
import { AppointmentManagement } from "./appointment-management"
import { PatientHealthUpdates } from "./patient-health-updates"
import { AppointmentManager, type Appointment } from "@/lib/appointments"
import { getCurrentUser } from "@/lib/auth"
import Image from "next/image"

interface MedicalRecord {
  id: string
  patientId: string
  date: string
  doctorName: string
  type: string
  status: string
  description: string
  results?: string
  createdAt: string
  bloodPressure?: string
  heartRate?: string
  temperature?: string
  weight?: string
  fileName?: string
  pdfFile?: string
}

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

export function PatientDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showScheduleView, setShowScheduleView] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [userAppointments, setUserAppointments] = useState<Appointment[]>([])
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [isEditingRecord, setIsEditingRecord] = useState(false)
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null)
  const [isComposingMessage, setIsComposingMessage] = useState(false)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)

  const currentUser = getCurrentUser()

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = () => {
    loadUserAppointments()
    loadMedicalRecords()
    loadMessages()
  }

  const loadUserAppointments = () => {
    if (currentUser) {
      const appointments = AppointmentManager.getAppointmentsByPatient(currentUser.email)
      setUserAppointments(appointments)
    }
  }

  const loadMedicalRecords = () => {
    try {
      const records = JSON.parse(localStorage.getItem("medical_records") || "[]")
      const userRecords = records.filter(
        (record: MedicalRecord) => record.patientId === currentUser?.id || record.patientId === currentUser?.email,
      )
      setMedicalRecords(userRecords)
    } catch (error) {
      console.error("Error loading medical records:", error)
      setMedicalRecords([])
    }
  }

  const loadMessages = () => {
    try {
      const allMessages = JSON.parse(localStorage.getItem("patient_messages") || "[]")
      const userMessages = allMessages.filter(
        (message: Message) =>
          message.patientId === currentUser?.id ||
          message.patientId === currentUser?.email ||
          message.toId === currentUser?.id ||
          message.toId === currentUser?.email ||
          message.fromId === currentUser?.id ||
          message.fromId === currentUser?.email,
      )
      setMessages(userMessages)
    } catch (error) {
      console.error("Error loading messages:", error)
      setMessages([])
    }
  }

  const handleCreateRecord = (recordData: Omit<MedicalRecord, "id" | "createdAt">) => {
    const newRecord: MedicalRecord = {
      ...recordData,
      id: `record-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }

    const allRecords = JSON.parse(localStorage.getItem("medical_records") || "[]")
    const updatedRecords = [...allRecords, newRecord]
    localStorage.setItem("medical_records", JSON.stringify(updatedRecords))

    setMedicalRecords((prev) => [...prev, newRecord])
    setIsEditingRecord(false)
    setEditingRecord(null)
  }

  const handleUpdateRecord = (recordId: string, recordData: Partial<MedicalRecord>) => {
    const allRecords = JSON.parse(localStorage.getItem("medical_records") || "[]")
    const updatedRecords = allRecords.map((record: MedicalRecord) =>
      record.id === recordId ? { ...record, ...recordData } : record,
    )
    localStorage.setItem("medical_records", JSON.stringify(updatedRecords))

    setMedicalRecords((prev) => prev.map((record) => (record.id === recordId ? { ...record, ...recordData } : record)))
    setIsEditingRecord(false)
    setEditingRecord(null)
  }

  const handleDeleteRecord = (recordId: string) => {
    const allRecords = JSON.parse(localStorage.getItem("medical_records") || "[]")
    const updatedRecords = allRecords.filter((record: MedicalRecord) => record.id !== recordId)
    localStorage.setItem("medical_records", JSON.stringify(updatedRecords))

    setMedicalRecords((prev) => prev.filter((record) => record.id !== recordId))
  }

  const handleSendMessage = (messageData: Omit<Message, "id" | "createdAt">) => {
    const newMessage: Message = {
      ...messageData,
      id: `message-${Date.now()}`,
      createdAt: new Date().toISOString(),
      type: "sent",
    }

    // Create corresponding received message for doctor
    const receivedMessage: Message = {
      ...newMessage,
      id: `message-${Date.now()}-received`,
      fromId: messageData.fromId,
      fromName: messageData.fromName,
      toId: messageData.toId,
      toName: messageData.toName,
      type: "received",
      unread: true,
    }

    const allMessages = JSON.parse(localStorage.getItem("patient_messages") || "[]")
    const updatedMessages = [...allMessages, newMessage, receivedMessage]
    localStorage.setItem("patient_messages", JSON.stringify(updatedMessages))

    setMessages((prev) => [...prev, newMessage])
    setIsComposingMessage(false)
    setReplyingTo(null)
  }

  const handleMarkMessageRead = (messageId: string) => {
    const allMessages = JSON.parse(localStorage.getItem("patient_messages") || "[]")
    const updatedMessages = allMessages.map((message: Message) =>
      message.id === messageId ? { ...message, unread: false } : message,
    )
    localStorage.setItem("patient_messages", JSON.stringify(updatedMessages))

    setMessages((prev) => prev.map((message) => (message.id === messageId ? { ...message, unread: false } : message)))
  }

  const handleBookFromSchedule = (
    doctorId: string,
    doctorName: string,
    date: string,
    timeSlotId: string,
    time: string,
  ) => {
    setShowScheduleView(false)
    setShowBookingModal(true)
  }

  const getStats = () => {
    const upcomingAppointments = userAppointments
      .filter((apt) => new Date(apt.date) >= new Date() && apt.status === "approved")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const unreadMessages = messages.filter((msg) => msg.unread && msg.type === "received")
    const activeRecords = medicalRecords.filter((record) => record.status === "Active")

    return {
      nextAppointment: upcomingAppointments[0] || null,
      unreadCount: unreadMessages.length,
      activeRecordsCount: activeRecords.length,
      totalAppointments: userAppointments.length,
      totalRecords: medicalRecords.length,
    }
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* ... existing header code ... */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-blue-100 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <Image
                src="/logo-bhayangkara.jpg"
                alt="RS. Bhayangkara Blora"
                width={48}
                height={48}
                className="rounded-xl"
              />
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  RS. Bhayangkara Blora Tk. IV
                </h1>
                <p className="text-sm sm:text-base text-blue-600/70">Portal Pasien</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <Button
                variant="outline"
                size="lg"
                className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent text-sm sm:text-base min-h-[48px] px-4"
              >
                <Phone className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Darurat: </span>911
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="md:hidden min-h-[48px] min-w-[48px] p-3"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
              <div className="hidden md:block">
                <UserNav />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-8 sm:mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
            Selamat datang kembali, {currentUser?.name?.split(" ")[0] || "Pasien"}!
          </h2>
          <p className="text-base sm:text-lg text-blue-600/70">
            Kelola kesehatan dan janji temu Anda dalam satu tempat.
          </p>
        </div>

        <div className="flex gap-6">
          {/* ... existing sidebar code ... */}
          <div
            className={`fixed inset-y-0 left-0 z-50 w-80 bg-white/95 backdrop-blur-sm border-r border-blue-100 shadow-lg transform transition-transform duration-300 md:relative md:translate-x-0 md:w-auto md:bg-transparent md:border-0 md:shadow-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
          >
            <div className="p-6 md:hidden">
              <div className="flex items-center gap-3 mb-8">
                <Image
                  src="/logo-bhayangkara.jpg"
                  alt="RS. Bhayangkara Blora"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <div>
                  <h3 className="font-bold text-blue-600 text-base">RS. Bhayangkara Blora</h3>
                  <p className="text-sm text-blue-600/70">Portal Pasien</p>
                </div>
              </div>
              <UserNav />
            </div>

            <nav className="p-6 space-y-3 md:hidden">
              {[
                { id: "overview", label: "Ringkasan" },
                { id: "schedule", label: "Jadwal Dokter" },
                { id: "appointments", label: "Janji Temu" },
                { id: "health-updates", label: "Update Kesehatan" },
                { id: "records", label: "Rekam Medis" },
                { id: "messages", label: "Pesan" },
                { id: "profile", label: "Profil Saya" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setSidebarOpen(false)
                  }}
                  className={`w-full text-left px-4 py-4 rounded-lg transition-colors text-base font-medium min-h-[56px] ${activeTab === tab.id ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="hidden md:grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 bg-white/60 backdrop-blur-sm border border-blue-100 shadow-sm p-2 h-auto">
                {[
                  { id: "overview", label: "Ringkasan" },
                  { id: "schedule", label: "Jadwal Dokter" },
                  { id: "appointments", label: "Janji Temu" },
                  { id: "health-updates", label: "Update Kesehatan" },
                  { id: "records", label: "Rekam Medis" },
                  { id: "messages", label: "Pesan" },
                  { id: "profile", label: "Profil Saya" },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-900 text-sm sm:text-base py-3 px-4 min-h-[48px]"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="overview" className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-blue-100">Janji Temu Berikutnya</CardTitle>
                      <Calendar className="h-5 w-5 text-blue-200" />
                    </CardHeader>
                    <CardContent>
                      {stats.nextAppointment ? (
                        <>
                          <div className="text-2xl sm:text-3xl font-bold text-white">
                            {new Date(stats.nextAppointment.date).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                            })}
                          </div>
                          <p className="text-xs text-blue-200">
                            {stats.nextAppointment.doctorName} - {stats.nextAppointment.time}
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="text-2xl sm:text-3xl font-bold text-white">-</div>
                          <p className="text-xs text-blue-200">Tidak ada jadwal</p>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-green-100">Pesan Belum Dibaca</CardTitle>
                      <MessageSquare className="h-5 w-5 text-green-200" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl sm:text-3xl font-bold text-white">{stats.unreadCount}</div>
                      <p className="text-xs text-green-200">Pesan baru</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg sm:col-span-2 lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-purple-100">Rekam Medis</CardTitle>
                      <FileText className="h-5 w-5 text-purple-200" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl sm:text-3xl font-bold text-white">{stats.totalRecords}</div>
                      <p className="text-xs text-purple-200">Total rekam medis</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-gray-800">Janji Temu Mendatang</CardTitle>
                        <CardDescription className="text-blue-600/70">Jadwal konsultasi medis Anda</CardDescription>
                      </div>
                      <Button
                        onClick={() => setShowBookingModal(true)}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg w-full sm:w-auto"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Buat Janji Temu
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userAppointments
                        .filter((apt) => new Date(apt.date) >= new Date() && apt.status === "approved")
                        .slice(0, 2)
                        .map((appointment) => (
                          <div
                            key={appointment.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 gap-4"
                          >
                            <div className="flex items-center gap-4">
                              <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-2 rounded-full">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{appointment.doctorName}</p>
                                <p className="text-sm text-blue-600/70">{appointment.doctorSpecialization}</p>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1">
                                  <div className="flex items-center gap-1 text-xs text-blue-600/70">
                                    <Calendar className="h-3 w-3" />
                                    {appointment.date}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-blue-600/70">
                                    <Clock className="h-3 w-3" />
                                    {appointment.time}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline" className="border-blue-200 text-blue-600 w-fit">
                              {appointment.type}
                            </Badge>
                          </div>
                        ))}
                      {userAppointments.filter((apt) => new Date(apt.date) >= new Date() && apt.status === "approved")
                        .length === 0 && (
                        <div className="text-center py-8">
                          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Tidak ada janji temu mendatang</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-gray-800">Pesan Terbaru</CardTitle>
                        <CardDescription className="text-blue-600/70">Komunikasi dari tim medis Anda</CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent w-full sm:w-auto"
                        onClick={() => setActiveTab("messages")}
                      >
                        Lihat Semua
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {messages
                        .filter((msg) => msg.type === "received")
                        .slice(0, 2)
                        .map((message) => (
                          <div
                            key={message.id}
                            className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                            onClick={() => handleMarkMessageRead(message.id)}
                          >
                            <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-2 rounded-full">
                              <MessageSquare className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1">
                                <p className="font-medium text-gray-800 truncate">{message.fromName}</p>
                                <span className="text-xs text-blue-600/70">{message.date}</span>
                              </div>
                              <p className="text-sm font-medium text-gray-800 mb-1">{message.subject}</p>
                              <p className="text-sm text-gray-600 line-clamp-2">{message.content}</p>
                            </div>
                            {message.unread && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>}
                          </div>
                        ))}
                      {messages.filter((msg) => msg.type === "received").length === 0 && (
                        <div className="text-center py-8">
                          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Tidak ada pesan</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">Jadwal Dokter</h3>
                  <p className="text-sm sm:text-lg text-blue-600/70">
                    Lihat slot janji temu yang tersedia dan buat langsung
                  </p>
                </div>
                <DoctorScheduleView onBookAppointment={handleBookFromSchedule} />
              </TabsContent>

              <TabsContent value="appointments" className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">Janji Temu</h3>
                    <p className="text-sm sm:text-lg text-blue-600/70">Kelola janji temu medis Anda</p>
                  </div>
                  <Button
                    onClick={() => setShowBookingModal(true)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Buat Janji Temu Baru
                  </Button>
                </div>

                <AppointmentManagement onAppointmentUpdated={loadUserAppointments} />
              </TabsContent>

              <TabsContent value="records" className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">Rekam Medis</h3>
                    <p className="text-sm sm:text-lg text-blue-600/70">Lihat riwayat medis dan hasil tes Anda</p>
                  </div>
                </div>

                <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-gray-800">Rekam Medis ({medicalRecords.length})</CardTitle>
                    <CardDescription className="text-blue-600/70">
                      Rekam medis dibuat dan dikelola oleh dokter dan staf medis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {medicalRecords.length === 0 ? (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Belum ada rekam medis</p>
                          <p className="text-sm text-gray-500 mt-2">
                            Rekam medis akan ditambahkan oleh dokter setelah konsultasi
                          </p>
                        </div>
                      ) : (
                        medicalRecords.map((record) => (
                          <div
                            key={record.id}
                            className="flex flex-col sm:flex-row sm:items-start justify-between p-4 bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 gap-4"
                          >
                            <div className="flex items-start gap-4 flex-1">
                              <div
                                className={`p-3 rounded-full ${
                                  record.type === "Konsultasi" || record.type === "Lab Results"
                                    ? "bg-gradient-to-r from-blue-100 to-blue-200"
                                    : "bg-gradient-to-r from-green-100 to-green-200"
                                }`}
                              >
                                <FileText className="h-6 w-6 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                                  <p className="font-medium text-gray-800">{record.type}</p>
                                  <span className="text-sm text-blue-600/70">{record.date}</span>
                                </div>
                                <p className="text-sm text-blue-600/70 mb-2">{record.doctorName}</p>
                                <p className="text-sm text-gray-600 mb-2">{record.description}</p>

                                {(record as any).bloodPressure && (
                                  <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                                    <div className="bg-green-50 p-2 rounded">
                                      <span className="font-medium">Tekanan Darah:</span>{" "}
                                      {(record as any).bloodPressure}
                                    </div>
                                    {(record as any).heartRate && (
                                      <div className="bg-green-50 p-2 rounded">
                                        <span className="font-medium">Detak Jantung:</span> {(record as any).heartRate}{" "}
                                        bpm
                                      </div>
                                    )}
                                    {(record as any).temperature && (
                                      <div className="bg-green-50 p-2 rounded">
                                        <span className="font-medium">Suhu:</span> {(record as any).temperature}°C
                                      </div>
                                    )}
                                    {(record as any).weight && (
                                      <div className="bg-green-50 p-2 rounded">
                                        <span className="font-medium">Berat Badan:</span> {(record as any).weight} kg
                                      </div>
                                    )}
                                  </div>
                                )}

                                {record.results && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    <span className="font-medium">Hasil:</span> {record.results}
                                  </p>
                                )}

                                {(record as any).fileName && (
                                  <div className="mt-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
                                      onClick={() => {
                                        if ((record as any).pdfFile) {
                                          const link = document.createElement("a")
                                          link.href = (record as any).pdfFile
                                          link.download = (record as any).fileName
                                          link.click()
                                        }
                                      }}
                                    >
                                      <FileText className="h-3 w-3 mr-1" />
                                      {(record as any).fileName}
                                    </Button>
                                  </div>
                                )}

                                <p className="text-xs text-blue-600/60 mt-1">{record.date}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={record.status === "Normal" ? "default" : "secondary"}>
                                {record.status}
                              </Badge>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="messages" className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">Pesan</h3>
                    <p className="text-sm sm:text-lg text-blue-600/70">Berkomunikasi dengan tim medis Anda</p>
                  </div>
                  <Dialog open={isComposingMessage} onOpenChange={setIsComposingMessage}>
                    <DialogTrigger asChild>
                      <Button
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg w-full sm:w-auto"
                        onClick={() => {
                          setReplyingTo(null)
                          setIsComposingMessage(true)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Tulis Pesan
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>{replyingTo ? "Balas Pesan" : "Tulis Pesan Baru"}</DialogTitle>
                        <DialogDescription>
                          {replyingTo ? "Balas pesan dari tim medis" : "Kirim pesan ke tim medis"}
                        </DialogDescription>
                      </DialogHeader>
                      <MessageForm
                        replyTo={replyingTo}
                        patientId={currentUser?.id || currentUser?.email || ""}
                        patientName={currentUser?.name || ""}
                        onSubmit={handleSendMessage}
                        onCancel={() => {
                          setIsComposingMessage(false)
                          setReplyingTo(null)
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>

                <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-gray-800">Kotak Masuk ({messages.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Tidak ada pesan</p>
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div
                            key={message.id}
                            className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                            onClick={() => {
                              if (message.unread) handleMarkMessageRead(message.id)
                            }}
                          >
                            <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-3 rounded-full">
                              <MessageSquare className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1">
                                <p className="font-medium text-gray-800 truncate">
                                  {message.type === "received" ? message.fromName : `Kepada: ${message.toName}`}
                                </p>
                                <span className="text-sm text-blue-600/70">{message.date}</span>
                              </div>
                              <p className="font-medium text-gray-800 mb-1">{message.subject}</p>
                              <p className="text-sm text-gray-600 line-clamp-2">{message.content}</p>
                              {message.type === "received" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent mt-2"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setReplyingTo(message)
                                    setIsComposingMessage(true)
                                  }}
                                >
                                  Balas
                                </Button>
                              )}
                            </div>
                            {message.unread && message.type === "received" && (
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-600">
                                  Baru
                                </Badge>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="health-updates" className="space-y-4 sm:space-y-6">
                <PatientHealthUpdates />
              </TabsContent>

              <TabsContent value="profile" className="space-y-4 sm:space-y-6">
                <PatientProfileManagement />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <BookAppointmentModal
          open={showBookingModal}
          onOpenChange={setShowBookingModal}
          onAppointmentBooked={loadUserAppointments}
        />
      </main>
    </div>
  )
}

function MedicalRecordForm({
  record,
  patientId,
  onSubmit,
  onCancel,
}: {
  record: MedicalRecord | null
  patientId: string
  onSubmit: (data: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    patientId,
    date: record?.date || new Date().toISOString().split("T")[0],
    doctorName: record?.doctorName || "",
    type: record?.type || "Blood Test Results",
    status: record?.status || "Normal",
    description: record?.description || "",
    results: record?.results || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="date">Tanggal</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="doctorName">Nama Dokter</Label>
        <Input
          id="doctorName"
          value={formData.doctorName}
          onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="type">Jenis Rekam Medis</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Blood Test Results">Hasil Tes Darah</SelectItem>
            <SelectItem value="X-Ray Report">Laporan X-Ray</SelectItem>
            <SelectItem value="Prescription">Resep Obat</SelectItem>
            <SelectItem value="Consultation Notes">Catatan Konsultasi</SelectItem>
            <SelectItem value="Lab Results">Hasil Lab</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Normal">Normal</SelectItem>
            <SelectItem value="Abnormal">Abnormal</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Reviewed">Reviewed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          required
        />
      </div>
      <div>
        <Label htmlFor="results">Hasil/Catatan</Label>
        <Textarea
          id="results"
          value={formData.results}
          onChange={(e) => setFormData({ ...formData, results: e.target.value })}
          rows={2}
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          Simpan
        </Button>
      </DialogFooter>
    </form>
  )
}

function MessageForm({
  replyTo,
  patientId,
  patientName,
  onSubmit,
  onCancel,
}: {
  replyTo: Message | null
  patientId: string
  patientName: string
  onSubmit: (data: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    patientId,
    fromId: patientId,
    fromName: patientName,
    toId: replyTo?.fromId || "doctor-1",
    toName: replyTo?.fromName || "Tim Medis",
    subject: replyTo ? `Re: ${replyTo.subject}` : "",
    content: "",
    date: new Date().toISOString().split("T")[0],
    unread: true,
    type: "sent" as const,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="toName">Kepada</Label>
        <Input
          id="toName"
          value={formData.toName}
          onChange={(e) => setFormData({ ...formData, toName: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="subject">Subjek</Label>
        <Input
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="content">Pesan</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={5}
          required
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit">
          <Send className="h-4 w-4 mr-2" />
          Kirim
        </Button>
      </DialogFooter>
    </form>
  )
}
