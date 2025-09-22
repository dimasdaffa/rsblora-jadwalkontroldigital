// Force create schedules for all doctors in localStorage
console.log("Creating schedules for all doctors...")

// Get doctors from localStorage
const users = JSON.parse(localStorage.getItem("users") || "[]")
const doctorProfiles = JSON.parse(localStorage.getItem("doctor_profiles") || "[]")

// Get all active doctors
const activeDoctors = users.filter(user => user.role === "doctor" && user.status === "active")

console.log("Found active doctors:", activeDoctors)

// Create schedules for next 30 days
const schedules = []
const today = new Date()

activeDoctors.forEach(doctor => {
  console.log("Creating schedules for doctor:", doctor.name)
  
  for (let i = 1; i <= 30; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const dateString = date.toISOString().split("T")[0]
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue
    
    const timeSlots = [
      { id: `${doctor.id}-${dateString}-09`, time: "09:00", isAvailable: true },
      { id: `${doctor.id}-${dateString}-10`, time: "10:00", isAvailable: true },
      { id: `${doctor.id}-${dateString}-11`, time: "11:00", isAvailable: true },
      { id: `${doctor.id}-${dateString}-14`, time: "14:00", isAvailable: true },
      { id: `${doctor.id}-${dateString}-15`, time: "15:00", isAvailable: true },
      { id: `${doctor.id}-${dateString}-16`, time: "16:00", isAvailable: true }
    ]
    
    schedules.push({
      id: `${doctor.id}-${dateString}`,
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.department || "General Practice",
      date: dateString,
      timeSlots: timeSlots
    })
  }
})

// Save schedules to localStorage
localStorage.setItem("doctor_schedules", JSON.stringify(schedules))

console.log("Created", schedules.length, "schedules for", activeDoctors.length, "doctors")
console.log("Schedules created successfully! Try the booking modal again.")