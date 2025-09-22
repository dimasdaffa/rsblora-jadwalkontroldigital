"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getCurrentUser, type User } from "@/lib/auth"
import { Home, Shield, Stethoscope, UserIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function RoleNav() {
  const [user, setUser] = useState<User | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  if (!user) return null

  const getNavItems = () => {
    const baseItems = [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: Home,
      },
    ]

    switch (user.role) {
      case "patient":
        return [
          ...baseItems,
          {
            href: "/patient",
            label: "My Health",
            icon: UserIcon,
          },
        ]
      case "doctor":
        return [
          ...baseItems,
          {
            href: "/doctor",
            label: "Practice",
            icon: Stethoscope,
          },
        ]
      case "admin":
        return [
          ...baseItems,
          {
            href: "/admin",
            label: "Administration",
            icon: Shield,
          },
        ]
      default:
        return baseItems
    }
  }

  const navItems = getNavItems()

  return (
    <nav className="flex items-center gap-2">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Button
            key={item.href}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            asChild
            className={cn("flex items-center gap-2", isActive && "bg-accent text-accent-foreground")}
          >
            <Link href={item.href}>
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          </Button>
        )
      })}
    </nav>
  )
}
