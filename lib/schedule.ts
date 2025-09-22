export interface DoctorSchedule {
  id: string
  doctorId: string
  doctorName: string
  specialty: string
  date: string
  timeSlots: TimeSlot[]
}

export interface TimeSlot {
  id: string
  time: string
  isAvailable: boolean
  patientId?: string
  patientName?: string
  appointmentType?: string
}

export class ScheduleManager {
  private static STORAGE_KEY = "doctor_schedules"

  static getSchedules(): DoctorSchedule[] {
    if (typeof window === "undefined") return []
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) {
        console.log("[ScheduleManager] No stored schedules found, returning empty array")
        return []
      }
      
      const parsed = JSON.parse(stored)
      if (!Array.isArray(parsed)) {
        console.warn("[ScheduleManager] Stored schedules is not an array, returning empty array")
        return []
      }
      
      console.log("[ScheduleManager] Loaded", parsed.length, "schedules from storage")
      return parsed
    } catch (error) {
      console.error("[ScheduleManager] Error parsing stored schedules:", error)
      return []
    }
  }

  static saveSchedules(schedules: DoctorSchedule[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(schedules))
  }

  static getDefaultSchedules(): DoctorSchedule[] {
    const storedDoctorProfiles = localStorage.getItem("doctor_profiles")
    let doctors: any[] = []

    if (storedDoctorProfiles) {
      try {
        const doctorProfiles = JSON.parse(storedDoctorProfiles)
        doctors = doctorProfiles
          .filter((d: any) => d && d.status === "active" && d.name && d.name !== "backendbuild" && d.specialty && d.id)
          .map((d: any) => ({
            id: d.id,
            name: d.name,
            specialty: d.specialty,
          }))
      } catch (error) {
        console.error("Error parsing doctor profiles:", error)
      }
    }

    // If no doctors found, return empty array
    if (doctors.length === 0) {
      return []
    }

    const schedules: DoctorSchedule[] = []
    const today = new Date()

    // Generate schedules for next 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const dateString = date.toISOString().split("T")[0]

      // Skip weekends for now
      if (date.getDay() === 0 || date.getDay() === 6) continue

      doctors.forEach((doctor) => {
        const timeSlots: TimeSlot[] = [
          { id: `${doctor.id}-${dateString}-09`, time: "09:00 AM", isAvailable: true },
          { id: `${doctor.id}-${dateString}-10`, time: "10:00 AM", isAvailable: true },
          { id: `${doctor.id}-${dateString}-11`, time: "11:00 AM", isAvailable: true },
          { id: `${doctor.id}-${dateString}-14`, time: "02:00 PM", isAvailable: true },
          { id: `${doctor.id}-${dateString}-15`, time: "03:00 PM", isAvailable: true },
          { id: `${doctor.id}-${dateString}-16`, time: "04:00 PM", isAvailable: true },
        ]

        schedules.push({
          id: `${doctor.id}-${dateString}`,
          doctorId: doctor.id,
          doctorName: doctor.name,
          specialty: doctor.specialty,
          date: dateString,
          timeSlots,
        })
      })
    }

    this.saveSchedules(schedules)
    return schedules
  }

  static getScheduleByDoctorAndDate(doctorId: string, date: string): DoctorSchedule | undefined {
    const schedules = this.getSchedules()
    return schedules.find((s) => s.doctorId === doctorId && s.date === date)
  }

  static updateTimeSlot(scheduleId: string, timeSlotId: string, updates: Partial<TimeSlot>): void {
    const schedules = this.getSchedules()
    const schedule = schedules.find((s) => s.id === scheduleId)
    if (schedule) {
      const timeSlot = schedule.timeSlots.find((ts) => ts.id === timeSlotId)
      if (timeSlot) {
        Object.assign(timeSlot, updates)
        this.saveSchedules(schedules)
      }
    }
  }

  static getAvailableSlots(doctorId: string, date: string): TimeSlot[] {
    const schedule = this.getScheduleByDoctorAndDate(doctorId, date)
    return schedule ? schedule.timeSlots.filter((slot) => slot.isAvailable) : []
  }

  static bookTimeSlot(
    doctorId: string,
    date: string,
    timeSlotId: string,
    patientId: string,
    patientName: string,
    appointmentType: string,
  ): boolean {
    const schedules = this.getSchedules()
    const schedule = schedules.find((s) => s.doctorId === doctorId && s.date === date)
    if (schedule) {
      const timeSlot = schedule.timeSlots.find((ts) => ts.id === timeSlotId)
      if (timeSlot && timeSlot.isAvailable) {
        timeSlot.isAvailable = false
        timeSlot.patientId = patientId
        timeSlot.patientName = patientName
        timeSlot.appointmentType = appointmentType
        this.saveSchedules(schedules)
        return true
      }
    }
    return false
  }

  static getDoctorScheduleForWeek(doctorId: string, startDate: Date): DoctorSchedule[] {
    const schedules = this.getSchedules()
    const weekSchedules: DoctorSchedule[] = []

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      const dateString = date.toISOString().split("T")[0]

      const schedule = schedules.find((s) => s.doctorId === doctorId && s.date === dateString)
      if (schedule) {
        weekSchedules.push(schedule)
      }
    }

    return weekSchedules
  }

  static createDoctorSchedule(scheduleData: {
    doctorId: string
    doctorName: string
    specialty: string
    date: string
    timeSlots: Omit<TimeSlot, "id">[]
  }): DoctorSchedule {
    const schedules = this.getSchedules()

    // Check if schedule already exists for this doctor and date
    const existingSchedule = schedules.find((s) => s.doctorId === scheduleData.doctorId && s.date === scheduleData.date)

    if (existingSchedule) {
      // Return existing schedule if it already exists
      return existingSchedule
    }

    // Create new schedule with proper IDs for time slots
    const newSchedule: DoctorSchedule = {
      id: `${scheduleData.doctorId}-${scheduleData.date}`,
      doctorId: scheduleData.doctorId,
      doctorName: scheduleData.doctorName,
      specialty: scheduleData.specialty,
      date: scheduleData.date,
      timeSlots: scheduleData.timeSlots.map((slot, index) => ({
        ...slot,
        id: `${scheduleData.doctorId}-${scheduleData.date}-${index + 1}`,
      })),
    }

    // Add to schedules and save
    schedules.push(newSchedule)
    this.saveSchedules(schedules)

    return newSchedule
  }

  static createSchedulesForDoctor(doctorId: string, doctorName: string, specialty: string): void {
    const schedules = this.getSchedules()
    const today = new Date()

    // Generate schedules for next 30 days
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const dateString = date.toISOString().split("T")[0]

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue

      // Check if schedule already exists
      const existingSchedule = schedules.find((s) => s.doctorId === doctorId && s.date === dateString)
      if (existingSchedule) continue

      const timeSlots: TimeSlot[] = [
        { id: `${doctorId}-${dateString}-09`, time: "09:00", isAvailable: true },
        { id: `${doctorId}-${dateString}-10`, time: "10:00", isAvailable: true },
        { id: `${doctorId}-${dateString}-11`, time: "11:00", isAvailable: true },
        { id: `${doctorId}-${dateString}-14`, time: "14:00", isAvailable: true },
        { id: `${doctorId}-${dateString}-15`, time: "15:00", isAvailable: true },
        { id: `${doctorId}-${dateString}-16`, time: "16:00", isAvailable: true },
      ]

      schedules.push({
        id: `${doctorId}-${dateString}`,
        doctorId,
        doctorName,
        specialty,
        date: dateString,
        timeSlots,
      })
    }

    this.saveSchedules(schedules)
  }
}
