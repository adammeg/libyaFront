"use client"

import { useState, useEffect } from "react"
import { HeroSection } from "@/components/hero-section"
import { VehicleSearch } from "@/components/vehicle-search"
import { NewsHero } from "@/components/news-hero"
import { NewsList } from "@/components/news-list"
import { FeaturedBrands } from "@/components/featured-brands"

interface ClientHomePageProps {
    locale: string;
    dictionary: any;
}

export default function ClientHomePage({ locale, dictionary }: ClientHomePageProps) {
    // Extract translations from the correct path in the dictionary
    // The structure of your translation files will determine the exact path
    const translations = dictionary.home || {};
    
    // Log dictionaries to debug
    useEffect(() => {
        console.log("Current locale:", locale);
        console.log("Dictionary:", dictionary);
    }, [locale, dictionary]);
    
    return (
        <>
            <HeroSection
                title={translations.title || 'Welcome to Libya Auto'}
                subtitle={translations.subtitle || 'Your trusted source for vehicles in Libya'}
                searchLabel={translations.searchVehicles || 'Search Vehicles'}
            />
            
            <FeaturedBrands
                title={translations.featuredBrands?.title || 'Featured Brands'}
                viewAllLabel={translations.featuredBrands?.viewAll || 'View All'}
            />
            
            <VehicleSearch />
            <NewsHero />
            
            <NewsList 
                title={translations.latestNews?.title || 'Latest News'} 
                viewAllLabel={translations.latestNews?.viewAll || 'View All Articles'} 
            />
        </>
    );
} 