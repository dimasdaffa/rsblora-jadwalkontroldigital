"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Calendar } from "lucide-react"
import { ScheduleManager, type DoctorSchedule } from "@/lib/schedule"
import { dataManager } from "@/lib/data-manager"

const doctorColors = [
  "from-blue-400 to-blue-600",
  "from-green-400 to-green-600",
  "from-purple-400 to-purple-600",
  "from-orange-400 to-orange-600",
  "from-red-400 to-red-600",
  "from-teal-400 to-teal-600",
  "from-indigo-400 to-indigo-600",
  "from-pink-400 to-pink-600",
]

const dayColors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
]

interface DoctorScheduleViewProps {
  onBookAppointment: (doctorId: string, doctorName: string, date: string, timeSlotId: string, time: string) => void
}

interface Doctor {
  id: string
  name: string
  specialty: string
  email?: string
  status?: string
}

export function DoctorScheduleView({ onBookAppointment }: DoctorScheduleViewProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<string>("")
  const [selectedWeek, setSelectedWeek] = useState(new Date())
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([])
  const [viewMode, setViewMode] = useState<"week" | "month">("week")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadDoctors()
  }, [])

  useEffect(() => {
    if (selectedDoctor) {
      loadSchedules()
    }
  }, [selectedDoctor, selectedWeek])

  const loadDoctors = () => {
    try {
      // Get doctors from user management system
      const users = dataManager.getUsers()
      const doctorUsers = users.filter((user) => user.role === "doctor" && user.status === "active")

      // Get doctor profiles for additional information
      const storedDoctorProfiles = localStorage.getItem("doctor_profiles")
      const doctorProfiles = storedDoctorProfiles ? JSON.parse(storedDoctorProfiles) : []

      // Combine user data with profile data
      const combinedDoctors = doctorUsers.map((user) => {
        const profile = doctorProfiles.find((p: any) => p.email === user.email || p.id === user.id)
        return {
          id: user.id,
          name: user.name,
          specialty: profile?.specialization || profile?.specialty || user.department || "General Practice",
          email: user.email,
          status: user.status,
        }
      })

      // Also include doctors from profiles that might not have user accounts yet
      const profileOnlyDoctors = doctorProfiles
        .filter((profile: any) => {
          // Only include if not already in combinedDoctors and is active
          return profile.status === "active" && 
                 !combinedDoctors.find(d => d.email === profile.email || d.id === profile.id)
        })
        .map((profile: any) => ({
          id: profile.id,
          name: profile.name,
          specialty: profile.specialty || profile.specialization || "General Practice",
          email: profile.email,
          status: profile.status,
        }))

      // Combine both sources
      let activeDoctors = [...combinedDoctors, ...profileOnlyDoctors]

      // Filter out any invalid entries
      activeDoctors = activeDoctors.filter(
        (d: any) =>
          d &&
          d.name &&
          d.name !== "backendbuild" &&
          d.specialty &&
          d.id &&
          typeof d.name === "string" &&
          typeof d.specialty === "string"
      )

      setDoctors(activeDoctors)

      // Auto-generate schedules for doctors if they don't exist
      if (activeDoctors.length > 0) {
        activeDoctors.forEach((doctor) => {
          const existingSchedules = ScheduleManager.getSchedules()
          const doctorSchedules = existingSchedules.filter(s => s.doctorId === doctor.id)
          
          // If doctor has no schedules or very few, generate them
          if (doctorSchedules.length < 10) {
            generateSchedulesForDoctor(doctor.id, doctor.name, doctor.specialty)
          }
        })
        
        // Set first doctor as selected if none selected
        if (!selectedDoctor && activeDoctors.length > 0) {
          setSelectedDoctor(activeDoctors[0].id)
        }
      }
    } catch (error) {
      console.error("Error loading doctors:", error)
      // Fallback to empty array
      setDoctors([])
    }
  }

  // Helper function to generate schedules for a doctor
  const generateSchedulesForDoctor = (doctorId: string, doctorName: string, specialty: string) => {
    const schedules = ScheduleManager.getSchedules()
    const today = new Date()

    // Generate schedules for next 30 days
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const dateString = date.toISOString().split("T")[0]

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue

      // Check if schedule already exists for this doctor and date
      const existingSchedule = schedules.find((s) => s.doctorId === doctorId && s.date === dateString)
      if (existingSchedule) continue

      // Create default time slots
      const timeSlots = [
        { id: `${doctorId}-${dateString}-09`, time: "09:00", isAvailable: true },
        { id: `${doctorId}-${dateString}-10`, time: "10:00", isAvailable: true },
        { id: `${doctorId}-${dateString}-11`, time: "11:00", isAvailable: true },
        { id: `${doctorId}-${dateString}-14`, time: "14:00", isAvailable: true },
        { id: `${doctorId}-${dateString}-15`, time: "15:00", isAvailable: true },
        { id: `${doctorId}-${dateString}-16`, time: "16:00", isAvailable: true },
      ]

      // Add new schedule
      schedules.push({
        id: `${doctorId}-${dateString}`,
        doctorId,
        doctorName,
        specialty,
        date: dateString,
        timeSlots,
      })
    }

    // Save updated schedules
    ScheduleManager.saveSchedules(schedules)
  }

  const loadSchedules = () => {
    const weekSchedules = ScheduleManager.getDoctorScheduleForWeek(selectedDoctor, selectedWeek)
    setSchedules(weekSchedules)
  }

  const getWeekDays = () => {
    const days = []
    const startOfWeek = new Date(selectedWeek)
    startOfWeek.setDate(selectedWeek.getDate() - selectedWeek.getDay() + 1) // Start from Monday

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    return days
  }

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeek = new Date(selectedWeek)
    newWeek.setDate(selectedWeek.getDate() + (direction === "next" ? 7 : -7))
    setSelectedWeek(newWeek)
  }

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const selectedDoctorInfo = doctors.find((d) => d.id === selectedDoctor)
  const selectedDoctorIndex = doctors.findIndex((d) => d.id === selectedDoctor)
  const weekDays = getWeekDays()

  if (doctors.length === 0) {
    return (
      <div className="space-y-4 p-4 max-w-7xl mx-auto">
        <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Belum ada dokter tersedia</p>
            <p className="text-sm text-gray-500 mt-2">Dokter akan ditambahkan oleh administrator sistem</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" className="p-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari dokter atau spesialisasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <Button size="sm" className="rounded-full w-10 h-10 p-0 bg-blue-500 hover:bg-blue-600">
          <Calendar className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center justify-center mb-6">
        <div className="flex bg-gray-100 rounded-full p-1">
          <Button
            variant={viewMode === "week" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("week")}
            className="rounded-full px-6"
          >
            Minggu Ini
          </Button>
          <Button
            variant={viewMode === "month" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("month")}
            className="rounded-full px-6"
          >
            Bulan
          </Button>
        </div>
      </div>

      {viewMode === "week" ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {filteredDoctors.map((doctor, index) => (
              <Card
                key={doctor.id}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedDoctor === doctor.id
                    ? "ring-2 ring-blue-500 bg-blue-50 border-blue-200"
                    : "hover:shadow-md border-gray-200"
                }`}
                onClick={() => setSelectedDoctor(doctor.id)}
              >
                <CardContent className="p-4">
                  <div className="text-center">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${doctorColors[index % doctorColors.length]} rounded-full mx-auto mb-2 flex items-center justify-center`}
                    >
                      <span className="text-white font-semibold text-lg">
                        {doctor.name.split(" ")[1]?.[0] || doctor.name[0]}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm text-gray-900">{doctor.name}</h3>
                    <p className="text-xs text-gray-600">{doctor.specialty}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDoctors.length === 0 && searchTerm && (
            <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Tidak ada dokter yang sesuai dengan pencarian "{searchTerm}"</p>
              </CardContent>
            </Card>
          )}

          {filteredDoctors.length > 0 && (
            <>
              <div className="flex items-center justify-center gap-4 mb-6">
                <Button variant="outline" size="sm" onClick={() => navigateWeek("prev")} className="rounded-full">
                  Minggu Sebelumnya
                </Button>
                <span className="font-medium">
                  {selectedWeek.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                </span>
                <Button variant="outline" size="sm" onClick={() => navigateWeek("next")} className="rounded-full">
                  Minggu Berikutnya
                </Button>
              </div>

              <div className="space-y-4">
                {/* Mobile: Vertical list */}
                <div className="md:hidden space-y-4">
                  {weekDays.map((day, index) => {
                    const daySchedule = schedules.find((s) => s.date === day.toISOString().split("T")[0])
                    const dayName = day.toLocaleDateString("id-ID", { weekday: "long" })
                    const dayDate = day.getDate()
                    const monthName = day.toLocaleDateString("id-ID", { month: "short" }).toUpperCase()
                    const availableSlots = daySchedule?.timeSlots.filter((slot) => slot.isAvailable) || []

                    return (
                      <Card key={index} className={`${dayColors[index]} text-white overflow-hidden`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm opacity-90">{dayName.toUpperCase()}</div>
                              <div className="text-3xl font-bold">{dayDate}</div>
                              <div className="text-sm opacity-90">{monthName}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm opacity-90">{availableSlots.length} slot tersedia</div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {availableSlots.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2">
                              {availableSlots.map((slot) => (
                                <Button
                                  key={slot.id}
                                  variant="secondary"
                                  size="sm"
                                  onClick={() =>
                                    onBookAppointment(
                                      selectedDoctor,
                                      selectedDoctorInfo?.name || "",
                                      day.toISOString().split("T")[0],
                                      slot.id,
                                      slot.time,
                                    )
                                  }
                                  className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-full"
                                >
                                  {slot.time}
                                </Button>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-white/70">Tidak ada slot tersedia</div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* Desktop: Grid view */}
                <div className="hidden md:grid md:grid-cols-7 gap-4">
                  {weekDays.map((day, index) => {
                    const daySchedule = schedules.find((s) => s.date === day.toISOString().split("T")[0])
                    const dayName = day.toLocaleDateString("id-ID", { weekday: "short" })
                    const dayDate = day.toLocaleDateString("id-ID", { month: "short", day: "numeric" })
                    const availableSlots = daySchedule?.timeSlots.filter((slot) => slot.isAvailable) || []

                    return (
                      <Card key={index} className="bg-white border-gray-200">
                        <CardHeader className="pb-2">
                          <div className="text-center">
                            <div className="font-semibold text-gray-900">{dayName}</div>
                            <div className="text-sm text-gray-600">{dayDate}</div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {availableSlots.length > 0 ? (
                            <div className="space-y-2">
                              {availableSlots.map((slot) => (
                                <Button
                                  key={slot.id}
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    onBookAppointment(
                                      selectedDoctor,
                                      selectedDoctorInfo?.name || "",
                                      day.toISOString().split("T")[0],
                                      slot.id,
                                      slot.time,
                                    )
                                  }
                                  className="w-full text-xs border-green-200 text-green-700 hover:bg-green-50 bg-transparent rounded-full"
                                >
                                  {slot.time}
                                </Button>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500 text-center p-2 bg-gray-50 rounded-lg">
                              Tidak ada slot
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }, (_, i) => {
            const month = new Date(2024, i, 1)
            const monthName = month.toLocaleDateString("id-ID", { month: "long" })
            const monthColors = [
              "from-green-400 to-green-500",
              "from-purple-400 to-purple-500",
              "from-red-400 to-red-500",
              "from-blue-400 to-blue-500",
              "from-teal-400 to-teal-500",
              "from-indigo-400 to-indigo-500",
              "from-yellow-400 to-yellow-500",
              "from-pink-400 to-pink-500",
            ]

            return (
              <Card key={i} className={`bg-gradient-to-br ${monthColors[i]} text-white overflow-hidden`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold text-center">{monthName}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-7 gap-1 text-xs">
                    {["M", "S", "S", "R", "K", "J", "S"].map((day, idx) => (
                      <div key={idx} className="text-center font-medium opacity-80">
                        {day}
                      </div>
                    ))}
                    {Array.from({ length: 35 }, (_, dayIdx) => {
                      const dayNum = dayIdx - 2
                      const isCurrentMonth = dayNum > 0 && dayNum <= 31
                      return (
                        <div
                          key={dayIdx}
                          className={`text-center p-1 ${isCurrentMonth ? "opacity-100" : "opacity-30"}`}
                        >
                          {isCurrentMonth ? dayNum : ""}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
