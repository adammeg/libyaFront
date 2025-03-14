import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/hero-section"
import { VehicleSearch } from "@/components/vehicle-search"
import { NewsHero } from "@/components/news-hero"
import { NewsList } from "@/components/news-list"
import { Footer } from "@/components/footer"
import { FeaturedBrands } from "@/components/featured-brands"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <FeaturedBrands />
        <VehicleSearch />
        <NewsHero />
        <NewsList />
        <Footer/>
      </main>
    </div>
  )
}

