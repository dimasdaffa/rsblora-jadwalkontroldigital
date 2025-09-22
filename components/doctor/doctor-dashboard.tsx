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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { UserNav } from "@/components/auth/user-nav"
import {
  Calendar,
  Clock,
  Users,
  FileText,
  Phone,
  User,
  MapPin,
  Plus,
  Menu,
  X,
  Edit,
  Trash2,
  MessageSquare,
  Heart,
  Save,
  Eye,
  Download,
} from "lucide-react"
import { AppointmentManager, type Appointment } from "@/lib/appointments"
import Image from "next/image"
import { dataManager } from "@/lib/data-manager"
import { getCurrentUser } from "@/lib/auth"
import { DoctorProfileForm } from "@/components/doctor/doctor-profile-form"
import { DoctorMessageForm } from "@/components/doctor/doctor-message-form"
import { getCookie } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

interface MedicalRecord {
  id: string
  patientId: string
  patientName: string
  date: string
  type: "health-update" | "clinical-note"
  doctorId: string
  createdAt: string

  // Health update fields
  bloodPressure?: string
  heartRate?: string
  temperature?: string
  weight?: string

  // Clinical note fields
  diagnosis?: string
  treatment?: string
  followUpDate?: string
  pdfFile?: string
  fileName?: string

