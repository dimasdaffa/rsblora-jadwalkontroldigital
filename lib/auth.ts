export interface User {
  email: string
  role: "patient" | "doctor" | "admin"
  name: string
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null

  try {
    const userStr = localStorage.getItem("user")
    return userStr ? JSON.parse(userStr) : null
  } catch {
    return null
  }
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user")
    document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    window.location.href = "/"
  }
}

export function requireAuth(allowedRoles?: string[]) {
  const user = getCurrentUser()

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
    return null
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
    return null
  }

  return user
}

export function redirectToDashboard(role: string) {
  if (typeof window === "undefined") return

  switch (role) {
    case "patient":
      window.location.href = "/patient"
      break
    case "doctor":
      window.location.href = "/doctor"
      break
    case "admin":
      window.location.href = "/admin"
      break
    default:
      window.location.href = "/login"
  }
}
