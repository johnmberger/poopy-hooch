import { E_COLI_THRESHOLD } from "@/lib/usgs";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://isthehoochpoopy.com";

export const siteName = "Is the Hooch poopy?";

export const siteTitle = "Is the Hooch poopy? | Chattahoochee River Bacteria Check";

export const siteDescription =
  "Is the Chattahoochee River poopy today? Check real-time E. coli bacteria levels before you shoot the Hooch. Live readings from USGS BacteriALERT at Medlock Bridge, Powers Ferry, and Paces Ferry in Atlanta.";

export const siteKeywords = [
  "is the hooch poopy",
  "is the hooch safe",
  "shoot the hooch",
  "chattahoochee river bacteria",
  "chattahoochee river e coli",
  "chattahoochee tubing",
  "chattahoochee river tubing safety",
  "is it safe to tube the chattahoochee",
  "float the hooch",
  "hooch water quality",
  "atlanta river tubing",
  "CRNRA bacteria",
  "chattahoochee river national recreation area",
  "USGS BacteriALERT",
  "medlock bridge bacteria",
  "powers ferry e coli",
  "paces ferry chattahoochee",
  "jones bridge tubing",
  "chattahoochee poop check",
  "river bacteria atlanta",
];

export const faqItems = [
  {
    question: "Is it safe to shoot the Hooch today?",
    answer:
      "It depends on current E. coli levels. This site checks three USGS BacteriALERT monitoring stations along the Chattahoochee River National Recreation Area and tells you which sections look clean or poopy right now.",
  },
  {
    question: "What E. coli level is safe for tubing?",
    answer: `The EPA beach action value is ${E_COLI_THRESHOLD} colony-forming units per 100 mL. At or below that is considered low risk. Above that, bacteria levels are elevated and tubing or swimming is riskier.`,
  },
  {
    question: "Where does the bacteria data come from?",
    answer:
      "Readings come from the USGS BacteriALERT program, which estimates E. coli at Medlock Bridge, Powers Ferry, and Paces Ferry using turbidity and other sensor data. Lab samples are collected weekly, usually on Thursdays.",
  },
  {
    question: "What parts of the Chattahoochee does this cover?",
    answer:
      "The three monitoring sites span the main tubing stretch of the CRNRA — upstream near Norcross (Medlock Bridge), mid-river at Sandy Springs and I-285 (Powers Ferry), and downstream near Atlanta and Vinings (Paces Ferry).",
  },
  {
    question: "How often is the data updated?",
    answer:
      "USGS estimates update roughly every 15 minutes. This site refreshes its cache hourly to stay current without hammering the government servers.",
  },
] as const;

export function getStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: siteName,
        description: siteDescription,
        inLanguage: "en-US",
      },
      {
        "@type": "WebApplication",
        "@id": `${siteUrl}/#app`,
        name: siteName,
        url: siteUrl,
        description: siteDescription,
        applicationCategory: "HealthApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        about: {
          "@type": "BodyOfWater",
          name: "Chattahoochee River",
          containedInPlace: {
            "@type": "Place",
            name: "Chattahoochee River National Recreation Area",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Atlanta",
              addressRegion: "GA",
              addressCountry: "US",
            },
          },
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}/#faq`,
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };
}
