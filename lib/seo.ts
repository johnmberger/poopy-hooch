import { E_COLI_THRESHOLD } from "@/lib/usgs";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://isthehoochpoopy.com";

export const siteName = "Is the Hooch poopy?";

export const titleHelper = "Chattahoochee River water quality today · Atlanta, Georgia";

export const siteTitle = "Is the Hooch poopy? | Chattahoochee River Tubing & Safety Check";

export const siteDescription =
  "Chattahoochee River water quality today — is it safe to shoot the Hooch? Check live E. coli bacteria levels before tubing or floating in Atlanta. USGS BacteriALERT readings at Medlock Bridge, Powers Ferry, and Paces Ferry.";

export const siteKeywords = [
  "is the hooch poopy",
  "is the hooch safe",
  "is it safe to shoot the hooch",
  "shoot the hooch",
  "shoot the hooch safe",
  "chattahoochee river bacteria",
  "chattahoochee river e coli",
  "chattahoochee river water quality",
  "chattahoochee river water quality today",
  "chattahoochee river safe to swim",
  "chattahoochee river safe today",
  "chattahoochee river conditions",
  "chattahoochee river weather",
  "chattahoochee river tubing",
  "chattahoochee river tubing safety",
  "is it safe to tube the chattahoochee river",
  "can you tube the chattahoochee river today",
  "float the hooch",
  "hooch water quality",
  "atlanta river tubing",
  "CRNRA bacteria",
  "chattahoochee river national recreation area",
  "USGS BacteriALERT",
  "medlock bridge bacteria",
  "powers ferry e coli",
  "paces ferry chattahoochee river",
  "jones bridge tubing",
  "chattahoochee river poop check",
  "river bacteria atlanta",
];

export const faqItems = [
  {
    question: "Is it safe to shoot the Hooch?",
    answer:
      "It depends on current E. coli levels along the stretch you're floating. This site checks three USGS BacteriALERT monitoring stations in the Chattahoochee River National Recreation Area and shows which sections look clean or poopy right now.",
  },
  {
    question: "What is the Chattahoochee River water quality today?",
    answer:
      "See the live verdict at the top of this page. We track E. coli — the main bacteria indicator for swimming and tubing — at three USGS stations along the CRNRA. Levels at or below 235 cfu/100 mL are considered low risk; above that, the river is more likely to make you sick.",
  },
  {
    question: "Is it safe to shoot the Hooch today?",
    answer:
      "Check the live verdict at the top of this page. We pull hourly E. coli estimates from USGS sensors at Medlock Bridge, Powers Ferry, and Paces Ferry — the main tubing corridor through Atlanta's CRNRA.",
  },
  {
    question: "Is the Chattahoochee River safe for tubing or swimming today?",
    answer:
      "Bacteria levels change, especially after rain. We compare live USGS E. coli estimates against the EPA beach action value (235 cfu/100 mL) at three stations so you can see if the river looks clean, mixed, or poopy before you get in.",
  },
  {
    question: "Should I check Chattahoochee River weather or bacteria levels?",
    answer:
      "Both matter, but they measure different things. A sunny forecast doesn't guarantee clean water — rain upstream can spike E. coli for days. Use this site for bacteria levels and a weather app for storms, lightning, and air temperature before you shoot the Hooch.",
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
    question: "What parts of the Chattahoochee River does this cover?",
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
        "@type": "WebPage",
        "@id": `${siteUrl}/#webpage`,
        url: siteUrl,
        name: siteTitle,
        description: siteDescription,
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: [
          "Chattahoochee River water quality today",
          "Chattahoochee River tubing safety",
          "Chattahoochee River E. coli bacteria levels",
          "Shoot the Hooch water quality",
        ],
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", ".verdict h2", ".verdict p"],
        },
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
