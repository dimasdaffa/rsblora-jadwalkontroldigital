export interface Doctor {
  id: string
  name: string
  specialty: string
  email: string
  schedule: DoctorSchedule[]
}

export interface DoctorSchedule {
  id: string
  doctorId: string
  date: string
  timeSlots: TimeSlot[]
}

export interface TimeSlot {
  id: string
  time: string
  available: boolean
  appointmentId?: string
}

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  patientEmail: string
  doctorId: string
  doctorName: string
  date: string
  time: string
  type: string
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled"
  notes?: string
  complaints?: string
  createdAt: string
  updatedAt?: string
}

// Mock doctors data
export const doctors: Doctor[] = [
  {
    id: "dr1",
    name: "Dr. Sarah Smith",
    specialty: "Kardiologi",
    email: "dr.sarah@rsbhayangkara.com",
    schedule: [
      {
        id: "sch1",
        doctorId: "dr1",
        date: "2024-01-15",
        timeSlots: [
          { id: "ts1", time: "09:00", available: true },
          { id: "ts2", time: "10:00", available: false, appointmentId: "apt1" },
          { id: "ts3", time: "11:00", available: true },
          { id: "ts4", time: "14:00", available: true },
          { id: "ts5", time: "15:00", available: true },
        ],
      },
      {
        id: "sch2",
        doctorId: "dr1",
        date: "2024-01-16",
        timeSlots: [
          { id: "ts6", time: "09:00", available: true },
          { id: "ts7", time: "10:00", available: true },
          { id: "ts8", time: "11:00", available: true },
        ],
      },
    ],
  },
  {
    id: "dr2",
    name: "Dr. Michael Johnson",
    specialty: "Dermatologi",
    email: "dr.michael@rsbhayangkara.com",
    schedule: [
      {
        id: "sch3",
        doctorId: "dr2",
        date: "2024-01-15",
        timeSlots: [
          { id: "ts9", time: "10:00", available: true },
          { id: "ts10", time: "11:00", available: true },
          { id: "ts11", time: "14:30", available: true },
          { id: "ts12", time: "15:30", available: true },
        ],
      },
    ],
  },
  {
    id: "dr3",
    name: "Dr. Emily Davis",
    specialty: "Penyakit Dalam",
    email: "dr.emily@rsbhayangkara.com",
    schedule: [
      {
        id: "sch4",
        doctorId: "dr3",
        date: "2024-01-17",
        timeSlots: [
          { id: "ts13", time: "09:00", available: true },
          { id: "ts14", time: "10:00", available: true },
          { id: "ts15", time: "11:00", available: true },
          { id: "ts16", time: "13:00", available: true },
          { id: "ts17", time: "14:00", available: true },
        ],
      },
    ],
  },
  {
    id: "dr4",
    name: "Dr. Robert Wilson",
    specialty: "Ortopedi",
    email: "dr.robert@rsbhayangkara.com",
    schedule: [
      {
        id: "sch5",
        doctorId: "dr4",
        date: "2024-01-18",
        timeSlots: [
          { id: "ts18", time: "08:00", available: true },
          { id: "ts19", time: "09:00", available: true },
          { id: "ts20", time: "10:00", available: true },
          { id: "ts21", time: "11:00", available: true },
        ],
      },
    ],
  },
]

// Appointment management class with enhanced functionality
export class AppointmentManager {
  private static getStoredAppointments(): Appointment[] {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("appointments")
      if (stored) {
        return JSON.parse(stored)
      }
    }
    return []
  }

  private static saveAppointments(appointments: Appointment[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("appointments", JSON.stringify(appointments))
    }
  }

  static getAllAppointments(): Appointment[] {
    return this.getStoredAppointments()
  }

  static getAppointmentsByPatient(patientEmail: string): Appointment[] {
    return this.getStoredAppointments().filter((apt) => apt.patientEmail === patientEmail)
  }

  static getAppointmentsByDoctor(doctorId: string): Appointment[] {
    return this.getStoredAppointments().filter((apt) => apt.doctorId === doctorId)
  }

  static getPendingAppointments(): Appointment[] {
    return this.getStoredAppointments().filter((apt) => apt.status === "pending")
  }

  static createAppointment(appointmentData: Omit<Appointment, "id" | "createdAt">): Appointment {
    const appointments = this.getStoredAppointments()
    const newAppointment: Appointment = {
      ...appointmentData,
      id: `apt_${Date.now()}`,
      createdAt: new Date().toISOString(),
    }

    appointments.push(newAppointment)
    this.saveAppointments(appointments)

    console.log("[v0] Created appointment:", newAppointment)

    return newAppointment
  }

  static updateAppointmentStatus(appointmentId: string, status: Appointment["status"], notes?: string): boolean {
    const appointments = this.getStoredAppointments()
    const appointment = appointments.find((apt) => apt.id === appointmentId)
    if (appointment) {
      appointment.status = status
      appointment.updatedAt = new Date().toISOString()
      if (notes) {
        appointment.notes = notes
      }
      this.saveAppointments(appointments)
      console.log("[v0] Updated appointment status:", appointmentId, status)
      return true
    }
    return false
  }

  static approveAppointment(appointmentId: string): boolean {
    return this.updateAppointmentStatus(appointmentId, "approved")
  }

  static rejectAppointment(appointmentId: string): boolean {
    const appointments = this.getStoredAppointments()
    const appointment = appointments.find((apt) => apt.id === appointmentId)
    if (!appointment) return false

    appointment.status = "rejected"
    appointment.updatedAt = new Date().toISOString()
    this.saveAppointments(appointments)
    console.log("[v0] Rejected appointment:", appointmentId)
    return true
  }

  static rescheduleAppointment(appointmentId: string, newDate: string, newTime: string): boolean {
    const appointments = this.getStoredAppointments()
    const appointment = appointments.find((apt) => apt.id === appointmentId)
    if (!appointment) return false

    appointment.date = newDate
    appointment.time = newTime
    appointment.status = "pending" // Reset to pending for admin approval
    appointment.updatedAt = new Date().toISOString()

    this.saveAppointments(appointments)
    console.log("[v0] Rescheduled appointment:", appointmentId, newDate, newTime)
    return true
  }

  static cancelAppointment(appointmentId: string, reason?: string): boolean {
    const appointments = this.getStoredAppointments()
    const appointment = appointments.find((apt) => apt.id === appointmentId)
    if (!appointment) return false

    appointment.status = "cancelled"
    appointment.updatedAt = new Date().toISOString()
    if (reason) {
      appointment.notes = `Dibatalkan: ${reason}`
    }

    this.saveAppointments(appointments)
    console.log("[v0] Cancelled appointment:", appointmentId, reason)
    return true
  }

  static getAvailableSlots(doctorId: string, date: string): TimeSlot[] {
    // This method is deprecated - use ScheduleManager instead
    return []
  }

  static getAppointmentStats() {
    const appointments = this.getStoredAppointments()
    const total = appointments.length
    const pending = appointments.filter((apt) => apt.status === "pending").length
    const approved = appointments.filter((apt) => apt.status === "approved").length
    const completed = appointments.filter((apt) => apt.status === "completed").length
    const cancelled = appointments.filter((apt) => apt.status === "cancelled").length

    return { total, pending, approved, completed, cancelled }
  }
}
