// Automatically generated from Lamar's Carrier & Contact records
import { Carrier, CarrierSystemStatus, GuidelineBulletin, Submission } from '../types';

export const INITIAL_CARRIERS: Carrier[] = [
  {
    "id": "amtrust-financial",
    "name": "AmTrust Financial Services",
    "originalLogoPath": "/:i:/r/sites/carriers2/SiteAssets/amtrust1.png?csf=1&web=1&e=Uop6ZG",
    "isActive": true,
    "segment": [
      "Commercial Lines",
      "Carrier"
    ],
    "linesOfBusiness": [
      "Workers Compensation",
      "Business Owners Policy (BOP)",
      "Commercial Package",
      "General Liability"
    ],
    "agencyCode": "AM-98285",
    "website": "https://amtrustfinancial.com",
    "agentLogin": "https://amtrustfinancial.com/agents-producers/agent-login",
    "appetite": {
      "canWrite": [
        "Main-street retail shops and convenience stores",
        "Artisan and trade contractors (electricians, painters, plumbers)",
        "Professional offices, consulting clinics, and service industries",
        "Light manufacturing and wholesale distributors",
        "Monoline Workers Compensation for small businesses"
      ],
      "cannotWrite": [
        "Heavy construction or demolition projects",
        "Aviation, maritime, or railroad exposures",
        "Underground mining or high-hazard oil/gas services",
        "Long-haul trucking or high-hazard logistics"
      ],
      "notes": "AmTrust is an absolute market leader in small business Workers Comp. Known for competitive pricing and quick BOP package deals on main-street business accounts.",
      "underwritingHotline": "877-528-7878"
    },
    "contacts": [
      {
        "id": "amtrust-c1",
        "name": "Marcus Vance",
        "role": "Senior Commercial Underwriter (East Region)",
        "email": "marcus.vance@amtrustgroup.com",
        "phone": "(877) 528-7878 ext. 421",
        "region": "East Coast / Southeast"
      },
      {
        "id": "amtrust-c2",
        "name": "Sarah Jenkins",
        "role": "Territory Sales Manager",
        "email": "sarah.jenkins@amtrustfinancial.com",
        "phone": "(555) 489-3220",
        "region": "Midwest"
      },
      {
        "id": "amtrust-financial-c-csv-113",
        "name": "Daniel Layden",
        "role": "Rep (Workers' comp)",
        "email": "Daniel.Layden@amtrustgroup.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ],
    "worksheets": [
      {
        "id": "am-ws-contractor",
        "name": "AmTrust Artisan Contractor General Liability Questionnaire",
        "description": "Mandatory supplemental sheet for contractor GL classes covering subcontractors, height exposures, and multi-family residential projects.",
        "lineOfBusiness": "General Liability",
        "fileSize": "440 KB",
        "fileType": "pdf",
        "isRequired": true,
        "downloadUrl": "https://amtrustfinancial.com/contractor-supplemental.pdf"
      },
      {
        "id": "am-ws-wc-injury",
        "name": "AmTrust Workers Comp Industry Supplemental Information Guide",
        "description": "Required when submitting monoline WC policies with more than 15 employees to map risk classification codes accurately.",
        "lineOfBusiness": "Workers Compensation",
        "fileSize": "1.2 MB",
        "fileType": "xlsx",
        "isRequired": false,
        "downloadUrl": "https://amtrustfinancial.com/wc-risk-classification.xlsx"
      }
    ]
  },
  {
    "id": "attune-insurance",
    "name": "Attune Insurance",
    "originalLogoPath": "/:i:/r/sites/carriers2/SiteAssets/Attune%20logo.jpeg?csf=1&web=1&e=ZFE5Yh",
    "isActive": true,
    "segment": [
      "Commercial Lines",
      "MGA",
      "Carrier/MGA"
    ],
    "linesOfBusiness": [
      "Business Owners Policy (BOP)",
      "Workers Compensation",
      "Umbrella/Excess Liability Insurance"
    ],
    "agencyCode": "AT-40122",
    "website": "https://attuneinsurance.com",
    "agentLogin": "https://app.attuneinsurance.com/login",
    "appetite": {
      "canWrite": [
        "Retail stores, gift shops, clothing outlets",
        "Boutiques, barbershops, hair and beauty salons",
        "Bakeries, coffee shops, and low-grease food operations",
        "Real estate agencies, financial services, offices"
      ],
      "cannotWrite": [
        "Bars, taverns, or high-liquor-volume nightclubs",
        "Residential constructors or high-loss general contractors",
        "24-hour convenience stores or pawn shops",
        "Businesses with extreme product liability expos"
      ],
      "notes": "Attune delivers instant quotes for small business BOP, underwritten by reputable capacity partners (e.g., Blackstone, Hamilton). No hassle, fully digitized portal workflow.",
      "underwritingHotline": "844-428-8863"
    },
    "contacts": [
      {
        "id": "attune-c1",
        "name": "Helena Reyes",
        "role": "Digital Underwriter Lead",
        "email": "underwriting@attuneinsurance.com",
        "phone": "844-4-ATTUNE",
        "region": "National"
      },
      {
        "id": "attune-insurance-c-csv-32",
        "name": "Support",
        "role": "WC Audit (WC audit (Nubian Clean WCV-0661441-01))",
        "email": "help@attuneinsurance.com",
        "phone": "",
        "region": "Source: Service (Last interaction: 2025-11-10)"
      },
      {
        "id": "attune-insurance-c-csv-80",
        "name": "Dan Hoopes",
        "role": "East Region Territory Mgr (Direct appointment + EverPeak WC)",
        "email": "dhoopes@attuneinsurance.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ],
    "worksheets": [
      {
        "id": "at-ws-grease",
        "name": "Attune Restaurant Grease & Hood Maintenance Questionnaire",
        "description": "Supplemental sheet detailing cooking exhaust cleaning schedules, deep-fryer safety features, and active fire suppression systems.",
        "lineOfBusiness": "Business Owners Policy (BOP)",
        "fileSize": "240 KB",
        "fileType": "pdf",
        "isRequired": true,
        "downloadUrl": "https://attuneinsurance.com/restaurant-grease-hood.pdf"
      },
      {
        "id": "at-ws-umbrella",
        "name": "Attune Commercial Excess Liability / Umbrella Supplemental Sheet",
        "description": "Supplemental question grid mapping auto liability scheduling and underlying policy limits for umbrella placement.",
        "lineOfBusiness": "Umbrella/Excess Liability Insurance",
        "fileSize": "510 KB",
        "fileType": "pdf",
        "isRequired": false,
        "downloadUrl": "https://attuneinsurance.com/umbrella-supplemental.pdf"
      }
    ]
  },
  {
    "id": "auto-owners",
    "name": "Auto-Owners Insurance",
    "originalLogoPath": "/:i:/r/sites/carriers2/SiteAssets/autoowners1.png?csf=1&web=1&e=6bRj81",
    "isActive": true,
    "segment": [
      "Personal Lines",
      "Commercial Lines"
    ],
    "linesOfBusiness": [
      "Personal Auto",
      "Homeowners",
      "Commercial Auto",
      "BOP",
      "Commercial Package"
    ],
    "agencyCode": "FC32170",
    "website": "https://www.auto-owners.com",
    "agentLogin": "https://saconnect.stateauto.com/",
    "appetite": {
      "canWrite": [
        "Prefers well-established local businesses with stable financials",
        "Commercial and personal multi-policy accounts",
        "Middle market standard premium commercial risks",
        "Standard personal home and auto risks"
      ],
      "cannotWrite": [
        "Excessive coastal property or hurricane zones",
        "Startups with no previous commercial insurance history",
        "High-performance luxury personal sports cars"
      ],
      "notes": "Auto-Owners is famous for outstanding claim service and agent friendliness. They take a traditional, human approach to underwriting with strong local ties.",
      "underwritingHotline": "800-346-0346"
    },
    "contacts": [
      {
        "id": "ao-c1",
        "name": "Robert McAlister",
        "role": "Regional Personal Lines VP",
        "email": "mcalister.robert@auto-owners.com",
        "phone": "(517) 323-1200",
        "region": "National"
      }
    ]
  },
  {
    "id": "berkshire-hathaway-homestate",
    "name": "Berkshire Hathaway Homestate",
    "originalLogoPath": "/:i:/r/sites/carriers2/SiteAssets/bhhc.png?csf=1&web=1&e=imZfcj",
    "isActive": true,
    "segment": [
      "Commercial Auto Only",
      "Commercial Lines",
      "Carrier"
    ],
    "linesOfBusiness": [
      "Commercial Auto",
      "Workers Compensation"
    ],
    "agencyCode": "BH-60822",
    "website": "https://www.bhhc.com",
    "agentLogin": "https://www.bhhc.com/partners/agent-login",
    "appetite": {
      "canWrite": [
        "Heavy trucking, local & intermediate delivery",
        "Artisan contractor squads and fleets (plumbing, roofing vehicles)",
        "Distributors, wholesalers, and agricultural haulers",
        "High-hazard workers compensation accounts with proper safety measures"
      ],
      "cannotWrite": [
        "Personal auto vehicles",
        "Unapproved toxic waste carriers or hazardous chemicals",
        "Passenger transport busses with extreme seat capacity"
      ],
      "notes": "BHHC provides unmatched stability under the Berkshire brand. Ideal for businesses with sizable truck fleets or challenging work safety exposures.",
      "underwritingHotline": "888-495-2442"
    },
    "contacts": [
      {
        "id": "bhhc-c1",
        "name": "Dwight Cooper",
        "role": "Fleet Underwriting Specialist",
        "email": "dcooper@bhhc.com",
        "phone": "(800) 488-2930",
        "region": "Western Region"
      },
      {
        "id": "berkshire-hathaway-homestate-c-csv-114",
        "name": "Kenna Foreman",
        "role": "Internal Marketing Specialist (Also MForsgren@bhhomestate.com; hello@bhhomestate.com)",
        "email": "KForeman@bhhomestate.com",
        "phone": "Direct 402.916.3625",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ]
  },
  {
    "id": "biberk",
    "name": "biBERK",
    "originalLogoPath": "/:i:/r/sites/carriers2/SiteAssets/Screenshot%202024-11-09%20at%209.36.57%E2%80%AFPM.png?csf=1&web=1&e=gNuT3X",
    "isActive": true,
    "segment": [
      "Commercial Lines"
    ],
    "linesOfBusiness": [
      "Workers Compensation",
      "General Liability",
      "BOP",
      "Professional Liability",
      "Commercial Auto"
    ],
    "agencyCode": "BB-7019",
    "website": "https://www.biberk.com",
    "agentLogin": "https://app.semsee.com/login-form",
    "appetite": {
      "canWrite": [
        "Direct small business owners looking for immediate cover",
        "Solo and micro artisan general contractors (handymen, painters, electricians)",
        "Office-based consultants, freelancers, IT professionals",
        "Janitorial services, dry cleans, small restaurants"
      ],
      "cannotWrite": [
        "Large-scale commercial structural design engineers",
        "Underground excavation or demolition contractors",
        "Marijuana or hemp commercial cultivation and dispensaries"
      ],
      "notes": "biBERK is part of the Berkshire Hathaway group of insurance companies. Unbelieva-fast online quoting ideal for rapid submission. Tailored for small accounts.",
      "underwritingHotline": "844-472-0967"
    },
    "contacts": [
      {
        "id": "biberk-c1",
        "name": "Direct Agent Desk",
        "role": "Broker Services Concierge",
        "email": "brokersupport@biberk.com",
        "phone": "(844) 472-0967",
        "region": "National"
      }
    ]
  },
  {
    "id": "cna-insurance",
    "name": "CNA Insurance",
    "originalLogoPath": "/:i:/r/sites/carriers2/SiteAssets/CNA%20insurance%20logo.png?csf=1&web=1&e=Q0hR4D",
    "isActive": true,
    "segment": [
      "Commercial Lines",
      "Carrier"
    ],
    "linesOfBusiness": [
      "BOP",
      "Commercial Package",
      "Workers Compensation",
      "Commercial Umbrella",
      "Marine Cargo"
    ],
    "agencyCode": "CNA-99810",
    "website": "https://www.cna.com",
    "agentLogin": "https://www.cna.com/agentcenterpublic",
    "appetite": {
      "canWrite": [
        "Middle market and corporate accounts",
        "Professional services, law firms, and research agencies",
        "Advanced manufacturers and wholesale supply networks",
        "Construction package accounts with solid risk logs"
      ],
      "cannotWrite": [
        "Unlicensed taxi chains or local food gig delivery",
        "High-risk recreational centers and theme parks",
        "Startups under 2 years looking for heavy specialty professional cover"
      ],
      "notes": "CNA is one of the largest U.S. commercial property and casualty insurance companies. Extremely reliable for professional services, manufacturing, and tech segments.",
      "underwritingHotline": "800-262-2000"
    },
    "contacts": [
      {
        "id": "cna-c1",
        "name": "Thomas Sterling",
        "role": "Commercial Underwriting Director",
        "email": "thomas.sterling@cna.com",
        "phone": "(312) 822-5000",
        "region": "Midwest/Chicago"
      },
      {
        "id": "cna-insurance-c-csv-130",
        "name": "Candace Chavira",
        "role": "Rep (Small business)",
        "email": "Candace.Chavira@cna.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ]
  },
  {
    "id": "cover-whale",
    "name": "Cover Whale",
    "originalLogoPath": "/:i:/r/sites/carriers2/SiteAssets/Cowerwhale%20logo.png?csf=1&web=1&e=5Gt4Dl",
    "isActive": true,
    "segment": [
      "Commercial Auto Only",
      "MGA",
      "Carrier/MGA"
    ],
    "linesOfBusiness": [
      "Commercial Auto",
      "Motor Truck Cargo",
      "Truckers General Liability",
      "Physical Damage"
    ],
    "agencyCode": "CW-88122",
    "website": "https://www.coverwhale.com",
    "agentLogin": "https://chenango.semsee.com/login-form?redirect=/agency/dashboard",
    "appetite": {
      "canWrite": [
        "Owner-operators (1 power unit to small fleets)",
        "Long-haul trucking, box trucks, cargo vans, flatbeds, dump trucks",
        "Logistics hauling, building materials transport",
        "Tough truck drivers with ELD (Electronic Logging Device) integration"
      ],
      "cannotWrite": [
        "Personal vehicles",
        "School buses, heavy public transport",
        "Extremely toxic chemical hazard tankers"
      ],
      "notes": "Cover Whale is a leading insurtech MGA focused on commercial trucking. They provide excellent rates but require the policyholder to utilize an active dashcam/ELD.",
      "underwritingHotline": "312-313-0980"
    },
    "contacts": [
      {
        "id": "cw-c1",
        "name": "Landon Vance",
        "role": "SVP Truck Underwriting",
        "email": "landon.v2@coverwhale.com",
        "phone": "(312) 313-0980",
        "region": "National"
      },
      {
        "id": "cover-whale-c-csv-108",
        "name": "MJ",
        "role": "Onboarding (Also onboarding@coverbadger.com; hello@coverbadger.com; hello@coverwhale.com)",
        "email": "mj@coverbadger.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ]
  },
  {
    "id": "fairmatic",
    "name": "Fairmatic",
    "originalLogoPath": "/:i:/r/sites/carriers2/SiteAssets/fairmatic.png?csf=1&web=1&e=ckYnQ5",
    "isActive": true,
    "segment": [
      "Commercial Auto Only",
      "MGA",
      "Carrier"
    ],
    "linesOfBusiness": [
      "Commercial Auto Fleet",
      "Telematics Commercial Auto"
    ],
    "agencyCode": "FM-33010",
    "website": "https://www.fairmatic.com",
    "agentLogin": "https://fairmatic.com/broker-portal",
    "appetite": {
      "canWrite": [
        "Fleets of 5 or more commercial vehicles (local or regional)",
        "Service fleets (plumbers, mechanical, HVAC fleets)",
        "Transit fleets, logistics carriers with modern tracking",
        "Risks willing to use GPS telematics to pricing adjustments"
      ],
      "cannotWrite": [
        "Single owner-operator monoline commercial cars (requires fleet size of 3+)",
        "Heavy hazardous haulers",
        "Taxis, limousines or micro-mobility fleets"
      ],
      "notes": "Fairmatic focuses heavily on telematics, modifying rates based on actual driving metrics. Drivers who practice safety receive massive rate drops.",
      "underwritingHotline": "415-813-2280"
    },
    "contacts": [
      {
        "id": "fm-c1",
        "name": "Darian Cole",
        "role": "Telematics Account Executive",
        "email": "darian.cole@fairmatic.com",
        "phone": "(415) 813-2280",
        "region": "West Coast"
      }
    ]
  },
  {
    "id": "honeycomb",
    "name": "Honeycomb Insurance",
    "originalLogoPath": "/:i:/r/sites/carriers2/SiteAssets/honeycomb.png?csf=1&web=1&e=tn4QaT",
    "isActive": true,
    "segment": [
      "Commercial Property Only"
    ],
    "linesOfBusiness": [
      "Commercial Residential Property",
      "Multi-Family Insurance",
      "Condo Associations (HOA)",
      "Landlord Packages"
    ],
    "agencyCode": "HC-77011",
    "website": "https://honeycombinsurance.com",
    "agentLogin": "https://honeycombinsurance.com/agent-login",
    "appetite": {
      "canWrite": [
        "Multi-family rental apartments (up to 12 stories)",
        "Condominium and HOA developments",
        "Mixed-use buildings (retail on main floors, residential above)",
        "Property associations (prefers modern updates on roofs & plumbing)"
      ],
      "cannotWrite": [
        "Single family personal residential (use Steadily instead)",
        "Properties with unresolved safety/underwriting infractions",
        "Extensive student housing or high vacancy structures"
      ],
      "notes": "Honeycomb excels at fast AI-driven property scoring. They use GIS data to evaluate roofs instantly, providing some of the fastest quotes for commercial HOAs and apartments.",
      "underwritingHotline": "866-932-8437"
    },
    "contacts": [
      {
        "id": "hc-c1",
        "name": "Abigail Stone",
        "role": "Chief Property Underwriter",
        "email": "abigail@honeycombinsurance.com",
        "phone": "(866) 932-8437",
        "region": "National"
      }
    ]
  },
  {
    "id": "liberty-mutual",
    "name": "Liberty Mutual Commercial Insurance",
    "originalLogoPath": "/:i:/r/sites/carriers2/SiteAssets/Liberty%20Mutual%20Logo.png?csf=1&web=1&e=wYpSxO",
    "isActive": true,
    "segment": [
      "Commercial Lines",
      "Carrier"
    ],
    "linesOfBusiness": [
      "BOP",
      "Commercial Package",
      "Workers Compensation",
      "Commercial Liability",
      "Custom Inland Marine"
    ],
    "agencyCode": "85-1683513",
    "website": "https://business.libertymutual.com",
    "agentLogin": "https://portal2018.nexsure.com/Login?key=B7C4E3D4750B5F67284BAA9A",
    "appetite": {
      "canWrite": [
        "A heavy focus on established businesses looking for comprehensive risk coverage",
        "Aviation, commercial construction packages, technology corporations",
        "Broad commercial lines with multi-tier umbrellas"
      ],
      "cannotWrite": [
        "Non-standard, higher loss ratio target startups without robust business plans",
        "Sub-contracted firms operating without certified insurance verification"
      ],
      "notes": "Liberty Mutual is a household name that handles heavy commercial portfolios. Use their Nexsure portal link for direct single-sign-on integration.",
      "underwritingHotline": "800-344-0197"
    },
    "contacts": [
      {
        "id": "lm-c1",
        "name": "Jeffrey Lang",
        "role": "Territory Relationship Manager",
        "email": "jeffrey.lang@libertymutual.com",
        "phone": "(800) 344-0197 ext 8820",
        "region": "Southeast"
      },
      {
        "id": "liberty-mutual-c-csv-28",
        "name": "Elizabeth Washington",
        "role": "Sr Claims Resolution Spec II (Commercial auto claims (Trees of GA))",
        "email": "Elizabeth.Washington@libertymutual.com",
        "phone": "",
        "region": "Source: Client (Last interaction: 2025-10-01)"
      },
      {
        "id": "liberty-mutual-c-csv-29",
        "name": "Nicole Brann",
        "role": "Service (Commercial (Nubian Clean))",
        "email": "Nicole.Brann@libertymutual.com",
        "phone": "",
        "region": "Source: Client (Last interaction: 2025-07-23)"
      },
      {
        "id": "liberty-mutual-c-csv-69",
        "name": "Steven Mansfield",
        "role": "Program contact (Agency-appointment wind-down, Jun 2026)",
        "email": "Steven.Mansfield@LibertyMutual.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      },
      {
        "id": "liberty-mutual-c-csv-70",
        "name": "Brian Fincher",
        "role": "Small commercial marketing rep (New rep intro, May 2026)",
        "email": "Brian.Fincher@LibertyMutual.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      },
      {
        "id": "liberty-mutual-c-csv-71",
        "name": "Lisa Guynn",
        "role": "Underwriter (E&O) (Agency E&O quote, Jan 2025)",
        "email": "LISA.GUYNN@libertymutual.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ]
  },
  {
    "id": "progressive",
    "name": "Progressive Insurance",
    "originalLogoPath": "/:i:/r/sites/carriers2/SiteAssets/Progressive%20logo.png?csf=1&web=1&e=frgA1c",
    "isActive": true,
    "segment": [
      "Personal Lines",
      "Commercial Lines",
      "Carrier"
    ],
    "linesOfBusiness": [
      "Personal Auto",
      "Commercial Auto",
      "Renters Insurance",
      "General Liability",
      "BOP"
    ],
    "agencyCode": "PR-201991",
    "website": "https://www.progressive.com",
    "agentLogin": "https://www.foragentsonly.com/login/",
    "appetite": {
      "canWrite": [
        "Personal vehicles - drivers of standard & non-standard records",
        "Commercial trucks, delivery vans, passenger vans (taxis)",
        "SXS, powersports, watercraft, motorhomes",
        "BOP policies through Progressive Advantage scheme"
      ],
      "cannotWrite": [
        "High-value corporate estate properties under single policy",
        "Cargo transport outside approved interstate routes"
      ],
      "notes": "Unbeatable market share for auto classes. The ForAgentsOnly (FAO) portal is standard. Great options for standard personal auto and highly hazardous commercial driving situations.",
      "underwritingHotline": "800-274-4000"
    },
    "contacts": [
      {
        "id": "pr-c1",
        "name": "Gary Sinclair",
        "role": "Agency Relationship Coordinator",
        "email": "gsinclai@progressive.com",
        "phone": "(800) 274-4000 ext. 100",
        "region": "National"
      },
      {
        "id": "progressive-c-csv-31",
        "name": "Fleet Desk",
        "role": "Fleet UW (Commercial fleet (ubreakifix))",
        "email": "fleet@commercial.progressive.com",
        "phone": "",
        "region": "Source: Client (Last interaction: 2025-08-25)"
      }
    ]
  },
  {
    "id": "scottsdale",
    "name": "Scottsdale Insurance Company",
    "originalLogoPath": "/:i:/r/sites/carriers2/SiteAssets/scottsdale.png?csf=1&web=1&e=uVbHWl",
    "isActive": true,
    "segment": [
      "Commercial Property Only",
      "MGA"
    ],
    "linesOfBusiness": [
      "Excess & Surplus (E&S)",
      "Commercial General Liability",
      "Commercial Property"
    ],
    "agencyCode": "SD-3392",
    "generalAgent": "CRC Wholesale",
    "website": "https://www.scottsdaleins.com",
    "agentLogin": "https://www.nationwide.com/personal/about-us/subsidiaries/scottsdale/",
    "appetite": {
      "canWrite": [
        "Hard-to-place commercial risks, E&S specialty",
        "Non-standard general liability issues (bars, restaurants with heavy music events)",
        "High-value real estate property without standard carrier approvals",
        "Contractor liability policies with high risk catalogs"
      ],
      "cannotWrite": [
        "Standard personal home/auto accounts (highly automated)",
        "Basic low-hazard commercial risks with cheaper standard carrier quotes"
      ],
      "notes": "Scottsdale operates under the Nationwide family. Highly respected peer in the E&S wholesale/surplus market. Outstanding claims support for hard-to-insure activities.",
      "underwritingHotline": "800-423-7675"
    },
    "contacts": [
      {
        "id": "sc-c1",
        "name": "Evelyn Finch",
        "role": "Specialty Surplus VP",
        "email": "finche1@nationwide.com",
        "phone": "(800) 423-7675",
        "region": "National"
      }
    ]
  },
  {
    "id": "steadily",
    "name": "Steadily",
    "originalLogoPath": "/:i:/r/sites/carriers2/SiteAssets/steadily.png?csf=1&web=1&e=4NFYTH",
    "isActive": true,
    "segment": [
      "Personal Lines Property Only",
      "Carrier"
    ],
    "linesOfBusiness": [
      "Landlord Insurance",
      "Short-Term Rentals (Airbnb/VRBO)",
      "Single Family Renters",
      "Vacant Home Insurance"
    ],
    "agencyCode": "RISOGR",
    "website": "https://www.steadily.com",
    "agentLogin": "https://app.steadily.com/login/",
    "appetite": {
      "canWrite": [
        "Landlord insurance for single-family rentals, duplexes, triplexes",
        "Short-term rental properties, Airbnb and VRBO properties",
        "Properties held in LLCs, corporate structures, or trusts",
        "Vacant homes undergoing light renovation or listing"
      ],
      "cannotWrite": [
        "Apartments above 12 units (use Honeycomb or US Assure)",
        "Standard primary owner-occupied homes with no rental plan"
      ],
      "notes": "Steadily is a super fast digitized MGA that quotes in less than 2 minutes. Specifically tuned for real estate investors and landlord accounts.",
      "underwritingHotline": "833-278-3234"
    },
    "contacts": [
      {
        "id": "st-c1",
        "name": "Nate Sterling",
        "role": "Head of Agent Sales",
        "email": "nate@steadily.com",
        "phone": "833-2-STEADILY",
        "region": "National"
      },
      {
        "id": "steadily-c-csv-78",
        "name": "Stacey King",
        "role": "Agency Success Mgr (Training; agent portal)",
        "email": "sking@steadily.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ]
  },
  {
    "id": "aegis-general",
    "name": "Aegis General Insurance Agency",
    "isActive": true,
    "segment": [
      "Personal Lines Property Only"
    ],
    "linesOfBusiness": [
      "Dwelling Fire",
      "Manufactured/Mobile Home",
      "Personal Toys",
      "Motorcycle & ATV"
    ],
    "agencyCode": "10175736",
    "generalAgent": "RPS",
    "website": "https://aegisgeneral.com",
    "agentLogin": "https://prod.aegisinsurance.com/GameChanger/Portal/Account/LogOn",
    "appetite": {
      "canWrite": [
        "Manufactured and mobile homes (all age categories)",
        "Dwelling Fire (DP-1 and DP-3) for rental and secondary properties",
        "Personal specialty vehicles, ATVs, side-by-sides, jet-skis"
      ],
      "cannotWrite": [
        "Standard high-value luxury smart mansions",
        "Commercial business packages or heavy commercial auto"
      ],
      "notes": "Aegis general is highly reliable for rural properties, mobile home developments, and specialized high-exposure recreational toys.",
      "underwritingHotline": "800-233-0219"
    },
    "contacts": [
      {
        "id": "aegis-c1",
        "name": "Clara Reynolds",
        "role": "Personal Lines Underwriter",
        "email": "creynolds@aegisgeneral.com",
        "phone": "(800) 233-0219 ext. 23",
        "region": "Northeast"
      }
    ]
  },
  {
    "id": "american-modern",
    "name": "American Modern Insurance Group",
    "originalLogoPath": "/:i:/r/sites/carriers2/SiteAssets/American%20modern%20logo.png?csf=1&web=1&e=0nXFg7",
    "isActive": true,
    "segment": [
      "Personal Lines Property Only"
    ],
    "linesOfBusiness": [
      "Dwelling Fire",
      "Manufactured/Mobile Home",
      "Personal Toys",
      "Collector Vehicle",
      "Vacant Land"
    ],
    "agencyCode": "AM-99120",
    "website": "https://www.amig.com",
    "agentLogin": "https://www.amgida.com/",
    "appetite": {
      "canWrite": [
        "Collector and classic cars, custom hot rods",
        "Mobile homes and seasonal cabins",
        "Older homes (over 100 years old) on dwelling fire forms",
        "Motorboats, jet skis, travel trailers"
      ],
      "cannotWrite": [
        "High-density commercial warehouses",
        "Heavy trucking transport or hazardous transport commercial fleets"
      ],
      "notes": "A member of Munich Re, American Modern is a fantastic outlet for toys and specialty structures. Extremely responsive and user-friendly portal.",
      "underwritingHotline": "800-543-2644"
    },
    "contacts": [
      {
        "id": "amig-c1",
        "name": "Derek Foster",
        "role": "Specialty Personal Underwriter Manager",
        "email": "dfoster@amig.com",
        "phone": "(800) 543-2644",
        "region": "National"
      }
    ]
  },
  {
    "id": "core-specialty",
    "name": "Core Specialty",
    "originalLogoPath": "/:i:/r/sites/carriers2/SiteAssets/Core%20Specialty%20Logo.jpeg?csf=1&web=1&e=RtMjRn",
    "isActive": true,
    "segment": [
      "Commercial Lines"
    ],
    "linesOfBusiness": [
      "Specialty Commercial Package",
      "General Liability",
      "E&S Property",
      "D&O Liability"
    ],
    "agencyCode": "78033, 747699",
    "website": "https://corespecialty.com",
    "agentLogin": "https://www.corespecialty.com/agent-login",
    "appetite": {
      "canWrite": [
        "Specialty markets, unique leisure/hospitality sites",
        "Environmental consulting and hazardous materials removal services",
        "D&O and professional liability for private corporations",
        "E&S property with heavy hazard fire load"
      ],
      "cannotWrite": [
        "High-density urban multi-family residential risks with previous active fires",
        "Traditional simple personal home/auto accounts"
      ],
      "notes": "Core Specialty offers tailor-made programs and high quality underwriting solutions in niche markets.",
      "underwritingHotline": "513-338-0628"
    },
    "contacts": [
      {
        "id": "cs-c1",
        "name": "Amanda Harris",
        "role": "Senior Director Specialty Market Services",
        "email": "amanda.harris@corespecialty.com",
        "phone": "(513) 338-0628",
        "region": "Midwest"
      }
    ]
  },
  {
    "id": "coterie-insurance",
    "name": "Coterie Insurance",
    "originalLogoPath": "/:i:/r/sites/carriers2/SiteAssets/Coterie%20logo.jpeg?csf=1&web=1&e=6PesT7",
    "isActive": true,
    "segment": [
      "Commercial Lines",
      "Carrier"
    ],
    "linesOfBusiness": [
      "BOP",
      "General Liability",
      "Professional Liability"
    ],
    "agencyCode": "CO-10928",
    "website": "https://coterieinsurance.com",
    "agentLogin": "https://app.semsee.com/login-form",
    "appetite": {
      "canWrite": [
        "Small business operators with rapid liability quote requirements",
        "Micro artisan contractors, dry cleaners, bookkeepers, local realtors",
        "BOP with low property values (liability centric)"
      ],
      "cannotWrite": [
        "High property values in heavily active industrial zones",
        "Restaurants with dance floors, structural engineering specialists"
      ],
      "notes": "Quotes within 60 seconds. Coterie utilizes dynamic background data scraping to automatically answer property checklists, keeping agent work minimal.",
      "underwritingHotline": "833-268-3743"
    },
    "contacts": [
      {
        "id": "cot-c1",
        "name": "Blake Mitchell",
        "role": "Partner Agency Specialist",
        "email": "blake@coterieinsurance.com",
        "phone": "(833) 268-3743",
        "region": "National"
      },
      {
        "id": "coterie-insurance-c-csv-112",
        "name": "Richard Deal",
        "role": "Rep (Small commercial)",
        "email": "richard.deal@coterieinsurance.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ]
  },
  {
    "id": "next-insurance",
    "name": "Next Insurance",
    "originalLogoPath": "/:i:/r/sites/carriers2/SiteAssets/next.png?csf=1&web=1&e=ybSKdQ",
    "isActive": true,
    "segment": [
      "Commercial Lines",
      "Carrier"
    ],
    "linesOfBusiness": [
      "BOP",
      "General Liability",
      "Workers Compensation",
      "Commercial Auto",
      "Professional Liability"
    ],
    "agencyCode": "TAC000152",
    "website": "https://www.nextinsurance.com",
    "agentLogin": "https://agents.nextinsurance.com/authentication",
    "appetite": {
      "canWrite": [
        "Solo operators, freelancers, and small businesses under 15 employees",
        "A vast assortment of artisan trades (painting, landscaping, cleaning, handyman)",
        "Retailers, consulting offices, massage therapists",
        "Commercial auto up to 10 vehicles"
      ],
      "cannotWrite": [
        "Aviation, maritime, or high-rise construction (over 3 stories)",
        "Underground pipelines or industrial chemical manufacturers"
      ],
      "notes": "Next is a fully digital insurtech giant. Incredibly smooth platform, instant certificates of insurance, and simple monthly billing formats.",
      "underwritingHotline": "855-222-5919"
    },
    "contacts": [
      {
        "id": "next-c1",
        "name": "Lydia Patel",
        "role": "Insurtech Account Director",
        "email": "lydia.patel@nextinsurance.com",
        "phone": "(855) 222-5919",
        "region": "National"
      },
      {
        "id": "next-insurance-c-csv-35",
        "name": "Self-service",
        "role": "Carrier (Small-commercial GL/PL (Precise Coverage/A1 Auto))",
        "email": "hello@nextinsurance.com",
        "phone": "",
        "region": "Source: Deals (Last interaction: 2025-05-25)"
      }
    ]
  },
  {
    "id": "us-assure",
    "name": "US Assure",
    "originalLogoPath": "/:i:/r/sites/carriers2/SiteAssets/Us%20Assure%20Logo.jpeg?csf=1&web=1&e=7iN2zC",
    "isActive": true,
    "segment": [
      "Commercial Property Only",
      "Commercial Lines",
      "MGA"
    ],
    "linesOfBusiness": [
      "Builders Risk Insurance",
      "Commercial Property Under Renovation",
      "Remodeling Builders Risk"
    ],
    "agencyCode": "USA-22340",
    "website": "https://usassure.com",
    "agentLogin": "https://buildersrisk.usassure.com/brhome",
    "appetite": {
      "canWrite": [
        "New residential & commercial construction from ground up",
        "Commercial and residential structural rehabilitation and remodeling",
        "Fast single-hazard builders risk policies for houses or small clinics"
      ],
      "cannotWrite": [
        "Already completed structures requiring ongoing standard commercial BOP (prefers Honeycomb or CNA)",
        "Demolition policies without active building timelines"
      ],
      "notes": "US Assure is the premier distributor of the Zurich Builders Risk program. Highly intuitive builder interface with outstanding fast quote guidelines.",
      "underwritingHotline": "800-800-3907"
    },
    "contacts": [
      {
        "id": "usa-c1",
        "name": "Zachary Taylor",
        "role": "Builders Risk Program Lead",
        "email": "ztaylor@usassure.com",
        "phone": "(800) 800-3907",
        "region": "National"
      },
      {
        "id": "us-assure-c-csv-16",
        "name": "Mike Martin",
        "role": "Vacant Property Program (Vacant/unoccupied property (GMD))",
        "email": "mike.martin@usassure.com",
        "phone": "",
        "region": "Source: Prospects (Last interaction: 2025-11-17)"
      },
      {
        "id": "us-assure-c-csv-17",
        "name": "Nate Rainer",
        "role": "Builders Risk UW (Builders risk (L&R Builds))",
        "email": "nate.rainer@usassure.com",
        "phone": "",
        "region": "Source: Deals (Last interaction: 2025-03-20)"
      }
    ]
  },
  {
    "id": "usli",
    "name": "USLI",
    "originalLogoPath": "/:i:/r/sites/carriers2/SiteAssets/usli.png?csf=1&web=1&e=86KAMA",
    "isActive": true,
    "segment": [
      "Commercial Lines"
    ],
    "linesOfBusiness": [
      "Specialty Excess & Surplus (E&S)",
      "Nonprofit Directors & Officers",
      "Special Events Liability"
    ],
    "agencyCode": "USLI-88220",
    "generalAgent": "Amwins",
    "website": "https://www.usli.com",
    "agentLogin": "https://xsbrokers.usli.com/",
    "appetite": {
      "canWrite": [
        "Small 501(c)(3) nonprofit entities, boards, and associations",
        "Short-term special events (weddings, conferences, festivals, sports tourneys)",
        "Main-street commercial offices and commercial low-exposure properties",
        "Vacant property liability and physical damage"
      ],
      "cannotWrite": [
        "Large national commercial chemical refineries",
        "High hazard pharmaceutical clinical testing firms"
      ],
      "notes": "USLI is a member of the Berkshire Hathaway family, specializing in small commercial specialty products. Phenomenal phone quoting desk that outputs options in minutes.",
      "underwritingHotline": "888-523-5545"
    },
    "contacts": [
      {
        "id": "usli-c1",
        "name": "Brooke Henderson",
        "role": "E&S Phone Quoting Lead",
        "email": "brooke@usli.com",
        "phone": "(888) 523-5545",
        "region": "National"
      }
    ]
  },
  {
    "id": "bass-underwriters",
    "name": "Bass Underwriters",
    "isActive": true,
    "segment": [
      "E&S Wholesaler"
    ],
    "linesOfBusiness": [
      "All lines - Comm P",
      "C/garage/flood/HO/prof liab/transportation/pollution"
    ],
    "agencyCode": "AGT20787",
    "appetite": {
      "canWrite": [
        "Approved classes under E&S Wholesaler program.",
        "Appetite details: All lines - Comm P&C/garage/flood/HO/prof liab/transportation/pollution"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "All lines - Comm P&C/garage/flood/HO/prof liab/transportation/pollution"
    },
    "contacts": [
      {
        "id": "bass-underwriters-c-csv-0",
        "name": "Cooper Arnold",
        "role": "Underwriter Assistant (Pollution/GL/PL; fast; all lines)",
        "email": "carnold@bassuw.com",
        "phone": "843-998-6855",
        "region": "Source: Client (Last interaction: 2025-12-08)"
      },
      {
        "id": "bass-underwriters-c-csv-1",
        "name": "Michael Mans AINS",
        "role": "Underwriter (Pharmacy/garage/commercial; renewals)",
        "email": "mmans@bassuw.com",
        "phone": "843-867-7729",
        "region": "Source: Client/Deals (Last interaction: 2025-12-08)"
      },
      {
        "id": "bass-underwriters-c-csv-2",
        "name": "M. Rosas",
        "role": "Underwriter (Commercial package (Goldies bind))",
        "email": "mrosas@bassuw.com",
        "phone": "",
        "region": "Source: Client (Last interaction: 2025-11-12)"
      },
      {
        "id": "bass-underwriters-c-csv-3",
        "name": "T. Fuchs",
        "role": "Underwriter (Pollution markets)",
        "email": "tfuchs@bassuw.com",
        "phone": "",
        "region": "Source: Client (Last interaction: 2025-12-05)"
      },
      {
        "id": "bass-underwriters-c-csv-4",
        "name": "Audit Control",
        "role": "Audit (GL audit (Goldies))",
        "email": "auditcontrol@bassuw.com",
        "phone": "",
        "region": "Source: Service (Last interaction: 2025-11-24)"
      }
    ],
    "generalAgent": "Direct E&S Binding / Wholesale"
  },
  {
    "id": "jencap-group",
    "name": "Jencap Group",
    "isActive": true,
    "segment": [
      "E&S Wholesaler"
    ],
    "linesOfBusiness": [
      "Fairmatic commercial auto/fleet"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under E&S Wholesaler program.",
        "Appetite details: Fairmatic commercial auto/fleet"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Fairmatic commercial auto/fleet"
    },
    "contacts": [
      {
        "id": "jencap-group-c-csv-5",
        "name": "Carrie Mudd",
        "role": "Wholesale Broker (Fairmatic commercial auto/fleet (SEIG))",
        "email": "carrie.mudd@jencapgroup.com",
        "phone": "",
        "region": "Source: Prospects (Last interaction: 2025-10-08)"
      }
    ],
    "generalAgent": "Direct E&S Binding / Wholesale"
  },
  {
    "id": "prime-insurance-prime-is",
    "name": "Prime Insurance (Prime IS)",
    "isActive": true,
    "segment": [
      "E&S Wholesaler/MGA"
    ],
    "linesOfBusiness": [
      "Commercial / E",
      "S"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under E&S Wholesaler/MGA program.",
        "Appetite details: Commercial / E&S"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Commercial / E&S"
    },
    "contacts": [
      {
        "id": "prime-insurance-prime-is-c-csv-6",
        "name": "Tyler M.",
        "role": "Underwriting/Intake (Commercial / E&S intake & quotes)",
        "email": "tylerm@primeis.com",
        "phone": "",
        "region": "Source: Prospects (Last interaction: 2025-10-07)"
      },
      {
        "id": "prime-insurance-prime-is-c-csv-7",
        "name": "Quotes Desk",
        "role": "Quotes (Commercial quoting)",
        "email": "quotes@primeis.com",
        "phone": "",
        "region": "Source: Prospects (Last interaction: 2025-10-02)"
      }
    ],
    "generalAgent": "Direct E&S Binding / Wholesale"
  },
  {
    "id": "crc-group",
    "name": "CRC Group",
    "isActive": true,
    "segment": [
      "E&S Wholesaler"
    ],
    "linesOfBusiness": [
      "E",
      "S commercial"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under E&S Wholesaler program.",
        "Appetite details: E&S commercial"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "E&S commercial"
    },
    "contacts": [
      {
        "id": "crc-group-c-csv-8",
        "name": "Brittany Johnson",
        "role": "Accounts Receivable Spec (E&S billing/AR (Havilah))",
        "email": "BriJohnson@crcgroup.com",
        "phone": "",
        "region": "Source: Client (Last interaction: 2025-10-27)"
      },
      {
        "id": "crc-group-c-csv-9",
        "name": "Em Moore",
        "role": "AR/Support (E&S billing)",
        "email": "EmMoore@crcgroup.com",
        "phone": "",
        "region": "Source: Client (Last interaction: 2025-08-19)"
      },
      {
        "id": "crc-group-c-csv-72",
        "name": "Mike Meirowitz",
        "role": "Benefits Sales Exec, PEO (CRC PEO/Benefits, 2025)",
        "email": "mike.meirowitz@crcgroup.com",
        "phone": "M 609-213-1782; CA Lic #0639679",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      },
      {
        "id": "crc-group-c-csv-73",
        "name": "JP DeKemper II",
        "role": "Broker (Contractors submission)",
        "email": "JDeKemper@CRCGroup.com",
        "phone": "Cell 828-381-8116",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      },
      {
        "id": "crc-group-c-csv-74",
        "name": "Will Lemmon",
        "role": "Broker/Support (Agent registration)",
        "email": "wlemmon@crcgroup.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ],
    "generalAgent": "Direct E&S Binding / Wholesale"
  },
  {
    "id": "shield-commercial-insurance",
    "name": "Shield Commercial Insurance",
    "isActive": true,
    "segment": [
      "Wholesaler/MGA"
    ],
    "linesOfBusiness": [
      "Commercial package",
      "renewals"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Wholesaler/MGA program.",
        "Appetite details: Commercial package; renewals"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Commercial package; renewals"
    },
    "contacts": [
      {
        "id": "shield-commercial-insurance-c-csv-10",
        "name": "Monica Reyes-Gil",
        "role": "Service (Comm cancel/reinstate (Renaissance))",
        "email": "mreyes-gil@shieldins.net",
        "phone": "760-345-9029 x243",
        "region": "Source: Client (Last interaction: 2025-12-02)"
      },
      {
        "id": "shield-commercial-insurance-c-csv-75",
        "name": "Griffin Lee",
        "role": "Product/Service (BOP product guide, Sep 2025)",
        "email": "glee@shieldins.net",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ],
    "generalAgent": "Direct E&S Binding / Wholesale"
  },
  {
    "id": "wholesure",
    "name": "Wholesure",
    "isActive": true,
    "segment": [
      "Wholesaler"
    ],
    "linesOfBusiness": [
      "Personal lines/flood",
      "garage renewals"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Wholesaler program.",
        "Appetite details: Personal lines/flood; garage renewals"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Personal lines/flood; garage renewals"
    },
    "contacts": [
      {
        "id": "wholesure-c-csv-13",
        "name": "Whitney Pace",
        "role": "Personal Lines Underwriter (Flood/personal lines (Sterling))",
        "email": "WGPace@wholesure.com",
        "phone": "",
        "region": "Source: Client (Last interaction: 2025-11-11)"
      },
      {
        "id": "wholesure-c-csv-14",
        "name": "Jared Cotter",
        "role": "Personal Lines Underwriter (Sterling flood)",
        "email": "JFCotter@wholesure.com",
        "phone": "",
        "region": "Source: Client (Last interaction: 2025-11-08)"
      },
      {
        "id": "wholesure-c-csv-15",
        "name": "Chip Bean",
        "role": "Garage Underwriter - Renewals (Garage (SE Transport))",
        "email": "ccbean@wholesure.com",
        "phone": "865",
        "region": "Source: Deals (Last interaction: 2025-04-17)"
      }
    ],
    "generalAgent": "Direct E&S Binding / Wholesale"
  },
  {
    "id": "integrated-specialty-coverages-isc-mga",
    "name": "Integrated Specialty Coverages (ISC MGA)",
    "isActive": true,
    "segment": [
      "MGA"
    ],
    "linesOfBusiness": [
      "E",
      "S"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under MGA program.",
        "Appetite details: E&S"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "E&S"
    },
    "contacts": [
      {
        "id": "integrated-specialty-coverages-isc-mga-c-csv-18",
        "name": "Certs/Online MGA",
        "role": "E&S MGA (E&S policies/endorsements/audits)",
        "email": "certs@iscmga.com",
        "phone": "",
        "region": "Source: Service (Last interaction: 2025-12-08)"
      },
      {
        "id": "integrated-specialty-coverages-isc-mga-c-csv-77",
        "name": "Accounting",
        "role": "Accounting (SIS broker statement)",
        "email": "accountingstaff@ISCMGA.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ],
    "generalAgent": "Direct E&S Binding / Wholesale"
  },
  {
    "id": "origin-specialty",
    "name": "Origin Specialty",
    "isActive": true,
    "segment": [
      "MGA/Audit"
    ],
    "linesOfBusiness": [
      "GL audits"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under MGA/Audit program.",
        "Appetite details: GL audits"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "GL audits"
    },
    "contacts": [
      {
        "id": "origin-specialty-c-csv-19",
        "name": "Audits Desk",
        "role": "GL Premium Audit (GL audit (Goldies))",
        "email": "audits@origin-specialty.com",
        "phone": "",
        "region": "Source: Service (Last interaction: 2025-12-05)"
      }
    ],
    "generalAgent": "Direct E&S Binding / Wholesale"
  },
  {
    "id": "boss-bonds-south-coast-surety",
    "name": "BOSS Bonds (South Coast Surety)",
    "isActive": true,
    "segment": [
      "Surety Wholesaler"
    ],
    "linesOfBusiness": [
      "Surety bonds - Merchants program up to $1M"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Surety Wholesaler program.",
        "Appetite details: Surety bonds - Merchants program up to $1M"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Surety bonds - Merchants program up to $1M"
    },
    "contacts": [
      {
        "id": "boss-bonds-south-coast-surety-c-csv-20",
        "name": "Rich Taylor",
        "role": "Vice President (Surety - Merchants program up to $1M)",
        "email": "rich@bossbonds.com",
        "phone": "",
        "region": "Source: Deals (Last interaction: 2025-04-22)"
      },
      {
        "id": "boss-bonds-south-coast-surety-c-csv-21",
        "name": "Rick Bredow",
        "role": "Head of Commercial Surety (Commercial surety)",
        "email": "rick@bossbonds.com",
        "phone": "",
        "region": "Source: Deals (Last interaction: 2025-04-11)"
      },
      {
        "id": "boss-bonds-south-coast-surety-c-csv-22",
        "name": "Madeline Brown",
        "role": "Account Manager (Bid/performance bonds (Artcraft))",
        "email": "madeline@bossbonds.com",
        "phone": "",
        "region": "Source: Deals (Last interaction: 2025-04-22)"
      },
      {
        "id": "boss-bonds-south-coast-surety-c-csv-23",
        "name": "Zach Bradley",
        "role": "Surety (Performance/maintenance bonds (Riley Place))",
        "email": "zach@bossbonds.com",
        "phone": "",
        "region": "Source: Deals (Last interaction: 2025-02-25)"
      }
    ],
    "generalAgent": "Direct E&S Binding / Wholesale"
  },
  {
    "id": "propeller-bonds",
    "name": "Propeller Bonds",
    "isActive": true,
    "segment": [
      "Surety Wholesaler"
    ],
    "linesOfBusiness": [
      "Contract surety bonds"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Surety Wholesaler program.",
        "Appetite details: Contract surety bonds"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Contract surety bonds"
    },
    "contacts": [
      {
        "id": "propeller-bonds-c-csv-24",
        "name": "Ken Morotto Jr",
        "role": "Underwriter Contract Dept (Contract surety bonds)",
        "email": "ken@propellerbonds.com",
        "phone": "860-989-4601",
        "region": "Source: Deals (Last interaction: 2025-02-21)"
      },
      {
        "id": "propeller-bonds-c-csv-25",
        "name": "Krystal",
        "role": "Submissions (Surety intake)",
        "email": "krystal@propellerbonds.com",
        "phone": "",
        "region": "Source: Deals (Last interaction: 2025-02-07)"
      },
      {
        "id": "propeller-bonds-c-csv-131",
        "name": "Danny",
        "role": "Surety (Welcome via Agency Collective, Oct 2023)",
        "email": "danny@propellerbonds.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ],
    "generalAgent": "Direct E&S Binding / Wholesale"
  },
  {
    "id": "risk-strategies",
    "name": "Risk Strategies",
    "isActive": true,
    "segment": [
      "Surety Retailer"
    ],
    "linesOfBusiness": [
      "Surety bonds"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Surety Retailer program.",
        "Appetite details: Surety bonds"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Surety bonds"
    },
    "contacts": [
      {
        "id": "risk-strategies-c-csv-26",
        "name": "Derek Yoder",
        "role": "Sales Associate (Retail surety) (Surety bonds)",
        "email": "dyoder@risk-strategies.com",
        "phone": "267-362-4326",
        "region": "Source: Deals (Last interaction: 2025-02-25)"
      }
    ]
  },
  {
    "id": "gaig-great-american",
    "name": "GAIG (Great American)",
    "isActive": true,
    "segment": [
      "Carrier"
    ],
    "linesOfBusiness": [
      "Specialty equipment / inland marine"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier program.",
        "Appetite details: Specialty equipment / inland marine"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Specialty equipment / inland marine"
    },
    "contacts": [
      {
        "id": "gaig-great-american-c-csv-27",
        "name": "Mathieu Bewley CLFP",
        "role": "Divisional AVP Specialty Equipment (Specialty equipment + claims (Burndebris/LDW))",
        "email": "MBewley@gaig.com",
        "phone": "425-653-5170",
        "region": "Source: Deals/Service (Last interaction: 2025-11-13)"
      },
      {
        "id": "gaig-great-american-c-csv-76",
        "name": "Evan Henn",
        "role": "Contracts (MPA amendment; also AgencyContracts@GAIG.com, AgencyAdmin@gaig.com)",
        "email": "ehenn@gaig.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ]
  },
  {
    "id": "state-auto",
    "name": "State Auto",
    "isActive": true,
    "segment": [
      "Carrier"
    ],
    "linesOfBusiness": [
      "Commercial auto"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier program.",
        "Appetite details: Commercial auto"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Commercial auto"
    },
    "contacts": [
      {
        "id": "state-auto-c-csv-30",
        "name": "Commercial Connect",
        "role": "UW Support (Commercial auto (SE Transport/Botha))",
        "email": "commercialconnect@stateauto.com",
        "phone": "",
        "region": "Source: Client (Last interaction: 2025-10-23)"
      }
    ]
  },
  {
    "id": "btis",
    "name": "BTIS",
    "isActive": true,
    "segment": [
      "Wholesaler"
    ],
    "linesOfBusiness": [
      "Workers Comp"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Wholesaler program.",
        "Appetite details: Workers Comp"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Workers Comp"
    },
    "contacts": [
      {
        "id": "btis-c-csv-33",
        "name": "WC Endorsements",
        "role": "WC Service (Workers Comp (Truecraft Drywall))",
        "email": "wcendorsements@btisinc.com",
        "phone": "",
        "region": "Source: Client (Last interaction: 2025-08-14)"
      },
      {
        "id": "btis-c-csv-79",
        "name": "Detric Golden",
        "role": "CSR II (WC service)",
        "email": "DGolden@btisinc.com",
        "phone": "+1 916-789-3147; main 877-649-6682; Lic #0D10271",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ],
    "generalAgent": "Direct E&S Binding / Wholesale"
  },
  {
    "id": "travelers",
    "name": "Travelers",
    "isActive": true,
    "segment": [
      "Carrier"
    ],
    "linesOfBusiness": [
      "Workers Comp"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier program.",
        "Appetite details: Workers Comp"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Workers Comp"
    },
    "contacts": [
      {
        "id": "travelers-c-csv-34",
        "name": "ARWC Desk",
        "role": "Audit/Billing (WC billing)",
        "email": "ARWC@travelers.com",
        "phone": "",
        "region": "Source: Client (Last interaction: 2025-07-10)"
      }
    ]
  },
  {
    "id": "gainsco",
    "name": "GAINSCO",
    "isActive": true,
    "segment": [
      "Carrier"
    ],
    "linesOfBusiness": [
      "Non-standard auto"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier program.",
        "Appetite details: Non-standard auto"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Non-standard auto"
    },
    "contacts": [
      {
        "id": "gainsco-c-csv-36",
        "name": "Agency Licensing",
        "role": "Carrier Appointment (Non-standard auto - new W9/appointment)",
        "email": "agencylicensing@gainsco.com",
        "phone": "",
        "region": "Source: Service (Last interaction: 2025-12-11)"
      }
    ]
  },
  {
    "id": "nationwide-ngic",
    "name": "Nationwide (NGIC)",
    "isActive": true,
    "segment": [
      "Carrier"
    ],
    "linesOfBusiness": [
      "Group health"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier program.",
        "Appetite details: Group health"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Group health"
    },
    "contacts": [
      {
        "id": "nationwide-ngic-c-csv-37",
        "name": "Jacob Harrell",
        "role": "Group Health Rep (Group health)",
        "email": "Jacob.Harrell@NGIC.com",
        "phone": "",
        "region": "Source: Service (Last interaction: 2025-11-05)"
      }
    ]
  },
  {
    "id": "monoline",
    "name": "Monoline",
    "isActive": true,
    "segment": [
      "Carrier"
    ],
    "linesOfBusiness": [
      "Homeowners personal lines"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier program.",
        "Appetite details: Homeowners personal lines"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Homeowners personal lines"
    },
    "contacts": [
      {
        "id": "monoline-c-csv-38",
        "name": "Jerod (JB)",
        "role": "Rep (Homeowners monoline personal lines)",
        "email": "jerod@monoline.com",
        "phone": "",
        "region": "Source: Client (Last interaction: 2025-09-25)"
      }
    ]
  },
  {
    "id": "amg-ida",
    "name": "AMG/IDA",
    "isActive": true,
    "segment": [
      "Life Brokerage"
    ],
    "linesOfBusiness": [
      "Life - Term/IUL/LTC (United of Omaha/Banner/Illinois Mutual)"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Life Brokerage program.",
        "Appetite details: Life - Term/IUL/LTC (United of Omaha/Banner/Illinois Mutual)"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Life - Term/IUL/LTC (United of Omaha/Banner/Illinois Mutual)"
    },
    "contacts": [
      {
        "id": "amg-ida-c-csv-39",
        "name": "Cindy Fletcher",
        "role": "Life Case Manager (Life: Term/IUL/LTC; app status)",
        "email": "cfletcher@amgida.com",
        "phone": "",
        "region": "Source: Deals (Last interaction: 2025-06-11)"
      },
      {
        "id": "amg-ida-c-csv-40",
        "name": "D. Johnston",
        "role": "Life Brokerage (Life quotes (Term/IUL/LTC))",
        "email": "djohnston@amgida.com",
        "phone": "",
        "region": "Source: Deals (Last interaction: 2025-06-11)"
      },
      {
        "id": "amg-ida-c-csv-41",
        "name": "Alexa Knowles",
        "role": "Life Brokerage (Life contracting (Illinois Mutual))",
        "email": "AKnowles@amgida.com",
        "phone": "",
        "region": "Source: Deals (Last interaction: 2025-06-11)"
      },
      {
        "id": "amg-ida-c-csv-42",
        "name": "Nikki McGinnis",
        "role": "Operations Assistant (Illinois Mutual / life (Betancourt))",
        "email": "nmcginnis@amgida.com",
        "phone": "",
        "region": "Source: Client (Last interaction: 2025-10-28)"
      },
      {
        "id": "amg-ida-c-csv-83",
        "name": "Kenny Froug",
        "role": "Regional Sales Director (Life brokerage)",
        "email": "kfroug@amgida.com",
        "phone": "Direct 706-995-5054; Main 706-543-7346",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      },
      {
        "id": "amg-ida-c-csv-84",
        "name": "Kelly Cody",
        "role": "Contracting Coordinator (Contracting)",
        "email": "kcody@amgida.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      },
      {
        "id": "amg-ida-c-csv-85",
        "name": "M. McMillan",
        "role": "Life Brokerage (Symetra / quotes)",
        "email": "MMcmillan@amgida.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      },
      {
        "id": "amg-ida-c-csv-86",
        "name": "Angela Brown",
        "role": "Life Brokerage",
        "email": "abrown@amgida.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      },
      {
        "id": "amg-ida-c-csv-87",
        "name": "Tracy",
        "role": "Life Brokerage",
        "email": "tracy@amgida.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      },
      {
        "id": "amg-ida-c-csv-88",
        "name": "Ben",
        "role": "Life Brokerage",
        "email": "ben@amgida.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      },
      {
        "id": "amg-ida-c-csv-89",
        "name": "S. Massey",
        "role": "Life Brokerage (Also smasseyjr@amgida.com)",
        "email": "smassey@amgida.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      },
      {
        "id": "amg-ida-c-csv-90",
        "name": "T. Fleming",
        "role": "Life Brokerage",
        "email": "tfleming@amgida.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      },
      {
        "id": "amg-ida-c-csv-91",
        "name": "M. Froug",
        "role": "Life Brokerage",
        "email": "mfroug@amgida.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      },
      {
        "id": "amg-ida-c-csv-92",
        "name": "General Mailbox",
        "role": "Operations",
        "email": "gm@amgida.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ]
  },
  {
    "id": "aflac",
    "name": "Aflac",
    "isActive": true,
    "segment": [
      "Carrier"
    ],
    "linesOfBusiness": [
      "Group voluntary/supplemental benefits"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier program.",
        "Appetite details: Group voluntary/supplemental benefits"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Group voluntary/supplemental benefits"
    },
    "contacts": [
      {
        "id": "aflac-c-csv-43",
        "name": "Will Hansen",
        "role": "Associate (GA North) (Group voluntary/supplemental benefits)",
        "email": "Will_Hansen@us.aflac.com",
        "phone": "601-543-4697",
        "region": "Source: Deals (Last interaction: 2025-07-22)"
      },
      {
        "id": "aflac-c-csv-44",
        "name": "Steven Prak",
        "role": "District Sales Coordinator (Voluntary benefits)",
        "email": "Steven_Prak@us.aflac.com",
        "phone": "401-347-8502",
        "region": "Source: Deals (Last interaction: 2025-03-25)"
      },
      {
        "id": "aflac-c-csv-45",
        "name": "Raysa Prak",
        "role": "Bilingual Benefits Specialist (Enrollment/deductions (Plumbing Shop))",
        "email": "Raysa_Prak@us.aflac.com",
        "phone": "",
        "region": "Source: Deals (Last interaction: 2025-04-25)"
      },
      {
        "id": "aflac-c-csv-46",
        "name": "John Curry",
        "role": "Agent (Voluntary benefits)",
        "email": "JohnCurry@aflac.com",
        "phone": "",
        "region": "Source: Deals (Last interaction: 2025-07-17)"
      },
      {
        "id": "aflac-c-csv-81",
        "name": "Taylor Borders",
        "role": "Associate (Writing number setup)",
        "email": "Taylor_Borders1@us.aflac.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      },
      {
        "id": "aflac-c-csv-82",
        "name": "Corey Borders",
        "role": "Associate (Voluntary benefits)",
        "email": "Corey_Borders@us.aflac.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ]
  },
  {
    "id": "alternative-insured-benefit-plans",
    "name": "Alternative / Insured Benefit Plans",
    "isActive": true,
    "segment": [
      "Benefits Agency"
    ],
    "linesOfBusiness": [
      "Group health (UHC/Anthem)"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Benefits Agency program.",
        "Appetite details: Group health (UHC/Anthem)"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Group health (UHC/Anthem)"
    },
    "contacts": [
      {
        "id": "alternative-insured-benefit-plans-c-csv-47",
        "name": "Stephen Mock",
        "role": "Benefits (Group Health) (Group health UHC + Anthem (Quick Action Plumbers))",
        "email": "s.mock@alternativebenefitplans.com",
        "phone": "770-451-0376 x224",
        "region": "Source: Client (Last interaction: 2025-08-05)"
      },
      {
        "id": "alternative-insured-benefit-plans-c-csv-48",
        "name": "B. Mock",
        "role": "Benefits (Group health/dental)",
        "email": "b.mock@alternativebenefitplans.com",
        "phone": "",
        "region": "Source: Client (Last interaction: 2025-08-05)"
      }
    ]
  },
  {
    "id": "amh-insurance-spark",
    "name": "AMH Insurance / Spark",
    "isActive": true,
    "segment": [
      "Medicare FMO"
    ],
    "linesOfBusiness": [
      "Medicare Advantage - Aetna/UHC/Cigna/Wellcare/Devoted"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Medicare FMO program.",
        "Appetite details: Medicare Advantage - Aetna/UHC/Cigna/Wellcare/Devoted"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Medicare Advantage - Aetna/UHC/Cigna/Wellcare/Devoted"
    },
    "contacts": [
      {
        "id": "amh-insurance-spark-c-csv-49",
        "name": "Leonard",
        "role": "FMO / Upline (Medicare) (Medicare Advantage access (Aetna/UHC/Cigna/Wellcare/Devoted); commissions via Tipalti)",
        "email": "leonard@amhinsured.com",
        "phone": "",
        "region": "Source: Medicare (Last interaction: 2025-09-19)"
      }
    ]
  },
  {
    "id": "highway",
    "name": "Highway",
    "isActive": true,
    "segment": [
      "COI Platform"
    ],
    "linesOfBusiness": [
      "COI automation/certs"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under COI Platform program.",
        "Appetite details: COI automation/certs"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "COI automation/certs"
    },
    "contacts": []
  },
  {
    "id": "ivans",
    "name": "IVANS",
    "isActive": true,
    "segment": [
      "Connectivity"
    ],
    "linesOfBusiness": [
      "Carrier download/connections"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Connectivity program.",
        "Appetite details: Carrier download/connections"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Carrier download/connections"
    },
    "contacts": [
      {
        "id": "ivans-c-csv-59",
        "name": "Traci Brown",
        "role": "Connectivity (Carrier download/connection setup)",
        "email": "traci.brown@ivans.com",
        "phone": "",
        "region": "Source: Service (Last interaction: 2025-11-13)"
      }
    ]
  },
  {
    "id": "chubb",
    "name": "Chubb",
    "isActive": true,
    "segment": [
      "Carrier"
    ],
    "linesOfBusiness": [
      "Small commercial",
      "workers' comp"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier program.",
        "Appetite details: Small commercial; workers' comp"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Small commercial; workers' comp"
    },
    "contacts": []
  },
  {
    "id": "omaha-national",
    "name": "Omaha National",
    "isActive": true,
    "segment": [
      "Carrier"
    ],
    "linesOfBusiness": [
      "Workers' comp (contractors",
      "transportation",
      "mfg",
      "hospitality",
      "ag)",
      "10% comm",
      "no volume req"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier program.",
        "Appetite details: Workers' comp (contractors, transportation, mfg, hospitality, ag); 10% comm, no volume req"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Workers' comp (contractors, transportation, mfg, hospitality, ag); 10% comm, no volume req"
    },
    "contacts": [
      {
        "id": "omaha-national-c-csv-93",
        "name": "Alex Naran",
        "role": "Sales Rep (New POC, Nov 2025)",
        "email": "anaran@omahanational.com",
        "phone": "Direct 402-913-2517; CA Lic #4500441",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      },
      {
        "id": "omaha-national-c-csv-94",
        "name": "J. O'Neill",
        "role": "Sales/Service",
        "email": "joneill@omahanational.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      },
      {
        "id": "omaha-national-c-csv-95",
        "name": "C. Ochsendorf",
        "role": "Sales/Service",
        "email": "cochsendorf@omahanational.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ]
  },
  {
    "id": "normandy-insurance-company",
    "name": "Normandy Insurance Company",
    "isActive": true,
    "segment": [
      "Carrier"
    ],
    "linesOfBusiness": [
      "Workers' comp",
      "GL",
      "cyber"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier program.",
        "Appetite details: Workers' comp, GL, cyber"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Workers' comp, GL, cyber"
    },
    "contacts": [
      {
        "id": "normandy-insurance-company-c-csv-96",
        "name": "Laura Lieberman, CIC",
        "role": "VP National Accounts (WC/GL)",
        "email": "llieberman@normandyins.com",
        "phone": "T 866-688-6442 x436; Direct 954-251-0571; C 305-335-6292",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ]
  },
  {
    "id": "tower-hill-specialty-thig",
    "name": "Tower Hill Specialty / THIG",
    "isActive": true,
    "segment": [
      "Carrier"
    ],
    "linesOfBusiness": [
      "Personal",
      "commercial property"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier program.",
        "Appetite details: Personal & commercial property"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Personal & commercial property"
    },
    "contacts": []
  },
  {
    "id": "trexis",
    "name": "Trexis",
    "isActive": true,
    "segment": [
      "Carrier"
    ],
    "linesOfBusiness": [
      "Non-standard auto"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier program.",
        "Appetite details: Non-standard auto"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Non-standard auto"
    },
    "contacts": []
  },
  {
    "id": "clearcover",
    "name": "Clearcover",
    "isActive": true,
    "segment": [
      "Carrier"
    ],
    "linesOfBusiness": [
      "Personal auto"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier program.",
        "Appetite details: Personal auto"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Personal auto"
    },
    "contacts": [
      {
        "id": "clearcover-c-csv-121",
        "name": "Jillian McKelvy",
        "role": "Rep (Auto)",
        "email": "jmckelvy@clearcover.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ]
  },
  {
    "id": "branch-insurance",
    "name": "Branch Insurance",
    "isActive": true,
    "segment": [
      "Carrier"
    ],
    "linesOfBusiness": [
      "Home/auto (GA launch)"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier program.",
        "Appetite details: Home/auto (GA launch)"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Home/auto (GA launch)"
    },
    "contacts": [
      {
        "id": "branch-insurance-c-csv-122",
        "name": "Katie Ennis",
        "role": "Rep (Home/auto GA)",
        "email": "katie.ennis@ourbranch.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ]
  },
  {
    "id": "lemonade",
    "name": "Lemonade",
    "isActive": true,
    "segment": [
      "Carrier"
    ],
    "linesOfBusiness": [
      "Renters/home (via Smart Start)"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier program.",
        "Appetite details: Renters/home (via Smart Start)"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Renters/home (via Smart Start)"
    },
    "contacts": [],
    "generalAgent": "Smart Start / Smart Choice"
  },
  {
    "id": "geico",
    "name": "GEICO",
    "isActive": true,
    "segment": [
      "Carrier"
    ],
    "linesOfBusiness": [
      "Commercial auto"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier program.",
        "Appetite details: Commercial auto"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Commercial auto"
    },
    "contacts": []
  },
  {
    "id": "bristol-west-foremost",
    "name": "Bristol West / Foremost",
    "isActive": true,
    "segment": [
      "Carrier"
    ],
    "linesOfBusiness": [
      "Personal auto (via First Connect)"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier program.",
        "Appetite details: Personal auto (via First Connect)"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Personal auto (via First Connect)"
    },
    "contacts": [],
    "generalAgent": "First Connect"
  },
  {
    "id": "adaptive",
    "name": "Adaptive",
    "isActive": true,
    "segment": [
      "Carrier"
    ],
    "linesOfBusiness": [
      "Parametric power-outage E",
      "S (via First Connect",
      "12% comm)"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier program.",
        "Appetite details: Parametric power-outage E&S (via First Connect; 12% comm)"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Parametric power-outage E&S (via First Connect; 12% comm)"
    },
    "contacts": [],
    "generalAgent": "First Connect"
  },
  {
    "id": "lancer-insurance",
    "name": "Lancer Insurance",
    "isActive": true,
    "segment": [
      "Carrier"
    ],
    "linesOfBusiness": [
      "Commercial auto / transportation / livery"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier program.",
        "Appetite details: Commercial auto / transportation / livery"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Commercial auto / transportation / livery"
    },
    "contacts": [
      {
        "id": "lancer-insurance-c-csv-123",
        "name": "E. Aleman",
        "role": "Underwriter/Service",
        "email": "ealeman@lancerinsurance.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      },
      {
        "id": "lancer-insurance-c-csv-124",
        "name": "Erin Ford",
        "role": "Underwriter/Service",
        "email": "ebford@lancerinsurance.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ]
  },
  {
    "id": "tokiomarine-hcc",
    "name": "TokioMarine HCC",
    "isActive": true,
    "segment": [
      "Carrier/MGA"
    ],
    "linesOfBusiness": [
      "ArtisanEdge GL - 35 artisan contractor classes"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier/MGA program.",
        "Appetite details: ArtisanEdge GL - 35 artisan contractor classes"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "ArtisanEdge GL - 35 artisan contractor classes"
    },
    "contacts": [
      {
        "id": "tokiomarine-hcc-c-csv-133",
        "name": "A. Eshetu",
        "role": "Underwriter (ArtisanEdge GL)",
        "email": "aeshetu@tmhcc.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ],
    "generalAgent": "Direct E&S Binding / Wholesale"
  },
  {
    "id": "encore-mga",
    "name": "Encore MGA",
    "isActive": true,
    "segment": [
      "MGA"
    ],
    "linesOfBusiness": [
      "PCIC program (new rater)"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under MGA program.",
        "Appetite details: PCIC program (new rater)"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "PCIC program (new rater)"
    },
    "contacts": [
      {
        "id": "encore-mga-c-csv-134",
        "name": "Bebe",
        "role": "Rep (PCIC program)",
        "email": "Bebe@encoremga.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ],
    "generalAgent": "Direct E&S Binding / Wholesale"
  },
  {
    "id": "igp-specialty",
    "name": "IGP Specialty",
    "isActive": true,
    "segment": [
      "MGA"
    ],
    "linesOfBusiness": [
      "Builder's Risk"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under MGA program.",
        "Appetite details: Builder's Risk"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Builder's Risk"
    },
    "contacts": [],
    "generalAgent": "Direct E&S Binding / Wholesale"
  },
  {
    "id": "orchid-insurance",
    "name": "Orchid Insurance",
    "isActive": true,
    "segment": [
      "MGA/Carrier"
    ],
    "linesOfBusiness": [
      "Coastal property / agency E",
      "O"
    ],
    "agencyCode": "AGY8206 (RSG agency code)",
    "appetite": {
      "canWrite": [
        "Approved classes under MGA/Carrier program.",
        "Appetite details: Coastal property / agency E&O"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Coastal property / agency E&O"
    },
    "contacts": [],
    "generalAgent": "Direct E&S Binding / Wholesale"
  },
  {
    "id": "crosscover-insurance",
    "name": "CrossCover Insurance",
    "isActive": true,
    "segment": [
      "MGA"
    ],
    "linesOfBusiness": [
      "E",
      "S property small commercial"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under MGA program.",
        "Appetite details: E&S property small commercial"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "E&S property small commercial"
    },
    "contacts": [
      {
        "id": "crosscover-insurance-c-csv-117",
        "name": "S. Dell",
        "role": "Underwriter (E&S property)",
        "email": "sdell@crosscover.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ],
    "generalAgent": "Direct E&S Binding / Wholesale"
  },
  {
    "id": "victor-insurance",
    "name": "Victor Insurance",
    "isActive": true,
    "segment": [
      "MGA"
    ],
    "linesOfBusiness": [
      "CNA workers' comp (5% bonus comm)"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under MGA program.",
        "Appetite details: CNA workers' comp (5% bonus comm)"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "CNA workers' comp (5% bonus comm)"
    },
    "contacts": [],
    "generalAgent": "Direct E&S Binding / Wholesale"
  },
  {
    "id": "blitz-insurance",
    "name": "Blitz Insurance",
    "isActive": true,
    "segment": [
      "MGA"
    ],
    "linesOfBusiness": [
      "E",
      "S",
      "customizable quotes (partner w/ The AC)"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under MGA program.",
        "Appetite details: E&S, customizable quotes (partner w/ The AC)"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "E&S, customizable quotes (partner w/ The AC)"
    },
    "contacts": [],
    "generalAgent": "Direct E&S Binding / Wholesale"
  },
  {
    "id": "osprey-underwriting",
    "name": "Osprey Underwriting",
    "isActive": true,
    "segment": [
      "MGA"
    ],
    "linesOfBusiness": [
      "E",
      "S"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under MGA program.",
        "Appetite details: E&S"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "E&S"
    },
    "contacts": [],
    "generalAgent": "Direct E&S Binding / Wholesale"
  },
  {
    "id": "reliance-risk-solutions",
    "name": "Reliance Risk Solutions",
    "isActive": true,
    "segment": [
      "MGA/Carrier"
    ],
    "linesOfBusiness": [
      "Appointed 2022"
    ],
    "agencyCode": "Producer code R60822",
    "appetite": {
      "canWrite": [
        "Approved classes under MGA/Carrier program.",
        "Appetite details: Appointed 2022"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Appointed 2022"
    },
    "contacts": [],
    "generalAgent": "Direct E&S Binding / Wholesale"
  },
  {
    "id": "invo-underwriting",
    "name": "INVO Underwriting",
    "isActive": true,
    "segment": [
      "MGA / Underwriting",
      "Personal Lines",
      "Commercial Lines"
    ],
    "linesOfBusiness": [
      "Personal Lines (16 categories / 35 markets)",
      "Workers' Compensation (9 markets)",
      "Commercial Lines (15 categories / 24 markets)"
    ],
    "website": "https://www.invounderwriting.com",
    "appetite": {
      "canWrite": [
        "Personal Lines via INVO portal — Auto, Collector Vehicle, Condo, Dwelling, Earthquake, Excess Liability, Flood, HO4 Renters, Homeowners, Jewelry, Manufactured Home, Personal Article Floater, Personal Liability, Recreational Vehicles, Vacant Dwelling, Watercraft",
        "Workers' Compensation — AmTrust, Berkshire Hathaway GUARD, biBerk, Employers, EverPeak, Great American, Pie Insurance, SoloGhost (Owner Only WC / Ghost Policies), Three",
        "Commercial Lines via INVO portal — BOP, Builder's Risk, Commercial Auto, Cyber, General Liability, Inland Marine, Lessor's Risk, Liquor Liability, Package, Professional Liability, Property, Special Events, Surety Bonds, Trucking, Workers' Compensation"
      ],
      "cannotWrite": [
        "Exposures outside INVO portal carrier guidelines."
      ],
      "notes": "Appointed Jun 2026. INVO portal market map on file: 35 Personal Lines markets, 9 WC markets (Instant Access vs Direct Submit), 24 commercial markets. Agent support: agent.support@invounderwriting.com / (865) 482-8142. See carrier-assets/invo profile guide for per-market categories."
    },
    "contacts": [
      {
        "id": "invo-underwriting-c-csv-67",
        "name": "Russ Rymer",
        "role": "Partnership/Account (Appointment thank-you, Jun 2026; portal agent.support@invounderwriting.com)",
        "email": "russ.rymer@invounderwriting.com",
        "phone": "Agent support (865) 482-8142",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ],
    "generalAgent": "Direct E&S Binding / Wholesale"
  },
  {
    "id": "epremium",
    "name": "ePremium",
    "isActive": true,
    "segment": [
      "MGA"
    ],
    "linesOfBusiness": [
      "Renters / HO4 (approved to write)"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under MGA program.",
        "Appetite details: Renters / HO4 (approved to write)"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Renters / HO4 (approved to write)"
    },
    "contacts": [],
    "generalAgent": "Direct E&S Binding / Wholesale"
  },
  {
    "id": "amwins-amwins-connect",
    "name": "Amwins / Amwins Connect",
    "isActive": true,
    "segment": [
      "Wholesaler"
    ],
    "linesOfBusiness": [
      "Benefits (UHC",
      "Kaiser",
      "Angle)",
      "P",
      "C",
      "professional/cyber"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Wholesaler program.",
        "Appetite details: Benefits (UHC, Kaiser, Angle), P&C, professional/cyber"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Benefits (UHC, Kaiser, Angle), P&C, professional/cyber"
    },
    "contacts": [],
    "generalAgent": "Direct E&S Binding / Wholesale"
  },
  {
    "id": "rps-risk-placement-services-gallagher",
    "name": "RPS - Risk Placement Services (Gallagher)",
    "isActive": true,
    "segment": [
      "Wholesaler"
    ],
    "linesOfBusiness": [
      "Trucking / MTC E",
      "S"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Wholesaler program.",
        "Appetite details: Trucking / MTC E&S"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Trucking / MTC E&S"
    },
    "contacts": [],
    "generalAgent": "Direct E&S Binding / Wholesale"
  },
  {
    "id": "xs-brokers",
    "name": "XS Brokers",
    "isActive": true,
    "segment": [
      "Wholesaler"
    ],
    "linesOfBusiness": [
      "E",
      "S (warehouse/property)"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Wholesaler program.",
        "Appetite details: E&S (warehouse/property)"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "E&S (warehouse/property)"
    },
    "contacts": [
      {
        "id": "xs-brokers-c-csv-125",
        "name": "C. Bowne",
        "role": "Broker",
        "email": "cbowne@XSBrokers.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      },
      {
        "id": "xs-brokers-c-csv-126",
        "name": "John Crowley",
        "role": "Binding Underwriter",
        "email": "jcrowley@XSBrokers.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ],
    "generalAgent": "Direct E&S Binding / Wholesale"
  },
  {
    "id": "tapco-underwriters",
    "name": "TAPCO Underwriters",
    "isActive": true,
    "segment": [
      "Wholesaler"
    ],
    "linesOfBusiness": [
      "E",
      "S"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Wholesaler program.",
        "Appetite details: E&S"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "E&S"
    },
    "contacts": [
      {
        "id": "tapco-underwriters-c-csv-115",
        "name": "Christy Freeman/Summey",
        "role": "Policy Issuance (E&S)",
        "email": "CFreeman@gotapco.com",
        "phone": "1-800-334-5579 ext 8472; CA Lic #0778135",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ],
    "generalAgent": "Direct E&S Binding / Wholesale"
  },
  {
    "id": "brown-brown-formerly-hays",
    "name": "Brown & Brown (formerly Hays)",
    "isActive": true,
    "segment": [
      "Wholesaler"
    ],
    "linesOfBusiness": [
      "E",
      "S/commercial"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Wholesaler program.",
        "Appetite details: E&S/commercial"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "E&S/commercial"
    },
    "contacts": [],
    "generalAgent": "Direct E&S Binding / Wholesale"
  },
  {
    "id": "novella-wholesale",
    "name": "Novella Wholesale",
    "isActive": true,
    "segment": [
      "Wholesaler"
    ],
    "linesOfBusiness": [
      "Commercial accts >$25K target premium"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Wholesaler program.",
        "Appetite details: Commercial accts >$25K target premium"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Commercial accts >$25K target premium"
    },
    "contacts": [
      {
        "id": "novella-wholesale-c-csv-118",
        "name": "Alex",
        "role": "Broker",
        "email": "alex@bynovella.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ],
    "generalAgent": "Direct E&S Binding / Wholesale"
  },
  {
    "id": "marsh-mclennan-agency-marshmma",
    "name": "Marsh McLennan Agency (MarshMMA)",
    "isActive": true,
    "segment": [
      "Broker"
    ],
    "linesOfBusiness": [
      "PEO + employee benefits referrals"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Broker program.",
        "Appetite details: PEO + employee benefits referrals"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "PEO + employee benefits referrals"
    },
    "contacts": []
  },
  {
    "id": "first-connect-insurance",
    "name": "First Connect Insurance",
    "isActive": true,
    "segment": [
      "Aggregator"
    ],
    "linesOfBusiness": [
      "Multi-carrier platform"
    ],
    "agencyCode": "Agency code FC32170",
    "appetite": {
      "canWrite": [
        "Approved classes under Aggregator program.",
        "Appetite details: Multi-carrier platform"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Multi-carrier platform"
    },
    "contacts": []
  },
  {
    "id": "smart-choice-smart-start-sspl",
    "name": "Smart Choice / Smart Start (SSPL)",
    "isActive": true,
    "segment": [
      "Aggregator"
    ],
    "linesOfBusiness": [
      "Personal + commercial lines"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Aggregator program.",
        "Appetite details: Personal + commercial lines"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Personal + commercial lines"
    },
    "contacts": []
  },
  {
    "id": "the-agency-collective-the-brokers",
    "name": "The Agency Collective / The Brokers",
    "isActive": true,
    "segment": [
      "Network/Aggregator"
    ],
    "linesOfBusiness": [
      "Carrier access network"
    ],
    "agencyCode": "Welcome code TAC000152",
    "appetite": {
      "canWrite": [
        "Approved classes under Network/Aggregator program.",
        "Appetite details: Carrier access network"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Carrier access network"
    },
    "contacts": []
  },
  {
    "id": "chenango-brokers",
    "name": "Chenango Brokers",
    "isActive": true,
    "segment": [
      "Aggregator/Network"
    ],
    "linesOfBusiness": [
      "Broker appointment"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Aggregator/Network program.",
        "Appetite details: Broker appointment"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Broker appointment"
    },
    "contacts": []
  },
  {
    "id": "decisionhr",
    "name": "DecisionHR",
    "isActive": true,
    "segment": [
      "PEO"
    ],
    "linesOfBusiness": [
      "WC-driven groups (construction)"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under PEO program.",
        "Appetite details: WC-driven groups (construction)"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "WC-driven groups (construction)"
    },
    "contacts": [
      {
        "id": "decisionhr-c-csv-60",
        "name": "Josh McIntosh",
        "role": "Chief Revenue Officer (PEO intro, May-Jun 2026)",
        "email": "Josh.McIntosh@DecisionHR.com",
        "phone": "Direct (561) 628-3621; Toll Free (888) 828-5511",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      },
      {
        "id": "decisionhr-c-csv-61",
        "name": "Tim Tyler",
        "role": "Sales (Prior comp coverage collaboration, Jun 2026)",
        "email": "Tim.Tyler@DecisionHR.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      },
      {
        "id": "decisionhr-c-csv-62",
        "name": "Chuck Link",
        "role": "SVP Sales (Jun 2026)",
        "email": "Chuck.Link@DecisionHR.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ]
  },
  {
    "id": "prestigepeo",
    "name": "PrestigePEO",
    "isActive": true,
    "segment": [
      "PEO"
    ],
    "linesOfBusiness": [
      "PEO / benefits"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under PEO program.",
        "Appetite details: PEO / benefits"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "PEO / benefits"
    },
    "contacts": [
      {
        "id": "prestigepeo-c-csv-107",
        "name": "Laurence (Larry) Lynch",
        "role": "Sales (PEO)",
        "email": "llynch@prestigepeo.com",
        "phone": "Direct (631) 498-1536; Main (516) 692-8505",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ]
  },
  {
    "id": "integritypeo",
    "name": "IntegrityPEO",
    "isActive": true,
    "segment": [
      "PEO Brokerage"
    ],
    "linesOfBusiness": [
      "Benefits / PEO"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under PEO Brokerage program.",
        "Appetite details: Benefits / PEO"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Benefits / PEO"
    },
    "contacts": [
      {
        "id": "integritypeo-c-csv-106",
        "name": "Tyler Stephens",
        "role": "Sales (PEO/benefits)",
        "email": "tstephens@integritypeo.com",
        "phone": "Cell 404.213.4228",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ]
  },
  {
    "id": "paycomp",
    "name": "PayComp",
    "isActive": true,
    "segment": [
      "Payroll / WC (PEO-style)"
    ],
    "linesOfBusiness": [
      "Agency Services Agreement signed"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Payroll / WC (PEO-style) program.",
        "Appetite details: Agency Services Agreement signed"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Agency Services Agreement signed"
    },
    "contacts": [
      {
        "id": "paycomp-c-csv-66",
        "name": "Kristian Cuasay",
        "role": "Sales (Editable flyer/agreement Jun 2026; also sales@paycomp.support)",
        "email": "kcuasay@paycomp.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ]
  },
  {
    "id": "banner-life-legal-general-america",
    "name": "Banner Life / Legal & General America",
    "isActive": true,
    "segment": [
      "Carrier (Life)"
    ],
    "linesOfBusiness": [
      "Term / appointed"
    ],
    "agencyCode": "Agent number Y710715",
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier (Life) program.",
        "Appetite details: Term / appointed"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Term / appointed"
    },
    "contacts": []
  },
  {
    "id": "symetra-life",
    "name": "Symetra Life",
    "isActive": true,
    "segment": [
      "Carrier (Life)"
    ],
    "linesOfBusiness": [
      "Term",
      "IUL - approved GA eff 10/18/2023"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier (Life) program.",
        "Appetite details: Term, IUL - approved GA eff 10/18/2023"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Term, IUL - approved GA eff 10/18/2023"
    },
    "contacts": []
  },
  {
    "id": "mutual-of-omaha-united-of-omaha",
    "name": "Mutual of Omaha / United of Omaha",
    "isActive": true,
    "segment": [
      "Carrier (Life)"
    ],
    "linesOfBusiness": [
      "IUL / term"
    ],
    "agencyCode": "Producer IDs 1087863 and 1120392",
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier (Life) program.",
        "Appetite details: IUL / term"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "IUL / term"
    },
    "contacts": []
  },
  {
    "id": "american-general-life-aig-corebridge",
    "name": "American General Life / AIG / Corebridge",
    "isActive": true,
    "segment": [
      "Carrier (Life)"
    ],
    "linesOfBusiness": [
      "Appointed"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier (Life) program.",
        "Appetite details: Appointed"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Appointed"
    },
    "contacts": []
  },
  {
    "id": "gerber-life",
    "name": "Gerber Life",
    "isActive": true,
    "segment": [
      "Carrier (Life)"
    ],
    "linesOfBusiness": [
      "Contracted via AMG"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier (Life) program.",
        "Appetite details: Contracted via AMG"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Contracted via AMG"
    },
    "contacts": []
  },
  {
    "id": "illinois-mutual",
    "name": "Illinois Mutual",
    "isActive": true,
    "segment": [
      "Carrier (DI/Life)"
    ],
    "linesOfBusiness": [
      "Appointment active"
    ],
    "agencyCode": "Producer code 89431",
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier (DI/Life) program.",
        "Appetite details: Appointment active"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Appointment active"
    },
    "contacts": []
  },
  {
    "id": "img-imglobal",
    "name": "IMG / IMGlobal",
    "isActive": true,
    "segment": [
      "Carrier"
    ],
    "linesOfBusiness": [
      "Travel / international medical"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier program.",
        "Appetite details: Travel / international medical"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Travel / international medical"
    },
    "contacts": []
  },
  {
    "id": "premier-smi",
    "name": "Premier SMI",
    "isActive": true,
    "segment": [
      "Medicare FMO"
    ],
    "linesOfBusiness": [
      "Contracting"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Medicare FMO program.",
        "Appetite details: Contracting"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Contracting"
    },
    "contacts": [
      {
        "id": "premier-smi-c-csv-119",
        "name": "Kylee Krueger",
        "role": "Contracting (Medicare FMO)",
        "email": "Kylee.Krueger@premiersmi.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      },
      {
        "id": "premier-smi-c-csv-120",
        "name": "Lacey Griffith",
        "role": "Contracting",
        "email": "lacey.griffith@premiersmi.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ]
  },
  {
    "id": "garityadvantage",
    "name": "GarityAdvantage",
    "isActive": true,
    "segment": [
      "Medicare FMO"
    ],
    "linesOfBusiness": [
      "Medicare"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Medicare FMO program.",
        "Appetite details: Medicare"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Medicare"
    },
    "contacts": []
  },
  {
    "id": "unitedhealthcare-uhc",
    "name": "UnitedHealthcare (UHC)",
    "isActive": true,
    "segment": [
      "Carrier"
    ],
    "linesOfBusiness": [
      "Small group health (via Amwins)"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier program.",
        "Appetite details: Small group health (via Amwins)"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Small group health (via Amwins)"
    },
    "contacts": [
      {
        "id": "unitedhealthcare-uhc-c-csv-101",
        "name": "Ember Ford",
        "role": "Small group rep (Small group packet; also blake_garrett@uhc.com)",
        "email": "ember_ford@uhc.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ],
    "generalAgent": "Amwins"
  },
  {
    "id": "kaiser-permanente",
    "name": "Kaiser Permanente",
    "isActive": true,
    "segment": [
      "Carrier"
    ],
    "linesOfBusiness": [
      "Small group health (via Amwins)"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier program.",
        "Appetite details: Small group health (via Amwins)"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Small group health (via Amwins)"
    },
    "contacts": [
      {
        "id": "kaiser-permanente-c-csv-102",
        "name": "Clark Cesar",
        "role": "Rep",
        "email": "Clark.X.Cesar@kp.org",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      },
      {
        "id": "kaiser-permanente-c-csv-103",
        "name": "Keith Ridley",
        "role": "Rep",
        "email": "Keith.A.Ridley@kp.org",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      },
      {
        "id": "kaiser-permanente-c-csv-104",
        "name": "Victor Houston",
        "role": "Rep",
        "email": "Victor.Houston@kp.org",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ],
    "generalAgent": "Amwins"
  },
  {
    "id": "angle-health",
    "name": "Angle Health",
    "isActive": true,
    "segment": [
      "Carrier"
    ],
    "linesOfBusiness": [
      "Level-funded health (via Amwins)"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier program.",
        "Appetite details: Level-funded health (via Amwins)"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Level-funded health (via Amwins)"
    },
    "contacts": [
      {
        "id": "angle-health-c-csv-105",
        "name": "Casey",
        "role": "Rep (Level-funded health)",
        "email": "casey@anglehealth.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ],
    "generalAgent": "Amwins"
  },
  {
    "id": "optimyl-benefits",
    "name": "Optimyl Benefits",
    "isActive": true,
    "segment": [
      "MGA"
    ],
    "linesOfBusiness": [
      "Level-funded health"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under MGA program.",
        "Appetite details: Level-funded health"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Level-funded health"
    },
    "contacts": [
      {
        "id": "optimyl-benefits-c-csv-111",
        "name": "Kimberly Cardascia",
        "role": "Rep (Level-funded health)",
        "email": "kimberly.cardascia@optimyl.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ],
    "generalAgent": "Direct E&S Binding / Wholesale"
  },
  {
    "id": "cigna-healthcare-healthspring",
    "name": "Cigna Healthcare / HealthSpring",
    "isActive": true,
    "segment": [
      "Carrier"
    ],
    "linesOfBusiness": [
      "Medicare Advantage"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier program.",
        "Appetite details: Medicare Advantage"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Medicare Advantage"
    },
    "contacts": []
  },
  {
    "id": "anthem",
    "name": "Anthem",
    "isActive": true,
    "segment": [
      "Carrier"
    ],
    "linesOfBusiness": [
      "Health / Medicare (via AMH)"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier program.",
        "Appetite details: Health / Medicare (via AMH)"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Health / Medicare (via AMH)"
    },
    "contacts": [],
    "generalAgent": "AMH Insurance"
  },
  {
    "id": "humana",
    "name": "Humana",
    "isActive": true,
    "segment": [
      "Carrier"
    ],
    "linesOfBusiness": [
      "Medicare (via AMH)"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier program.",
        "Appetite details: Medicare (via AMH)"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Medicare (via AMH)"
    },
    "contacts": [],
    "generalAgent": "AMH Insurance"
  },
  {
    "id": "clover-health",
    "name": "Clover Health",
    "isActive": true,
    "segment": [
      "Carrier"
    ],
    "linesOfBusiness": [
      "Medicare Advantage (via AMH)"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier program.",
        "Appetite details: Medicare Advantage (via AMH)"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Medicare Advantage (via AMH)"
    },
    "contacts": [],
    "generalAgent": "AMH Insurance"
  },
  {
    "id": "sonder-health",
    "name": "Sonder Health",
    "isActive": true,
    "segment": [
      "Carrier"
    ],
    "linesOfBusiness": [
      "Medicare (via AMH)"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier program.",
        "Appetite details: Medicare (via AMH)"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Medicare (via AMH)"
    },
    "contacts": [],
    "generalAgent": "AMH Insurance"
  },
  {
    "id": "clear-spring-health",
    "name": "Clear Spring Health",
    "isActive": true,
    "segment": [
      "Carrier"
    ],
    "linesOfBusiness": [
      "Medicare Advantage"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier program.",
        "Appetite details: Medicare Advantage"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Medicare Advantage"
    },
    "contacts": []
  },
  {
    "id": "three-insurance",
    "name": "Three Insurance",
    "isActive": true,
    "segment": [
      "Carrier"
    ],
    "linesOfBusiness": [
      "Small commercial / WC (Agent Academy)"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Carrier program.",
        "Appetite details: Small commercial / WC (Agent Academy)"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Small commercial / WC (Agent Academy)"
    },
    "contacts": []
  },
  {
    "id": "xinsurance-program-of-prime-is",
    "name": "XINSURANCE (program of Prime IS)",
    "isActive": true,
    "segment": [
      "Program"
    ],
    "linesOfBusiness": [
      "E",
      "S excess"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Program program.",
        "Appetite details: E&S excess"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "E&S excess"
    },
    "contacts": []
  },
  {
    "id": "ncci",
    "name": "NCCI",
    "isActive": true,
    "segment": [
      "Rating Bureau"
    ],
    "linesOfBusiness": [
      "WC rating bureau (ph 800-622-4123)"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Rating Bureau program.",
        "Appetite details: WC rating bureau (ph 800-622-4123)"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "WC rating bureau (ph 800-622-4123)"
    },
    "contacts": []
  },
  {
    "id": "lexisnexis",
    "name": "LexisNexis",
    "isActive": true,
    "segment": [
      "Data Vendor"
    ],
    "linesOfBusiness": [
      "Reports / MVR / data"
    ],
    "agencyCode": "User ID IDX5H8C6, Node JO2158000",
    "appetite": {
      "canWrite": [
        "Approved classes under Data Vendor program.",
        "Appetite details: Reports / MVR / data"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Reports / MVR / data"
    },
    "contacts": []
  },
  {
    "id": "ipipeline",
    "name": "iPipeline",
    "isActive": true,
    "segment": [
      "Life Quoting Platform"
    ],
    "linesOfBusiness": [
      "Life quoting"
    ],
    "agencyCode": "Username rcoates1942",
    "appetite": {
      "canWrite": [
        "Approved classes under Life Quoting Platform program.",
        "Appetite details: Life quoting"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Life quoting"
    },
    "contacts": []
  },
  {
    "id": "coverforce",
    "name": "CoverForce",
    "isActive": true,
    "segment": [
      "Quoting Platform"
    ],
    "linesOfBusiness": [
      "NBS Quote",
      "Bind"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Quoting Platform program.",
        "Appetite details: NBS Quote & Bind"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "NBS Quote & Bind"
    },
    "contacts": []
  },
  {
    "id": "hawksoft",
    "name": "HawkSoft",
    "isActive": true,
    "segment": [
      "AMS"
    ],
    "linesOfBusiness": [
      "Agency management system"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under AMS program.",
        "Appetite details: Agency management system"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Agency management system"
    },
    "contacts": []
  },
  {
    "id": "momentum-amp-nowcerts",
    "name": "Momentum AMP / Nowcerts",
    "isActive": true,
    "segment": [
      "AMS"
    ],
    "linesOfBusiness": [
      "Agency management / Nowcerts University"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under AMS program.",
        "Appetite details: Agency management / Nowcerts University"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Agency management / Nowcerts University"
    },
    "contacts": []
  },
  {
    "id": "hipnation",
    "name": "HIPnation",
    "isActive": true,
    "segment": [
      "Health Vendor"
    ],
    "linesOfBusiness": [
      "Primary-care / health membership"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Health Vendor program.",
        "Appetite details: Primary-care / health membership"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Primary-care / health membership"
    },
    "contacts": [
      {
        "id": "hipnation-c-csv-136",
        "name": "Brian E. Hill, MD",
        "role": "CEO (Primary-care/health vendor)",
        "email": "bhill@hipnation.com",
        "phone": "770.855.4201",
        "region": "Source: Service (Last interaction: 2025-12-08)"
      }
    ]
  },
  {
    "id": "baxrx",
    "name": "BaxRx",
    "isActive": true,
    "segment": [
      "Pharmacy Vendor"
    ],
    "linesOfBusiness": [
      "Pharmacy discount program"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Pharmacy Vendor program.",
        "Appetite details: Pharmacy discount program"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Pharmacy discount program"
    },
    "contacts": []
  },
  {
    "id": "essigmann-associates",
    "name": "Essigmann & Associates",
    "isActive": true,
    "segment": [
      "Referral Partner"
    ],
    "linesOfBusiness": [
      "Personal-lines referrals"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes under Referral Partner program.",
        "Appetite details: Personal-lines referrals"
      ],
      "cannotWrite": [
        "Exposures outside standard carrier underwriting guidelines."
      ],
      "notes": "Personal-lines referrals"
    },
    "contacts": []
  },
  {
    "id": "shield-insurance",
    "name": "Shield Insurance",
    "isActive": true,
    "segment": [
      "Commercial Lines"
    ],
    "linesOfBusiness": [
      "Comm package renewals (JB Noble)"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes and risks."
      ],
      "cannotWrite": [
        "Hazardous classes."
      ],
      "notes": "Source: Client"
    },
    "contacts": [
      {
        "id": "shield-insurance-c-csv-11",
        "name": "Amber Miller",
        "role": "Renewals (Comm package renewals (JB Noble))",
        "email": "amiller@shieldins.net",
        "phone": "",
        "region": "Source: Client (Last interaction: 2025-07-22)"
      },
      {
        "id": "shield-insurance-c-csv-12",
        "name": "CPPL Desk",
        "role": "Quote Approvals (Comm quote approvals)",
        "email": "cppl@shieldins.net",
        "phone": "",
        "region": "Source: Client (Last interaction: 2025-09-15)"
      }
    ]
  },
  {
    "id": "natalie-reid-state-farm",
    "name": "Natalie Reid State Farm",
    "isActive": true,
    "segment": [
      "Commercial Lines"
    ],
    "linesOfBusiness": [
      "Loss runs source (ubreakifix)"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes and risks."
      ],
      "cannotWrite": [
        "Hazardous classes."
      ],
      "notes": "Source: Client"
    },
    "contacts": [
      {
        "id": "natalie-reid-state-farm-c-csv-50",
        "name": "Brittany Astin",
        "role": "Office Manager (Loss runs source (ubreakifix))",
        "email": "brittany.astin.wi5n@statefarm.com",
        "phone": "",
        "region": "Source: Client (Last interaction: 2025-08-22)"
      }
    ]
  },
  {
    "id": "lowry-resource-pro",
    "name": "Lowry / ReSource Pro",
    "isActive": true,
    "segment": [
      "Commercial Lines"
    ],
    "linesOfBusiness": [
      "WC premium audit (JB Noble)"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes and risks."
      ],
      "cannotWrite": [
        "Hazardous classes."
      ],
      "notes": "Source: Client"
    },
    "contacts": [
      {
        "id": "lowry-resource-pro-c-csv-51",
        "name": "Madison Robinson",
        "role": "Premium Auditor (WC premium audit (JB Noble))",
        "email": "madison.robinson@lowryinc.com",
        "phone": "435-310-148",
        "region": "Source: Client (Last interaction: 2025-09-12)"
      }
    ]
  },
  {
    "id": "advance-contracting",
    "name": "Advance Contracting",
    "isActive": true,
    "segment": [
      "Commercial Lines"
    ],
    "linesOfBusiness": [
      "VSI Locust Grove (holder BankPlus)"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes and risks."
      ],
      "cannotWrite": [
        "Hazardous classes."
      ],
      "notes": "Source: Prospects"
    },
    "contacts": [
      {
        "id": "advance-contracting-c-csv-52",
        "name": "Miguel",
        "role": "GC / COI requester (VSI Locust Grove (holder BankPlus))",
        "email": "Miguel@advance-contracting.com",
        "phone": "",
        "region": "Source: Prospects (Last interaction: 2025-10-15)"
      }
    ]
  },
  {
    "id": "rbi-alliance-rbi-private-lending",
    "name": "RBI Alliance / RBI Private Lending",
    "isActive": true,
    "segment": [
      "Commercial Lines"
    ],
    "linesOfBusiness": [
      "Builders risk / investor property referral feed"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes and risks."
      ],
      "cannotWrite": [
        "Hazardous classes."
      ],
      "notes": "Source: Prospects"
    },
    "contacts": [
      {
        "id": "rbi-alliance-rbi-private-lending-c-csv-53",
        "name": "Jerome Green",
        "role": "Referral Partner (lender) (Builders risk / investor property referral feed)",
        "email": "jerome@rbialliance.com",
        "phone": "",
        "region": "Source: Prospects (Last interaction: 2025-11-24)"
      }
    ]
  },
  {
    "id": "rbi-alliance",
    "name": "RBI Alliance",
    "isActive": true,
    "segment": [
      "Commercial Lines"
    ],
    "linesOfBusiness": [
      "Property insurance requests"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes and risks."
      ],
      "cannotWrite": [
        "Hazardous classes."
      ],
      "notes": "Source: Prospects"
    },
    "contacts": [
      {
        "id": "rbi-alliance-c-csv-54",
        "name": "Cori",
        "role": "Property Processor (Property insurance requests)",
        "email": "cori@rbialliance.com",
        "phone": "",
        "region": "Source: Prospects (Last interaction: 2025-10-30)"
      },
      {
        "id": "rbi-alliance-c-csv-55",
        "name": "Toni",
        "role": "Property Processor (Property insurance requests)",
        "email": "toni@rbialliance.com",
        "phone": "",
        "region": "Source: Prospects (Last interaction: 2025-10-21)"
      },
      {
        "id": "rbi-alliance-c-csv-56",
        "name": "Anh",
        "role": "Property Processor (Property insurance requests)",
        "email": "anh@rbialliance.com",
        "phone": "",
        "region": "Source: Prospects (Last interaction: 2025-10-22)"
      }
    ]
  },
  {
    "id": "rotunda-land",
    "name": "Rotunda Land",
    "isActive": true,
    "segment": [
      "Commercial Lines"
    ],
    "linesOfBusiness": [
      "Performance/maintenance bonds going forward"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes and risks."
      ],
      "cannotWrite": [
        "Hazardous classes."
      ],
      "notes": "Source: Deals"
    },
    "contacts": [
      {
        "id": "rotunda-land-c-csv-57",
        "name": "Doug Hooker",
        "role": "Developer (bond client) (Performance/maintenance bonds going forward)",
        "email": "dhooker@rotundaland.com",
        "phone": "",
        "region": "Source: Deals (Last interaction: 2025-02-27)"
      },
      {
        "id": "rotunda-land-c-csv-58",
        "name": "Jim Thomas",
        "role": "Developer (bond client) (Contract/site bonds (Riley Place/Dawsonville))",
        "email": "jthomas@rotundaland.com",
        "phone": "",
        "region": "Source: Deals (Last interaction: 2025-02-25)"
      }
    ]
  },
  {
    "id": "marsh-mclennan-marshmma",
    "name": "Marsh McLennan (MarshMMA)",
    "isActive": true,
    "segment": [
      "Commercial Lines"
    ],
    "linesOfBusiness": [
      "PEO/benefits intros"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes and risks."
      ],
      "cannotWrite": [
        "Hazardous classes."
      ],
      "notes": "Source: Carrier folder (email)"
    },
    "contacts": [
      {
        "id": "marsh-mclennan-marshmma-c-csv-63",
        "name": "Matthew A. Lee",
        "role": "VP Employee Health & Benefits (PEO/benefits intros)",
        "email": "Matthew.Lee01@MarshMMA.com",
        "phone": "CA Lic #4020503",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      },
      {
        "id": "marsh-mclennan-marshmma-c-csv-64",
        "name": "Mike Giangiobbe",
        "role": "Director Sales & Revenue, SE PEO (PEO referrals)",
        "email": "Mike.Giangiobbe@MarshMMA.com",
        "phone": "Lic #3713584",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      },
      {
        "id": "marsh-mclennan-marshmma-c-csv-65",
        "name": "Brent Morris",
        "role": "Director, Simple Benefits (Benefits)",
        "email": "Brent.Morris@MarshMMA.com",
        "phone": "Mobile 404-368-0338; CA Lic #4096718",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ]
  },
  {
    "id": "invo-peo",
    "name": "INVO PEO",
    "isActive": true,
    "segment": [
      "Commercial Lines"
    ],
    "linesOfBusiness": [
      "Submissions, Oct 2024"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes and risks."
      ],
      "cannotWrite": [
        "Hazardous classes."
      ],
      "notes": "Source: Carrier folder (email)"
    },
    "contacts": [
      {
        "id": "invo-peo-c-csv-68",
        "name": "Dianna Sexton",
        "role": "Director Sales (Arrow Broker) (Submissions, Oct 2024)",
        "email": "Dianna.Sexton@invopeo.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ]
  },
  {
    "id": "amwins",
    "name": "Amwins",
    "isActive": true,
    "segment": [
      "Commercial Lines"
    ],
    "linesOfBusiness": [
      "Benefits/P&C"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes and risks."
      ],
      "cannotWrite": [
        "Hazardous classes."
      ],
      "notes": "Source: Carrier folder (email)"
    },
    "contacts": [
      {
        "id": "amwins-c-csv-97",
        "name": "Haroletta Martin",
        "role": "Regional Sales Mgr (Benefits/P&C)",
        "email": "haroletta.martin@amwins.com",
        "phone": "T 404-534-5934; M 412-606-0177",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      },
      {
        "id": "amwins-c-csv-98",
        "name": "Augie Yost",
        "role": "VP Professional Lines (Professional/cyber)",
        "email": "augie.yost@amwins.com",
        "phone": "M 678-770-3555",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      },
      {
        "id": "amwins-c-csv-99",
        "name": "Cooper Marini",
        "role": "Small business broker (Atlanta)",
        "email": "cooper.marini@amwins.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      },
      {
        "id": "amwins-c-csv-100",
        "name": "Hannah Rapaka",
        "role": "Broker/Support",
        "email": "hannah.rapaka@amwins.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ]
  },
  {
    "id": "banner-life-legal-general",
    "name": "Banner Life / Legal & General",
    "isActive": true,
    "segment": [
      "Commercial Lines"
    ],
    "linesOfBusiness": [
      "Appointment"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes and risks."
      ],
      "cannotWrite": [
        "Hazardous classes."
      ],
      "notes": "Source: Carrier folder (email)"
    },
    "contacts": [
      {
        "id": "banner-life-legal-general-c-csv-109",
        "name": "Agent Licensing",
        "role": "Licensing (Appointment)",
        "email": "AgentLicensing@bannerlife.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ]
  },
  {
    "id": "symetra",
    "name": "Symetra",
    "isActive": true,
    "segment": [
      "Commercial Lines"
    ],
    "linesOfBusiness": [
      "Life contracting"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes and risks."
      ],
      "cannotWrite": [
        "Hazardous classes."
      ],
      "notes": "Source: Carrier folder (email)"
    },
    "contacts": [
      {
        "id": "symetra-c-csv-110",
        "name": "Contracting",
        "role": "Contracting (Life contracting)",
        "email": "contracting@symetra.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ]
  },
  {
    "id": "brown-brown",
    "name": "Brown & Brown",
    "isActive": true,
    "segment": [
      "Commercial Lines"
    ],
    "linesOfBusiness": [
      "Standard Lines"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes and risks."
      ],
      "cannotWrite": [
        "Hazardous classes."
      ],
      "notes": "Source: Carrier folder (email)"
    },
    "contacts": [
      {
        "id": "brown-brown-c-csv-116",
        "name": "Alyson Nelson",
        "role": "Broker/Support",
        "email": "Alyson.Nelson@bbrown.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ]
  },
  {
    "id": "rps-risk-placement-services",
    "name": "RPS - Risk Placement Services",
    "isActive": true,
    "segment": [
      "Commercial Lines"
    ],
    "linesOfBusiness": [
      "Trucking/MTC E&S"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes and risks."
      ],
      "cannotWrite": [
        "Hazardous classes."
      ],
      "notes": "Source: Carrier folder (email)"
    },
    "contacts": [
      {
        "id": "rps-risk-placement-services-c-csv-127",
        "name": "Angie Powell",
        "role": "Broker (Trucking/MTC E&S)",
        "email": "angie_powell@rpsins.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ]
  },
  {
    "id": "smart-choice",
    "name": "Smart Choice",
    "isActive": true,
    "segment": [
      "Commercial Lines"
    ],
    "linesOfBusiness": [
      "Also sspl@; info@smartchoiceagents.com"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes and risks."
      ],
      "cannotWrite": [
        "Hazardous classes."
      ],
      "notes": "Source: Carrier folder (email)"
    },
    "contacts": [
      {
        "id": "smart-choice-c-csv-128",
        "name": "Wil Carter",
        "role": "Territory Mgr (Also sspl@; info@smartchoiceagents.com)",
        "email": "wcarter@smartchoiceagents.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ]
  },
  {
    "id": "first-connect",
    "name": "First Connect",
    "isActive": true,
    "segment": [
      "Commercial Lines"
    ],
    "linesOfBusiness": [
      "Also luis@fcis.com; agentsupport@fcis.com"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes and risks."
      ],
      "cannotWrite": [
        "Hazardous classes."
      ],
      "notes": "Source: Carrier folder (email)"
    },
    "contacts": [
      {
        "id": "first-connect-c-csv-129",
        "name": "Raul D",
        "role": "Agency Support (Also luis@fcis.com; agentsupport@fcis.com)",
        "email": "raul@fcis.com",
        "phone": "877-287-605x (agent support)",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ]
  },
  {
    "id": "the-agency-collective",
    "name": "The Agency Collective",
    "isActive": true,
    "segment": [
      "Commercial Lines"
    ],
    "linesOfBusiness": [
      "Also ppaule@, dransom@, kenny@jointheac.com"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes and risks."
      ],
      "cannotWrite": [
        "Hazardous classes."
      ],
      "notes": "Source: Carrier folder (email)"
    },
    "contacts": [
      {
        "id": "the-agency-collective-c-csv-132",
        "name": "Lindey Woodworth",
        "role": "Support (Also ppaule@, dransom@, kenny@jointheac.com)",
        "email": "lwoodworth@jointheac.com",
        "phone": "",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ]
  },
  {
    "id": "cigna-healthspring",
    "name": "Cigna / HealthSpring",
    "isActive": true,
    "segment": [
      "Commercial Lines"
    ],
    "linesOfBusiness": [
      "Medicare Advantage"
    ],
    "appetite": {
      "canWrite": [
        "Approved classes and risks."
      ],
      "cannotWrite": [
        "Hazardous classes."
      ],
      "notes": "Source: Carrier folder (email)"
    },
    "contacts": [
      {
        "id": "cigna-healthspring-c-csv-135",
        "name": "Agent Resource Center",
        "role": "Support (Medicare Advantage)",
        "email": "ARCMAPD@HealthSpring.com",
        "phone": "866.442.7516",
        "region": "Source: Carrier folder (email) (Last interaction: 2026-06-07)"
      }
    ]
  }
];

export const INITIAL_SYSTEM_STATUSES: CarrierSystemStatus[] = [
  {
    "carrierId": "amtrust-financial",
    "portalStatus": "operational",
    "responseTime": "fast",
    "lastChecked": "2026-06-06T23:30:00Z",
    "statusNote": "API online. Instant Workers Comp clearance running normally."
  },
  {
    "carrierId": "attune-insurance",
    "portalStatus": "operational",
    "responseTime": "fast",
    "lastChecked": "2026-06-06T23:35:00Z",
    "statusNote": "Hamilton capacity BOP clearance fully available."
  },
  {
    "carrierId": "next-insurance",
    "portalStatus": "operational",
    "responseTime": "fast",
    "lastChecked": "2026-06-06T23:40:00Z",
    "statusNote": "All products operational. Instant binder issues working."
  },
  {
    "carrierId": "coterie-insurance",
    "portalStatus": "degraded",
    "responseTime": "slow",
    "lastChecked": "2026-06-06T23:45:00Z",
    "statusNote": "Scraper is timing out on deep GIS structures. Manual address overrides recommended."
  },
  {
    "carrierId": "cover-whale",
    "portalStatus": "operational",
    "responseTime": "average",
    "lastChecked": "2026-06-06T23:12:00Z",
    "statusNote": "Standard truck ELD/telemetry validation is functional."
  },
  {
    "carrierId": "progressive",
    "portalStatus": "operational",
    "responseTime": "fast",
    "lastChecked": "2026-06-06T23:50:00Z",
    "statusNote": "ForAgentsOnly portal fully active. Standard API response times < 1.1s."
  },
  {
    "carrierId": "steadily",
    "portalStatus": "operational",
    "responseTime": "fast",
    "lastChecked": "2026-06-06T23:48:00Z",
    "statusNote": "Landlord portal active. Immediate underwriting response metrics green."
  }
];

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    "id": "sub-1001",
    "clientName": "Raleigh Baking Co.",
    "carrierId": "attune-insurance",
    "lineOfBusiness": "Business Owners Policy (BOP)",
    "status": "Approved",
    "dateCreated": "2026-06-01T14:30:00Z",
    "dateUpdated": "2026-06-02T10:15:00Z",
    "notes": "Approved automatically with clean premium rating. Bound on policy #AT-99220-44.",
    "amount": 1450
  },
  {
    "id": "sub-1002",
    "clientName": "Greenwood HVAC Artisans",
    "carrierId": "amtrust-financial",
    "lineOfBusiness": "Workers Compensation",
    "status": "Underwriting",
    "dateCreated": "2026-06-04T09:00:00Z",
    "dateUpdated": "2026-06-05T16:45:00Z",
    "notes": "Underwriter is requesting 3-year loss runs as high-tier HVAC contractor profile.",
    "amount": 3200
  },
  {
    "id": "sub-1003",
    "clientName": "Starlight Multi-Family Condo HOA",
    "carrierId": "honeycomb",
    "lineOfBusiness": "Commercial Residential Property",
    "status": "Need Info",
    "dateCreated": "2026-06-05T11:00:00Z",
    "dateUpdated": "2026-06-06T08:20:00Z",
    "notes": "Requires updated roof photo or inspector sign-off on 2018 retrofitted units.",
    "amount": 8750
  },
  {
    "id": "sub-1004",
    "clientName": "Interstate Cargo Movers LLC",
    "carrierId": "cover-whale",
    "lineOfBusiness": "Commercial Auto",
    "status": "Approved",
    "dateCreated": "2026-06-05T08:15:00Z",
    "dateUpdated": "2026-06-05T14:00:00Z",
    "notes": "Approved. Telematics driver agreement signed. Awaiting deposit validation.",
    "amount": 12400
  },
  {
    "id": "sub-1005",
    "clientName": "Apex Dry Cleaners",
    "carrierId": "coterie-insurance",
    "lineOfBusiness": "Business Owners Policy (BOP)",
    "status": "Draft",
    "dateCreated": "2026-06-06T15:22:00Z",
    "dateUpdated": "2026-06-06T15:22:00Z",
    "notes": "Draft complete. Checking active premium with and without employee liability endorsements."
  }
];

export const INITIAL_BULLETINS: GuidelineBulletin[] = [
  {
    "id": "bulletin-1",
    "carrierId": "amtrust-financial",
    "title": "AmTrust Extends Underwriting Flexibility on Roof Requirements",
    "description": "AmTrust is immediately relaxing some commercial property roof restrictions for main-street offices. Roof life limits are extended to 22 years (previously 15) for high-grade multi-layer shingles in selected non-coastal states.",
    "severity": "info",
    "datePosted": "2026-06-05T10:00:00Z",
    "isActive": true
  },
  {
    "id": "bulletin-2",
    "carrierId": "progressive",
    "title": "URGENT: Progressive Commercial Auto Texas Rates Adjustment",
    "description": "Progressive Commercial Auto is updating rates for local transit delivery and livery operations in metropolitan Dallas and Houston territory. All quotes draft policies must be binder-registered prior to June 15th to lock existing brackets.",
    "severity": "warning",
    "datePosted": "2026-06-03T14:30:00Z",
    "isActive": true
  },
  {
    "id": "bulletin-3",
    "carrierId": "attune-insurance",
    "title": "New Restricted Hazard: Woodworking and Machine Artisan Classes",
    "description": "Due to capacity changes, Attune of BOP limits is immediately halting quote availability for high-end woodcarver shops, custom carpentry furniture designers with heavy sanding tools, and machinery fabrication artisans.",
    "severity": "critical",
    "datePosted": "2026-06-06T09:12:00Z",
    "isActive": true
  },
  {
    "id": "bulletin-4",
    "title": "Hurricane Preparations Guidelines & Coastal Property Underwriting",
    "description": "Multi-carrier advisory: Hurricane binders will trigger automated guidelines restrictions immediately upon active tropical warnings from NOAA. Please complete existing coastal residential and commercial proposals pro-actively.",
    "severity": "warning",
    "datePosted": "2026-06-06T12:00:00Z",
    "isActive": true
  }
];
