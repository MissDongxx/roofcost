export function getLocalRoofingSchema(city: string, state: string, averagePrice: number) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `Roof Replacement Services in ${city}, ${state}`,
    "provider": {
      "@type": "Organization",
      "name": "RoofCost.ai Contractors Network",
    },
    "areaServed": {
      "@type": "City",
      "name": city,
      "containedInPlace": {
        "@type": "State",
        "name": state
      }
    },
    // Useful for showing average estimated cost directly in rich snippets
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "lowPrice": Math.round(averagePrice * 0.8),
      "highPrice": Math.round(averagePrice * 1.3),
      "offerCount": 150
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "125"
    }
  };
}

export function generateFAQSchema(faqs: {q: string, a: string}[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };
}

export function generateWebAppSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "RoofCost Calculator",
    "url": process.env.NEXT_PUBLIC_SITE_URL || "https://roofcost.us",
    "description": "Free instant roof replacement cost calculator.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };
}

export function generateBreadcrumbSchema(items: {name: string, url: string}[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}
