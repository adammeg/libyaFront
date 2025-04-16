"use client"

import Link from "next/link"

interface FooterProps {
  dictionary?: any; // Add this prop definition
  locale: string;
}

export function Footer({ dictionary = {}, locale }: FooterProps) {
  const currentYear = new Date().getFullYear()
  const footerText = dictionary.footer || {}
  
  return (
    <footer className="bg-muted py-12">
      <div className="container grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <p className="mt-4 text-muted-foreground">
            {footerText.copyright?.replace("{{year}}", currentYear.toString()) || 
             `© ${currentYear} Libya Auto. All rights reserved.`}
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">{footerText.quickLinks || "Quick Links"}</h3>
          <ul className="space-y-2">
            <li>
              <Link href={`/${locale}/`} className="text-muted-foreground hover:text-foreground">
                {dictionary.navbar?.home || "Home"}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/vehicles`} className="text-muted-foreground hover:text-foreground">
                {dictionary.navbar?.vehicles || "Vehicles"}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/blog`} className="text-muted-foreground hover:text-foreground">
                {dictionary.navbar?.blog || "Blog"}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">{footerText.contactUs || "Contact Us"}</h3>
          <address className="not-italic text-muted-foreground">
            <p>Tripoli, Libya</p>
            <p className="mt-2">Email: info@libyaauto.com</p>
            <p className="mt-2">Phone: +218 91-234-5678</p>
          </address>
        </div>
      </div>
    </footer>
  )
}