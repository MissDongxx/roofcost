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
