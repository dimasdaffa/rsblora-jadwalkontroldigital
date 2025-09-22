// Reset all hospital data and create dummy accounts for testing

interface User {
  id: string
  name: string
  email: string
  password: string
  role: "admin" | "doctor" | "patient"
  status: "active" | "inactive"
  department?: string
  createdAt: string
  updatedAt: string
}

interface DoctorProfile {
  id: string
  name: string
  email: string
  phone: string
  specialty: string
  license: string
  experience: number
  education: string
  bio: string
  status: "active" | "inactive"
  joinDate: string
  totalPatients: number
  rating: number
}

interface PatientProfile {
  id: string
  name: string
  email: string
  phone: string
  dateOfBirth: string
  gender: "male" | "female"
  address: string
  emergencyContact: string
  emergencyPhone: string
  bloodType: string
  allergies: string
  medicalHistory: string
  insuranceProvider: string
  insuranceNumber: string
  nik: string
  bpjsNumber?: string
  status: "active" | "inactive"
  registrationDate: string
}

// Clear all existing data
function clearAllData() {
  const keysToRemove = [
    "users",
    "doctor_profiles",
    "patient_profiles",
    "appointments",
    "doctor_schedules",
    "medical_records",
    "patient_messages",
    "login_credentials",
  ]

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key)
  })

  console.log("[v0] All data cleared successfully")
}

