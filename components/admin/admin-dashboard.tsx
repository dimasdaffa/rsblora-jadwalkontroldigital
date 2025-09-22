"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Calendar,
  Activity,
  TrendingUp,
  UserPlus,
  CheckCircle,
  XCircle,
  Clock,
  Stethoscope,
  Brain,
  X,
  Menu,
  FileText,
  MessageSquare,
  LogOut,
  Edit,
  Trash2,
} from "lucide-react"
import { AppointmentManager, type Appointment } from "@/lib/appointments"
import { ScheduleManagement } from "./schedule-management"
import { UnifiedUserForm } from "./unified-user-form"
import { Shield, Check } from "lucide-react"
import { UserList } from "./user-list"

import { dataManager, type User } from "@/lib/data-manager"
import { UserNav } from "@/components/user-nav"
import Image from "next/image"
import { Label } from "@/components/ui/label"
import { ProfileForm } from "./profile-form"

interface SystemUser {
  id: string
  name: string
  email: string
  role: "admin" | "doctor" | "patient"
  department: string
  status: "active" | "inactive"
  lastLogin: string
  patients?: number
  createdAt: string
}

interface SystemAlert {
  id: string
  type: "error" | "warning" | "success" | "info"
  title: string
  message: string
  timestamp: string
  status: "active" | "resolved"
}

interface AdminProfile {
  id: string
  name: string
  email: string
  phone: string
  department: string
  position: string
  bio: string
  avatar?: string
  dateOfBirth?: string
  gender?: "male" | "female" | "other"
  employeeId?: string
  accessLevel?: string
  joinDate?: string
  education?: string
  certifications?: string
  address?: string
  city?: string
  province?: string
  postalCode?: string
  emergencyContact?: string
  emergencyPhone?: string
}

