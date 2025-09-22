"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, ChevronLeft, ChevronRight, Search, Filter } from "lucide-react"
import { ScheduleManager, type DoctorSchedule } from "@/lib/schedule"
import { dataManager } from "@/lib/data-manager"

interface Doctor {
  id: string
  name: string
  specialty: string
  status: string
}

const dayColors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
]

const timeSlotColors = [
  "bg-red-100 border-red-200 text-red-800",
  "bg-blue-100 border-blue-200 text-blue-800",
  "bg-green-100 border-green-200 text-green-800",
  "bg-purple-100 border-purple-200 text-purple-800",
  "bg-orange-100 border-orange-200 text-orange-800",
]

export function ScheduleManagement() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [selectedWeek, setSelectedWeek] = useState(new Date())
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([])
  const [viewMode, setViewMode] = useState<"week" | "day">("week")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("all")

  useEffect(() => {
    loadDoctors()
    cleanupDeletedDoctorSchedules()

    const cleanupInterval = setInterval(() => {
      cleanupDeletedDoctorSchedules()
      loadDoctors()
    }, 5000)

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "doctor_profiles" || e.key === "doctor_schedules") {
        cleanupDeletedDoctorSchedules()
        loadDoctors()
        if (selectedDoctor) {
          loadSchedules()
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      clearInterval(cleanupInterval)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  useEffect(() => {
    filterDoctors()
  }, [doctors, searchQuery, selectedSpecialty])

  useEffect(() => {
    if (selectedDoctor) {
      loadSchedules()
    }
  }, [selectedDoctor, selectedWeek])

  const cleanupDeletedDoctorSchedules = () => {
    try {
      // Get active doctors from user management system
      const users = dataManager.getUsers()
      const activeDoctorUsers = users.filter((user) => user.role === "doctor" && user.status === "active")
      const activeDoctorIds = activeDoctorUsers.map((user) => user.id)

      // Also include doctor profile IDs as fallback
      const storedDoctorProfiles = localStorage.getItem("doctor_profiles")
      if (storedDoctorProfiles) {
        const doctorProfiles = JSON.parse(storedDoctorProfiles)
        const activeProfileIds = doctorProfiles.filter((d: any) => d.status === "active").map((d: any) => d.id)
        activeDoctorIds.push(...activeProfileIds)
      }

      // Remove duplicates
      const uniqueActiveDoctorIds = [...new Set(activeDoctorIds)]

      const storedSchedules = localStorage.getItem("doctor_schedules")
      const storedDoctors = localStorage.getItem("doctors")

      if (storedSchedules) {
        const existingSchedules = JSON.parse(storedSchedules)
        const cleanedSchedules = existingSchedules.filter((schedule: any) =>
          uniqueActiveDoctorIds.includes(schedule.doctorId),
        )

        if (cleanedSchedules.length !== existingSchedules.length) {
          localStorage.setItem("doctor_schedules", JSON.stringify(cleanedSchedules))
          console.log("[v0] Cleaned up schedules for deleted doctors")
        }
      }

      if (storedDoctors) {
        const existingDoctors = JSON.parse(storedDoctors)
        const cleanedDoctors = existingDoctors.filter((doctor: any) => uniqueActiveDoctorIds.includes(doctor.id))

        if (cleanedDoctors.length !== existingDoctors.length) {
          localStorage.setItem("doctors", JSON.stringify(cleanedDoctors))
          console.log("[v0] Cleaned up doctors list for deleted doctors")
        }
      }

      if (selectedDoctor && !uniqueActiveDoctorIds.includes(selectedDoctor)) {
        setSelectedDoctor("")
        setSchedules([])
        console.log("[v0] Reset selected doctor as it was deleted")
      }
    } catch (error) {
      console.error("Error during cleanup:", error)
    }
  }

  const loadDoctors = () => {
    try {
      console.log("[v0] Loading doctors from user management system...")

      // Get doctors from user management system first
      const users = dataManager.getUsers()
      console.log("[v0] All users from dataManager:", users)

      const doctorUsers = users.filter((user) => user.role === "doctor" && user.status === "active")
      console.log("[v0] Filtered doctor users:", doctorUsers)

      // Get doctor profiles for additional information
      const stored = localStorage.getItem("doctor_profiles")
      const doctorProfiles = stored ? JSON.parse(stored) : []
      console.log("[v0] Doctor profiles from localStorage:", doctorProfiles)

      // Combine user data with profile data
      const combinedDoctors = doctorUsers.map((user) => {
        const profile = doctorProfiles.find((p: any) => p.email === user.email || p.id === user.id)
        return {
          id: user.id,
          name: user.name,
          specialty: profile?.specialization || profile?.specialty || user.department || "General Practice",
          status: user.status,
        }
      })

      // If no doctors found in user system, fallback to doctor profiles only
      let activeDoctors = combinedDoctors
      if (combinedDoctors.length === 0) {
        console.log("[v0] No doctors found in user system, using fallback to doctor profiles")
        const fallbackDoctors = doctorProfiles
          .filter((d: any) => d.status === "active")
          .map((d: any) => ({
            id: d.id,
            name: d.name,
            specialty: d.specialty || d.specialization || "General Practice",
            status: d.status,
          }))
        activeDoctors = fallbackDoctors
      }

      console.log("[v0] Final active doctors:", activeDoctors)

      setDoctors(activeDoctors)

      if (activeDoctors.length > 0 && (!selectedDoctor || !activeDoctors.find((d) => d.id === selectedDoctor))) {
        setSelectedDoctor(activeDoctors[0].id)
      } else if (activeDoctors.length === 0) {
        setSelectedDoctor("")
        setSchedules([])
      }
    } catch (error) {
      console.error("Error loading doctors:", error)
      // Fallback to empty array
      setDoctors([])
      setSelectedDoctor("")
      setSchedules([])
    }
  }

  const filterDoctors = () => {
    console.log("[v0] Filtering doctors. Total doctors:", doctors.length)
    let filtered = doctors

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedSpecialty !== "all") {
      filtered = filtered.filter((doctor) => doctor.specialty === selectedSpecialty)
    }

    console.log("[v0] Filtered doctors:", filtered)
    setFilteredDoctors(filtered)

    if (selectedDoctor && !filtered.find((d) => d.id === selectedDoctor)) {
      if (filtered.length > 0) {
        setSelectedDoctor(filtered[0].id)
      } else {
        setSelectedDoctor("")
      }
    }
  }

  const getUniqueSpecialties = () => {
    const specialties = [...new Set(doctors.map((d) => d.specialty))]
    return specialties.sort()
  }

  const loadSchedules = () => {
    const storedDoctorProfiles = localStorage.getItem("doctor_profiles")
    if (storedDoctorProfiles) {
      const doctorProfiles = JSON.parse(storedDoctorProfiles)
      const doctorExists = doctorProfiles.find((d: any) => d.id === selectedDoctor && d.status === "active")

      if (!doctorExists) {
        console.log("[v0] Selected doctor no longer exists, clearing schedules")
        setSchedules([])
        setSelectedDoctor("")
        return
      }
    }

    const weekSchedules = ScheduleManager.getDoctorScheduleForWeek(selectedDoctor, selectedWeek)
    setSchedules(weekSchedules)
  }

  const toggleSlotAvailability = (scheduleId: string, timeSlotId: string, currentAvailability: boolean) => {
    ScheduleManager.updateTimeSlot(scheduleId, timeSlotId, {
      isAvailable: !currentAvailability,
      ...(currentAvailability ? { patientId: undefined, patientName: undefined, appointmentType: undefined } : {}),
    })
    loadSchedules()
  }

  const addScheduleForDay = (day: Date) => {
    if (!selectedDoctor) return

    const dateStr = day.toISOString().split("T")[0]
    const doctorInfo = filteredDoctors.find((d) => d.id === selectedDoctor)

    if (doctorInfo) {
      const newSchedule = ScheduleManager.createDoctorSchedule({
        doctorId: selectedDoctor,
        doctorName: doctorInfo.name,
        specialty: doctorInfo.specialty,
        date: dateStr,
        timeSlots: [
          { id: `slot_${Date.now()}_1`, time: "09:00", isAvailable: true },
          { id: `slot_${Date.now()}_2`, time: "10:00", isAvailable: true },
          { id: `slot_${Date.now()}_3`, time: "11:00", isAvailable: true },
          { id: `slot_${Date.now()}_4`, time: "14:00", isAvailable: true },
          { id: `slot_${Date.now()}_5`, time: "15:00", isAvailable: true },
          { id: `slot_${Date.now()}_6`, time: "16:00", isAvailable: true },
        ],
      })
      loadSchedules()
    }
  }

  const getWeekDays = () => {
    const days = []
    const startOfWeek = new Date(selectedWeek)
    startOfWeek.setDate(selectedWeek.getDate() - selectedWeek.getDay() + 1)

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

  const selectedDoctorInfo = filteredDoctors.find((d) => d.id === selectedDoctor)
  const weekDays = getWeekDays()

  if (doctors.length === 0) {
    return (
      <div className="space-y-4 p-4 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Manajemen Jadwal Dokter</h1>
          <p className="text-gray-600">Kelola ketersediaan dokter dan slot janji temu</p>
        </div>
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Selamat Pagi, Admin!</h1>
          <p className="text-gray-600">Kelola jadwal dokter untuk hari ini</p>
        </div>
        <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Dokter</h3>
            <p className="text-gray-600 mb-4">
              Tambahkan dokter terlebih dahulu di menu Manajemen Pengguna untuk mulai mengatur jadwal.
            </p>
            <Button
              onClick={loadDoctors}
              variant="outline"
              className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
            >
              Refresh Data Dokter
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-3 sm:p-4 max-w-7xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">Manajemen Jadwal Dokter</h1>
        <p className="text-sm sm:text-base text-blue-600/70">Kelola ketersediaan dokter dan slot janji temu</p>
      </div>

      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">Selamat Pagi, Admin!</h1>
        <p className="text-sm sm:text-base text-blue-600/70">Kelola jadwal dokter untuk hari ini</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari dokter berdasarkan nama atau spesialisasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/80 backdrop-blur-sm border-blue-100 focus:border-blue-300"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 h-4 w-4" />
          <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
            <SelectTrigger className="w-48 bg-white/80 backdrop-blur-sm border-blue-100">
              <SelectValue placeholder="Filter spesialisasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Spesialisasi</SelectItem>
              {getUniqueSpecialties().map((specialty) => (
                <SelectItem key={specialty} value={specialty}>
                  {specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
        <div className="flex bg-white/60 backdrop-blur-sm border border-blue-100 rounded-lg p-1 w-full sm:w-auto">
          <Button
            variant={viewMode === "day" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("day")}
            className="rounded-md flex-1 sm:flex-none text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600"
          >
            Hari Ini
          </Button>
          <Button
            variant={viewMode === "week" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("week")}
            className="rounded-md flex-1 sm:flex-none text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600"
          >
            Minggu Ini
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek("prev")}
            className="rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 border-blue-200 hover:bg-blue-50"
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <span className="text-xs sm:text-sm font-medium px-2 sm:px-3 text-center min-w-[120px] text-gray-800">
            {selectedWeek.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek("next")}
            className="rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 border-blue-200 hover:bg-blue-50"
          >
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>

      {filteredDoctors.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="text-gray-500 mb-4">
              <Search className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Dokter Ditemukan</h3>
            <p className="text-gray-600 mb-4">
              Tidak ada dokter yang sesuai dengan pencarian "{searchQuery}" atau filter spesialisasi yang dipilih.
            </p>
            <Button
              onClick={() => {
                setSearchQuery("")
                setSelectedSpecialty("all")
              }}
              variant="outline"
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              Reset Filter
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 sm:mb-6">
          {filteredDoctors.map((doctor) => (
            <Card
              key={doctor.id}
              className={`cursor-pointer transition-all duration-200 ${
                selectedDoctor === doctor.id
                  ? "ring-2 ring-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg"
                  : "hover:shadow-md border-blue-100 bg-white/80 backdrop-blur-sm hover:bg-white/90"
              }`}
              onClick={() => setSelectedDoctor(doctor.id)}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mx-auto mb-2 flex items-center justify-center shadow-lg">
                    <span className="text-white font-semibold text-sm sm:text-lg">
                      {doctor.name.split(" ")[1]?.[0] || doctor.name[0]}
                    </span>
                  </div>
                  <h3 className="font-semibold text-xs sm:text-sm text-gray-900 leading-tight">{doctor.name}</h3>
                  <p className="text-xs text-blue-600/70 mt-1">{doctor.specialty}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewMode === "week" ? (
        <div className="space-y-4">
          <div className="md:hidden space-y-3">
            {weekDays.map((day, index) => {
              const daySchedule = schedules.find((s) => s.date === day.toISOString().split("T")[0])
              const dayName = day.toLocaleDateString("id-ID", { weekday: "long" })
              const dayDate = day.getDate()
              const monthName = day.toLocaleDateString("id-ID", { month: "short" }).toUpperCase()

              return (
                <Card key={index} className={`${dayColors[index]} text-white overflow-hidden shadow-lg`}>
                  <CardHeader className="pb-2 sm:pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs sm:text-sm opacity-90 font-medium">{dayName.toUpperCase()}</div>
                        <div className="text-xl sm:text-2xl font-bold">{dayDate}</div>
                        <div className="text-xs sm:text-sm opacity-90">{monthName}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/20 hover:bg-white/30 text-white border-0 h-8 w-8 sm:h-10 sm:w-10 p-0"
                        onClick={() => addScheduleForDay(day)}
                      >
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 pb-3 sm:pb-4">
                    {daySchedule ? (
                      <div className="space-y-2">
                        {daySchedule.timeSlots.map((slot, slotIndex) => (
                          <div
                            key={slot.id}
                            className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 flex items-center justify-between min-h-[44px]"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-sm sm:text-base">{slot.time}</div>
                              {!slot.isAvailable && slot.patientName && (
                                <div className="text-xs sm:text-sm opacity-80 truncate">{slot.patientName}</div>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleSlotAvailability(daySchedule.id, slot.id, slot.isAvailable)}
                              className="text-white hover:bg-white/20 h-8 w-8 p-0 flex-shrink-0 ml-2"
                            >
                              {slot.isAvailable ? (
                                <X className="h-3 w-3 sm:h-4 sm:w-4" />
                              ) : (
                                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-3 sm:py-4 text-white/70 text-sm">Tidak ada jadwal</div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="hidden md:grid md:grid-cols-7 gap-3 lg:gap-4">
            {weekDays.map((day, index) => {
              const daySchedule = schedules.find((s) => s.date === day.toISOString().split("T")[0])
              const dayName = day.toLocaleDateString("id-ID", { weekday: "short" })
              const dayDate = day.toLocaleDateString("id-ID", { month: "short", day: "numeric" })

              return (
                <Card
                  key={index}
                  className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CardHeader className="pb-2">
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 text-sm">{dayName}</div>
                      <div className="text-xs text-blue-600/70">{dayDate}</div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {daySchedule ? (
                      <div className="space-y-2">
                        {daySchedule.timeSlots.map((slot, slotIndex) => (
                          <div
                            key={slot.id}
                            className={`p-2 rounded-lg border text-xs transition-all hover:shadow-sm ${
                              slot.isAvailable
                                ? timeSlotColors[slotIndex % timeSlotColors.length]
                                : "bg-gray-100 border-gray-200 text-gray-600"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{slot.time}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleSlotAvailability(daySchedule.id, slot.id, slot.isAvailable)}
                                className="h-5 w-5 p-0 hover:bg-white/50"
                              >
                                {slot.isAvailable ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                              </Button>
                            </div>
                            {!slot.isAvailable && slot.patientName && (
                              <div className="mt-1 text-xs opacity-80 truncate">{slot.patientName}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 text-center p-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => addScheduleForDay(day)}
                          className="text-blue-600 hover:bg-blue-50 h-8 w-full"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Tambah Jadwal
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ) : (
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
                  {new Date().toLocaleDateString("id-ID", { weekday: "long" })}
                </CardTitle>
                <p className="text-base sm:text-lg font-semibold text-gray-600">
                  {new Date().getDate()} {new Date().toLocaleDateString("id-ID", { month: "long" })}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">08:00</div>
                <div className="text-xs text-gray-500">Indonesia</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Card className="bg-gradient-to-r from-red-400 to-red-500 text-white">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm opacity-90">10:45</div>
                      <div className="font-semibold text-sm sm:text-base">Konsultasi Pasien</div>
                      <div className="text-xs sm:text-sm opacity-90">📍 Ruang Konsultasi</div>
                    </div>
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full"></div>
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-400 to-orange-500 text-white">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm opacity-90">12:10</div>
                      <div className="font-semibold text-sm sm:text-base">Rapat Tim Medis</div>
                      <div className="text-xs sm:text-sm opacity-90">📍 Ruang Rapat</div>
                    </div>
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
