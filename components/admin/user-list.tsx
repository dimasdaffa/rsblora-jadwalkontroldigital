"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Stethoscope, Users, Shield, Edit, Trash2 } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "doctor" | "patient"
  department: string
  status: "active" | "inactive"
  lastLogin: string
  patients?: number
}

interface UserListProps {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (userId: string) => void
}

export function UserList({ users, onEdit, onDelete }: UserListProps) {
  const handleEditUser = (user: User) => {
    onEdit(user)
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardContent className="p-6">
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100 gap-4"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="bg-blue-100 p-3 rounded-full flex-shrink-0">
                  {user.role === "doctor" && <Stethoscope className="h-4 w-4" />}
                  {user.role === "patient" && <Users className="h-4 w-4" />}
                  {user.role === "admin" && <Shield className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-gray-900 truncate">{user.name}</h4>
                  <p className="text-sm text-gray-600 truncate">{user.email}</p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1">
                    <span className="text-xs text-gray-500">Dept: {user.department}</span>
                    <span className="text-xs text-gray-500">
                      Login: {new Date(user.lastLogin).toLocaleDateString()}
                    </span>
                    {user.role === "doctor" && user.patients && (
                      <span className="text-xs text-gray-500">Pasien: {user.patients}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Badge variant="outline" className="capitalize">
                  {user.role}
                </Badge>
                <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  onClick={() => handleEditUser(user)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                  onClick={() => onDelete(user.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
