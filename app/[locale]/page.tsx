import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/hero-section"
import { VehicleSearch } from "@/components/vehicle-search"
import { NewsHero } from "@/components/news-hero"
import { NewsList } from "@/components/news-list"
import { Footer } from "@/components/footer"
import { FeaturedBrands } from "@/components/featured-brands"
import useTranslation from "next-translate/useTranslation"

export default function Home() {
  const { t } = useTranslation("home")
  
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection 
          title={t("hero.title")}
          subtitle={t("hero.subtitle")}
          searchLabel={t("hero.searchVehicles")}
        />
        <FeaturedBrands
          title={t("featuredBrands.title")}
          viewAllLabel={t("featuredBrands.viewAll")}
        />
        <VehicleSearch />
        <NewsHero />
        <NewsList title={t("latestNews.title")} viewAllLabel={t("latestNews.viewAll")} />
        <Footer/>
      </main>
    </div>
  )
}