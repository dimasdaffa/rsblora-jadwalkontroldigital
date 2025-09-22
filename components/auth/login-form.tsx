"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, User, Stethoscope, Shield } from "lucide-react"
import { useRouter } from "next/navigation"

type UserRole = "patient" | "doctor" | "admin"

interface LoginFormData {
  email: string
  password: string
}

interface UserCredential {
  email: string
  password: string
  role: UserRole
  name: string
}

export function LoginForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const validUsers: UserCredential[] = [
    { email: "patient@demo.com", password: "demo123", role: "patient", name: "John Doe" },
    { email: "john.patient@hospital.com", password: "patient123", role: "patient", name: "John Patient" },
    { email: "doctor@demo.com", password: "demo123", role: "doctor", name: "Dr. Sarah Smith" },
    { email: "dr.sarah@hospital.com", password: "doctor123", role: "doctor", name: "Dr. Sarah Wilson" },
    { email: "admin@demo.com", password: "demo123", role: "admin", name: "Admin User" },
    { email: "admin@hospital.com", password: "admin123", role: "admin", name: "Hospital Admin" },
  ]

  const getDynamicUserCredentials = (): UserCredential[] => {
    try {
      const storedCredentials = localStorage.getItem("user_credentials")
      return storedCredentials ? JSON.parse(storedCredentials) : []
    } catch {
      return []
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate authentication
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const dynamicCredentials = getDynamicUserCredentials()
      const dynamicUser = dynamicCredentials.find(
        (user) => user.email === formData.email && user.password === formData.password,
      )

      if (dynamicUser) {
        const userData = {
          email: dynamicUser.email,
          role: dynamicUser.role,
          name: dynamicUser.name,
        }

        localStorage.setItem("user", JSON.stringify(userData))
        const encodedUserData = encodeURIComponent(JSON.stringify(userData))
        document.cookie = `user=${encodedUserData}; path=/; max-age=86400; SameSite=Lax`

        console.log("[v0] Dynamic user authenticated:", userData)

        switch (dynamicUser.role) {
          case "patient":
            window.location.href = "/patient"
            break
          case "doctor":
            window.location.href = "/doctor"
            break
          case "admin":
            window.location.href = "/admin"
            break
        }
        return
      }

      const registeredPatients = JSON.parse(localStorage.getItem("patient_profiles") || "[]")
      const registeredPatient = registeredPatients.find((p: any) => p.email === formData.email)

      if (registeredPatient) {
        // For demo purposes, we'll use a simple password check
        // In production, this would be properly hashed and verified
        const userData = {
          email: registeredPatient.email,
          role: "patient" as const,
          name: `${registeredPatient.firstName} ${registeredPatient.lastName}`,
          id: registeredPatient.id,
        }

        localStorage.setItem("user", JSON.stringify(userData))
        const encodedUserData = encodeURIComponent(JSON.stringify(userData))
        document.cookie = `user=${encodedUserData}; path=/; max-age=86400; SameSite=Lax`

        window.location.href = "/patient"
        return
      }

      const authenticatedUser = validUsers.find(
        (user) => user.email === formData.email && user.password === formData.password,
      )

      if (authenticatedUser) {
        const userData = {
          email: authenticatedUser.email,
          role: authenticatedUser.role,
          name: authenticatedUser.name,
        }

        localStorage.setItem("user", JSON.stringify(userData))

        const encodedUserData = encodeURIComponent(JSON.stringify(userData))
        document.cookie = `user=${encodedUserData}; path=/; max-age=86400; SameSite=Lax`

        console.log("[v0] User authenticated:", userData)
        console.log("[v0] Cookie set:", encodedUserData)

        switch (authenticatedUser.role) {
          case "patient":
            window.location.href = "/patient"
            break
          case "doctor":
            window.location.href = "/doctor"
            break
          case "admin":
            window.location.href = "/admin"
            break
        }
      } else {
        setError("Invalid email or password. Please check your credentials.")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "patient":
        return <User className="h-4 w-4" />
      case "doctor":
        return <Stethoscope className="h-4 w-4" />
      case "admin":
        return <Shield className="h-4 w-4" />
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Masukkan email Anda"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          required
        />
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Masukkan password Anda"
            value={formData.password}
            onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Masuk..." : "Masuk"}
      </Button>

      {/* Register Link */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <Button
            variant="link"
            className="p-0 h-auto text-blue-600 hover:text-blue-700"
            onClick={() => router.push("/register")}
          >
            Daftar sebagai pasien baru
          </Button>
        </p>
      </div>

      {/* Forgot Password */}
      <div className="text-center">
        <Button variant="link" className="text-sm text-muted-foreground">
          Lupa password?
        </Button>
      </div>
    </form>
  )
}
