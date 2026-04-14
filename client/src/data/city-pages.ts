export type CityPageData = {
  slug: string;
  name: string;
  county: string;
  headline: string;
  subheadline: string;
  areaBlurb: string;
  neighborhoods: string[];
  zipCodes: string[];
  faq: Array<{ question: string; answer: string }>;
};

export const cityPages: CityPageData[] = [
  {
    slug: "decatur",
    name: "Decatur",
    county: "DeKalb County",
    headline: "TV Mounting & Smart Home Installation in Decatur, GA",
    subheadline: "Professional, same-evening service for Decatur homeowners and renters.",
    areaBlurb:
      "We serve all of Decatur and the surrounding DeKalb County communities. Whether you're in a historic bungalow near downtown Decatur Square or a newer build off Ponce de Leon, we'll get your TV on the wall cleanly — wires concealed, mount level, setup complete.",
    neighborhoods: ["Downtown Decatur", "Oakhurst", "Winnona Park", "Fattoria", "Clairemont"],
    zipCodes: ["30030", "30031", "30032", "30033"],
    faq: [
      {
        question: "Do you serve apartments in Decatur?",
        answer:
          "Yes — apartments, condos, and single-family homes alike. We bring all necessary hardware and patch any small holes from prior mounts.",
      },
      {
        question: "Can you mount above a fireplace in a Decatur home?",
        answer:
          "Absolutely. Fireplace mounts start at $200. We assess the mantel height, heat exposure, and cable routing before confirming final pricing.",
      },
      {
        question: "How soon can I book in Decatur?",
        answer:
          "Weekend same-day bookings require 2 hours notice. Weekday evening slots (after 5:30 PM) are also available. Use our online booking tool to lock in a time.",
      },
    ],
  },
  {
    slug: "buckhead",
    name: "Buckhead",
    county: "Fulton County",
    headline: "TV Mounting & Smart Home Installation in Buckhead, Atlanta",
    subheadline: "White-glove TV mounting and smart device setup for Buckhead residences.",
    areaBlurb:
      "Buckhead's high-rise condos, luxury townhomes, and classic estates get the same precise, damage-free installation we're known for across Atlanta. We handle stucco, brick, and high-ceilinged drywall walls — and we always clean up before we leave.",
    neighborhoods: ["Buckhead Village", "Garden Hills", "Tuxedo Park", "Peachtree Hills", "Paces Ferry"],
    zipCodes: ["30305", "30327", "30342"],
    faq: [
      {
        question: "Do you install in Buckhead high-rises?",
        answer:
          "Yes. We're comfortable with concrete and drywall over metal stud construction common in Buckhead condos. We use appropriate anchors for each wall type.",
      },
      {
        question: "Can you conceal cables in my Buckhead townhome?",
        answer:
          "Yes. Standard wire concealment starts at $100 per TV. For complex cable paths or outlet relocation, we assess on-site and confirm pricing before work begins.",
      },
      {
        question: "Do you install security cameras in Buckhead?",
        answer:
          "Yes — Ring, Arlo, Nest, Blink, and others. We handle both wireless and wired smart camera setups. Pricing starts at $65 per camera.",
      },
    ],
  },
  {
    slug: "marietta",
    name: "Marietta",
    county: "Cobb County",
    headline: "TV Mounting & Smart Home Installation in Marietta, GA",
    subheadline: "Reliable evening and weekend TV installs across Marietta and Cobb County.",
    areaBlurb:
      "From the East Cobb suburbs to historic neighborhoods near Marietta Square, we cover all of Marietta. Weekend and weekday evening appointments available — we work around your schedule so installation doesn't require taking time off.",
    neighborhoods: ["East Cobb", "West Marietta", "Kennesaw Mountain", "Marietta Square", "Lost Mountain"],
    zipCodes: ["30060", "30062", "30064", "30066", "30067", "30068"],
    faq: [
      {
        question: "How far is Marietta from your home base?",
        answer:
          "We operate out of the Atlanta metro and serve all of Marietta with no travel surcharge for most Cobb County ZIP codes. Enter your ZIP in our quote tool to confirm.",
      },
      {
        question: "Can you mount a TV above a brick fireplace in Marietta?",
        answer:
          "Yes. Brick and stone wall mounting is a specialty. We use masonry anchors and confirm cable routing options before finalizing pricing.",
      },
      {
        question: "Do you offer same-day appointments in Marietta?",
        answer:
          "Same-day weekend slots are available with 2 hours notice. Weekday evening slots start at 5:30 PM. Book online or call 404-702-4748.",
      },
    ],
  },
  {
    slug: "alpharetta",
    name: "Alpharetta",
    county: "Fulton County",
    headline: "TV Mounting & Smart Home Installation in Alpharetta, GA",
    subheadline: "Professional TV mounting for Alpharetta homes — evenings and weekends.",
    areaBlurb:
      "Alpharetta's newer subdivisions and tech-corridor townhomes are ideal for clean wire concealment and smart home upgrades. We install security cameras, doorbells, soundbars, and TV mounts — all in a single visit when schedules allow.",
    neighborhoods: ["Downtown Alpharetta", "Avalon", "Windward", "Milton", "Providence"],
    zipCodes: ["30004", "30005", "30009", "30022"],
    faq: [
      {
        question: "Can you do a multi-room TV install in Alpharetta in one visit?",
        answer:
          "Yes — we handle 2-4 TVs in a single appointment for most homes. Use our quote tool to configure each room and get a bundled price.",
      },
      {
        question: "Is there a travel fee for Alpharetta?",
        answer:
          "Alpharetta is within our extended service area. A small travel fee may apply depending on your exact ZIP code — enter it in our quote tool for a precise number.",
      },
      {
        question: "Do you install Nest or Ring doorbells in Alpharetta?",
        answer:
          "Yes. Smart doorbell installation starts at $85. We handle the wiring, setup, and app pairing.",
      },
    ],
  },
  {
    slug: "midtown-atlanta",
    name: "Midtown Atlanta",
    county: "Fulton County",
    headline: "TV Mounting & Smart Home Installation in Midtown Atlanta",
    subheadline: "Expert TV and smart home installs for Midtown condos and lofts.",
    areaBlurb:
      "Midtown's mix of historic bungalows, converted lofts, and modern high-rises requires experience with all wall types. We work in open-plan spaces, concrete ceilings, and brick industrial walls — no fuss, just a clean install.",
    neighborhoods: ["Arts Center", "Ansley Park", "Virginia-Highland", "Ponce City Market area", "Tech Square"],
    zipCodes: ["30308", "30309", "30363"],
    faq: [
      {
        question: "Can you mount a TV on a brick loft wall in Midtown?",
        answer:
          "Yes. Brick and concrete wall mounting starts at $25 above our standard rate and requires masonry anchors. We confirm feasibility before booking.",
      },
      {
        question: "Do you work in Midtown high-rise condos?",
        answer:
          "Yes — we're familiar with Midtown condo construction types. We bring appropriate anchors for metal stud and concrete walls.",
      },
      {
        question: "How do I book a TV mount in Midtown Atlanta?",
        answer:
          "Use our online booking tool to pick a time and lock in your slot. Evening and weekend availability — no parking hassle, we find our way.",
      },
    ],
  },
  {
    slug: "roswell",
    name: "Roswell",
    county: "Fulton County",
    headline: "TV Mounting & Smart Home Installation in Roswell, GA",
    subheadline: "Trusted TV installation for Roswell families — evenings and weekends.",
    areaBlurb:
      "Roswell's established neighborhoods and newer subdivisions are a regular stop for us. Whether it's a family room TV, a primary bedroom mount, or a full home camera system, we bring the gear and leave the space better than we found it.",
    neighborhoods: ["Historic Roswell", "East Roswell", "Crabapple", "Mountain Park", "Chattahoochee Plantation"],
    zipCodes: ["30075", "30076"],
    faq: [
      {
        question: "Do you install security cameras in Roswell?",
        answer:
          "Yes — wireless and wired setups. Ring, Arlo, Nest, Blink, and others. Pricing starts at $65 per camera including mount and app setup.",
      },
      {
        question: "Can you handle a multi-TV install in a Roswell home?",
        answer:
          "Absolutely. We configure each TV individually in our quote tool — different wall types, different mount styles, different rooms. Bundle pricing applies for 2+ TVs.",
      },
      {
        question: "What's your availability in Roswell?",
        answer:
          "Weekday evenings start at 5:30 PM. Weekend slots run 10 AM to 9:30 PM. Book online or call 404-702-4748 to confirm.",
      },
    ],
  },
  {
    slug: "lawrenceville",
    name: "Lawrenceville",
    county: "Gwinnett County",
    headline: "TV Mounting & Smart Home Installation in Lawrenceville, GA",
    subheadline: "Professional TV and smart home installs across Lawrenceville and Gwinnett County.",
    areaBlurb:
      "Lawrenceville and the surrounding Gwinnett communities are a regular part of our service area. New construction or older home — we mount cleanly and leave no mess behind. A small travel fee may apply for certain Gwinnett ZIP codes.",
    neighborhoods: ["Historic Lawrenceville", "Sugarloaf", "Hamilton Mill", "Collins Hill", "Snellville"],
    zipCodes: ["30043", "30044", "30045", "30046"],
    faq: [
      {
        question: "Is there a travel fee for Lawrenceville?",
        answer:
          "Possibly a small fee depending on your ZIP code. Enter your ZIP in our online quote tool to get the exact travel cost — no surprises.",
      },
      {
        question: "Do you work in new construction homes in Gwinnett County?",
        answer:
          "Yes. New builds are actually ideal — clean drywall, easy stud access, pre-wired spaces. We're experienced with builder-grade and custom homes.",
      },
      {
        question: "Can you mount a TV and set up a security camera in one visit?",
        answer:
          "Yes. We can combine TV mounting, wire concealment, and smart home device setup in a single appointment. Use the quote tool to bundle services.",
      },
    ],
  },
  {
    slug: "sandy-springs",
    name: "Sandy Springs",
    county: "Fulton County",
    headline: "TV Mounting & Smart Home Installation in Sandy Springs, GA",
    subheadline: "Same-evening TV installs for Sandy Springs homes and apartments.",
    areaBlurb:
      "Sandy Springs — from Perimeter Center to Dunwoody borders — is well within our home zone. No travel fee for most Sandy Springs ZIP codes. Evening and weekend appointments available for homeowners, renters, and short-term rentals.",
    neighborhoods: ["Perimeter Center", "Hammond Park", "Dunwoody-adjacent", "Northridge", "Johnson Ferry"],
    zipCodes: ["30328", "30338", "30350"],
    faq: [
      {
        question: "Is Sandy Springs in your free travel zone?",
        answer:
          "Yes — most Sandy Springs ZIP codes (30328, 30338, 30350) fall within our no-travel-fee home zone. Confirm with your ZIP in the quote tool.",
      },
      {
        question: "Do you do TV installs in Sandy Springs apartments?",
        answer:
          "Yes. We're familiar with the large apartment complexes near Perimeter. We use appropriate anchors for your wall type and patch prior mount holes on request.",
      },
      {
        question: "How do I book in Sandy Springs?",
        answer:
          "Book online 24/7 — pick your date and time, we hold the slot. You can also call 404-702-4748 for immediate scheduling.",
      },
    ],
  },
];

export function getCityBySlug(slug: string): CityPageData | undefined {
  return cityPages.find((city) => city.slug === slug);
}
