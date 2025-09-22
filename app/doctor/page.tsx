import { AuthGuard } from "@/components/auth/auth-guard"
import { DoctorDashboard } from "@/components/doctor/doctor-dashboard"

export default function DoctorPage() {
  return (
    <AuthGuard allowedRoles={["doctor"]}>
      <DoctorDashboard />
    </AuthGuard>
  )
}
