"use client"

import { useState, useEffect } from "react"
import { HeroSection } from "@/components/hero-section"
import { VehicleSearch } from "@/components/vehicle-search"
import { NewsHero } from "@/components/news-hero"
import { NewsList } from "@/components/news-list"
import { FeaturedBrands } from "@/components/featured-brands"

interface Dictionary {
    home?: {
        title?: string;
        subtitle?: string;
        featuredBrands?: {
            title?: string;
            viewAll?: string;
        };
        latestNews?: {
            title?: string;
            viewAll?: string;
        };
    };
    [key: string]: any;
}

interface ClientHomePageProps {
    locale: string;
    dictionary: Dictionary;
}

export default function ClientHomePage({ locale, dictionary }: ClientHomePageProps) {
    // Safe access to dictionary properties with defaults
    const homeDict = dictionary.home || {};

    const heroTitle = homeDict.title || 'Welcome to Libya Auto';
    const heroSubtitle = homeDict.subtitle || 'Your trusted source for vehicles in Libya';
    const searchLabel = 'Search'; // Default

    const featuredTitle = homeDict.featuredBrands?.title || 'Featured Brands';
    const featuredViewAll = homeDict.featuredBrands?.viewAll || 'View All';

    const newsTitle = homeDict.latestNews?.title || 'Latest News';
    const newsViewAll = homeDict.latestNews?.viewAll || 'View All Articles';

    return (
        <>
            <HeroSection
                title={heroTitle}
                subtitle={heroSubtitle}
                searchLabel={searchLabel}
            />
            <FeaturedBrands
                title={featuredTitle}
                viewAllLabel={featuredViewAll}
            />

            <VehicleSearch />
            <NewsHero />

            <NewsList
                title={newsTitle}
                viewAllLabel={newsViewAll}
            />
        </>
    );
} 