const demoPatients = [
  {
    name: "Ahmad Wijaya",
    email: "ahmad.wijaya@email.com",
    role: "patient",
    status: "active",
    phone: "+62 812-3456-7890",
    address: "Jl. Merdeka No. 123, Jakarta",
    dateOfBirth: "1985-05-15",
    gender: "Laki-laki",
    bloodType: "O+",
    emergencyContact: "+62 813-9876-5432",
    password: "patient123",
    id: "patient_ahmad_wijaya",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Siti Nurhaliza",
    email: "siti.nurhaliza@email.com",
    role: "patient",
    status: "active",
    phone: "+62 815-2468-1357",
    address: "Jl. Sudirman No. 456, Bandung",
    dateOfBirth: "1990-08-22",
    gender: "Perempuan",
    bloodType: "A+",
    emergencyContact: "+62 816-1357-2468",
    password: "patient123",
    id: "patient_siti_nurhaliza",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Budi Santoso",
    email: "budi.santoso@email.com",
    role: "patient",
    status: "active",
    phone: "+62 817-3691-4725",
    address: "Jl. Gatot Subroto No. 789, Surabaya",
    dateOfBirth: "1978-12-03",
    gender: "Laki-laki",
    bloodType: "B+",
    emergencyContact: "+62 818-4725-3691",
    password: "patient123",
    id: "patient_budi_santoso",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Dewi Sartika",
    email: "dewi.sartika@email.com",
    role: "patient",
    status: "active",
    phone: "+62 819-5814-7036",
    address: "Jl. Diponegoro No. 321, Yogyakarta",
    dateOfBirth: "1992-03-18",
    gender: "Perempuan",
    bloodType: "AB+",
    emergencyContact: "+62 820-7036-5814",
    password: "patient123",
    id: "patient_dewi_sartika",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Andi Pratama",
    email: "andi.pratama@email.com",
    role: "patient",
    status: "active",
    phone: "+62 821-6925-8147",
    address: "Jl. Ahmad Yani No. 654, Medan",
    dateOfBirth: "1987-11-07",
    gender: "Laki-laki",
    bloodType: "O-",
    emergencyContact: "+62 822-8147-6925",
    password: "patient123",
    id: "patient_andi_pratama",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Create demo patient accounts
console.log("Creating demo patient accounts...")

// Get existing users
const existingUsers = JSON.parse(localStorage.getItem("hospital_users") || "[]")

// Add demo patients if they don't exist
demoPatients.forEach((patient) => {
  const existingPatient = existingUsers.find((u: any) => u.email === patient.email)
  if (!existingPatient) {
    existingUsers.push(patient)
    console.log(`Created demo patient: ${patient.name} (${patient.email})`)
  } else {
    console.log(`Demo patient already exists: ${patient.name}`)
  }
})

// Save updated users list
localStorage.setItem("hospital_users", JSON.stringify(existingUsers))

// Create login credentials for demo patients
const existingCredentials = JSON.parse(localStorage.getItem("user_credentials") || "{}")

demoPatients.forEach((patient) => {
  if (!existingCredentials[patient.email]) {
    existingCredentials[patient.email] = {
      username: patient.email,
      password: patient.password,
      role: patient.role,
      name: patient.name,
      id: patient.id,
    }
    console.log(`Created login credentials for: ${patient.name}`)
  }
})

localStorage.setItem("user_credentials", JSON.stringify(existingCredentials))

console.log("Demo patient accounts created successfully!")
console.log("\nDemo Patient Login Credentials:")
console.log("================================")
demoPatients.forEach((patient) => {
  console.log(`Name: ${patient.name}`)
  console.log(`Email: ${patient.email}`)
  console.log(`Password: ${patient.password}`)
  console.log(`Phone: ${patient.phone}`)
  console.log("---")
})
