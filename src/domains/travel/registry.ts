export type Tool = { name: string; slug: string; desc: string };
export type Category = { name: string; tools: Tool[] };

const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const mk = (entries: [string, string][]): Tool[] =>
  entries.map(([name, desc]) => ({ name, desc, slug: slugify(name) }));

export const categories: Category[] = [
  {
    name: "Trip Planning",
    tools: mk([
      ["Trip Itinerary Builder", "Build a complete day-by-day trip itinerary"],
      ["Multi-City Trip Planner", "Plan a trip across multiple cities"],
      ["Day-by-Day Itinerary Maker", "Map out activities for each day"],
      ["Travel Budget Planner", "Plan and allocate your travel budget"],
      ["Trip Duration Calculator", "Calculate ideal trip length"],
      ["Best Time to Visit Planner", "Find the best season for a destination"],
      ["Travel Timeline Builder", "Build a visual travel timeline"],
      ["Points of Interest Mapper", "Map out attractions to visit"],
      ["Travel Wish List Builder", "Create a list of dream destinations"],
      ["Tour Route Optimizer", "Optimize the order of your stops"],
      ["Group Trip Coordinator", "Coordinate trips with multiple people"],
      ["Honeymoon Planner", "Plan a romantic honeymoon trip"],
      ["Adventure Trip Planner", "Plan an adventure-focused trip"],
      ["Family Vacation Planner", "Plan a family-friendly vacation"],
    ]),
  },
  {
    name: "Packing & Preparation",
    tools: mk([
      ["Packing List Builder", "Build a customized packing list"],
      ["Smart Packing Checklist", "Smart checklist based on trip details"],
      ["Climate-Based Packing Guide", "Pack based on destination climate"],
      ["Carry-On vs Checked Bag Planner", "Decide what goes where"],
      ["Luggage Weight Tracker", "Track luggage weight per bag"],
      ["Travel Essentials Checklist", "Never forget the essentials"],
      ["Medication Travel Checklist", "Plan medications for travel"],
      ["Electronics Packing Guide", "Pack your devices and adapters"],
      ["Travel Documents Checklist", "Track required documents"],
      ["Special Needs Travel Prep Checklist", "Prep for accessibility needs"],
    ]),
  },
  {
    name: "Flights & Transport",
    tools: mk([
      ["Flight Time Zone Calculator", "Calculate flight times across zones"],
      ["Layover Duration Planner", "Plan productive layovers"],
      ["Jet Lag Calculator", "Estimate jet lag and recovery"],
      ["Airport Code Reference", "Look up airport IATA codes"],
      ["Flight Distance Calculator", "Calculate distance between airports"],
      ["Seat Map Advisor", "Pick the best seat on board"],
      ["Airline Baggage Fee Comparator", "Compare baggage fees"],
      ["Road Trip Route Planner", "Plan your road trip route"],
      ["Driving Distance Estimator", "Estimate driving distance and time"],
      ["Gas Cost Calculator", "Estimate fuel costs"],
      ["Public Transport Route Planner", "Plan transit routes"],
      ["Car Rental Checklist", "Checklist for renting a car"],
    ]),
  },
  {
    name: "Accommodation",
    tools: mk([
      ["Hotel Location Comparator", "Compare hotel locations"],
      ["Accommodation Type Comparator", "Compare hotel vs rental vs hostel"],
      ["Check-In/Check-Out Tracker", "Track check-in and out times"],
      ["Short-Term Rental Cost Comparator", "Compare rental costs"],
      ["Hostel Budget Calculator", "Budget for hostel stays"],
      ["Airbnb vs Hotel Break-Even Calculator", "Find the cost break-even"],
      ["Extended Stay Planner", "Plan a long-stay accommodation"],
      ["Campsite Planner", "Plan your campsite stays"],
    ]),
  },
  {
    name: "Currency & Budget",
    tools: mk([
      ["Travel Budget Tracker", "Track travel spending live"],
      ["Currency Exchange Rate Reference", "Offline exchange rate reference"],
      ["Per Diem Budget Calculator", "Calculate daily budget per traveler"],
      ["Daily Spending Tracker", "Log daily spend categories"],
      ["Travel Cost Estimator by Country", "Estimate costs by destination"],
      ["Tipping Guide by Country", "Tipping norms worldwide"],
      ["Budget vs Luxury Trip Comparator", "Compare trip styles"],
      ["Cost of Living Comparison Tool", "Compare cities by cost"],
      ["Travel Expense Report Builder", "Build expense reports"],
      ["Group Expense Splitter", "Split costs with travel buddies"],
      ["Travel Fund Saver Planner", "Plan how to save for a trip"],
      ["Travel Insurance Cost Reference", "Reference for insurance costs"],
    ]),
  },
  {
    name: "Visa & Documents",
    tools: mk([
      ["Visa Requirement Reference", "Look up visa requirements"],
      ["Passport Validity Checker", "Check if your passport is valid"],
      ["Travel Document Organizer", "Organize travel documents"],
      ["E-Visa Checklist", "Apply for e-visas with confidence"],
      ["International Driving Permit Guide", "Get an IDP for your trip"],
      ["Travel Insurance Checklist", "Choose the right coverage"],
      ["Vaccination Requirement Reference", "Vaccines required per country"],
      ["Entry Requirement Tracker", "Track entry requirements"],
      ["Emergency Contact Card Builder", "Build a printable emergency card"],
      ["Travel Legal Reference Guide", "Key legal info per destination"],
    ]),
  },
  {
    name: "Culture & Etiquette",
    tools: mk([
      ["Cultural Etiquette Guide by Country", "Avoid cultural missteps"],
      ["Tipping Etiquette Reference", "Tipping etiquette worldwide"],
      ["Dress Code Guide by Destination", "What to wear where"],
      ["Greeting Customs Reference", "Greetings across cultures"],
      ["Religious Site Visitor Guide", "Visit holy sites respectfully"],
      ["Food Allergy Communication Card Builder", "Communicate allergies abroad"],
      ["Local Holiday Calendar", "See local holidays per country"],
      ["Emergency Phrase Card Builder", "Build emergency phrase cards"],
      ["Time Zone Reference Map", "Time zones at a glance"],
      ["Cultural Taboo Reference", "Avoid common cultural taboos"],
    ]),
  },
  {
    name: "Safety & Health",
    tools: mk([
      ["Travel Safety Checklist", "Stay safe on the road"],
      ["Destination Risk Level Reference", "Check safety risk levels"],
      ["Travel Health Advisory Reference", "Latest health advisories"],
      ["Vaccination Schedule Planner", "Plan your vaccine timeline"],
      ["Traveler's First Aid Checklist", "Pack a proper first aid kit"],
      ["Emergency Services Numbers Reference", "Emergency numbers worldwide"],
      ["Typhoon/Hurricane Season Reference", "Storm seasons by region"],
      ["Altitude Sickness Guide", "Prevent altitude sickness"],
      ["Food & Water Safety Guide", "Eat and drink safely abroad"],
      ["Insect & Disease Prevention Guide", "Prevent bites and illness"],
    ]),
  },
  {
    name: "Solo & Adventure Travel",
    tools: mk([
      ["Solo Travel Safety Planner", "Plan a safe solo trip"],
      ["Solo Trip Itinerary Builder", "Itineraries built for one"],
      ["Adventure Activity Risk Reference", "Know the risks before you go"],
      ["Trekking & Hiking Prep Guide", "Prep for the trail"],
      ["Camping Trip Planner", "Plan a great camping trip"],
      ["Off-Grid Travel Checklist", "Get ready to disconnect"],
      ["Long-Term Travel Budget Builder", "Budget for long trips"],
      ["Digital Nomad Setup Guide", "Set up a nomad workflow"],
      ["Work & Travel Visa Reference", "Working holiday visas"],
      ["Backpacker Route Planner", "Plan your backpacking route"],
    ]),
  },
  {
    name: "Business Travel",
    tools: mk([
      ["Business Trip Checklist", "Don't forget a thing"],
      ["Business Expense Tracker", "Track business spend"],
      ["Conference Travel Planner", "Plan conference trips"],
      ["Business Visa Reference", "Business visa lookup"],
      ["Corporate Travel Policy Builder", "Build a travel policy"],
      ["Meeting Time Zone Scheduler", "Schedule across zones"],
      ["Hotel Loyalty Points Tracker", "Track loyalty points"],
      ["Travel Reimbursement Form Builder", "Build a reimbursement form"],
    ]),
  },
  {
    name: "Travel Content & Memory",
    tools: mk([
      ["Travel Journal Builder", "Write a travel journal"],
      ["Travel Photo Caption Generator", "Generate photo captions"],
      ["Travel Blog Post Template", "Start a travel blog post"],
      ["Destination Review Template", "Review a destination"],
      ["Travel Memory Timeline", "Build a memory timeline"],
      ["Trip Statistics Summary", "Summarize trip stats"],
      ["Travel Map Pin Builder", "Pin destinations on a map"],
      ["Travel Bucket List Tracker", "Track your bucket list"],
    ]),
  },
  {
    name: "Group & Events Travel",
    tools: mk([
      ["Group Tour Coordinator", "Coordinate group tours"],
      ["Wedding Destination Planner", "Plan a destination wedding"],
      ["Reunion Trip Planner", "Plan reunion trips"],
      ["Team Retreat Planner", "Plan a team retreat"],
      ["Sports Tour Planner", "Plan a sports tour"],
      ["Religious Pilgrimage Planner", "Plan a pilgrimage"],
      ["Educational Trip Planner", "Plan educational tours"],
      ["Volunteer Travel Planner", "Plan volunteer trips"],
      ["Festival Trip Planner", "Plan around festivals"],
      ["Cruise Itinerary Planner", "Plan a cruise itinerary"],
    ]),
  },
];

export const allTools: Tool[] = categories.flatMap((c) => c.tools);
export const totalCount = allTools.length;

export const findTool = (slug: string) => allTools.find((t) => (t as any).slug === slug);
export const findCategoryOfTool = (slug: string) =>
  categories.find((c) => c.tools.some((t) => (t as any).slug === slug));
