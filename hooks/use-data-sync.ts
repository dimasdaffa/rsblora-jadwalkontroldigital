"use client"

import { useEffect, useState, useCallback } from "react"
import { dataManager } from "@/lib/data-manager"

export function useDataSync<T>(dataKey: string, fetchData: () => T, dependencies: string[] = []) {
  const [data, setData] = useState<T>(fetchData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshData = useCallback(() => {
    try {
      setLoading(true)
      setError(null)
      const newData = fetchData()
      setData(newData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [fetchData])

  useEffect(() => {
    // Subscribe to data changes
    const handleDataChange = () => {
      refreshData()
    }

    dependencies.forEach((dep) => {
      dataManager.subscribe(`${dep}_changed`, handleDataChange)
    })

    // Initial data load
    refreshData()

    // Cleanup subscriptions
    return () => {
      dependencies.forEach((dep) => {
        dataManager.unsubscribe(`${dep}_changed`, handleDataChange)
      })
    }
  }, [refreshData, dependencies])

  return { data, loading, error, refresh: refreshData }
}

// Specific hooks for common data types
export function useAppointments() {
  return useDataSync("appointments", () => JSON.parse(localStorage.getItem("appointments") || "[]"), ["appointment"])
}

export function useUsers() {
  return useDataSync("users", () => dataManager.getUsers(), ["user"])
}

export function useMedicalRecords(patientId?: string) {
  return useDataSync("medical_records", () => dataManager.getMedicalRecords(patientId), ["medical_record"])
}

export function useMessages(userId?: string) {
  return useDataSync("messages", () => dataManager.getMessages(userId), ["message"])
}

export function useClinicalNotes(doctorId?: string, patientId?: string) {
  return useDataSync("clinical_notes", () => dataManager.getClinicalNotes(doctorId, patientId), ["clinical_note"])
}

export function useStatistics() {
  return useDataSync("statistics", () => dataManager.getStatistics(), [
    "appointment",
    "user",
    "medical_record",
    "message",
    "clinical_note",
  ])
}