// Create dummy accounts
function createDummyAccounts() {
  const currentDate = new Date().toISOString()

  // Admin account
  const adminUser: User = {
    id: "admin_001",
    name: "Hospital Admin",
    email: "admin@hospital.com",
    password: "admin123",
    role: "admin",
    status: "active",
    department: "Administration",
    createdAt: currentDate,
    updatedAt: currentDate,
  }

  // Doctor accounts
  const doctorUsers: User[] = [
    {
      id: "doctor_001",
      name: "Dr. Ahmad Santoso",
      email: "ahmad.santoso@hospital.com",
      password: "doctor123",
      role: "doctor",
      status: "active",
      department: "Kardiologi",
      createdAt: currentDate,
      updatedAt: currentDate,
    },
    {
      id: "doctor_002",
      name: "Dr. Siti Rahayu",
      email: "siti.rahayu@hospital.com",
      password: "doctor123",
      role: "doctor",
      status: "active",
      department: "Penyakit Dalam",
      createdAt: currentDate,
      updatedAt: currentDate,
    },
  ]

  // Patient accounts
  const patientUsers: User[] = [
    {
      id: "patient_001",
      name: "Budi Setiawan",
      email: "budi.setiawan@email.com",
      password: "patient123",
      role: "patient",
      status: "active",
      createdAt: currentDate,
      updatedAt: currentDate,
    },
    {
      id: "patient_002",
      name: "Ani Wijayanti",
      email: "ani.wijayanti@email.com",
      password: "patient123",
      role: "patient",
      status: "active",
      createdAt: currentDate,
      updatedAt: currentDate,
    },
  ]

  // Doctor profiles
  const doctorProfiles: DoctorProfile[] = [
    {
      id: "doctor_001",
      name: "Dr. Ahmad Santoso",
      email: "ahmad.santoso@hospital.com",
      phone: "+62 812-3456-7890",
      specialty: "Kardiologi",
      license: "STR-001-2024",
      experience: 10,
      education: "Universitas Indonesia - Spesialis Jantung",
      bio: "Dokter spesialis jantung dengan pengalaman 10 tahun menangani berbagai penyakit kardiovaskular.",
      status: "active",
      joinDate: "2020-01-15",
      totalPatients: 150,
      rating: 4.8,
    },
    {
      id: "doctor_002",
      name: "Dr. Siti Rahayu",
      email: "siti.rahayu@hospital.com",
      phone: "+62 813-4567-8901",
      specialty: "Penyakit Dalam",
      license: "STR-002-2024",
      experience: 8,
      education: "Universitas Gadjah Mada - Spesialis Penyakit Dalam",
      bio: "Dokter spesialis penyakit dalam dengan fokus pada diabetes dan hipertensi.",
      status: "active",
      joinDate: "2021-03-20",
      totalPatients: 120,
      rating: 4.7,
    },
  ]

  // Patient profiles
  const patientProfiles: PatientProfile[] = [
    {
      id: "patient_001",
      name: "Budi Setiawan",
      email: "budi.setiawan@email.com",
      phone: "+62 821-1234-5678",
      dateOfBirth: "1985-05-15",
      gender: "male",
      address: "Jl. Merdeka No. 123, Jakarta Pusat",
      emergencyContact: "Sari Setiawan (Istri)",
      emergencyPhone: "+62 822-2345-6789",
      bloodType: "O+",
      allergies: "Tidak ada",
      medicalHistory: "Hipertensi ringan",
      insuranceProvider: "BPJS Kesehatan",
      insuranceNumber: "BPJS-001-2024",
      nik: "3171051505850001",
      bpjsNumber: "0001234567890",
      status: "active",
      registrationDate: currentDate,
    },
    {
      id: "patient_002",
      name: "Ani Wijayanti",
      email: "ani.wijayanti@email.com",
      phone: "+62 823-3456-7890",
      dateOfBirth: "1990-08-20",
      gender: "female",
      address: "Jl. Sudirman No. 456, Jakarta Selatan",
      emergencyContact: "Tono Wijaya (Suami)",
      emergencyPhone: "+62 824-4567-8901",
      bloodType: "A+",
      allergies: "Seafood",
      medicalHistory: "Tidak ada riwayat penyakit serius",
      insuranceProvider: "BPJS Kesehatan",
      insuranceNumber: "BPJS-002-2024",
      nik: "3171052008900002",
      bpjsNumber: "0002345678901",
      status: "active",
      registrationDate: currentDate,
    },
  ]

  // Save all data to localStorage
  const allUsers = [adminUser, ...doctorUsers, ...patientUsers]
  localStorage.setItem("users", JSON.stringify(allUsers))
  localStorage.setItem("doctor_profiles", JSON.stringify(doctorProfiles))
  localStorage.setItem("patient_profiles", JSON.stringify(patientProfiles))

  // Create login credentials
  const credentials: any = {}
  allUsers.forEach((user) => {
    credentials[user.email] = {
      password: user.password,
      role: user.role,
      name: user.name,
      id: user.id,
    }
  })
  localStorage.setItem("login_credentials", JSON.stringify(credentials))

  // Initialize empty arrays for other data
  localStorage.setItem("appointments", JSON.stringify([]))
  localStorage.setItem("doctor_schedules", JSON.stringify([]))
  localStorage.setItem("medical_records", JSON.stringify([]))
  localStorage.setItem("patient_messages", JSON.stringify([]))

  console.log("[v0] Dummy accounts created successfully")

  // Log account details for reference
  console.log("\n=== DUMMY ACCOUNTS CREATED ===")
  console.log("\nADMIN ACCOUNT:")
  console.log("Email: admin@hospital.com")
  console.log("Password: admin123")

  console.log("\nDOCTOR ACCOUNTS:")
  console.log("1. Email: ahmad.santoso@hospital.com | Password: doctor123")
  console.log("2. Email: siti.rahayu@hospital.com | Password: doctor123")

  console.log("\nPATIENT ACCOUNTS:")
  console.log("1. Email: budi.setiawan@email.com | Password: patient123")
  console.log("2. Email: ani.wijayanti@email.com | Password: patient123")
  console.log("\n===============================")
}

// Main execution
function resetDataAndCreateAccounts() {
  try {
    clearAllData()
    createDummyAccounts()
    alert("Data reset complete! Check console for account details.")
  } catch (error) {
    console.error("[v0] Error during data reset:", error)
    alert("Error occurred during data reset. Check console for details.")
  }
}

// Execute the reset
resetDataAndCreateAccounts()
