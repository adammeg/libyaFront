"use client"

import { useParams } from "next/navigation"
import { useContext } from "react"
import { Navbar } from "@/components/navbar"

export function SiteHeader({ dictionary = {} }) {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale || "en"
  
  return <Navbar locale={locale} dictionary={dictionary} />
}