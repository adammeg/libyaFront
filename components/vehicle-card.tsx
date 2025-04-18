"use client"

import { PriceFormatter } from "@/components/price-formatter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatImagePath } from "@/utils/image-helpers";
import Link from "next/link";

interface VehicleCardProps {
  vehicle: {
    _id: string;
    model: string;
    price: number;
    photos: string[];
    type: string;
  };
  locale: string;
}

export function VehicleCard({ vehicle, locale }: VehicleCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="p-0">
        <div className="aspect-[4/3] relative">
          <img
            src={vehicle.photos[0] ? formatImagePath(vehicle.photos[0]) : "/placeholder-car.svg"}
            alt={vehicle.model}
            className="object-cover w-full h-full"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-car.svg";
            }}
          />
          <Badge
            variant="secondary"
            className="absolute top-2 right-2"
          >
            {vehicle.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2">{vehicle.model}</h3>
        <div className="text-xl font-bold text-primary">
          <PriceFormatter price={vehicle.price} locale={locale} />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link href={`/${locale}/vehicles/${vehicle._id}`}>
            {locale === "ar" ? "عرض التفاصيل" : "View Details"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
} 