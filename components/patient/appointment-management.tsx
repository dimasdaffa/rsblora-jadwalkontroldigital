"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, MapPin, User, Edit, X, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import { AppointmentManager, doctors, type Appointment, type Doctor, type TimeSlot } from "@/lib/appointments"
import { getCurrentUser } from "@/lib/auth"

interface AppointmentManagementProps {
  onAppointmentUpdated?: () => void
}

export function AppointmentManagement({ onAppointmentUpdated }: AppointmentManagementProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Reschedule form state
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")

  // Cancel form state
  const [cancelReason, setCancelReason] = useState("")

  const currentUser = getCurrentUser()

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = () => {
    if (currentUser) {
      const userAppointments = AppointmentManager.getAppointmentsByPatient(currentUser.email)
      setAppointments(userAppointments)
    }
  }

  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    const doctor = doctors.find((d) => d.id === appointment.doctorId)
    setSelectedDoctor(doctor || null)
    setSelectedDate("")
    setSelectedTime("")
    setShowRescheduleModal(true)
    setError("")
    setSuccess("")
  }

  const handleCancel = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setCancelReason("")
    setShowCancelModal(true)
    setError("")
    setSuccess("")
  }

  const getAvailableTimeSlots = (): TimeSlot[] => {
    if (!selectedDoctor || !selectedDate) return []
    const schedule = selectedDoctor.schedule.find((s) => s.date === selectedDate)
    return schedule ? schedule.timeSlots.filter((ts) => ts.available) : []
  }

  const submitReschedule = async () => {
    if (!selectedAppointment || !selectedDoctor || !selectedDate || !selectedTime) return

    setIsLoading(true)
    setError("")

    try {
      // Cancel the old appointment
      AppointmentManager.rejectAppointment(selectedAppointment.id)

      // Create new appointment
      AppointmentManager.createAppointment({
        patientId: selectedAppointment.patientId,
        patientName: selectedAppointment.patientName,
        patientEmail: selectedAppointment.patientEmail,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        date: selectedDate,
        time: selectedTime,
        type: selectedAppointment.type,
        status: "pending",
        notes: `Rescheduled from ${selectedAppointment.date} ${selectedAppointment.time}. ${selectedAppointment.notes || ""}`,
      })

      setSuccess("Appointment rescheduled successfully! Waiting for admin approval.")
      setShowRescheduleModal(false)
      loadAppointments()
      onAppointmentUpdated?.()

      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError("Failed to reschedule appointment. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const submitCancel = async () => {
    if (!selectedAppointment || !cancelReason.trim()) {
      setError("Please provide a reason for cancellation.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Update appointment with cancelled status and reason
      const appointments = AppointmentManager.getAllAppointments()
      const updatedAppointments = appointments.map((apt) =>
        apt.id === selectedAppointment.id
          ? { ...apt, status: "rejected" as const, notes: `Cancelled by patient. Reason: ${cancelReason}` }
          : apt,
      )

      localStorage.setItem("appointments", JSON.stringify(updatedAppointments))

      // Make time slot available again
      AppointmentManager.rejectAppointment(selectedAppointment.id)

      setSuccess("Appointment cancelled successfully.")
      setShowCancelModal(false)
      loadAppointments()
      onAppointmentUpdated?.()

      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError("Failed to cancel appointment. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "rejected":
        return <X className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Disetujui"
      case "pending":
        return "Menunggu Persetujuan"
      case "rejected":
        return "Dibatalkan"
      case "completed":
        return "Selesai"
      default:
        return status
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3 sm:space-y-4">
        {appointments.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
            <CardContent className="p-6 sm:p-8 text-center">
              <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Belum Ada Janji Temu</h3>
              <p className="text-sm sm:text-base text-gray-600">Anda belum memiliki janji temu yang terjadwal.</p>
            </CardContent>
          </Card>
        ) : (
          appointments.map((appointment) => (
            <Card key={appointment.id} className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  {/* Header with doctor info and status */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-2 sm:p-3 rounded-full flex-shrink-0">
                      <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                          {appointment.doctorName}
                        </h3>
                        <Badge
                          className={`${getStatusColor(appointment.status)} flex items-center gap-1 w-fit text-xs sm:text-sm`}
                        >
                          {getStatusIcon(appointment.status)}
                          {getStatusText(appointment.status)}
                        </Badge>
                      </div>

                      {/* Appointment details - stacked on mobile */}
                      <div className="space-y-2 sm:space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>{new Date(appointment.date).toLocaleDateString("id-ID")}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span>{appointment.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span>Ruang Praktek</span>
                          </div>
                        </div>

                        <div>
                          <Badge variant="outline" className="border-blue-200 text-blue-600 text-xs">
                            {appointment.type}
                          </Badge>
                        </div>
                      </div>

                      {appointment.notes && (
                        <div className="bg-gray-50 p-3 rounded-lg mt-3">
                          <p className="text-sm text-gray-700">
                            <strong>Catatan:</strong> {appointment.notes}
                          </p>
                        </div>
                      )}

                      <div className="text-xs text-gray-500 mt-2">
                        Dibuat: {new Date(appointment.createdAt).toLocaleDateString("id-ID")}{" "}
                        {new Date(appointment.createdAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons - full width on mobile */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 border-t border-gray-100">
                    {appointment.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReschedule(appointment)}
                          className="border-blue-200 text-blue-600 hover:bg-blue-50 w-full sm:w-auto min-h-[44px]"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Ubah Jadwal
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancel(appointment)}
                          className="border-red-200 text-red-600 hover:bg-red-50 w-full sm:w-auto min-h-[44px]"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Batalkan
                        </Button>
                      </>
                    )}

                    {appointment.status === "approved" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(appointment)}
                        className="border-red-200 text-red-600 hover:bg-red-50 w-full sm:w-auto min-h-[44px]"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Batalkan
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reschedule Modal - improved mobile responsiveness */}
      <Dialog open={showRescheduleModal} onOpenChange={setShowRescheduleModal}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto mx-auto">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg sm:text-xl">Ubah Jadwal Janji Temu</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Pilih jadwal baru untuk janji temu dengan {selectedAppointment?.doctorName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6">
            {/* Current Appointment Info */}
            {selectedAppointment && (
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-sm sm:text-base">Jadwal Saat Ini:</h4>
                <p className="text-sm text-gray-600">
                  {selectedAppointment.doctorName} - {new Date(selectedAppointment.date).toLocaleDateString("id-ID")}{" "}
                  pada {selectedAppointment.time}
                </p>
              </div>
            )}

            {/* Date Selection - improved mobile layout */}
            {selectedDoctor && (
              <div>
                <h4 className="font-medium mb-3 text-sm sm:text-base">Pilih Tanggal Baru</h4>
                <div className="space-y-2">
                  {selectedDoctor.schedule.map((schedule) => (
                    <Card
                      key={schedule.id}
                      className={`cursor-pointer transition-colors ${
                        selectedDate === schedule.date ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        setSelectedDate(schedule.date)
                        setSelectedTime("")
                      }}
                    >
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-sm sm:text-base">
                              {new Date(schedule.date).toLocaleDateString("id-ID")}
                            </span>
                          </div>
                          <Badge variant="outline" className="w-fit text-xs">
                            {schedule.timeSlots.filter((ts) => ts.available).length} slot tersedia
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Time Selection - improved mobile grid */}
            {selectedDate && (
              <div>
                <h4 className="font-medium mb-3 text-sm sm:text-base">Pilih Waktu Baru</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {getAvailableTimeSlots().map((timeSlot) => (
                    <Button
                      key={timeSlot.id}
                      variant={selectedTime === timeSlot.time ? "default" : "outline"}
                      className="justify-center min-h-[44px] text-sm"
                      onClick={() => setSelectedTime(timeSlot.time)}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      {timeSlot.time}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowRescheduleModal(false)}
                className="w-full sm:w-auto min-h-[44px]"
              >
                Batal
              </Button>
              <Button
                onClick={submitReschedule}
                disabled={isLoading || !selectedDate || !selectedTime}
                className="w-full sm:w-auto min-h-[44px]"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Mengubah...
                  </>
                ) : (
                  "Ubah Jadwal"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Modal - improved mobile responsiveness */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg">Batalkan Janji Temu</DialogTitle>
            <DialogDescription className="text-sm">
              Anda yakin ingin membatalkan janji temu dengan {selectedAppointment?.doctorName}?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedAppointment && (
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Jadwal:</strong> {new Date(selectedAppointment.date).toLocaleDateString("id-ID")} pada{" "}
                  {selectedAppointment.time}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Jenis:</strong> {selectedAppointment.type}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Alasan Pembatalan *</label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Mohon berikan alasan pembatalan..."
                rows={3}
                className="min-h-[80px]"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowCancelModal(false)}
                className="w-full sm:w-auto min-h-[44px]"
              >
                Kembali
              </Button>
              <Button
                variant="destructive"
                onClick={submitCancel}
                disabled={isLoading || !cancelReason.trim()}
                className="w-full sm:w-auto min-h-[44px]"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Membatalkan...
                  </>
                ) : (
                  "Batalkan Janji Temu"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
