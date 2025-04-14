"use client"

import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"

export function SiteHeader() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale || ""
  return <Navbar />
}