// Script to manually clear all application data for fresh testing

console.log("[v0] Starting complete data clearing process...")

// List of all localStorage keys used by the application
const dataKeys = [
  // User management
  "users",
  "user_profiles",

  // Doctor data
  "doctor_profiles",
  "doctor_schedules",
  "doctor_medical_records",

  // Patient data
  "patient_profiles",
  "patient_appointments",
  "patient_medical_records",

  // Appointments
  "appointments",
  "appointment_history",

  // Medical records
  "medical_records",
  "health_updates",
  "clinical_notes",

  // Messages
  "patient_messages",
  "doctor_messages",
  "messages",

  // Schedule management
  "schedules",
  "doctor_availability",

  // Admin data
  "admin_profiles",
  "admin_settings",

  // Authentication
  "currentUser",
  "authToken",

  // Other possible keys
  "hospital_data",
  "system_settings",
]

// Clear all data
let clearedCount = 0
let totalItems = 0

console.log("[v0] Checking localStorage for existing data...")

// First, log what exists
dataKeys.forEach((key) => {
  const data = localStorage.getItem(key)
  if (data) {
    try {
      const parsed = JSON.parse(data)
      const count = Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length
      console.log(`[v0] Found ${key}: ${count} items`)
      totalItems += count
    } catch (e) {
      console.log(`[v0] Found ${key}: non-JSON data`)
      totalItems += 1
    }
  }
})

console.log(`[v0] Total items found: ${totalItems}`)

// Clear all data
console.log("[v0] Clearing all data...")

dataKeys.forEach((key) => {
  const data = localStorage.getItem(key)
  if (data) {
    localStorage.removeItem(key)
    clearedCount++
    console.log(`[v0] Cleared: ${key}`)
  }
})

// Clear any remaining localStorage items that might have been missed
const remainingKeys = Object.keys(localStorage)
remainingKeys.forEach((key) => {
  if (!dataKeys.includes(key)) {
    localStorage.removeItem(key)
    console.log(`[v0] Cleared additional key: ${key}`)
    clearedCount++
  }
})

// Clear sessionStorage as well
sessionStorage.clear()
console.log("[v0] Cleared sessionStorage")

// Clear any cookies (if any)
document.cookie.split(";").forEach((c) => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
})
console.log("[v0] Cleared cookies")

console.log(`[v0] Data clearing complete!`)
console.log(`[v0] Cleared ${clearedCount} localStorage keys`)
console.log(`[v0] Application is now reset to initial state`)
console.log(`[v0] You can now test from scratch with no existing data`)

// Reload the page to ensure clean state
setTimeout(() => {
  console.log("[v0] Reloading page to ensure clean state...")
  window.location.reload()
}, 2000)
