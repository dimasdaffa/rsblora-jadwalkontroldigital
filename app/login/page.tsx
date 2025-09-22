"use client"

import { LoginForm } from "@/components/auth/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

export default function LoginPage() {
  const [logoError, setLogoError] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <Link href="/" className="inline-flex items-center gap-4 mb-6 hover:opacity-80 transition-opacity">
            <div className="relative w-14 h-14">
              {!logoError ? (
                <Image
                  src="/logo-bhayangkara.jpg"
                  alt="RS. Bhayangkara Blora"
                  width={56}
                  height={56}
                  className="rounded-full shadow-lg object-cover"
                  priority={true}
                  onError={() => {
                    console.log("Logo failed to load, using fallback")
                    setLogoError(true)
                  }}
                  onLoad={() => {
                    console.log("Logo loaded successfully")
                  }}
                />
              ) : (
                /* Fallback logo */
                <div className="w-14 h-14 rounded-full shadow-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center font-bold text-lg">
                  RS
                </div>
              )}
            </div>
            <div className="text-left">
              <span className="text-xl sm:text-2xl font-bold text-gray-900 block">RS. Bhayangkara Blora</span>
              <span className="text-base text-gray-600">Tk. IV</span>
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Selamat Datang Kembali</h1>
          <p className="text-gray-600 text-base sm:text-lg">Masuk untuk mengakses dashboard Anda</p>
        </div>

        {/* Login Form */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="pb-6">
            <CardTitle className="text-gray-900 text-xl">Masuk</CardTitle>
            <CardDescription className="text-gray-600 text-base">
              Masukkan kredensial Anda untuk melanjutkan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-base text-gray-600">
            Butuh bantuan?{" "}
            <Link href="#" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
              Hubungi Dukungan
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
