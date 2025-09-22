// Quick script to create dummy doctors for testing
console.log("Creating dummy doctors...")

// Clear existing data first
localStorage.removeItem("users")
localStorage.removeItem("doctor_profiles")
localStorage.removeItem("user_credentials")

// Create dummy users (doctors)
const dummyUsers = [
  {
    id: "doctor_001",
    name: "Dr. Ahmad Santoso", 
    email: "ahmad.santoso@hospital.com",
    role: "doctor",
    status: "active",
    department: "Kardiologi",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "doctor_002",
    name: "Dr. Siti Rahayu",
    email: "siti.rahayu@hospital.com", 
    role: "doctor",
    status: "active",
    department: "Penyakit Dalam",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "doctor_003",
    name: "Dr. Budi Prakoso",
    email: "budi.prakoso@hospital.com",
    role: "doctor", 
    status: "active",
    department: "Pediatri",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// Create doctor profiles
const dummyDoctorProfiles = [
  {
    id: "doctor_001",
    name: "Dr. Ahmad Santoso",
    email: "ahmad.santoso@hospital.com",
    phone: "+62 812-3456-7890",
    specialty: "Kardiologi",
    specialization: "Kardiologi",
    license: "STR-001-2024",
    experience: 10,
    education: "Universitas Indonesia - Spesialis Jantung",
    bio: "Dokter spesialis jantung dengan pengalaman 10 tahun",
    status: "active",
    joinDate: "2020-01-15",
    totalPatients: 150,
    rating: 4.8
  },
  {
    id: "doctor_002", 
    name: "Dr. Siti Rahayu",
    email: "siti.rahayu@hospital.com",
    phone: "+62 813-4567-8901",
    specialty: "Penyakit Dalam",
    specialization: "Penyakit Dalam", 
    license: "STR-002-2024",
    experience: 8,
    education: "Universitas Gadjah Mada - Spesialis Penyakit Dalam",
    bio: "Dokter spesialis penyakit dalam dengan fokus diabetes",
    status: "active",
    joinDate: "2021-03-20", 
    totalPatients: 120,
    rating: 4.7
  },
  {
    id: "doctor_003",
    name: "Dr. Budi Prakoso", 
    email: "budi.prakoso@hospital.com",
    phone: "+62 814-5678-9012",
    specialty: "Pediatri",
    specialization: "Pediatri",
    license: "STR-003-2024", 
    experience: 6,
    education: "Universitas Airlangga - Spesialis Anak",
    bio: "Dokter spesialis anak dengan pengalaman menangani bayi dan anak",
    status: "active",
    joinDate: "2022-06-10",
    totalPatients: 80,
    rating: 4.9
  }
]

// Create login credentials
const credentials = {
  "ahmad.santoso@hospital.com": {
    password: "doctor123",
    role: "doctor",
    name: "Dr. Ahmad Santoso",
    id: "doctor_001",
    email: "ahmad.santoso@hospital.com"
  },
  "siti.rahayu@hospital.com": {
    password: "doctor123", 
    role: "doctor",
    name: "Dr. Siti Rahayu",
    id: "doctor_002",
    email: "siti.rahayu@hospital.com"
  },
  "budi.prakoso@hospital.com": {
    password: "doctor123",
    role: "doctor", 
    name: "Dr. Budi Prakoso",
    id: "doctor_003",
    email: "budi.prakoso@hospital.com"
  }
}

// Save to localStorage (this will run in browser console)
localStorage.setItem("users", JSON.stringify(dummyUsers))
localStorage.setItem("doctor_profiles", JSON.stringify(dummyDoctorProfiles))
localStorage.setItem("user_credentials", JSON.stringify(credentials))

console.log("Dummy doctors created successfully!")
console.log("Created", dummyUsers.length, "doctors")
console.log("You can now test the booking modal")