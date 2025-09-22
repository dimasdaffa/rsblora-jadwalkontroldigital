"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, User, CheckCircle, Stethoscope, Heart, Activity } from "lucide-react"
import { AppointmentManager, type TimeSlot } from "@/lib/appointments"
import { getCurrentUser } from "@/lib/auth"
import { ScheduleManager, type DoctorSchedule } from "@/lib/schedule"
import { dataManager } from "@/lib/data-manager"

interface Doctor {
  id: string
  name: string
  specialty: string
  email: string
  phone: string
  status: string
}

interface BookAppointmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAppointmentBooked?: () => void
}

export function BookAppointmentModal({ open, onOpenChange, onAppointmentBooked }: BookAppointmentModalProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [appointmentType, setAppointmentType] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [isBooking, setIsBooking] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  const currentUser = getCurrentUser()

  useEffect(() => {
    if (open) {
      loadDoctorsAndSchedules()
    }
  }, [open])

  const loadDoctorsAndSchedules = () => {
    console.log("[v0] Loading doctors and schedules...")

    try {
      // First, get doctors from the user management system
      const users = dataManager.getUsers()
      console.log("[v0] All users from dataManager:", users)
      
      const doctorUsers = users.filter((user) => user.role === "doctor" && user.status === "active")
      console.log("[v0] Doctor users:", doctorUsers)

      // Get doctor profiles for additional information
      const storedDoctorProfiles = localStorage.getItem("doctor_profiles")
      const doctorProfiles = storedDoctorProfiles ? JSON.parse(storedDoctorProfiles) : []
      console.log("[v0] Doctor profiles:", doctorProfiles)

      // Combine user data with profile data
      const combinedDoctors = doctorUsers.map((user) => {
        const profile = doctorProfiles.find((p: any) => p.email === user.email || p.id === user.id)
        return {
          id: user.id,
          name: user.name,
          specialty: profile?.specialization || profile?.specialty || user.department || "General Practice",
          email: user.email,
          phone: profile?.phone || "",
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
          phone: profile.phone || "",
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

      console.log("[v0] Final active doctors:", activeDoctors)

      // If still no doctors found, let's check localStorage directly for debugging
      if (activeDoctors.length === 0) {
        console.log("[v0] No doctors found, checking localStorage directly...")
        console.log("[v0] users localStorage:", localStorage.getItem("users"))
        console.log("[v0] doctor_profiles localStorage:", localStorage.getItem("doctor_profiles"))
        
        // Try to load from older data structures as fallback
        const legacyDoctors = localStorage.getItem("doctors")
        if (legacyDoctors) {
          console.log("[v0] Found legacy doctors:", legacyDoctors)
          try {
            const parsed = JSON.parse(legacyDoctors)
            if (Array.isArray(parsed)) {
              activeDoctors = parsed.filter(d => d.status === "active")
              console.log("[v0] Using legacy doctors:", activeDoctors)
            }
          } catch (e) {
            console.error("[v0] Error parsing legacy doctors:", e)
          }
        }
      }

      setDoctors(activeDoctors)

      // Auto-generate schedules for doctors if they don't exist
      if (activeDoctors.length > 0) {
        try {
          console.log("[v0] Auto-generating schedules for doctors...")
          
          // Get existing schedules with proper error handling
          let allSchedules = []
          try {
            allSchedules = ScheduleManager.getSchedules()
            if (!Array.isArray(allSchedules)) {
              console.warn("[v0] ScheduleManager returned non-array, using empty array")
              allSchedules = []
            }
          } catch (scheduleGetError) {
            console.error("[v0] Error getting schedules:", scheduleGetError)
            allSchedules = []
          }
          
          console.log("[v0] Existing schedules:", allSchedules.length)
          
          // For each doctor, ensure they have schedules for the next 30 days
          activeDoctors.forEach((doctor) => {
            try {
              const doctorSchedules = allSchedules.filter(s => s.doctorId === doctor.id)
              console.log(`[v0] Doctor ${doctor.name} has ${doctorSchedules.length} existing schedules`)
              
              // If doctor has no schedules or very few, generate them
              if (doctorSchedules.length < 5) {
                console.log(`[v0] Auto-generating schedules for ${doctor.name}`)
                const newSchedules = generateSchedulesForDoctor(doctor.id, doctor.name, doctor.specialty)
                if (Array.isArray(newSchedules)) {
                  allSchedules = newSchedules
                }
              }
            } catch (doctorError) {
              console.error(`[v0] Error processing doctor ${doctor.name}:`, doctorError)
            }
          })

          // Reload schedules after generation with error handling
          try {
            allSchedules = ScheduleManager.getSchedules()
            if (!Array.isArray(allSchedules)) {
              console.warn("[v0] After generation, schedules is not an array")
              allSchedules = []
            }
          } catch (reloadError) {
            console.error("[v0] Error reloading schedules:", reloadError)
            allSchedules = []
          }
          
          // Filter schedules for our active doctors only
          const relevantSchedules = allSchedules.filter(schedule => 
            activeDoctors.some(doctor => doctor.id === schedule.doctorId)
          )
          
          console.log("[v0] Final schedules available:", relevantSchedules.length)
          setSchedules(relevantSchedules)
          
        } catch (scheduleError) {
          console.error("[v0] Error auto-generating schedules:", scheduleError)
          setSchedules([])
        }
      } else {
        console.log("[v0] No doctors available, setting empty schedules")
        setSchedules([])
      }
    } catch (error) {
      console.error("Error loading doctors and schedules:", error)
      setDoctors([])
      setSchedules([])
    }
  }

  // Helper function to generate schedules for a doctor
  const generateSchedulesForDoctor = (doctorId: string, doctorName: string, specialty: string) => {
    console.log(`[v0] Generating schedules for doctor: ${doctorName} (${doctorId})`)
    
    const existingSchedules = ScheduleManager.getSchedules()
    const today = new Date()
    const newSchedules = [...existingSchedules]

    // Generate schedules for next 30 days (including today for debugging)
    for (let i = 0; i <= 30; i++) { // Changed from i = 1 to i = 0 to include today
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const dateString = date.toISOString().split("T")[0]

      // Skip weekends, but allow today even if it's weekend for debugging
      if (i > 0 && (date.getDay() === 0 || date.getDay() === 6)) continue

      // Check if schedule already exists for this doctor and date
      const existingSchedule = newSchedules.find((s) => s.doctorId === doctorId && s.date === dateString)
      if (existingSchedule) {
        console.log(`[v0] Schedule already exists for ${doctorName} on ${dateString}`)
        continue
      }

      // Create default time slots
      const timeSlots = [
        { id: `${doctorId}-${dateString}-09`, time: "09:00", isAvailable: true },
        { id: `${doctorId}-${dateString}-10`, time: "10:00", isAvailable: true },
        { id: `${doctorId}-${dateString}-11`, time: "11:00", isAvailable: true },
        { id: `${doctorId}-${dateString}-14`, time: "14:00", isAvailable: true },
        { id: `${doctorId}-${dateString}-15`, time: "15:00", isAvailable: true },
        { id: `${doctorId}-${dateString}-16`, time: "16:00", isAvailable: true },
        { id: `${doctorId}-${dateString}-23`, time: "23:00", isAvailable: true }, // 11:00 PM for debugging
      ]

      // Add new schedule
      const newSchedule = {
        id: `${doctorId}-${dateString}`,
        doctorId,
        doctorName,
        specialty,
        date: dateString,
        timeSlots,
      }
      
      newSchedules.push(newSchedule)
      console.log(`[v0] Created schedule for ${doctorName} on ${dateString}`)
    }

    // Save updated schedules
    ScheduleManager.saveSchedules(newSchedules)
    console.log(`[v0] Saved ${newSchedules.length} total schedules, generated new ones for ${doctorName}`)
    
    return newSchedules
  }

  const handleDoctorSelect = (doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId)
    console.log("[v0] Selected doctor:", doctor)
    setSelectedDoctor(doctor || null)
    setSelectedDate("")
    setSelectedTime("")
  }

  const handleDateSelect = (date: string) => {
    console.log("[v0] Selected date:", date)
    setSelectedDate(date)
    setSelectedTime("")
  }

  const getAvailableTimeSlots = (): TimeSlot[] => {
    if (!selectedDoctor || !selectedDate) return []

    const doctorSchedules = schedules.filter((s) => s.doctorId === selectedDoctor.id)
    const schedule = doctorSchedules.find((s) => s.date === selectedDate)
    const availableSlots = schedule ? schedule.timeSlots.filter((ts) => ts.isAvailable) : []
    console.log("[v0] Available time slots:", availableSlots)
    return availableSlots
  }

  const getAvailableDates = (): DoctorSchedule[] => {
    if (!selectedDoctor) return []

    const doctorSchedules = schedules.filter((s) => s.doctorId === selectedDoctor.id)
    const availableDates = doctorSchedules.filter((schedule) => schedule.timeSlots.some((slot) => slot.isAvailable))
    console.log("[v0] Available dates for doctor:", selectedDoctor.name, availableDates)
    return availableDates
  }

  const formatTime = (time: string): string => {
    // Convert 24-hour format to 12-hour format with AM/PM
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes || "00"} ${ampm}`
  }

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !appointmentType || !currentUser) return

    console.log("[v0] Booking appointment:", {
      doctor: selectedDoctor.name,
      date: selectedDate,
      time: selectedTime,
      type: appointmentType,
    })

    setIsBooking(true)

    try {
      const timeSlot = getAvailableTimeSlots().find((slot) => slot.time === selectedTime)
      if (!timeSlot) {
        throw new Error("Selected time slot is no longer available")
      }

      const success = ScheduleManager.bookTimeSlot(
        selectedDoctor.id,
        selectedDate,
        timeSlot.id,
        currentUser.id || currentUser.email,
        currentUser.name,
        appointmentType,
      )

      if (!success) {
        throw new Error("Failed to book time slot")
      }

      AppointmentManager.createAppointment({
        patientId: currentUser.id || currentUser.email,
        patientName: currentUser.name,
        patientEmail: currentUser.email,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        date: selectedDate,
        time: formatTime(selectedTime),
        type: appointmentType,
        status: "pending",
        notes: notes || undefined,
      })

      const updatedSchedules = ScheduleManager.getSchedules()
      setSchedules(updatedSchedules)

      console.log("[v0] Appointment booked successfully")
      setBookingSuccess(true)

      setTimeout(() => {
        setBookingSuccess(false)
        onOpenChange(false)
        onAppointmentBooked?.()
        // Reset form
        setSelectedDoctor(null)
        setSelectedDate("")
        setSelectedTime("")
        setAppointmentType("")
        setNotes("")
      }, 2000)
    } catch (error) {
      console.error("Error booking appointment:", error)
      alert("Failed to book appointment. Please try again.")
    } finally {
      setIsBooking(false)
    }
  }

  if (bookingSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-accent/20 rounded-full animate-ping"></div>
              <div className="relative bg-gradient-to-br from-accent to-primary p-4 rounded-full">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Appointment Booked Successfully!</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Your appointment request has been submitted and is pending admin approval.
            </p>
            <div className="bg-card p-4 rounded-lg border border-border/50">
              <p className="text-sm text-muted-foreground">
                📧 You will receive a notification once your appointment is approved.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-3 rounded-xl">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">Book Appointment</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Choose your doctor and preferred time
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-180px)] pr-2">
          <div className="space-y-6 py-2">
            <div>
              <h4 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-rose-500" />
                Select Doctor
              </h4>

              {doctors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No doctors available</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedDoctor?.id === doctor.id
                          ? "border-rose-500 bg-rose-50"
                          : "border-gray-200 hover:border-rose-300 hover:bg-gray-50"
                      }`}
                      onClick={() => handleDoctorSelect(doctor.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                            selectedDoctor?.id === doctor.id ? "bg-rose-500" : "bg-gray-400"
                          }`}
                        >
                          {doctor.name.charAt(0)}
                        </div>
                        <div>
                          <h5 className="font-semibold text-foreground">{doctor.name}</h5>
                          <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedDoctor && (
              <div>
                <h4 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-rose-500" />
                  Select Date
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {getAvailableDates().length === 0 ? (
                    <div className="col-span-2 text-center py-6 text-muted-foreground">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No available dates for this doctor</p>
                    </div>
                  ) : (
                    getAvailableDates()
                      .slice(0, 6)
                      .map((schedule) => (
                        <div
                          key={schedule.id}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedDate === schedule.date
                              ? "border-rose-500 bg-rose-50"
                              : "border-gray-200 hover:border-rose-300 hover:bg-gray-50"
                          }`}
                          onClick={() => handleDateSelect(schedule.date)}
                        >
                          <div className="text-center">
                            <p className="font-medium text-foreground">
                              {new Date(schedule.date).toLocaleDateString("id-ID", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {schedule.timeSlots.filter((ts) => ts.isAvailable).length} slots
                            </p>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}

            {selectedDate && (
              <div>
                <h4 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-rose-500" />
                  Select Time
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {getAvailableTimeSlots().map((timeSlot) => (
                    <Button
                      key={timeSlot.id}
                      variant={selectedTime === timeSlot.time ? "default" : "outline"}
                      className={`h-10 ${
                        selectedTime === timeSlot.time
                          ? "bg-rose-500 hover:bg-rose-600"
                          : "hover:bg-rose-50 hover:border-rose-300"
                      }`}
                      onClick={() => setSelectedTime(timeSlot.time)}
                    >
                      {formatTime(timeSlot.time)}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {selectedTime && (
              <div>
                <h4 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-rose-500" />
                  Appointment Type
                </h4>
                <Select value={appointmentType} onValueChange={setAppointmentType}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Choose type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="checkup">Check-up</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {appointmentType && (
              <div>
                <h4 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-rose-500" />
                  Notes (Optional)
                </h4>
                <Textarea
                  placeholder="Any additional information..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            )}
          </div>
        </div>

        {appointmentType && (
          <div className="flex gap-3 pt-4 border-t border-border/50">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleBookAppointment}
              disabled={isBooking}
              className="flex-1 bg-rose-500 hover:bg-rose-600"
            >
              {isBooking ? "Booking..." : "Book Appointment"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
