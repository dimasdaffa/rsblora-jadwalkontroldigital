"use client"

import { PatientRegistrationForm } from "@/components/auth/patient-registration-form"
import Image from "next/image"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image
              src="/logo-bhayangkara.jpg"
              alt="RS. Bhayangkara Blora"
              width={64}
              height={64}
              className="rounded-xl"
            />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                RS. Bhayangkara Blora Tk. IV
              </h1>
              <p className="text-sm sm:text-base text-blue-600/70">Sistem Informasi Rumah Sakit</p>
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">Daftar Sebagai Pasien Baru</h2>
          <p className="text-gray-600">
            Bergabunglah dengan sistem digital kami untuk kemudahan akses layanan kesehatan
          </p>
        </div>

        <PatientRegistrationForm />
      </div>
    </div>
  )
}
