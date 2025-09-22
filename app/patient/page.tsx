import { AuthGuard } from "@/components/auth/auth-guard"
import { PatientDashboard } from "@/components/patient/patient-dashboard"

export default function PatientPage() {
  return (
    <AuthGuard allowedRoles={["patient"]}>
      <PatientDashboard />
    </AuthGuard>
  )
}