interface PatientHealthUpdate {
  id: string
  patientName: string
  doctorId: string
  diagnosis: string
  treatment: string
  date: string
  notes?: string
  followUpRequired: boolean
  followUpDate?: string
  status: "draft" | "completed"
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [systemUsers, setSystemUsers] = useState<User[]>([])
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([])
  const [healthUpdates, setHealthUpdates] = useState<PatientHealthUpdate[]>([])
  const [statistics, setStatistics] = useState({
    totalPatients: 0,
    pendingAppointments: 0,
    totalDoctors: 0,
    totalMedicalRecords: 0,
    totalHealthUpdates: 0,
  })
  const [medicalRecords, setMedicalRecords] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([])
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null)
  const [isEditingUser, setIsEditingUser] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([])
  const [success, setSuccess] = useState<string>("")
  const [error, setError] = useState<string>("")

  const [deleteAppointmentId, setDeleteAppointmentId] = useState<string | null>(null)

  const handleLogout = () => {
    // Clear user session
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    localStorage.removeItem("user")
    sessionStorage.removeItem("user")

    // Redirect to login page
    window.location.href = "/login"
  }

  useEffect(() => {
    const clearAllData = () => {
      console.log("[v0] Manually clearing all data...")

      // Clear all localStorage data
      const keysToRemove = [
        "users",
        "doctor_profiles",
        "patient_profiles",
        "appointments",
        "medical_records",
        "doctor_medical_records",
        "patient_messages",
        "patient_health_updates",
        "system_alerts",
        "admin_profile",
        "doctor_schedules",
        "patient_appointments",
      ]

      keysToRemove.forEach((key) => {
        if (localStorage.getItem(key)) {
          console.log(`[v0] Removing ${key}:`, localStorage.getItem(key))
          localStorage.removeItem(key)
        }
      })

      // Clear all sessionStorage
      sessionStorage.clear()

      // Clear all cookies except the current user session
      const cookies = document.cookie.split(";")
      cookies.forEach((cookie) => {
        const eqPos = cookie.indexOf("=")
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
        if (name !== "user") {
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
        }
      })

      console.log("[v0] All data cleared successfully!")

      // Mark that data has been cleared
      localStorage.setItem("data_cleared", "true")

      // Reload the page to start fresh
      window.location.reload()
    }

    // Only clear data once
    if (!localStorage.getItem("data_cleared")) {
      clearAllData()
      return
    }

    const loadData = async () => {
      try {
        setLoading(true)

        // Load users
        const users = dataManager.getUsers()
        setSystemUsers(users)

        loadAppointments()

        const storedHealthUpdates = localStorage.getItem("patient_health_updates")
        const allHealthUpdates = storedHealthUpdates ? JSON.parse(storedHealthUpdates) : []
        setHealthUpdates(allHealthUpdates)

        // Calculate statistics
        const stats = {
          totalPatients: users.filter((u) => u.role === "patient").length,
          pendingAppointments: allAppointments.filter((a) => a.status === "pending").length,
          totalDoctors: users.filter((u) => u.role === "doctor").length,
          totalMedicalRecords: 0, // Will be calculated from actual data
          totalHealthUpdates: allHealthUpdates.length,
        }
        setStatistics(stats)

        // Load other data
        setMedicalRecords([])
        setMessages([])
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, []) // Empty dependency array to run only once

  const loadAppointments = () => {
    try {
      const appointments = AppointmentManager.getAllAppointments()
      setAllAppointments(appointments)
      setPendingAppointments(appointments.filter((apt: Appointment) => apt.status === "pending"))
    } catch (error) {
      console.error("Error loading appointments:", error)
    }
  }

  const loadSystemAlerts = () => {
    try {
      const alerts = JSON.parse(localStorage.getItem("system_alerts") || "[]")
      setSystemAlerts(alerts)
    } catch (error) {
      console.error("Error loading system alerts:", error)
      setSystemAlerts([])
    }
  }

  const loadAdminProfile = () => {
    try {
      const profile = JSON.parse(localStorage.getItem("admin_profile") || "null")
      if (!profile) {
        // Create default admin profile
        const defaultProfile: AdminProfile = {
          id: "admin-1",
          name: "Administrator",
          email: "admin@rsbhayangkara.com",
          phone: "+62 123 456 789",
          department: "IT & Administration",
          position: "System Administrator",
          bio: "Mengelola sistem informasi rumah sakit dan infrastruktur digital.",
        }
        setAdminProfile(defaultProfile)
        localStorage.setItem("admin_profile", JSON.stringify(defaultProfile))
      } else {
        setAdminProfile(profile)
      }
    } catch (error) {
      console.error("Error loading admin profile:", error)
    }
  }

  const handleCreateUnifiedUser = (userData: Omit<User, "id" | "createdAt" | "updatedAt">, doctorData?: any) => {
    try {
      // Step 1: Create basic user account
      const newUser = dataManager.createUser(userData)

      if (userData.password) {
        const existingCredentials = JSON.parse(localStorage.getItem("user_credentials") || "[]")
        const newCredential = {
          email: userData.email,
          password: userData.password,
          role: userData.role,
          name: userData.name,
        }
        const updatedCredentials = [...existingCredentials, newCredential]
        localStorage.setItem("user_credentials", JSON.stringify(updatedCredentials))
        console.log("[v0] Login credentials created for:", userData.email)
      }

      // Step 2: If creating a doctor, handle doctor-specific data
      if (userData.role === "doctor" && doctorData) {
        // Create doctor profile
        const doctorProfile = {
          id: `dr_${Date.now()}`,
          ...doctorData,
          status: "active" as const,
          joinDate: new Date().toISOString().split("T")[0],
          totalPatients: 0,
          rating: 0,
        }

        // Save to doctor profiles
        const existingDoctors = JSON.parse(localStorage.getItem("doctor_profiles") || "[]")
        const updatedDoctors = [...existingDoctors, doctorProfile]
        localStorage.setItem("doctor_profiles", JSON.stringify(updatedDoctors))

        // Auto-add to schedule system
        const scheduleData = JSON.parse(localStorage.getItem("doctor_schedules") || "{}")
        if (!scheduleData[doctorProfile.id]) {
          scheduleData[doctorProfile.id] = {
            doctorId: doctorProfile.id,
            name: doctorData.name,
            specialty: doctorData.specialty,
            schedule: {},
            availability: "available",
          }
          localStorage.setItem("doctor_schedules", JSON.stringify(scheduleData))
        }

        console.log("[v0] Doctor created successfully with profile and schedule integration")
      }

      // Step 3: Refresh user list
      const users = dataManager.getUsers()
      setSystemUsers(users)
      setIsEditingUser(false)
      setEditingUser(null)

      console.log("[v0] User created successfully:", newUser)
    } catch (error) {
      console.error("[v0] Error creating user:", error)
    }
  }

  const handleUpdateUser = (userId: string, userData: Partial<User>) => {
    dataManager.updateUser(userId, userData)
    const users = dataManager.getUsers()
    setSystemUsers(users)
    setIsEditingUser(false)
    setEditingUser(null)
  }

  const handleDeleteUser = (userId: string) => {
    dataManager.deleteUser(userId)
    const users = dataManager.getUsers()
    setSystemUsers(users)
  }

  const handleUpdateProfile = (profileData: Partial<AdminProfile>) => {
    if (adminProfile) {
      const updatedProfile = { ...adminProfile, ...profileData }
      setAdminProfile(updatedProfile)
      localStorage.setItem("admin_profile", JSON.stringify(updatedProfile))
      setIsEditingProfile(false)
    }
  }

  const handleApproveAppointment = (appointmentId: string) => {
    AppointmentManager.approveAppointment(appointmentId)
    const appointments = AppointmentManager.getAllAppointments()
    setAllAppointments(appointments)
    const stats = {
      ...statistics,
      pendingAppointments: appointments.filter((a) => a.status === "pending").length,
    }
    setStatistics(stats)
  }

  const handleRejectAppointment = (appointmentId: string) => {
    AppointmentManager.rejectAppointment(appointmentId)
    const appointments = AppointmentManager.getAllAppointments()
    setAllAppointments(appointments)
    const stats = {
      ...statistics,
      pendingAppointments: appointments.filter((a) => a.status === "pending").length,
    }
    setStatistics(stats)
  }

  const handleDeleteAppointment = (appointment: any) => {
    setDeleteAppointmentId(appointment.id)
  }

  const confirmDeleteAppointment = () => {
    if (!deleteAppointmentId) return

    try {
      // Get current appointments
      const appointments = AppointmentManager.getAllAppointments()

      // Remove the appointment
      const updatedAppointments = appointments.filter((apt) => apt.id !== deleteAppointmentId)

      // Save updated appointments using AppointmentManager's private method approach
      localStorage.setItem("appointments", JSON.stringify(updatedAppointments))

      // Refresh the appointments list by reloading from localStorage
      const refreshedAppointments = AppointmentManager.getAllAppointments()
      setAllAppointments(refreshedAppointments)

      // Show success message
      setSuccess("Appointment deleted successfully")
      setTimeout(() => setSuccess(""), 3000)

      console.log("[v0] Appointment deleted successfully:", deleteAppointmentId)
    } catch (error) {
      console.error("[v0] Error deleting appointment:", error)
      setError("Failed to delete appointment")
      setTimeout(() => setError(""), 3000)
    } finally {
      setDeleteAppointmentId(null)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "doctor":
        return <Stethoscope className="h-4 w-4" />
      case "patient":
        return <Users className="h-4 w-4" />
      case "admin":
        return <Shield className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "inactive":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case "error":
        return "destructive"
      case "warning":
        return "secondary"
      case "success":
        return "default"
      case "info":
        return "outline"
      default:
        return "outline"
    }
  }

  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "approved":
        return "default"
      case "rejected":
        return "destructive"
      case "completed":
        return "outline"
      default:
        return "outline"
    }
  }

  const getSystemStats = () => {
    const totalUsers = systemUsers.length
    const activeUsers = systemUsers.filter((u) => u.status === "active").length
    const totalAppointments = allAppointments.length
    const todayAppointments = allAppointments.filter(
      (apt) => apt.date === new Date().toISOString().split("T")[0],
    ).length

    return {
      totalUsers,
      activeUsers,
      totalAppointments,
      todayAppointments,
      systemUptime: "99.9%",
      avgResponseTime: "1.2s",
    }
  }

  const getDepartmentStats = () => {
    const doctors = systemUsers.filter((u) => u.role === "doctor")
    const departments = [...new Set(doctors.map((d) => d.department))]

    return departments.map((dept) => ({
      name: dept,
      doctors: doctors.filter((d) => d.department === dept).length,
      patients: doctors.filter((d) => d.department === dept).reduce((sum, d) => sum + (d.patients || 0), 0),
      appointments: allAppointments.filter((apt) => apt.doctorSpecialization === dept).length,
    }))
  }

  const getHealthAnalytics = () => {
    const specializations = ["Kardiologi", "Dermatologi", "Ortopedi", "Penyakit Dalam"]
    return specializations.map((spec) => ({
      name: spec,
      cases: allAppointments.filter((apt) => apt.doctorSpecialization === spec).length,
      percentage: Math.round(
        (allAppointments.filter((apt) => apt.doctorSpecialization === spec).length /
          Math.max(allAppointments.length, 1)) *
          100,
      ),
    }))
  }

  const systemStats = getSystemStats()
  const departmentStats = getDepartmentStats()
  const healthAnalytics = getHealthAnalytics()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

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
              <p className="text-sm text-blue-600/70">Portal Admin</p>
            </div>
          </div>
          <UserNav />
        </div>

        <nav className="p-6 space-y-3 md:hidden">
          {[
            { id: "overview", label: "Ringkasan", icon: TrendingUp },
            { id: "appointments", label: "Janji Temu", icon: Calendar },
            { id: "schedule", label: "Jadwal Kontrol", icon: Clock },
            { id: "health-updates", label: "Update Kesehatan", icon: FileText },
            { id: "users", label: "Pengguna", icon: Users },
            { id: "analytics", label: "Analitik", icon: Brain },
            { id: "profile", label: "Profile", icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setSidebarOpen(false)
              }}
              className={`w-full text-left px-4 py-4 rounded-lg transition-colors text-base font-medium min-h-[56px] flex items-center gap-3 ${activeTab === tab.id ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"}`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-200 md:hidden">
          <Button
            variant="outline"
            className="justify-start w-full h-12 text-left font-medium border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 bg-transparent"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Keluar
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/90 backdrop-blur-sm border-b border-blue-100 shadow-sm px-4 py-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden h-10 w-10 p-0 hover:bg-gray-100"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Dashboard Admin
                </h1>
                <p className="text-sm sm:text-base text-blue-600/70">Kelola sistem rumah sakit</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Keluar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
              >
                <Users className="h-4 w-4 mr-2" />
                911
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 bg-gradient-to-br from-blue-50/30 via-white/50 to-blue-50/30">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">Selamat datang, Administrator!</h2>
            <p className="text-base sm:text-lg text-blue-600/70">
              Kelola dan pantau seluruh sistem rumah sakit dalam satu tempat.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 sm:space-y-8">
            <TabsList className="hidden md:grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 bg-white/60 backdrop-blur-sm border border-blue-100 shadow-sm p-2 h-auto">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-900 text-sm sm:text-base py-3 px-4 min-h-[48px]"
              >
                Ringkasan
              </TabsTrigger>
              <TabsTrigger
                value="appointments"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-900 text-sm sm:text-base py-3 px-4 min-h-[48px]"
              >
                Janji Temu
              </TabsTrigger>
              <TabsTrigger
                value="schedule"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-900 text-sm sm:text-base py-3 px-4 min-h-[48px]"
              >
                Jadwal Kontrol
              </TabsTrigger>
              <TabsTrigger
                value="health-updates"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-900 text-sm sm:text-base py-3 px-4 min-h-[48px]"
              >
                Update Kesehatan
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-900 text-sm sm:text-base py-3 px-4 min-h-[48px]"
              >
                Pengguna
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-900 text-sm sm:text-base py-3 px-4 min-h-[48px]"
              >
                Analitik
              </TabsTrigger>
            </TabsList>

            <div className="md:hidden overflow-x-auto">
              <TabsList className="flex w-max gap-1 h-auto p-1 bg-white/80 backdrop-blur-sm min-w-full">
                <TabsTrigger
                  value="overview"
                  className="text-xs py-3 px-4 whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
                >
                  Ringkasan
                </TabsTrigger>
                <TabsTrigger
                  value="appointments"
                  className="text-xs py-3 px-4 whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
                >
                  Janji Temu
                </TabsTrigger>
                <TabsTrigger
                  value="schedule"
                  className="text-xs py-3 px-4 whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
                >
                  Jadwal
                </TabsTrigger>
                <TabsTrigger
                  value="health-updates"
                  className="text-xs py-3 px-4 whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
                >
                  Update
                </TabsTrigger>
                <TabsTrigger
                  value="users"
                  className="text-xs py-3 px-4 whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
                >
                  Pengguna
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="text-xs py-3 px-4 whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
                >
                  Analitik
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">Ringkasan Sistem</h3>
                <p className="text-sm sm:text-lg text-blue-600/70">Statistik dan aktivitas terkini rumah sakit</p>
              </div>

              <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-100">Total Pasien</CardTitle>
                    <div className="bg-blue-400/20 p-2 rounded-lg">
                      <Users className="h-4 w-4 text-blue-200" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{statistics.totalPatients}</div>
                    <p className="text-xs text-blue-200">Pasien terdaftar</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-orange-100">Janji Temu</CardTitle>
                    <div className="bg-orange-400/20 p-2 rounded-lg">
                      <Calendar className="h-4 w-4 text-orange-200" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{statistics.pendingAppointments}</div>
                    <p className="text-xs text-orange-200">Menunggu persetujuan</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-100">Dokter Aktif</CardTitle>
                    <div className="bg-green-400/20 p-2 rounded-lg">
                      <Stethoscope className="h-4 w-4 text-green-200" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{statistics.totalDoctors}</div>
                    <p className="text-xs text-green-200">Dokter tersedia</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-100">Update Kesehatan</CardTitle>
                    <div className="bg-purple-400/20 p-2 rounded-lg">
                      <Activity className="h-4 w-4 text-purple-200" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{statistics.totalHealthUpdates}</div>
                    <p className="text-xs text-purple-200">Total update</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-gray-800">Janji Temu Terbaru</CardTitle>
                    <CardDescription className="text-blue-600/70">
                      Permintaan janji temu yang perlu ditinjau
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {pendingAppointments.slice(0, 5).map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 space-y-3 sm:space-y-0"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{appointment.patientName}</p>
                            <p className="text-sm text-gray-500">{appointment.doctorName}</p>
                            <p className="text-xs text-gray-400">
                              {appointment.date} {appointment.time}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              className="h-8 px-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                              onClick={() => handleApproveAppointment(appointment.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-3 border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                              onClick={() => handleRejectAppointment(appointment.id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {pendingAppointments.length === 0 && (
                        <div className="text-center py-8">
                          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Tidak ada janji temu yang menunggu</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-gray-800">Pesan Terbaru</CardTitle>
                    <CardDescription className="text-blue-600/70">Pesan dari pasien dan dokter</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {messages.slice(0, 5).map((message) => (
                        <div
                          key={message.id}
                          className="flex items-start space-x-3 p-4 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{message.subject}</p>
                            <p className="text-sm text-gray-500 truncate">{message.content}</p>
                            <p className="text-xs text-gray-400">{new Date(message.createdAt).toLocaleDateString()}</p>
                          </div>
                          {!message.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />}
                        </div>
                      ))}
                      {messages.length === 0 && (
                        <div className="text-center py-8">
                          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Tidak ada pesan</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Appointments Tab */}
            <TabsContent value="appointments" className="space-y-6">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">Manajemen Janji Temu</h3>
                <p className="text-sm sm:text-lg text-blue-600/70">Tinjau dan kelola permintaan janji temu pasien</p>
              </div>

              {/* Pending Appointments */}
              <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-800">Pending Appointments ({pendingAppointments.length})</CardTitle>
                  <CardDescription className="text-blue-600/70">Appointments awaiting your approval</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingAppointments.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No pending appointments</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-3 rounded-full">
                              <Calendar className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{appointment.patientName}</h4>
                              <p className="text-sm text-gray-600">{appointment.patientEmail}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <Users className="h-4 w-4" />
                                  {appointment.doctorName}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <Calendar className="h-4 w-4" />
                                  {appointment.date}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <Clock className="h-4 w-4" />
                                  {appointment.time}
                                </div>
                              </div>
                              {appointment.notes && (
                                <p className="text-sm text-gray-600 mt-1">
                                  <strong>Notes:</strong> {appointment.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-blue-200 text-blue-600">
                              {appointment.type}
                            </Badge>
                            <Button
                              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                              onClick={() => handleApproveAppointment(appointment.id)}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                              onClick={() => handleRejectAppointment(appointment.id)}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* All Appointments */}
              <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-800">All Appointments ({allAppointments.length})</CardTitle>
                  <CardDescription className="text-blue-600/70">Complete appointment history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {allAppointments.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No appointments found</p>
                      </div>
                    ) : (
                      allAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 p-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-2 sm:p-3 rounded-full flex-shrink-0">
                                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                                  {appointment.patientName}
                                </h4>
                                <p className="text-xs sm:text-sm text-gray-600 truncate">{appointment.patientEmail}</p>

                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                    <span className="truncate">{appointment.doctorName}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                    <span>{appointment.date}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                    <span>{appointment.time}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="border-blue-200 text-blue-600 text-xs">
                                  {appointment.type}
                                </Badge>
                                <Badge variant={getAppointmentStatusColor(appointment.status)} className="text-xs">
                                  {appointment.status}
                                </Badge>
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteAppointment(appointment)}
                                className="border-red-200 text-red-600 hover:bg-red-50 w-full sm:w-auto min-h-[36px] text-xs"
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                <span className="sm:inline">Delete</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Schedule Management Tab */}
            <TabsContent value="schedule" className="space-y-6">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">Manajemen Jadwal Dokter</h3>
                <p className="text-sm sm:text-lg text-blue-600/70">Kelola ketersediaan dokter dan slot janji temu</p>
              </div>
              <ScheduleManagement />
            </TabsContent>

            {/* Unified User Management Tab */}
            <TabsContent value="users" className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">Manajemen Pengguna</h3>
                  <p className="text-sm sm:text-lg text-blue-600/70">
                    Kelola semua pengguna sistem termasuk dokter, pasien, dan admin
                  </p>
                </div>
                <div className="flex gap-2">
                  <Dialog open={isEditingUser} onOpenChange={setIsEditingUser}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Tambah Pengguna
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                        <DialogDescription>
                          Masukkan informasi pengguna baru. Pilih role "Dokter" untuk menambahkan informasi medis.
                        </DialogDescription>
                      </DialogHeader>
                      <UnifiedUserForm
                        user={editingUser}
                        onSubmit={(userData, doctorData) => {
                          if (editingUser) {
                            // If editing an existing user, call update function with the user's ID
                            handleUpdateUser(editingUser.id, userData);
                          } else {
                            // If creating a new user, call create function
                            handleCreateUnifiedUser(userData, doctorData);
                          }
                        }}
                        onCancel={() => {
                          setIsEditingUser(false);
                          setEditingUser(null);
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* User Type Tabs */}
              <Tabs defaultValue="all" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-sm border border-blue-100">
                  <TabsTrigger value="all">Semua ({systemUsers.length})</TabsTrigger>
                  <TabsTrigger value="doctor">
                    Dokter ({systemUsers.filter((u) => u.role === "doctor").length})
                  </TabsTrigger>
                  <TabsTrigger value="patient">
                    Pasien ({systemUsers.filter((u) => u.role === "patient").length})
                  </TabsTrigger>
                  <TabsTrigger value="admin">
                    Admin ({systemUsers.filter((u) => u.role === "admin").length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  <UserList
                    users={systemUsers}
                    onEdit={(user) => {
                      setEditingUser(user)
                      setIsEditingUser(true)
                    }}
                    onDelete={handleDeleteUser}
                  />
                </TabsContent>

                <TabsContent value="doctor" className="space-y-4">
                  <UserList
                    users={systemUsers.filter((u) => u.role === "doctor")}
                    onEdit={(user) => {
                      setEditingUser(user)
                      setIsEditingUser(true)
                    }}
                    onDelete={handleDeleteUser}
                  />
                </TabsContent>

                <TabsContent value="patient" className="space-y-4">
                  <UserList
                    users={systemUsers.filter((u) => u.role === "patient")}
                    onEdit={(user) => {
                      setEditingUser(user)
                      setIsEditingUser(true)
                    }}
                    onDelete={handleDeleteUser}
                  />
                </TabsContent>

                <TabsContent value="admin" className="space-y-4">
                  <UserList
                    users={systemUsers.filter((u) => u.role === "admin")}
                    onEdit={(user) => {
                      setEditingUser(user)
                      setIsEditingUser(true)
                    }}
                    onDelete={handleDeleteUser}
                  />
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">Analitik Kesehatan</h3>
                <p className="text-sm sm:text-lg text-blue-600/70">Jumlah kasus kesehatan berdasarkan spesialisasi</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {healthAnalytics.map((specialty, index) => (
                  <Card
                    key={specialty.name}
                    className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-700">{specialty.name}</CardTitle>
                      <div
                        className={`bg-gradient-to-r ${
                          index === 0
                            ? "from-blue-500 to-blue-600"
                            : index === 1
                              ? "from-green-500 to-green-600"
                              : index === 2
                                ? "from-orange-500 to-orange-600"
                                : "from-purple-500 to-purple-600"
                        } p-2 rounded-lg`}
                      >
                        <Activity className="h-4 w-4 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-800">{specialty.cases}</div>
                      <p className="text-xs text-gray-600">{specialty.percentage}% dari total kasus</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-gray-800">Statistik Departemen</CardTitle>
                    <CardDescription className="text-blue-600/70">
                      Distribusi dokter dan pasien per departemen
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {departmentStats.map((dept) => (
                        <div
                          key={dept.name}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100"
                        >
                          <div>
                            <h4 className="font-medium text-gray-900">{dept.name}</h4>
                            <p className="text-sm text-gray-600">
                              {dept.doctors} dokter • {dept.patients} pasien
                            </p>
                          </div>
                          <Badge variant="outline" className="border-blue-200 text-blue-600">
                            {dept.appointments} janji temu
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-gray-800">Statistik Sistem</CardTitle>
                    <CardDescription className="text-blue-600/70">Performa dan aktivitas sistem</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100">
                        <div>
                          <h4 className="font-medium text-gray-900">Total Pengguna</h4>
                          <p className="text-sm text-gray-600">
                            {systemStats.activeUsers} aktif dari {systemStats.totalUsers}
                          </p>
                        </div>
                        <Badge variant="outline" className="border-green-200 text-green-600">
                          Online
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100">
                        <div>
                          <h4 className="font-medium text-gray-900">Janji Temu Hari Ini</h4>
                          <p className="text-sm text-gray-600">
                            {systemStats.todayAppointments} dari {systemStats.totalAppointments} total
                          </p>
                        </div>
                        <Badge variant="outline" className="border-blue-200 text-blue-600">
                          Aktif
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100">
                        <div>
                          <h4 className="font-medium text-gray-900">Uptime Sistem</h4>
                          <p className="text-sm text-gray-600">
                            Waktu respons rata-rata: {systemStats.avgResponseTime}
                          </p>
                        </div>
                        <Badge variant="outline" className="border-green-200 text-green-600">
                          {systemStats.systemUptime}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Health Updates Tab */}
            <TabsContent value="health-updates" className="space-y-6">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">Update Kesehatan Pasien</h3>
                <p className="text-sm sm:text-lg text-blue-600/70">
                  Pantau semua update kesehatan yang dibuat oleh dokter
                </p>
              </div>

              <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-100">Total Update</CardTitle>
                    <div className="bg-blue-400/20 p-2 rounded-lg">
                      <FileText className="h-4 w-4 text-blue-200" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{healthUpdates.length}</div>
                    <p className="text-xs text-blue-200">Update kesehatan</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-100">Selesai</CardTitle>
                    <div className="bg-green-400/20 p-2 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-200" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {healthUpdates.filter((update) => update.status === "completed").length}
                    </div>
                    <p className="text-xs text-green-200">Update selesai</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-orange-100">Follow-up</CardTitle>
                    <div className="bg-orange-400/20 p-2 rounded-lg">
                      <Clock className="h-4 w-4 text-orange-200" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {healthUpdates.filter((update) => update.followUpRequired).length}
                    </div>
                    <p className="text-xs text-orange-200">Perlu follow-up</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-800">Semua Update Kesehatan</CardTitle>
                  <CardDescription className="text-blue-600/70">
                    Update kesehatan yang dibuat oleh dokter untuk pasien
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {healthUpdates.map((update) => (
                      <div
                        key={update.id}
                        className="flex items-start justify-between p-4 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900">{update.patientName}</h4>
                            <Badge variant={update.status === "completed" ? "default" : "secondary"}>
                              {update.status === "completed" ? "Selesai" : "Draft"}
                            </Badge>
                            {update.followUpRequired && (
                              <Badge variant="outline" className="border-orange-200 text-orange-600">
                                Follow-up
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Diagnosis:</strong> {update.diagnosis}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Treatment:</strong> {update.treatment}
                          </p>
                          {update.notes && (
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Catatan:</strong> {update.notes}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Tanggal: {update.date}</span>
                            {update.followUpDate && <span>Follow-up: {update.followUpDate}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                    {healthUpdates.length === 0 && (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Belum ada update kesehatan</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Tab - Added comprehensive profile management tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">Profil Administrator</h3>
                  <p className="text-sm sm:text-lg text-blue-600/70">Kelola informasi profil dan akun Anda</p>
                </div>
                <Button
                  onClick={() => setIsEditingProfile(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profil
                </Button>
              </div>

              {adminProfile && (
                <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-gray-800">Informasi Profil</CardTitle>
                    <CardDescription className="text-blue-600/70">Detail informasi administrator</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Basic Information */}
                    <div>
                      <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">Informasi Dasar</h4>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Nama Lengkap</Label>
                          <p className="text-gray-900 mt-1">{adminProfile.name}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Email</Label>
                          <p className="text-gray-900 mt-1">{adminProfile.email}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Nomor Telepon</Label>
                          <p className="text-gray-900 mt-1">{adminProfile.phone || "Belum diisi"}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Tanggal Lahir</Label>
                          <p className="text-gray-900 mt-1">
                            {adminProfile.dateOfBirth
                              ? new Date(adminProfile.dateOfBirth).toLocaleDateString("id-ID")
                              : "Belum diisi"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Jenis Kelamin</Label>
                          <p className="text-gray-900 mt-1">
                            {adminProfile.gender === "male"
                              ? "Laki-laki"
                              : adminProfile.gender === "female"
                                ? "Perempuan"
                                : "Belum diisi"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">ID Karyawan</Label>
                          <p className="text-gray-900 mt-1 font-mono">{adminProfile.employeeId || "Belum diisi"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Professional Information */}
                    <div>
                      <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">Informasi Profesional</h4>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Departemen</Label>
                          <p className="text-gray-900 mt-1">{adminProfile.department}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Posisi/Jabatan</Label>
                          <p className="text-gray-900 mt-1">{adminProfile.position}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Level Akses</Label>
                          <p className="text-gray-900 mt-1">{adminProfile.accessLevel || "Admin"}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Tanggal Bergabung</Label>
                          <p className="text-gray-900 mt-1">
                            {adminProfile.joinDate
                              ? new Date(adminProfile.joinDate).toLocaleDateString("id-ID")
                              : "Belum diisi"}
                          </p>
                        </div>
                      </div>

                      {adminProfile.education && (
                        <div className="mt-4">
                          <Label className="text-sm font-medium text-gray-700">Pendidikan</Label>
                          <p className="text-gray-900 mt-1">{adminProfile.education}</p>
                        </div>
                      )}

                      {adminProfile.certifications && (
                        <div className="mt-4">
                          <Label className="text-sm font-medium text-gray-700">Sertifikasi</Label>
                          <p className="text-gray-900 mt-1">{adminProfile.certifications}</p>
                        </div>
                      )}
                    </div>

                    {/* Address Information */}
                    {(adminProfile.address || adminProfile.city || adminProfile.province) && (
                      <div>
                        <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">Alamat</h4>
                        <div className="grid md:grid-cols-2 gap-6">
                          {adminProfile.address && (
                            <div className="md:col-span-2">
                              <Label className="text-sm font-medium text-gray-700">Alamat Lengkap</Label>
                              <p className="text-gray-900 mt-1">{adminProfile.address}</p>
                            </div>
                          )}
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Kota</Label>
                            <p className="text-gray-900 mt-1">{adminProfile.city || "Belum diisi"}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Provinsi</Label>
                            <p className="text-gray-900 mt-1">{adminProfile.province || "Belum diisi"}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Kode Pos</Label>
                            <p className="text-gray-900 mt-1">{adminProfile.postalCode || "Belum diisi"}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Emergency Contact */}
                    {(adminProfile.emergencyContact || adminProfile.emergencyPhone) && (
                      <div>
                        <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">Kontak Darurat</h4>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Nama Kontak Darurat</Label>
                            <p className="text-gray-900 mt-1">{adminProfile.emergencyContact || "Belum diisi"}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Nomor Telepon Darurat</Label>
                            <p className="text-gray-900 mt-1">{adminProfile.emergencyPhone || "Belum diisi"}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bio */}
                    {adminProfile.bio && (
                      <div>
                        <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">Bio Profesional</h4>
                        <p className="text-gray-900">{adminProfile.bio}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Dialog open={!!deleteAppointmentId} onOpenChange={() => setDeleteAppointmentId(null)}>
                <DialogContent className="w-[95vw] max-w-md mx-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg">Delete Appointment</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this appointment? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setDeleteAppointmentId(null)}
                      className="w-full sm:w-auto min-h-[44px]"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={confirmDeleteAppointment}
                      className="w-full sm:w-auto min-h-[44px]"
                    >
                      Delete Appointment
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Profil Administrator</DialogTitle>
                    <DialogDescription>Ubah informasi profil dan akun Anda</DialogDescription>
                  </DialogHeader>
                  {adminProfile && (
                    <ProfileForm
                      profile={adminProfile}
                      onSubmit={handleUpdateProfile}
                      onCancel={() => setIsEditingProfile(false)}
                    />
                  )}
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

export { AdminDashboard }
