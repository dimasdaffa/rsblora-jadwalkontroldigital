export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "doctor" | "patient"
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
  profile?: any
}

export interface MedicalRecord {
  id: string
  patientId: string
  doctorId?: string
  title: string
  description: string
  date: string
  type: "diagnosis" | "treatment" | "test_result" | "prescription" | "note"
  attachments?: string[]
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  subject: string
  content: string
  isRead: boolean
  createdAt: string
  type: "general" | "appointment" | "medical" | "system"
}

export interface ClinicalNote {
  id: string
  doctorId: string
  patientId: string
  appointmentId?: string
  diagnosis: string
  treatment: string
  notes: string
  followUp?: string
  createdAt: string
  updatedAt: string
}

// Event system for real-time synchronization
type DataChangeEvent = {
  type: "create" | "update" | "delete"
  entity: "user" | "appointment" | "medical_record" | "message" | "clinical_note" | "doctor_profile"
  data: any
  timestamp: string
}

class DataManager {
  private static instance: DataManager
  private listeners: Map<string, Function[]> = new Map()

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager()
    }
    return DataManager.instance
  }

  // Event system for cross-dashboard synchronization
  subscribe(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  unsubscribe(event: string, callback: Function) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach((callback) => callback(data))
    }
  }

  // Generic localStorage operations with event emission
  private setData(key: string, data: any, entityType: string) {
    localStorage.setItem(key, JSON.stringify(data))
    this.emit(`${entityType}_changed`, { type: "update", data, timestamp: new Date().toISOString() })
  }

  private getData(key: string, defaultValue: any = []) {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  }

  // User Management
  getUsers(): User[] {
    return this.getData("users", [])
  }

  createUser(user: Omit<User, "id" | "createdAt" | "updatedAt">): User {
    const users = this.getUsers()
    const newUser: User = {
      ...user,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    users.push(newUser)
    this.setData("users", users, "user")
    return newUser
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers()
    const index = users.findIndex((u) => u.id === id)
    if (index === -1) return null

    users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() }
    this.setData("users", users, "user")
    return users[index]
  }

  deleteUser(id: string): boolean {
    const users = this.getUsers()
    const filteredUsers = users.filter((u) => u.id !== id)
    if (filteredUsers.length === users.length) return false

    this.setData("users", filteredUsers, "user")
    return true
  }

  // Medical Records Management
  getMedicalRecords(patientId?: string): MedicalRecord[] {
    const records = this.getData("medical_records", [])
    return patientId ? records.filter((r: MedicalRecord) => r.patientId === patientId) : records
  }

  createMedicalRecord(record: Omit<MedicalRecord, "id" | "createdAt" | "updatedAt">): MedicalRecord {
    const records = this.getMedicalRecords()
    const newRecord: MedicalRecord = {
      ...record,
      id: `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    records.push(newRecord)
    this.setData("medical_records", records, "medical_record")
    return newRecord
  }

  updateMedicalRecord(id: string, updates: Partial<MedicalRecord>): MedicalRecord | null {
    const records = this.getMedicalRecords()
    const index = records.findIndex((r) => r.id === id)
    if (index === -1) return null

    records[index] = { ...records[index], ...updates, updatedAt: new Date().toISOString() }
    this.setData("medical_records", records, "medical_record")
    return records[index]
  }

  deleteMedicalRecord(id: string): boolean {
    const records = this.getMedicalRecords()
    const filteredRecords = records.filter((r) => r.id !== id)
    if (filteredRecords.length === records.length) return false

    this.setData("medical_records", filteredRecords, "medical_record")
    return true
  }

  // Messages Management
  getMessages(userId?: string): Message[] {
    const messages = this.getData("messages", [])
    return userId ? messages.filter((m: Message) => m.senderId === userId || m.receiverId === userId) : messages
  }

  createMessage(message: Omit<Message, "id" | "createdAt">): Message {
    const messages = this.getMessages()
    const newMessage: Message = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    }
    messages.push(newMessage)
    this.setData("messages", messages, "message")
    return newMessage
  }

  markMessageAsRead(id: string): boolean {
    const messages = this.getMessages()
    const index = messages.findIndex((m) => m.id === id)
    if (index === -1) return false

    messages[index].isRead = true
    this.setData("messages", messages, "message")
    return true
  }

  deleteMessage(id: string): boolean {
    const messages = this.getMessages()
    const filteredMessages = messages.filter((m) => m.id !== id)
    if (filteredMessages.length === messages.length) return false

    this.setData("messages", filteredMessages, "message")
    return true
  }

  // Clinical Notes Management
  getClinicalNotes(doctorId?: string, patientId?: string): ClinicalNote[] {
    const notes = this.getData("clinical_notes", [])
    let filteredNotes = notes

    if (doctorId) {
      filteredNotes = filteredNotes.filter((n: ClinicalNote) => n.doctorId === doctorId)
    }
    if (patientId) {
      filteredNotes = filteredNotes.filter((n: ClinicalNote) => n.patientId === patientId)
    }

    return filteredNotes
  }

  createClinicalNote(note: Omit<ClinicalNote, "id" | "createdAt" | "updatedAt">): ClinicalNote {
    const notes = this.getClinicalNotes()
    const newNote: ClinicalNote = {
      ...note,
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    notes.push(newNote)
    this.setData("clinical_notes", notes, "clinical_note")
    return newNote
  }

  updateClinicalNote(id: string, updates: Partial<ClinicalNote>): ClinicalNote | null {
    const notes = this.getClinicalNotes()
    const index = notes.findIndex((n) => n.id === id)
    if (index === -1) return null

    notes[index] = { ...notes[index], ...updates, updatedAt: new Date().toISOString() }
    this.setData("clinical_notes", notes, "clinical_note")
    return notes[index]
  }

  deleteClinicalNote(id: string): boolean {
    const notes = this.getClinicalNotes()
    const filteredNotes = notes.filter((n) => n.id !== id)
    if (filteredNotes.length === notes.length) return false

    this.setData("clinical_notes", filteredNotes, "clinical_note")
    return true
  }

  // Sync with existing appointment system
  syncAppointmentData() {
    // Ensure appointment data is properly synchronized
    const appointments = this.getData("appointments", [])
    this.emit("appointment_changed", { type: "sync", data: appointments, timestamp: new Date().toISOString() })
  }

  // Sync with existing doctor profiles
  syncDoctorProfiles() {
    const doctorProfiles = this.getData("doctor_profiles", [])
    this.emit("doctor_profile_changed", { type: "sync", data: doctorProfiles, timestamp: new Date().toISOString() })
  }

  // Get statistics for dashboards
  getStatistics() {
    const appointments = this.getData("appointments", [])
    const users = this.getUsers()
    const medicalRecords = this.getMedicalRecords()
    const messages = this.getMessages()
    const clinicalNotes = this.getClinicalNotes()

    return {
      totalAppointments: appointments.length,
      pendingAppointments: appointments.filter((a: any) => a.status === "pending").length,
      approvedAppointments: appointments.filter((a: any) => a.status === "approved").length,
      totalPatients: users.filter((u) => u.role === "patient").length,
      totalDoctors: users.filter((u) => u.role === "doctor").length,
      totalMedicalRecords: medicalRecords.length,
      unreadMessages: messages.filter((m) => !m.isRead).length,
      totalClinicalNotes: clinicalNotes.length,
    }
  }
}

export const dataManager = DataManager.getInstance()
export default dataManager
