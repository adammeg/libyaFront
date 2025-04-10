import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Libya Auto - Redirect",
  description: "Redirecting to the appropriate language version",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
} 