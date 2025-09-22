"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  Shield,
  Heart,
  Stethoscope,
  Award,
  Activity,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Star,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentDoctorSlide, setCurrentDoctorSlide] = useState(0)
  const [currentNewsSlide, setCurrentNewsSlide] = useState(0)
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({})

  const handleImageError = (imageKey: string) => {
    setImageErrors((prev) => ({ ...prev, [imageKey]: true }))
  }

  const doctors = [
    {
      name: "Dr. Sarah Smith",
      specialty: "Kardiologi",
      experience: "15 tahun",
      image: "/female-cardiologist.png",
      rating: 4.9,
    },
    {
      name: "Dr. Michael Johnson",
      specialty: "Dermatologi",
      experience: "12 tahun",
      image: "/male-dermatologist.png",
      rating: 4.8,
    },
    {
      name: "Dr. Emily Davis",
      specialty: "Kedokteran Umum",
      experience: "10 tahun",
      image: "/female-doctor-general-medicine.png",
      rating: 4.9,
    },
    {
      name: "Dr. Robert Wilson",
      specialty: "Ortopedi",
      experience: "18 tahun",
      image: "/male-orthopedic-doctor.png",
      rating: 4.7,
    },
  ]

  const healthNews = [
    {
      title: "Tips Menjaga Kesehatan Jantung di Era Modern",
      excerpt:
        "Pelajari cara-cara efektif untuk menjaga kesehatan jantung Anda dengan gaya hidup sehat dan pemeriksaan rutin.",
      image: "/heart-health-tips.png",
      date: "15 Jan 2024",
      category: "Kardiologi",
    },
    {
      title: "Pentingnya Vaksinasi untuk Keluarga",
      excerpt: "Memahami jadwal vaksinasi yang tepat untuk melindungi keluarga besar Polri dan masyarakat umum.",
      image: "/family-vaccination.png",
      date: "12 Jan 2024",
      category: "Kesehatan Umum",
    },
    {
      title: "Deteksi Dini Kanker: Yang Perlu Anda Ketahui",
      excerpt: "Informasi penting tentang screening kanker dan tanda-tanda awal yang harus diwaspadai.",
      image: "/cancer-screening-detection.png",
      date: "10 Jan 2024",
      category: "Onkologi",
    },
  ]

  const nextDoctorSlide = () => {
    setCurrentDoctorSlide((prev) => (prev + 1) % Math.ceil(doctors.length / 2))
  }

  const prevDoctorSlide = () => {
    setCurrentDoctorSlide((prev) => (prev - 1 + Math.ceil(doctors.length / 2)) % Math.ceil(doctors.length / 2))
  }

  const nextNewsSlide = () => {
    setCurrentNewsSlide((prev) => (prev + 1) % healthNews.length)
  }

  const prevNewsSlide = () => {
    setCurrentNewsSlide((prev) => (prev - 1 + healthNews.length) % healthNews.length)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              {!imageErrors["logo"] ? (
                <Image
                  src="/logo-bhayangkara.jpg"
                  alt="RS. Bhayangkara Blora Logo"
                  width={44}
                  height={44}
                  className="rounded-lg sm:w-14 sm:h-14"
                  priority
                  onError={() => handleImageError("logo")}
                />
              ) : (
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  RS
                </div>
              )}
              <div>
                <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 leading-tight">
                  RS. Bhayangkara Blora Tk. IV
                </h1>
                <p className="text-sm text-gray-600 hidden sm:block">Polda Jawa Tengah</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-8">
                <Link
                  href="#layanan"
                  className="text-gray-600 hover:text-blue-600 transition-colors font-medium text-base"
                >
                  Layanan
                </Link>
                <Link
                  href="#dokter"
                  className="text-gray-600 hover:text-blue-600 transition-colors font-medium text-base"
                >
                  Dokter
                </Link>
                <Link
                  href="#poliklinik"
                  className="text-gray-600 hover:text-blue-600 transition-colors font-medium text-base"
                >
                  Poliklinik
                </Link>
                <Link
                  href="#berita"
                  className="text-gray-600 hover:text-blue-600 transition-colors font-medium text-base"
                >
                  Berita
                </Link>
                <Link
                  href="#kontak"
                  className="text-gray-600 hover:text-blue-600 transition-colors font-medium text-base"
                >
                  Kontak
                </Link>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-base min-h-[48px]" asChild>
                  <Link href="/login">Portal</Link>
                </Button>
              </nav>

              {/* Mobile Menu Button - Enhanced touch target */}
              <Button
                variant="ghost"
                size="lg"
                className="md:hidden p-3 min-h-[48px] min-w-[48px]"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Sidebar */}
        {isMobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden transition-opacity duration-300 ease-out"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <div
              className={`fixed left-0 top-0 h-full w-80 bg-white z-[100] md:hidden shadow-2xl border-r border-gray-100 transform transition-transform duration-300 ease-out ${
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <div className="bg-white border-b border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    {!imageErrors["mobile-logo"] ? (
                      <Image
                        src="/logo-bhayangkara.jpg"
                        alt="RS. Bhayangkara Blora Logo"
                        width={48}
                        height={48}
                        className="rounded-lg shadow-sm"
                        onError={() => handleImageError("mobile-logo")}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                        RS
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900 text-base leading-tight">RS. Bhayangkara Blora</h3>
                      <p className="text-sm text-gray-600">Polda Jawa Tengah</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-3 hover:bg-gray-100 rounded-xl transition-colors duration-200 min-h-[48px] min-w-[48px]"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 bg-white overflow-y-auto">
                <div className="p-4">
                  <nav className="space-y-2">
                    <a
                      href="#layanan"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 w-full p-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 active:bg-blue-100 transition-all duration-200 hover:scale-[1.01] hover:shadow-sm min-h-[48px] text-sm font-medium touch-manipulation"
                    >
                      <div className="bg-blue-100 p-2 rounded-lg shadow-sm">
                        <Stethoscope className="h-5 w-5 text-blue-600" />
                      </div>
                      <span>Layanan Kesehatan</span>
                    </a>

                    <a
                      href="#dokter"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 w-full p-3 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 active:bg-green-100 transition-all duration-200 hover:scale-[1.01] hover:shadow-sm min-h-[48px] text-sm font-medium touch-manipulation"
                    >
                      <div className="bg-green-100 p-2 rounded-lg shadow-sm">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <span>Tim Dokter</span>
                    </a>

                    <a
                      href="#poliklinik"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 w-full p-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700 active:bg-purple-100 transition-all duration-200 hover:scale-[1.01] hover:shadow-sm min-h-[48px] text-sm font-medium touch-manipulation"
                    >
                      <div className="bg-purple-100 p-2 rounded-lg shadow-sm">
                        <Activity className="h-5 w-5 text-purple-600" />
                      </div>
                      <span>Poliklinik Spesialis</span>
                    </a>

                    <a
                      href="#berita"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 w-full p-3 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-700 active:bg-orange-100 transition-all duration-200 hover:scale-[1.01] hover:shadow-sm min-h-[48px] text-sm font-medium touch-manipulation"
                    >
                      <div className="bg-orange-100 p-2 rounded-lg shadow-sm">
                        <Award className="h-5 w-5 text-orange-600" />
                      </div>
                      <span>Berita Kesehatan</span>
                    </a>

                    <a
                      href="#kontak"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 w-full p-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-700 active:bg-red-100 transition-all duration-200 hover:scale-[1.01] hover:shadow-sm min-h-[48px] text-sm font-medium touch-manipulation"
                    >
                      <div className="bg-red-100 p-2 rounded-lg shadow-sm">
                        <Phone className="h-5 w-5 text-red-600" />
                      </div>
                      <span>Kontak & Lokasi</span>
                    </a>
                  </nav>

                  <div className="mt-6 p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-red-500 p-2 rounded-lg shadow-sm">
                        <Phone className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-red-800 text-base">Gawat Darurat</p>
                        <p className="text-red-600 text-xs">Siaga 24 Jam</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-red-700 font-bold text-2xl mb-1">911</p>
                      <p className="text-red-600 text-xs">Tekan untuk panggilan darurat</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] min-h-[56px] text-base font-semibold touch-manipulation"
                      asChild
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Link href="/login" className="flex items-center justify-center gap-2">
                        <Users className="h-5 w-5" />
                        <span>Portal Pasien</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </header>

      {/* Enhanced Hero Section */}
      <section className="relative py-16 sm:py-20 lg:py-24 px-4 bg-gradient-to-br from-blue-50 to-white overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-3 bg-blue-100 text-blue-700 px-4 py-3 rounded-full text-sm sm:text-base font-medium mb-6 sm:mb-8">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                Pelayanan Kesehatan Terdepan
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight">
                Melindungi Hari Esok:
                <span className="text-blue-600 block">Komitmen Kami untuk Kesehatan Anda</span>
              </h2>
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Rasakan pelayanan kesehatan berkelas dunia dengan sistem jadwal digital yang komprehensif untuk keluarga
                besar Polri dan masyarakat umum.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold min-h-[56px] shadow-lg hover:shadow-xl transition-all duration-200"
                  asChild
                >
                  <Link href="/login">Buat Janji Temu</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold bg-transparent min-h-[56px] shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Pelajari Lebih Lanjut
                </Button>
              </div>
            </div>

            {/* YouTube Video Embed */}
            <div className="relative mt-8 lg:mt-0">
              <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 border">
                <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src="https://www.youtube.com/embed/zFwfeAYTVZo"
                    title="RS Bhayangkara Blora Services"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">Tonton video profil layanan kesehatan kami</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-white">
            <CardContent className="p-6 sm:p-8 lg:p-12">
              <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-center">
                <div className="text-center md:text-left">
                  <div className="mb-4">
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                      Kepala RS. Bhayangkara Blora Tk. IV.
                    </h3>
                    <div className="w-20 h-1 bg-blue-600 mx-auto md:mx-0"></div>
                  </div>
                  <blockquote className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6">
                    "Selamat datang di RS. Bhayangkara Blora Tk. IV. Kami berkomitmen memberikan pelayanan kesehatan
                    terbaik dengan teknologi modern dan tenaga medis profesional untuk melayani keluarga besar Polri dan
                    masyarakat umum."
                  </blockquote>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-lg">dr. M. ARDI WIBAWA, Sp.PD.</p>
                    <p className="text-blue-600 font-medium">Kepala Rumah Sakit</p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="relative">
                    <Image
                      src="/hospital-director.png"
                      alt="Kepala Rumah Sakit"
                      width={250}
                      height={300}
                      className="rounded-2xl shadow-lg"
                      onError={() => handleImageError("hospital-director")}
                    />
                    <div className="absolute -bottom-4 -right-4 bg-blue-600 text-white p-3 rounded-full">
                      <Stethoscope className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="layanan" className="py-12 sm:py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Fasilitas Medis Terbaik</h3>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              Dilengkapi dengan teknologi medis terdepan dan fasilitas modern untuk memberikan pelayanan kesehatan
              optimal
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-white">
              <CardHeader className="text-center pb-4">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Unit Gawat Darurat</CardTitle>
                <CardDescription className="text-gray-600">Pelayanan 24/7 dengan tim medis siaga</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Ambulans siaga 24 jam
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Tim dokter spesialis
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Peralatan medis canggih
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-white">
              <CardHeader className="text-center pb-4">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Laboratorium</CardTitle>
                <CardDescription className="text-gray-600">Pemeriksaan diagnostik lengkap dan akurat</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Tes darah lengkap
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Mikrobiologi
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Kimia klinik
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-white">
              <CardHeader className="text-center pb-4">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Kamar Operasi</CardTitle>
                <CardDescription className="text-gray-600">Ruang operasi berstandar internasional</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Teknologi minimal invasif
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Sistem sterilisasi canggih
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Tim bedah berpengalaman
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="dokter" className="py-12 sm:py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Tim Dokter Terbaik Kami</h3>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              Dipercayakan kepada dokter spesialis berpengalaman dengan dedikasi tinggi untuk kesehatan Anda
            </p>
          </div>

          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentDoctorSlide * 100}%)` }}
              >
                {Array.from({ length: Math.ceil(doctors.length / 2) }).map((_, slideIndex) => (
                  <div key={slideIndex} className="w-full flex-shrink-0">
                    <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
                      {doctors.slice(slideIndex * 2, slideIndex * 2 + 2).map((doctor, index) => (
                        <Card
                          key={index}
                          className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-white"
                        >
                          <CardContent className="p-6">
                            <div className="text-center">
                              <div className="relative mb-4">
                                {!imageErrors[`doctor-${slideIndex}-${index}`] ? (
                                  <Image
                                    src={doctor.image}
                                    alt={doctor.name}
                                    width={120}
                                    height={120}
                                    className="rounded-full mx-auto shadow-lg object-cover"
                                    onError={() => handleImageError(`doctor-${slideIndex}-${index}`)}
                                  />
                                ) : (
                                  <div className="w-[120px] h-[120px] rounded-full mx-auto shadow-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                    <Stethoscope className="h-12 w-12 text-blue-600" />
                                  </div>
                                )}
                                <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full">
                                  <Stethoscope className="h-4 w-4" />
                                </div>
                              </div>
                              <h4 className="text-xl font-bold text-gray-900 mb-1">{doctor.name}</h4>
                              <p className="text-blue-600 font-medium mb-2">{doctor.specialty}</p>
                              <p className="text-gray-600 text-sm mb-3">Pengalaman: {doctor.experience}</p>
                              <div className="flex items-center justify-center gap-1 mb-4">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-gray-700 font-medium">{doctor.rating}</span>
                              </div>
                              <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full">
                                Buat Janji Temu
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <Button
              variant="outline"
              size="sm"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg border-gray-200 hover:bg-gray-50"
              onClick={prevDoctorSlide}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg border-gray-200 hover:bg-gray-50"
              onClick={nextDoctorSlide}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: Math.ceil(doctors.length / 2) }).map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentDoctorSlide ? "bg-blue-600" : "bg-gray-300"
                  }`}
                  onClick={() => setCurrentDoctorSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="poliklinik" className="py-12 sm:py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Poliklinik Terbaik</h3>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              Layanan poliklinik spesialis dengan fasilitas modern dan tenaga medis berpengalaman
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-gradient-to-br from-red-50 to-white">
              <CardHeader className="pb-3">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-lg text-gray-900">Poli Jantung</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">Pemeriksaan dan pengobatan penyakit kardiovaskular</p>
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center justify-between">
                    <span>Senin - Jumat</span>
                    <span>08:00 - 16:00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Sabtu</span>
                    <span>08:00 - 12:00</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader className="pb-3">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-lg text-gray-900">Poli Umum</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">Pelayanan kesehatan umum dan konsultasi medis</p>
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center justify-between">
                    <span>Senin - Jumat</span>
                    <span>07:00 - 20:00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Sabtu</span>
                    <span>07:00 - 14:00</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-gradient-to-br from-green-50 to-white">
              <CardHeader className="pb-3">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-lg text-gray-900">Poli Anak</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">Pelayanan kesehatan khusus untuk anak-anak</p>
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center justify-between">
                    <span>Senin - Jumat</span>
                    <span>08:00 - 16:00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Sabtu</span>
                    <span>08:00 - 12:00</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-white">
              <CardHeader className="pb-3">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-lg text-gray-900">Poli Mata</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">Pemeriksaan dan pengobatan gangguan mata</p>
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center justify-between">
                    <span>Senin - Jumat</span>
                    <span>08:00 - 15:00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Sabtu</span>
                    <span>08:00 - 12:00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="berita" className="py-12 sm:py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Berita Kesehatan Terkini</h3>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              Informasi kesehatan terbaru dan tips hidup sehat dari para ahli medis kami
            </p>
          </div>

          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentNewsSlide * 100}%)` }}
              >
                {healthNews.map((news, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    <Card className="border-0 shadow-lg bg-white max-w-2xl mx-auto">
                      <div className="grid md:grid-cols-2 gap-0">
                        <div className="relative">
                          {!imageErrors[`news-${index}`] ? (
                            <Image
                              src={news.image}
                              alt={news.title}
                              width={300}
                              height={200}
                              className="w-full h-48 md:h-full object-cover rounded-l-lg"
                              onError={() => handleImageError(`news-${index}`)}
                            />
                          ) : (
                            <div className="w-full h-48 md:h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-l-lg flex items-center justify-center">
                              <Activity className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute top-4 left-4">
                            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                              {news.category}
                            </span>
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                            <Calendar className="h-4 w-4" />
                            <span>{news.date}</span>
                          </div>
                          <h4 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{news.title}</h4>
                          <p className="text-gray-600 text-sm leading-relaxed mb-4">{news.excerpt}</p>
                          <Button
                            variant="outline"
                            className="border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent"
                          >
                            Baca Selengkapnya
                          </Button>
                        </CardContent>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <Button
              variant="outline"
              size="sm"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg border-gray-200 hover:bg-gray-50"
              onClick={prevNewsSlide}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg border-gray-200 hover:bg-gray-50"
              onClick={nextNewsSlide}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-8 gap-2">
              {healthNews.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentNewsSlide ? "bg-blue-600" : "bg-gray-300"
                  }`}
                  onClick={() => setCurrentNewsSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
            Siap Merasakan Pelayanan Kesehatan Terbaik?
          </h3>
          <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Bergabunglah dengan ribuan pasien yang mempercayai platform kesehatan digital kami untuk kebutuhan medis
            mereka
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg"
              asChild
            >
              <Link href="/login">Buat Janji Temu Sekarang</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg bg-transparent"
            >
              Hubungi Kami
            </Button>
          </div>
        </div>
      </section>

      <footer id="kontak" className="bg-gray-900 text-white py-12 sm:py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                {!imageErrors["footer-logo"] ? (
                  <Image
                    src="/logo-bhayangkara.jpg"
                    alt="RS. Bhayangkara Blora Logo"
                    width={32}
                    height={32}
                    className="rounded-lg sm:w-10 sm:h-10"
                    onError={() => handleImageError("footer-logo")}
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                    RS
                  </div>
                )}
                <div>
                  <span className="text-base sm:text-lg font-bold">RS. Bhayangkara Blora Tk. IV</span>
                  <p className="text-xs text-gray-400">Polda Jawa Tengah</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4 text-sm sm:text-base">
                Penyedia layanan kesehatan terdepan yang berkomitmen memberikan pelayanan medis terbaik melalui solusi
                digital inovatif untuk keluarga besar Polri dan masyarakat umum.
              </p>
              <div className="flex gap-3 sm:gap-4">
                <div className="bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-semibold text-white mb-4 sm:mb-6 text-sm sm:text-base">Layanan</h5>
              <ul className="space-y-2 sm:space-y-3 text-gray-400 text-sm">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Unit Gawat Darurat
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Poli Jantung
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Poli Umum
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Laboratorium
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-white mb-4 sm:mb-6 text-sm sm:text-base">Tautan Cepat</h5>
              <ul className="space-y-2 sm:space-y-3 text-gray-400 text-sm">
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Portal Pasien
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Login Dokter
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Panel Admin
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Hubungi Kami
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-white mb-4 sm:mb-6 text-sm sm:text-base">Informasi Kontak</h5>
              <div className="space-y-2 sm:space-y-3 text-gray-400 text-sm">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span>(0296) 531234</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="break-all">info@rsbhayangkarablora.com</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span>Jl. Letjen S. Parman No.1, Blora, Jawa Tengah</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span>24 Jam (Gawat Darurat)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center">
            <p className="text-gray-400 text-xs sm:text-sm">
              © 2024 RS. Bhayangkara Blora Tk. IV. Hak Cipta Dilindungi. | Kebijakan Privasi | Syarat Layanan
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
