import type { Metadata } from "next"
import { AuthProvider } from "@/context/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { AdminLayoutClient } from "./admin-layout-client"

export const metadata: Metadata = {
  title: "Admin Dashboard - Libya Auto",
  description: "Admin dashboard for managing vehicle listings",
}

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <AdminLayoutClient>{children}</AdminLayoutClient>
      </ProtectedRoute>
    </AuthProvider>
  )
}