  // Common fields
  notes: string
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

type ClinicalNote = {}

type HealthUpdate = {}

export function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState("schedule")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([])
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [isEditingRecord, setIsEditingRecord] = useState(false)
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null)
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null)
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [editingNote, setEditingNote] = useState<ClinicalNote | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  const [messages, setMessages] = useState<Message[]>([])
  const [isComposingMessage, setIsComposingMessage] = useState(false)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)

  const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false)
  const [credentialFormData, setCredentialFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  })

  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [showPatientDetail, setShowPatientDetail] = useState(false)
  const [showPatientHistory, setShowPatientHistory] = useState(false)
  const [showPhoneNumber, setShowPhoneNumber] = useState<string | null>(null)

  const [isEditingHealthUpdate, setIsEditingHealthUpdate] = useState(false)
  const [editingHealthUpdate, setEditingHealthUpdate] = useState<HealthUpdate | null>(null)

  const [previewRecord, setPreviewRecord] = useState<MedicalRecord | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = () => {
    loadAppointments()
    loadPatients()
    loadMedicalRecords()
    loadDoctorProfile()
    loadMessages()
  }

  const loadAppointments = () => {
    console.log("[v0] Loading appointments for doctor...")
    
    let currentUser = {}
    try {
      const userCookie = document.cookie.split("; ").find((row) => row.startsWith("user="))
      if (userCookie) {
        currentUser = JSON.parse(decodeURIComponent(userCookie.split("=")[1]))
      }
    } catch (error) {
      console.log("[v0] Error parsing user cookie:", error)
    }

    console.log("[v0] Current logged in user:", currentUser)

    const all = AppointmentManager.getAllAppointments()
    console.log("[v0] All appointments in system:", all)
    
    const today = new Date().toISOString().split("T")[0]

    // Improved doctor appointment filtering with better matching logic
    const doctorAppointments = all.filter((apt) => {
      console.log(`[v0] Checking appointment:`, {
        appointmentId: apt.id,
        doctorName: apt.doctorName,
        doctorId: apt.doctorId,
        doctorEmail: apt.doctorEmail,
        patientName: apt.patientName,
        currentUserName: currentUser.name,
        currentUserId: currentUser.id,
        currentUserEmail: currentUser.email
      })

      // Match by doctor name (most common case)
      if (currentUser.name && apt.doctorName && 
          currentUser.name.toLowerCase().trim() === apt.doctorName.toLowerCase().trim()) {
        console.log(`[v0] ✓ Matched by doctor name: ${currentUser.name} === ${apt.doctorName}`)
        return true
      }

      // Match by doctor ID
      if (currentUser.id && apt.doctorId && currentUser.id === apt.doctorId) {
        console.log(`[v0] ✓ Matched by doctor ID: ${currentUser.id} === ${apt.doctorId}`)
        return true
      }

      // Match by doctor email
      if (currentUser.email && apt.doctorEmail && 
          currentUser.email.toLowerCase().trim() === apt.doctorEmail.toLowerCase().trim()) {
        console.log(`[v0] ✓ Matched by doctor email: ${currentUser.email} === ${apt.doctorEmail}`)
        return true
      }

      // Additional fallback: check if this appointment was created for any doctor with current user's name
      // This handles cases where the doctor name might have slight variations
      if (currentUser.name && apt.doctorName) {
        const currentNameParts = currentUser.name.toLowerCase().split(' ')
        const aptNameParts = apt.doctorName.toLowerCase().split(' ')
        
        // Check if all parts of current user name are in appointment doctor name
        const nameMatches = currentNameParts.every(part => 
          aptNameParts.some(aptPart => aptPart.includes(part) || part.includes(aptPart))
        )
        
        if (nameMatches) {
          console.log(`[v0] ✓ Matched by name parts: ${currentUser.name} ≈ ${apt.doctorName}`)
          return true
        }
      }

      console.log(`[v0] ✗ No match found for appointment ${apt.id}`)
      return false
    })

    console.log("[v0] Filtered doctor appointments:", doctorAppointments)

    // If no real appointments found, check if we should add sample appointments
    if (doctorAppointments.length === 0 && currentUser.name) {
      console.log("[v0] No appointments found, checking if we should add sample data...")
      
      // Only add sample appointments if there are also no real appointments in the system at all
      // or if this is a fresh login
      const hasAnyAppointments = all.length > 0
      
      if (!hasAnyAppointments) {
        console.log("[v0] No appointments in system, creating sample appointments...")
        
        const sampleAppointments = [
          {
            id: `sample-${Date.now()}-1`,
            patientId: "sample-patient-1",
            patientName: "Ahmad Wijaya",
            patientEmail: "ahmad.wijaya@email.com",
            doctorId: currentUser.id || "current-doctor",
            doctorName: currentUser.name,
            doctorEmail: currentUser.email,
            date: today,
            time: "09:00",
            type: "Konsultasi Rutin",
            status: "approved",
            complaints: "Kontrol rutin diabetes",
            notes: "Pasien kontrol rutin untuk diabetes mellitus",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: `sample-${Date.now()}-2`,
            patientId: "sample-patient-2",
            patientName: "Siti Nurhaliza",
            patientEmail: "siti.nurhaliza@email.com",
            doctorId: currentUser.id || "current-doctor",
            doctorName: currentUser.name,
            doctorEmail: currentUser.email,
            date: today,
            time: "10:00",
            type: "Konsultasi Lanjutan",
            status: "approved",
            complaints: "Nyeri punggung",
            notes: "Pasien mengeluh nyeri punggung bagian bawah",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]

        // Add sample appointments to storage for persistence
        const existingAppointments = AppointmentManager.getAllAppointments()
        const updatedAppointments = [...existingAppointments, ...sampleAppointments]
        localStorage.setItem("appointments", JSON.stringify(updatedAppointments))

        doctorAppointments.push(...sampleAppointments)
        console.log("[v0] Added sample appointments:", sampleAppointments)
      }
    }

    // Filter for today's appointments that are approved
    const todayAppts = doctorAppointments.filter((apt) => {
      const isToday = apt.date === today
      const isApprovedOrPending = apt.status === "approved" || apt.status === "pending"
      console.log(`[v0] Checking if appointment is for today: ${apt.patientName} - Date: ${apt.date}, Today: ${today}, Status: ${apt.status}`)
      return isToday && isApprovedOrPending
    })

    console.log("[v0] Final results:")
    console.log("[v0] - Current user:", currentUser.name)
    console.log("[v0] - All doctor appointments:", doctorAppointments.length)
    console.log("[v0] - Today's appointments:", todayAppts.length)
    console.log("[v0] - Today's appointment details:", todayAppts)

    setAllAppointments(doctorAppointments)
    setTodayAppointments(todayAppts)
  }

  const loadPatients = () => {
    try {
      const patientProfiles = JSON.parse(localStorage.getItem("patient_profiles") || "[]")
      const appointments = AppointmentManager.getAllAppointments()

      // Create patient list from appointments and profiles
      const patientMap = new Map()

      appointments.forEach((apt) => {
        if (!patientMap.has(apt.patientEmail)) {
          const profile = patientProfiles.find((p: any) => p.email === apt.patientEmail)
          patientMap.set(apt.patientEmail, {
            id: apt.patientId || `patient-${Date.now()}-${Math.random()}`,
            name: apt.patientName,
            email: apt.patientEmail,
            age: profile?.age || 0,
            condition: apt.notes || "General consultation",
            lastVisit: apt.date,
            nextAppointment: apt.date,
            priority: apt.type === "emergency" ? "high" : "medium",
            phone: profile?.phone || "",
            medicalHistory: profile?.medicalHistory || [],
          })
        }
      })

      setPatients(Array.from(patientMap.values()))
    } catch (error) {
      console.error("Error loading patients:", error)
      setPatients([])
    }
  }

  const loadMedicalRecords = () => {
    try {
      const records = JSON.parse(localStorage.getItem("medical_records") || "[]")
      const currentUser = JSON.parse(getCookie("user") || "{}")
      const doctorRecords = records.filter(
        (record: MedicalRecord) =>
          record.doctorId === currentUser.id ||
          record.doctorId === currentUser.email ||
          record.doctorId === "current-doctor",
      )
      setMedicalRecords(doctorRecords)
    } catch (error) {
      console.error("Error loading medical records:", error)
      setMedicalRecords([])
    }
  }

  const loadDoctorProfile = () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("current_user") || "{}")
      if (currentUser.role === "doctor") {
        const doctorProfiles = JSON.parse(localStorage.getItem("doctor_profiles") || "[]")
        const users = dataManager.getUsers()

        // First try to find profile by email match
        let profile = doctorProfiles.find((d: any) => d.email === currentUser.email)

        // If not found by email, try by ID
        if (!profile) {
          profile = doctorProfiles.find((d: any) => d.id === currentUser.id)
        }

        // If still not found, get user data and create basic profile
        if (!profile) {
          const userData = users.find((u) => u.email === currentUser.email || u.id === currentUser.id)
          if (userData) {
            profile = {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              phone: "+62 123 456 789",
              specialization: "General Practice",
              license: "STR-123456789",
              experience: "5 tahun",
              bio: "Dokter dengan pengalaman dalam pelayanan kesehatan.",
            }

            // Save the created profile
            const updatedProfiles = [...doctorProfiles, profile]
            localStorage.setItem("doctor_profiles", JSON.stringify(updatedProfiles))
          }
        }

        if (profile) {
          setDoctorProfile(profile)
        } else {
          // Create default profile as fallback
          const defaultProfile: DoctorProfile = {
            id: currentUser.id || "doctor-1",
            name: currentUser.name || "Dr. Smith",
            email: currentUser.email || "doctor@rsbhayangkara.com",
            phone: "+62 123 456 789",
            specialization: "General Practice",
            license: "STR-123456789",
            experience: "5 tahun",
            bio: "Dokter dengan pengalaman dalam pelayanan kesehatan.",
          }
          setDoctorProfile(defaultProfile)
        }
      }
    } catch (error) {
      console.error("Error loading doctor profile:", error)
    }
  }

  const loadMessages = () => {
    try {
      const allMessages = JSON.parse(localStorage.getItem("patient_messages") || "[]")
      const currentUser = JSON.parse(getCookie("user") || "{}")

      // Get messages where doctor is sender or receiver
      const doctorMessages = allMessages.filter(
        (message: Message) =>
          message.fromId === currentUser.id ||
          message.toId === currentUser.id ||
          message.fromId === currentUser.email ||
          message.toId === currentUser.email ||
          message.fromName === currentUser.name ||
          message.toName === currentUser.name,
      )
      setMessages(doctorMessages)
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
    setMedicalRecords((prev) => [...prev, newRecord])
    localStorage.setItem("medical_records", JSON.stringify(updatedRecords))
    setIsEditingRecord(false)
    setEditingRecord(null)
  }

  const handleUpdateRecord = (recordId: string, recordData: Partial<MedicalRecord>) => {
    const allRecords = JSON.parse(localStorage.getItem("medical_records") || "[]")
    const updatedRecords = allRecords.map((record: MedicalRecord) =>
      record.id === recordId ? { ...record, ...recordData } : record,
    )
    setMedicalRecords((prev) => prev.map((record) => (record.id === recordId ? { ...record, ...recordData } : record)))
    localStorage.setItem("medical_records", JSON.stringify(updatedRecords))
    setIsEditingRecord(false)
    setEditingRecord(null)
  }

  const handleDeleteRecord = (recordId: string) => {
    const allRecords = JSON.parse(localStorage.getItem("medical_records") || "[]")
    const updatedRecords = allRecords.filter((record: MedicalRecord) => record.id !== recordId)
    setMedicalRecords((prev) => prev.filter((record) => record.id !== recordId))
    localStorage.setItem("medical_records", JSON.stringify(updatedRecords))
  }

  const handleSendMessage = (messageData: Omit<Message, "id" | "createdAt">) => {
    const currentUser = JSON.parse(getCookie("user") || "{}")

    const newMessage: Message = {
      ...messageData,
      id: `message-${Date.now()}`,
      createdAt: new Date().toISOString(),
      fromId: currentUser.id || currentUser.email,
      fromName: currentUser.name,
      type: "sent",
    }

    // Create corresponding received message for patient
    const receivedMessage: Message = {
      ...newMessage,
      id: `message-${Date.now()}-received`,
      fromId: currentUser.id || currentUser.email,
      fromName: currentUser.name,
      toId: messageData.patientId,
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

  const handleUpdateProfile = (profileData: Partial<DoctorProfile>) => {
    if (doctorProfile) {
      const updatedProfile = { ...doctorProfile, ...profileData }
      setDoctorProfile(updatedProfile)

      // Update in doctor profiles
      const doctorProfiles = JSON.parse(localStorage.getItem("doctor_profiles") || "[]")
      const updatedProfiles = doctorProfiles.map((d: any) =>
        d.id === doctorProfile.id || d.email === doctorProfile.email ? updatedProfile : d,
      )

      // If profile wasn't found in the array, add it
      if (!updatedProfiles.find((d: any) => d.id === updatedProfile.id || d.email === updatedProfile.email)) {
        updatedProfiles.push(updatedProfile)
      }

      localStorage.setItem("doctor_profiles", JSON.stringify(updatedProfiles))

      // Also update user data if needed
      const users = dataManager.getUsers()
      const userIndex = users.findIndex((u) => u.id === doctorProfile.id || u.email === doctorProfile.email)
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          name: updatedProfile.name,
          email: updatedProfile.email,
          updatedAt: new Date().toISOString(),
        }
        localStorage.setItem("users", JSON.stringify(users))
      }

      setIsEditingProfile(false)
    }
  }

  const handleUpdateCredentials = () => {
    if (!credentialFormData.username || !credentialFormData.password) return
    if (credentialFormData.password !== credentialFormData.confirmPassword) {
      alert("Password dan konfirmasi password tidak cocok!")
      return
    }

    const credentials = JSON.parse(localStorage.getItem("user_credentials") || "{}")
    const currentUser = getCurrentUser()

    // Remove old credential if username changed
    const oldUsername = Object.keys(credentials).find((username) => credentials[username].email === currentUser?.email)
    if (oldUsername && oldUsername !== credentialFormData.username) {
      delete credentials[oldUsername]
    }

    // Add/update new credential
    credentials[credentialFormData.username] = {
      password: credentialFormData.password,
      email: currentUser?.email || "",
      role: "doctor",
      name: currentUser?.name || "",
      id: currentUser?.id || "",
    }

    localStorage.setItem("user_credentials", JSON.stringify(credentials))

    setCredentialFormData({ username: "", password: "", confirmPassword: "" })
    setIsCredentialModalOpen(false)
  }

  const openCredentialModal = () => {
    const credentials = JSON.parse(localStorage.getItem("user_credentials") || "{}")
    const currentUser = getCurrentUser()
    const existingUsername = Object.keys(credentials).find(
      (username) => credentials[username].email === currentUser?.email,
    )
    setCredentialFormData({
      username: existingUsername || "",
      password: "",
      confirmPassword: "",
    })
    setIsCredentialModalOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
      case "approved":
        return "default"
      case "in-progress":
        return "secondary"
      case "pending":
        return "outline"
      default:
        return "outline"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  const getStats = () => {
    const todayCount = todayAppointments.length
    const totalPatients = patients.length
    const highPriorityCount = patients.filter((p) => p.priority === "high").length
    const completedToday = todayAppointments.filter((apt) => apt.status === "completed").length

    return {
      todayCount,
      totalPatients,
      highPriorityCount,
      completedToday,
    }
  }

  const stats = getStats()

  const handleViewPatientDetail = (appointment: any) => {
    console.log("[v0] Viewing patient detail for:", appointment.patientName)
    setSelectedPatient(appointment)
    setShowPatientDetail(true)
  }

  const handleViewPatientHistory = (patient: any) => {
    console.log("[v0] Viewing patient history for:", patient.name)
    setSelectedPatient(patient)
    setShowPatientHistory(true)
  }

  const handleShowPhone = (phone: string) => {
    console.log("[v0] Showing phone number:", phone)
    setShowPhoneNumber(phone)
    setTimeout(() => setShowPhoneNumber(null), 3000) // Hide after 3 seconds
  }

  const getDoctorPatients = () => {
    const currentUser = JSON.parse(getCookie("user") || "{}")
    
    // Get all appointments for this doctor (not just today's)
    const allDoctorAppointments = allAppointments
    
    // Get all unique patients from appointments
    const appointmentPatients = new Map()
    allDoctorAppointments.forEach((apt) => {
      if (!appointmentPatients.has(apt.patientEmail)) {
        appointmentPatients.set(apt.patientEmail, {
          id: apt.patientId || apt.patientEmail,
          name: apt.patientName,
          email: apt.patientEmail,
        })
      }
    })
    
    // Also get patients from the patient list
    patients.forEach((patient) => {
      if (!appointmentPatients.has(patient.email)) {
        appointmentPatients.set(patient.email, {
          id: patient.id,
          name: patient.name,
          email: patient.email,
        })
      }
    })
    
    // Get registered patients from localStorage who might have appointments
    try {
      const registeredPatients = JSON.parse(localStorage.getItem("hospital_users") || "[]")
        .filter((user: any) => user.role === "patient")
      
      registeredPatients.forEach((patient: any) => {
        if (!appointmentPatients.has(patient.email)) {
          appointmentPatients.set(patient.email, {
            id: patient.id,
            name: patient.name || `${patient.firstName} ${patient.lastName}`.trim(),
            email: patient.email,
          })
        }
      })
    } catch (error) {
      console.error("Error loading registered patients:", error)
    }
    
    return Array.from(appointmentPatients.values()).filter(p => p.name && p.email)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* ... existing header code ... */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 shadow-sm">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Image
                src="/logo-bhayangkara.jpg"
                alt="RS. Bhayangkara Blora"
                width={40}
                height={40}
                className="rounded-xl sm:w-12 sm:h-12"
              />
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  RS. Bhayangkara Blora Tk. IV
                </h1>
                <p className="text-xs sm:text-sm text-blue-600/70">Portal Dokter</p>
              </div>
              <div className="block sm:hidden">
                <h1 className="text-sm font-bold text-blue-600">RS. Bhayangkara</h1>
                <p className="text-xs text-blue-600/70">Portal Dokter</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent text-xs px-2 sm:px-4"
              >
                <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Darurat: </span>911
              </Button>
              <Button variant="ghost" size="sm" className="md:hidden p-2" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <div className="hidden md:block">
                <UserNav />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8">
          <h2 className="text-xl sm:text-4xl font-bold text-gray-800 mb-2">
            Selamat pagi, {doctorProfile?.name || "Dokter"}!
          </h2>
          <p className="text-sm sm:text-lg text-blue-600/70">
            Anda memiliki {stats.todayCount} janji temu yang dijadwalkan untuk hari ini.
          </p>
        </div>

        <div className="flex gap-0 md:gap-6">
          <div
            className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-sm border-r border-blue-100 shadow-lg transform transition-transform duration-300 md:relative md:translate-x-0 md:w-auto md:bg-transparent md:border-0 md:shadow-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
          >
            <div className="p-4 md:hidden">
              <div className="flex items-center gap-3 mb-6">
                <Image
                  src="/logo-bhayangkara.jpg"
                  alt="RS. Bhayangkara Blora"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <div>
                  <h3 className="font-bold text-blue-600 text-sm">RS. Bhayangkara Blora</h3>
                  <p className="text-xs text-blue-600/70">Portal Dokter</p>
                </div>
              </div>
              <div className="mb-4">
                <UserNav />
              </div>
            </div>

            {/* Improved mobile navigation with better responsive design */}
            <nav className="p-4 space-y-2 md:hidden">
              {[
                { id: "schedule", label: "Jadwal Hari Ini", icon: "📅" },
                { id: "control-schedule", label: "Jadwal Kontrol", icon: "🛠️" },
                { id: "patients", label: "Daftar Pasien", icon: "👥" },
                { id: "medical-records", label: "Rekam Medis", icon: "🏥" },
                { id: "messages", label: "Pesan", icon: "💬" },
                { id: "overview", label: "Ringkasan", icon: "📈" },
                { id: "profile", label: "Profil", icon: "👤" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-[1.02]"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-600 active:scale-95"
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {activeTab === tab.id && <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>}
                </button>
              ))}
            </nav>
          </div>

          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          <div className="flex-1 w-full">
            {/* Enhanced desktop tab navigation with better mobile responsiveness */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-sm sticky top-0 z-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-1 bg-transparent p-2 h-auto">
                    {[
                      { id: "schedule", label: "Jadwal Hari Ini", icon: "📅", shortLabel: "Jadwal" },
                      { id: "control-schedule", label: "Jadwal Kontrol", icon: "🛠️", shortLabel: "Kontrol" },
                      { id: "patients", label: "Daftar Pasien", icon: "👥", shortLabel: "Pasien" },
                      { id: "medical-records", label: "Rekam Medis", icon: "🏥", shortLabel: "Rekam" },
                      { id: "messages", label: "Pesan", icon: "💬", shortLabel: "Pesan" },
                      { id: "overview", label: "Ringkasan", icon: "📈", shortLabel: "Ringkasan" },
                      { id: "profile", label: "Profil", icon: "👤", shortLabel: "Profil" },
                    ].map((tab) => (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-gray-700 data-[state=inactive]:hover:bg-blue-50 data-[state=inactive]:hover:text-blue-600 text-xs sm:text-sm py-2 sm:py-3 px-1 sm:px-3 min-h-[50px] sm:min-h-[56px] rounded-xl transition-all duration-200 font-medium"
                      >
                        <span className="text-base sm:text-lg">{tab.icon}</span>
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden text-[10px] leading-tight text-center">{tab.shortLabel}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </div>

              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                {/* Schedule Tab */}
                <TabsContent value="schedule" className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div>
                      <h3 className="text-xl sm:text-3xl font-bold text-gray-800">Jadwal Hari Ini</h3>
                      <p className="text-blue-600/70 text-sm sm:text-lg">
                        {new Date().toLocaleDateString("id-ID", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    {todayAppointments.length === 0 ? (
                      <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
                        <CardContent className="p-8 text-center">
                          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Tidak ada janji temu untuk hari ini</p>
                        </CardContent>
                      </Card>
                    ) : (
                      todayAppointments.map((appointment) => (
                        <Card
                          key={appointment.id}
                          className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <CardContent className="p-3 sm:p-6">
                            <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
                              <div className="flex items-start gap-3">
                                <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-2 rounded-full flex-shrink-0">
                                  <User className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-semibold text-gray-800 text-sm sm:text-lg">
                                    {appointment.patientName}
                                  </h4>
                                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4 mt-1">
                                    <div className="flex items-center gap-1 text-xs sm:text-sm text-blue-600/70">
                                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                                      {appointment.time}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs sm:text-sm text-blue-600/70">
                                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                                      {appointment.type}
                                    </div>
                                  </div>
                                  {appointment.notes && (
                                    <p className="text-xs sm:text-sm text-gray-600 mt-2 bg-blue-50 p-2 rounded-lg">
                                      {appointment.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end sm:gap-2">
                                <Badge variant={getStatusColor(appointment.status)} className="px-2 py-1 text-xs">
                                  {appointment.status}
                                </Badge>
                                <Badge variant="outline" className="border-blue-200 text-blue-600 px-2 py-1 text-xs">
                                  {appointment.type}
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent text-xs"
                                  onClick={() => handleViewPatientDetail(appointment)}
                                >
                                  Lihat Detail
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="control-schedule">
                  <div>
                    <h3 className="text-xl sm:text-3xl font-bold text-gray-800 mb-2">Jadwal Kontrol Digital</h3>
                    <p className="text-blue-600/70 text-sm sm:text-lg mb-6">
                      Kelola jadwal kontrol dan ketersediaan Anda
                    </p>
                  </div>
                  <div className="space-y-6">
                    <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-800">Jadwal Kontrol Pasien</CardTitle>
                        <p className="text-sm text-gray-600">Daftar pasien yang memiliki jadwal kontrol</p>
                      </CardHeader>
                      <CardContent>
                        {allAppointments.length === 0 ? (
                          <div className="text-center py-8">
                            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">Tidak ada jadwal kontrol pasien</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {allAppointments.map((appointment) => (
                              <div
                                key={appointment.id}
                                className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="bg-blue-100 p-2 rounded-full">
                                    <User className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-800">{appointment.patientName}</h4>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {appointment.date}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {appointment.time}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {appointment.type}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-blue-600 border-blue-200 bg-transparent"
                                    onClick={() => handleViewPatientDetail(appointment)}
                                  >
                                    Detail
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Patients Tab */}
                <TabsContent value="patients" className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-xl sm:text-3xl font-bold text-gray-800">Daftar Pasien</h3>
                      <p className="text-blue-600/70 text-sm sm:text-lg">
                        Kelola informasi pasien Anda ({patients.length} pasien)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    {patients.length === 0 ? (
                      <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
                        <CardContent className="p-8 text-center">
                          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Belum ada data pasien</p>
                        </CardContent>
                      </Card>
                    ) : (
                      patients.map((patient) => (
                        <Card
                          key={patient.id}
                          className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <CardContent className="p-3 sm:p-6">
                            <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
                              <div className="flex items-start gap-3">
                                <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-2 rounded-full flex-shrink-0">
                                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-semibold text-gray-800 text-sm sm:text-lg">{patient.name}</h4>
                                  <p className="text-xs sm:text-sm text-blue-600/70">Umur: {patient.age}</p>
                                  <p className="text-xs sm:text-sm text-gray-600">Kondisi: {patient.condition}</p>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 mt-2 text-xs text-blue-600/60">
                                    <span>Visit terakhir: {patient.lastVisit}</span>
                                    <span>Berikutnya: {patient.nextAppointment}</span>
                                    <span>{patient.phone}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end sm:gap-2">
                                <Badge variant={getPriorityColor(patient.priority)} className="px-2 py-1 text-xs">
                                  {patient.priority} prioritas
                                </Badge>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent text-xs"
                                    onClick={() => handleViewPatientHistory(patient)}
                                  >
                                    Lihat Riwayat
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent p-2"
                                    onClick={() => handleShowPhone(patient.phone)}
                                  >
                                    <Phone className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="medical-records" className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-xl sm:text-3xl font-bold text-gray-800">Rekam Medis Pasien</h3>
                      <p className="text-blue-600/70 text-sm sm:text-lg">
                        Kelola rekam medis dan update kesehatan pasien ({medicalRecords.length} rekam)
                      </p>
                    </div>
                    <Dialog open={isEditingRecord} onOpenChange={setIsEditingRecord}>
                      <DialogTrigger asChild>
                        <Button
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg text-sm"
                          onClick={() => {
                            setEditingRecord(null)
                            setIsEditingRecord(true)
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Rekam Medis Baru
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{editingRecord ? "Edit Rekam Medis" : "Rekam Medis Baru"}</DialogTitle>
                          <DialogDescription>
                            {editingRecord ? "Ubah rekam medis pasien" : "Buat rekam medis baru untuk pasien"}
                          </DialogDescription>
                        </DialogHeader>
                        <MedicalRecordForm
                          record={editingRecord}
                          patients={getDoctorPatients()}
                          onSave={
                            editingRecord ? (data) => handleUpdateRecord(editingRecord.id, data) : handleCreateRecord
                          }
                          onCancel={() => {
                            setIsEditingRecord(false)
                            setEditingRecord(null)
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    {medicalRecords.length === 0 ? (
                      <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
                        <CardContent className="p-8 text-center">
                          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Belum ada rekam medis</p>
                        </CardContent>
                      </Card>
                    ) : (
                      medicalRecords.map((record) => (
                        <Card
                          key={record.id}
                          className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <CardContent className="p-3 sm:p-6">
                            <div className="space-y-3 sm:space-y-0 sm:flex sm:items-start sm:gap-4">
                              <div
                                className={`p-2 rounded-full flex-shrink-0 w-fit ${
                                  record.type === "health-update"
                                    ? "bg-gradient-to-r from-green-100 to-green-200"
                                    : "bg-gradient-to-r from-blue-100 to-blue-200"
                                }`}
                              >
                                {record.type === "health-update" ? (
                                  <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                                ) : (
                                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
                                  <h4 className="font-semibold text-gray-800 text-sm sm:text-lg">
                                    {record.patientName}
                                  </h4>
                                  <span className="text-xs sm:text-sm text-blue-600/70">{record.date}</span>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={`mb-3 text-xs ${
                                    record.type === "health-update"
                                      ? "border-green-200 text-green-600"
                                      : "border-blue-200 text-blue-600"
                                  }`}
                                >
                                  {record.type === "health-update" ? "Update Kesehatan" : "Catatan Klinis"}
                                </Badge>

                                {record.type === "health-update" && (
                                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                                    {record.bloodPressure && (
                                      <div className="bg-green-50 p-2 rounded">
                                        <span className="font-medium">TD:</span> {record.bloodPressure}
                                      </div>
                                    )}
                                    {record.heartRate && (
                                      <div className="bg-green-50 p-2 rounded">
                                        <span className="font-medium">HR:</span> {record.heartRate} bpm
                                      </div>
                                    )}
                                    {record.temperature && (
                                      <div className="bg-green-50 p-2 rounded">
                                        <span className="font-medium">Suhu:</span> {record.temperature}°C
                                      </div>
                                    )}
                                    {record.weight && (
                                      <div className="bg-green-50 p-2 rounded">
                                        <span className="font-medium">BB:</span> {record.weight} kg
                                      </div>
                                    )}
                                  </div>
                                )}

                                {record.type === "clinical-note" && (
                                  <div className="space-y-2 mb-3 text-xs">
                                    {record.diagnosis && (
                                      <div className="bg-blue-50 p-2 rounded">
                                        <span className="font-medium">Diagnosis:</span> {record.diagnosis}
                                      </div>
                                    )}
                                    {record.treatment && (
                                      <div className="bg-blue-50 p-2 rounded">
                                        <span className="font-medium">Pengobatan:</span> {record.treatment}
                                      </div>
                                    )}
                                    {record.fileName && (
                                      <div className="bg-blue-50 p-2 rounded">
                                        <span className="font-medium">File:</span> {record.fileName}
                                      </div>
                                    )}
                                  </div>
                                )}

                                <p className="text-xs sm:text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                  {record.notes}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-green-200 text-green-600 hover:bg-green-50 bg-transparent text-xs w-fit"
                                  onClick={() => {
                                    setPreviewRecord(record)
                                    setIsPreviewOpen(true)
                                  }}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent text-xs w-fit"
                                  onClick={() => {
                                    setEditingRecord(record)
                                    setIsEditingRecord(true)
                                  }}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent text-xs w-fit"
                                  onClick={() => handleDeleteRecord(record.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>

                {/* Messages Tab */}
                <TabsContent value="messages" className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl sm:text-3xl font-bold text-gray-800">Pesan</h3>
                      <p className="text-sm sm:text-lg text-blue-600/70">Berkomunikasi dengan pasien Anda</p>
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
                            {replyingTo ? "Balas pesan dari pasien" : "Kirim pesan ke pasien"}
                          </DialogDescription>
                        </DialogHeader>
                        <DoctorMessageForm
                          replyTo={replyingTo}
                          doctorProfile={doctorProfile}
                          patients={patients}
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

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-xl sm:text-3xl font-bold text-gray-800 mb-2">Ringkasan Hari Ini</h3>
                    <p className="text-sm sm:text-lg text-blue-600/70">Statistik dan informasi penting</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500 rounded-lg">
                            <Calendar className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-blue-600/70">Janji Temu Hari Ini</p>
                            <p className="text-lg sm:text-2xl font-bold text-blue-700">{stats.todayCount}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-500 rounded-lg">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-green-600/70">Total Pasien</p>
                            <p className="text-lg sm:text-2xl font-bold text-green-700">{stats.totalPatients}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-500 rounded-lg">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-purple-600/70">Rekam Medis</p>
                            <p className="text-lg sm:text-2xl font-bold text-purple-700">{medicalRecords.length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-500 rounded-lg">
                            <MessageSquare className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-orange-600/70">Pesan Baru</p>
                            <p className="text-lg sm:text-2xl font-bold text-orange-700">
                              {messages.filter((m) => m.unread).length}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Hospital director and video sections removed as requested */}

                    <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200 lg:col-span-2">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg sm:text-xl text-blue-700">
                          Kepala Rumah Sakit Bhayangkara Tk. IV Blora
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <p className="text-sm sm:text-base text-gray-700">
                            RS. Bhayangkara Blora Tk. IV berkomitmen memberikan pelayanan kesehatan terbaik untuk
                            masyarakat dengan fasilitas modern dan tenaga medis profesional.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
                    <CardHeader>
                      <CardTitle className="text-lg sm:text-xl text-purple-700">Aktivitas Terbaru</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {todayAppointments.slice(0, 3).map((appointment) => (
                          <div
                            key={appointment.id}
                            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-100"
                          >
                            <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {appointment.patientName} - {appointment.type}
                              </p>
                              <p className="text-xs text-purple-600/70">
                                {appointment.time} • {appointment.status}
                              </p>
                            </div>
                          </div>
                        ))}
                        {todayAppointments.length === 0 && (
                          <div className="text-center py-4">
                            <p className="text-sm text-purple-600/70">Tidak ada aktivitas hari ini</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Profil Dokter</h3>
                      <p className="text-gray-600">Kelola informasi profil Anda</p>
                    </div>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                      onClick={() => setIsEditingProfile(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profil
                    </Button>
                    <Button
                      variant="outline"
                      className="border-purple-200 text-purple-600 hover:bg-purple-50 w-full sm:w-auto bg-transparent"
                      onClick={openCredentialModal}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Login
                    </Button>
                  </div>

                  {doctorProfile && (
                    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                      <CardHeader>
                        <CardTitle className="text-gray-900">Informasi Profil</CardTitle>
                        <CardDescription className="text-gray-600">Detail informasi dokter</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Nama Lengkap</Label>
                            <p className="text-gray-900 mt-1">{doctorProfile.name}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Email</Label>
                            <p className="text-gray-900 mt-1">{doctorProfile.email}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Nomor Telepon</Label>
                            <p className="text-gray-900 mt-1">{doctorProfile.phone}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Spesialisasi</Label>
                            <p className="text-gray-900 mt-1">{doctorProfile.specialization}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Nomor STR</Label>
                            <p className="text-gray-900 mt-1">{doctorProfile.license}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Pengalaman</Label>
                            <p className="text-gray-900 mt-1">{doctorProfile.experience}</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Bio</Label>
                          <p className="text-gray-900 mt-1">{doctorProfile.bio}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Edit Profil Dokter</DialogTitle>
                        <DialogDescription>Ubah informasi profil Anda</DialogDescription>
                      </DialogHeader>
                      {doctorProfile && (
                        <DoctorProfileForm
                          profile={doctorProfile}
                          onSubmit={handleUpdateProfile}
                          onCancel={() => setIsEditingProfile(false)}
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                  <Dialog open={isCredentialModalOpen} onOpenChange={setIsCredentialModalOpen}>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Edit Login Credentials</DialogTitle>
                        <DialogDescription>Ubah username dan password login Anda</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="doctor-credential-username">Username Login *</Label>
                          <Input
                            id="doctor-credential-username"
                            value={credentialFormData.username}
                            onChange={(e) => setCredentialFormData({ ...credentialFormData, username: e.target.value })}
                            placeholder="username_dokter"
                          />
                        </div>
                        <div>
                          <Label htmlFor="doctor-credential-password">Password Baru *</Label>
                          <Input
                            id="doctor-credential-password"
                            type="password"
                            value={credentialFormData.password}
                            onChange={(e) => setCredentialFormData({ ...credentialFormData, password: e.target.value })}
                            placeholder="Password baru"
                          />
                        </div>
                        <div>
                          <Label htmlFor="doctor-credential-confirm">Konfirmasi Password *</Label>
                          <Input
                            id="doctor-credential-confirm"
                            type="password"
                            value={credentialFormData.confirmPassword}
                            onChange={(e) =>
                              setCredentialFormData({ ...credentialFormData, confirmPassword: e.target.value })
                            }
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
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </main>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview Rekam Medis
            </DialogTitle>
            <DialogDescription>Tampilan lengkap rekam medis pasien</DialogDescription>
          </DialogHeader>
          {previewRecord && (
            <div className="space-y-6">
              {/* Patient Info Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{previewRecord.patientName}</h3>
                    <p className="text-blue-600">ID: {previewRecord.patientId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Tanggal Pemeriksaan</p>
                    <p className="font-semibold text-gray-800">{previewRecord.date}</p>
                  </div>
                </div>
              </div>

              {/* Health Data Section */}
              {(previewRecord.bloodPressure ||
                previewRecord.heartRate ||
                previewRecord.temperature ||
                previewRecord.weight) && (
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Data Kesehatan
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {previewRecord.bloodPressure && (
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-600">Tekanan Darah</p>
                        <p className="text-lg font-bold text-green-600">{previewRecord.bloodPressure}</p>
                        <p className="text-xs text-gray-500">mmHg</p>
                      </div>
                    )}
                    {previewRecord.heartRate && (
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-600">Detak Jantung</p>
                        <p className="text-lg font-bold text-green-600">{previewRecord.heartRate}</p>
                        <p className="text-xs text-gray-500">bpm</p>
                      </div>
                    )}
                    {previewRecord.temperature && (
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-600">Suhu Tubuh</p>
                        <p className="text-lg font-bold text-green-600">{previewRecord.temperature}</p>
                        <p className="text-xs text-gray-500">°C</p>
                      </div>
                    )}
                    {previewRecord.weight && (
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-600">Berat Badan</p>
                        <p className="text-lg font-bold text-green-600">{previewRecord.weight}</p>
                        <p className="text-xs text-gray-500">kg</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Clinical Notes Section */}
              {(previewRecord.diagnosis || previewRecord.treatment || previewRecord.followUpDate) && (
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Catatan Klinis
                  </h4>
                  <div className="space-y-4">
                    {previewRecord.diagnosis && (
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm font-medium text-gray-600 mb-2">Diagnosis</p>
                        <p className="text-gray-800">{previewRecord.diagnosis}</p>
                      </div>
                    )}
                    {previewRecord.treatment && (
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm font-medium text-gray-600 mb-2">Pengobatan</p>
                        <p className="text-gray-800">{previewRecord.treatment}</p>
                      </div>
                    )}
                    {previewRecord.followUpDate && (
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm font-medium text-gray-600 mb-2">Tanggal Kontrol Berikutnya</p>
                        <p className="text-gray-800">{previewRecord.followUpDate}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PDF File Section */}
              {previewRecord.fileName && (
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <h4 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    File Rekam Medis
                  </h4>
                  <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-100 p-2 rounded">
                        <FileText className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{previewRecord.fileName}</p>
                        <p className="text-sm text-gray-600">PDF Document</p>
                      </div>
                    </div>
                    {previewRecord.pdfFile && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement("a")
                          link.href = previewRecord.pdfFile!
                          link.download = previewRecord.fileName!
                          link.click()
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Notes Section */}
              {previewRecord.notes && (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Catatan Tambahan</h4>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-gray-800 leading-relaxed">{previewRecord.notes}</p>
                  </div>
                </div>
              )}

              {/* Footer Info */}
              <div className="bg-gray-100 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">
                  Rekam medis dibuat pada: {new Date(previewRecord.createdAt).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Tutup
            </Button>
            {previewRecord && (
              <Button
                onClick={() => {
                  setEditingRecord(previewRecord)
                  setIsEditingRecord(true)
                  setIsPreviewOpen(false)
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPatientDetail} onOpenChange={setShowPatientDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Pasien</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Nama Pasien</Label>
                  <p className="text-gray-900 mt-1">{selectedPatient.patientName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Email</Label>
                  <p className="text-gray-900 mt-1">{selectedPatient.patientEmail}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Tanggal Janji</Label>
                  <p className="text-gray-900 mt-1">{selectedPatient.date}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Waktu</Label>
                  <p className="text-gray-900 mt-1">{selectedPatient.time}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Jenis Konsultasi</Label>
                  <p className="text-gray-900 mt-1">{selectedPatient.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Status</Label>
                  <Badge variant={getStatusColor(selectedPatient.status)}>{selectedPatient.status}</Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Keluhan</Label>
                <p className="text-gray-900 mt-1">{selectedPatient.complaints}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Catatan</Label>
                <p className="text-gray-900 mt-1">{selectedPatient.notes}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showPatientHistory} onOpenChange={setShowPatientHistory}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Riwayat Pasien - {selectedPatient?.name}</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Nama</Label>
                  <p className="text-gray-900 mt-1">{selectedPatient.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Umur</Label>
                  <p className="text-gray-900 mt-1">{selectedPatient.age}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Telepon</Label>
                  <p className="text-gray-900 mt-1">{selectedPatient.phone}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Kondisi Saat Ini</Label>
                <p className="text-gray-900 mt-1">{selectedPatient.condition}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Kunjungan Terakhir</Label>
                  <p className="text-gray-900 mt-1">{selectedPatient.lastVisit}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Janji Berikutnya</Label>
                  <p className="text-gray-900 mt-1">{selectedPatient.nextAppointment}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Prioritas</Label>
                <Badge variant={getPriorityColor(selectedPatient.priority)}>{selectedPatient.priority} prioritas</Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Riwayat Kunjungan</Label>
                <div className="mt-2 space-y-2">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium">Kunjungan Terakhir - {selectedPatient.lastVisit}</p>
                    <p className="text-sm text-gray-600 mt-1">Kondisi: {selectedPatient.condition}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {showPhoneNumber && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span>Nomor Telepon: {showPhoneNumber}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function MedicalRecordForm({
  record,
  patients,
  onSave,
  onCancel,
}: {
  record?: MedicalRecord
  patients: any[]
  onSave: (record: Omit<MedicalRecord, "id" | "createdAt">) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    patientId: record?.patientId || "",
    patientName: record?.patientName || "",
    date: record?.date || new Date().toISOString().split("T")[0],
    type: "Rekam Medis Lengkap", // Combined type instead of separate health-update/clinical-note
    doctorId: "current-doctor",
    doctorName: record?.doctorName || "Dr. Current",
    status: "Normal",
    description: record?.notes || "",

    // Health update fields
    bloodPressure: record?.bloodPressure || "",
    heartRate: record?.heartRate || "",
    temperature: record?.temperature || "",
    weight: record?.weight || "",

    // Clinical note fields
    diagnosis: record?.diagnosis || "",
    treatment: record?.treatment || "",
    followUpDate: record?.followUpDate || "",
    pdfFile: record?.pdfFile || "",
    fileName: record?.fileName || "",

    // Common fields
    notes: record?.notes || "",
  })

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64String = event.target?.result as string
        setFormData({
          ...formData,
          pdfFile: base64String,
          fileName: file.name,
        })
      }
      reader.readAsDataURL(file)
    } else {
      alert("Silakan pilih file PDF")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="patientName">Nama Pasien</Label>
          <Select
            value={formData.patientName}
            onValueChange={(value) => {
              const patient = patients.find((p) => p.name === value)
              setFormData({
                ...formData,
                patientName: value,
                patientId: patient?.id || patient?.email || value,
              })
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih pasien" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.name}>
                  {patient.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-800">Data Kesehatan</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="bloodPressure">Tekanan Darah</Label>
            <Input
              id="bloodPressure"
              placeholder="120/80"
              value={formData.bloodPressure}
              onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="heartRate">Detak Jantung</Label>
            <Input
              id="heartRate"
              placeholder="72"
              value={formData.heartRate}
              onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="temperature">Suhu Tubuh (°C)</Label>
            <Input
              id="temperature"
              placeholder="36.5"
              value={formData.temperature}
              onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="weight">Berat Badan (kg)</Label>
            <Input
              id="weight"
              placeholder="70"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-800">Catatan Klinis</h4>
        <div>
          <Label htmlFor="diagnosis">Diagnosis</Label>
          <Input
            id="diagnosis"
            value={formData.diagnosis}
            onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
            placeholder="Diagnosis pasien"
          />
        </div>
        <div>
          <Label htmlFor="treatment">Pengobatan</Label>
          <Input
            id="treatment"
            value={formData.treatment}
            onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
            placeholder="Rencana pengobatan"
          />
        </div>
        <div>
          <Label htmlFor="followUpDate">Tanggal Kontrol</Label>
          <Input
            id="followUpDate"
            type="date"
            value={formData.followUpDate}
            onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="pdfFile">Upload File PDF Rekam Medis</Label>
          <Input id="pdfFile" type="file" accept=".pdf" onChange={handleFileUpload} />
          {formData.fileName && <p className="text-sm text-green-600 mt-1">File terpilih: {formData.fileName}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Catatan Tambahan</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={4}
          placeholder="Catatan tambahan..."
          required
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
