 "use client"

import { useEffect, useState } from "react"

interface PriceFormatterProps {
  price: number;
  locale?: string;
}

export function PriceFormatter({ price, locale = "en" }: PriceFormatterProps) {
  const [formattedPrice, setFormattedPrice] = useState<string>(`${price}`);
  
  useEffect(() => {
    try {
      // Use proper currency code based on locale
      const currencyCode = locale === "ar" ? "LYD" : "USD"; // Libyan Dinar or US Dollar
      
      const formatter = new Intl.NumberFormat(locale === "ar" ? "ar-LY" : "en-US", {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits: 0
      });
      
      setFormattedPrice(formatter.format(price));
    } catch (error) {
      console.error("Error formatting price:", error);
      // Fallback to basic formatting
      setFormattedPrice(locale === "ar" 
        ? `${price} د.ل` // Libyan Dinar symbol
        : `$${price}`);
    }
  }, [price, locale]);
  
  return <span className="whitespace-nowrap">{formattedPrice}</span>;
}