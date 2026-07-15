import { Calendar, Calendar1, CalendarArrowDown, BadgeDollarSign, AArrowDown, CalendarArrowUp, CalendarCheck, AArrowUp, ALargeSmall, Accessibility, LucideUserSearch, CalendarCheck2, CalendarClock, CalendarCog, Briefcase, BriefcaseBusiness, BriefcaseConveyorBelt, CableCar, BriefcaseMedical, Activity, ActivitySquare, LucideBriefcase, File, AirVent, LucidePlane, CalendarDays, Airplay, AlarmCheck, LucidePlaneLanding, AlarmClock, LucidePlaneTakeoff, Car, AlarmClockCheck, CircleDollarSign, CalendarFold, CarFront, Hotel, LucideHotel, AlarmClockMinus, DollarSign, Bed, BedDouble, CalendarHeart, CalendarMinus, LucideBadgeDollarSign, LucideCircleDollarSign, LucideDollarSign, AlarmClockOff, Bitcoin, AlarmClockPlus, Coins, HandCoins, LucideBitcoin, LucideCoins, LucideHandCoins, LucideWallet, FileArchive, FileAudio, FileAudio2, FileAxis3D, FileAxis3d, LucideShield, LucideShieldAlert, AlarmMinus, CarTaxiFront, AlarmPlus, Book, BookA, AlarmSmoke, Album, AlertCircle, Caravan, AlertOctagon, Carrot, AlertTriangle, BookAudio, LucideShieldBan, AlignCenter, LucideShieldCheck, CalendarMinus2, AlignCenterHorizontal, LucideShieldClose, AlignCenterVertical, AlignEndHorizontal, LucideShieldEllipsis, LucideUserSquare, CalendarOff, CalendarPlus, LucideTableOfContents, LucideTent, CalendarPlus2, AlignEndVertical, LucideWallet2, AlignHorizontalDistributeCenter, FileBadge, LucideBriefcaseBusiness, AlignHorizontalDistributeEnd, LucideWalletCards, CalendarRange, FileBadge2, AlignHorizontalDistributeStart, AlignHorizontalJustifyCenter, BedSingle, AlignHorizontalJustifyEnd, Camera, CameraOff, LucideCamera, AlignHorizontalJustifyStart, CalendarSearch, AlignHorizontalSpaceAround, AlignHorizontalSpaceBetween, AlignJustify, LucideUserSquare2, CalendarSync, CalendarX, CalendarX2, LucideCalendar, LucideCalendar1, LucideCalendarArrowDown, LucideCalendarArrowUp, LucideCalendarCheck, LucideCalendarCheck2 } from "lucide-react";
import { ToolResult } from "@/components/CategorySearch";

export type Tool = { name: string; slug: string; desc: string; icon: any; status: "live" | "soon" };
export type Category = { name: string; tools: Tool[] };

const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const mk = (entries: [string, string, any, boolean][]): Tool[] =>
  entries.map(([name, desc, icon, isLive]) => ({ name, desc, slug: slugify(name), icon, status: isLive ? "live" : "soon" }));

export const categories: Category[] = [
  {
    name: "Trip Planning",
    tools: mk([
      ["Trip Itinerary Builder", "Build a complete day-by-day trip itinerary", Calendar, true],
      ["Multi-City Trip Planner", "Plan a trip across multiple cities", Calendar1, false],
      ["Day-by-Day Itinerary Maker", "Map out activities for each day", CalendarArrowDown, false],
      ["Travel Budget Planner", "Plan and allocate your travel budget", BadgeDollarSign, false],
      ["Trip Duration Calculator", "Calculate ideal trip length", AArrowDown, false],
      ["Best Time to Visit Planner", "Find the best season for a destination", CalendarArrowUp, false],
      ["Travel Timeline Builder", "Build a visual travel timeline", CalendarCheck, false],
      ["Points of Interest Mapper", "Map out attractions to visit", AArrowUp, false],
      ["Travel Wish List Builder", "Create a list of dream destinations", ALargeSmall, false],
      ["Tour Route Optimizer", "Optimize the order of your stops", Accessibility, false],
      ["Group Trip Coordinator", "Coordinate trips with multiple people", LucideUserSearch, false],
      ["Honeymoon Planner", "Plan a romantic honeymoon trip", CalendarCheck2, false],
      ["Adventure Trip Planner", "Plan an adventure-focused trip", CalendarClock, false],
      ["Family Vacation Planner", "Plan a family-friendly vacation", CalendarCog, false],
    ]),
  },
  {
    name: "Packing & Preparation",
    tools: mk([
      ["Packing List Builder", "Build a customized packing list", Briefcase, false],
      ["Smart Packing Checklist", "Smart checklist based on trip details", BriefcaseBusiness, false],
      ["Climate-Based Packing Guide", "Pack based on destination climate", BriefcaseConveyorBelt, false],
      ["Carry-On vs Checked Bag Planner", "Decide what goes where", CableCar, false],
      ["Luggage Weight Tracker", "Track luggage weight per bag", BriefcaseMedical, false],
      ["Travel Essentials Checklist", "Never forget the essentials", Activity, false],
      ["Medication Travel Checklist", "Plan medications for travel", ActivitySquare, false],
      ["Electronics Packing Guide", "Pack your devices and adapters", LucideBriefcase, false],
      ["Travel Documents Checklist", "Track required documents", File, false],
      ["Special Needs Travel Prep Checklist", "Prep for accessibility needs", AirVent, false],
    ]),
  },
  {
    name: "Flights & Transport",
    tools: mk([
      ["Flight Time Zone Calculator", "Calculate flight times across zones", LucidePlane, false],
      ["Layover Duration Planner", "Plan productive layovers", CalendarDays, false],
      ["Jet Lag Calculator", "Estimate jet lag and recovery", Airplay, false],
      ["Airport Code Reference", "Look up airport IATA codes", AlarmCheck, false],
      ["Flight Distance Calculator", "Calculate distance between airports", LucidePlaneLanding, false],
      ["Seat Map Advisor", "Pick the best seat on board", AlarmClock, false],
      ["Airline Baggage Fee Comparator", "Compare baggage fees", LucidePlaneTakeoff, false],
      ["Road Trip Route Planner", "Plan your road trip route", Car, false],
      ["Driving Distance Estimator", "Estimate driving distance and time", AlarmClockCheck, false],
      ["Gas Cost Calculator", "Estimate fuel costs", CircleDollarSign, false],
      ["Public Transport Route Planner", "Plan transit routes", CalendarFold, false],
      ["Car Rental Checklist", "Checklist for renting a car", CarFront, false],
    ]),
  },
  {
    name: "Accommodation",
    tools: mk([
      ["Hotel Location Comparator", "Compare hotel locations", Hotel, false],
      ["Accommodation Type Comparator", "Compare hotel vs rental vs hostel", LucideHotel, false],
      ["Check-In/Check-Out Tracker", "Track check-in and out times", AlarmClockMinus, false],
      ["Short-Term Rental Cost Comparator", "Compare rental costs", DollarSign, false],
      ["Hostel Budget Calculator", "Budget for hostel stays", Bed, false],
      ["Airbnb vs Hotel Break-Even Calculator", "Find the cost break-even", BedDouble, false],
      ["Extended Stay Planner", "Plan a long-stay accommodation", CalendarHeart, false],
      ["Campsite Planner", "Plan your campsite stays", CalendarMinus, false],
    ]),
  },
  {
    name: "Currency & Budget",
    tools: mk([
      ["Travel Budget Tracker", "Track travel spending live", LucideBadgeDollarSign, false],
      ["Currency Exchange Rate Reference", "Offline exchange rate reference", LucideCircleDollarSign, false],
      ["Per Diem Budget Calculator", "Calculate daily budget per traveler", LucideDollarSign, false],
      ["Daily Spending Tracker", "Log daily spend categories", AlarmClockOff, false],
      ["Travel Cost Estimator by Country", "Estimate costs by destination", Bitcoin, false],
      ["Tipping Guide by Country", "Tipping norms worldwide", AlarmClockPlus, false],
      ["Budget vs Luxury Trip Comparator", "Compare trip styles", Coins, false],
      ["Cost of Living Comparison Tool", "Compare cities by cost", HandCoins, false],
      ["Travel Expense Report Builder", "Build expense reports", LucideBitcoin, false],
      ["Group Expense Splitter", "Split costs with travel buddies", LucideCoins, false],
      ["Travel Fund Saver Planner", "Plan how to save for a trip", LucideHandCoins, false],
      ["Travel Insurance Cost Reference", "Reference for insurance costs", LucideWallet, false],
    ]),
  },
  {
    name: "Visa & Documents",
    tools: mk([
      ["Visa Requirement Reference", "Look up visa requirements", FileArchive, false],
      ["Passport Validity Checker", "Check if your passport is valid", FileAudio, false],
      ["Travel Document Organizer", "Organize travel documents", FileAudio2, false],
      ["E-Visa Checklist", "Apply for e-visas with confidence", FileAxis3D, false],
      ["International Driving Permit Guide", "Get an IDP for your trip", FileAxis3d, false],
      ["Travel Insurance Checklist", "Choose the right coverage", LucideShield, false],
      ["Vaccination Requirement Reference", "Vaccines required per country", LucideShieldAlert, false],
      ["Entry Requirement Tracker", "Track entry requirements", AlarmMinus, false],
      ["Emergency Contact Card Builder", "Build a printable emergency card", CarTaxiFront, false],
      ["Travel Legal Reference Guide", "Key legal info per destination", AlarmPlus, false],
    ]),
  },
  {
    name: "Culture & Etiquette",
    tools: mk([
      ["Cultural Etiquette Guide by Country", "Avoid cultural missteps", Book, false],
      ["Tipping Etiquette Reference", "Tipping etiquette worldwide", BookA, false],
      ["Dress Code Guide by Destination", "What to wear where", AlarmSmoke, false],
      ["Greeting Customs Reference", "Greetings across cultures", Album, false],
      ["Religious Site Visitor Guide", "Visit holy sites respectfully", AlertCircle, false],
      ["Food Allergy Communication Card Builder", "Communicate allergies abroad", Caravan, false],
      ["Local Holiday Calendar", "See local holidays per country", AlertOctagon, false],
      ["Emergency Phrase Card Builder", "Build emergency phrase cards", Carrot, false],
      ["Time Zone Reference Map", "Time zones at a glance", AlertTriangle, false],
      ["Cultural Taboo Reference", "Avoid common cultural taboos", BookAudio, false],
    ]),
  },
  {
    name: "Safety & Health",
    tools: mk([
      ["Travel Safety Checklist", "Stay safe on the road", LucideShieldBan, false],
      ["Destination Risk Level Reference", "Check safety risk levels", AlignCenter, false],
      ["Travel Health Advisory Reference", "Latest health advisories", LucideShieldCheck, false],
      ["Vaccination Schedule Planner", "Plan your vaccine timeline", CalendarMinus2, false],
      ["Traveler's First Aid Checklist", "Pack a proper first aid kit", AlignCenterHorizontal, false],
      ["Emergency Services Numbers Reference", "Emergency numbers worldwide", LucideShieldClose, false],
      ["Typhoon/Hurricane Season Reference", "Storm seasons by region", AlignCenterVertical, false],
      ["Altitude Sickness Guide", "Prevent altitude sickness", AlignEndHorizontal, false],
      ["Food & Water Safety Guide", "Eat and drink safely abroad", LucideShieldEllipsis, false],
      ["Insect & Disease Prevention Guide", "Prevent bites and illness", LucideUserSquare, false],
    ]),
  },
  {
    name: "Solo & Adventure Travel",
    tools: mk([
      ["Solo Travel Safety Planner", "Plan a safe solo trip", CalendarOff, false],
      ["Solo Trip Itinerary Builder", "Itineraries built for one", CalendarPlus, false],
      ["Adventure Activity Risk Reference", "Know the risks before you go", LucideTableOfContents, false],
      ["Trekking & Hiking Prep Guide", "Prep for the trail", LucideTent, false],
      ["Camping Trip Planner", "Plan a great camping trip", CalendarPlus2, false],
      ["Off-Grid Travel Checklist", "Get ready to disconnect", AlignEndVertical, false],
      ["Long-Term Travel Budget Builder", "Budget for long trips", LucideWallet2, false],
      ["Digital Nomad Setup Guide", "Set up a nomad workflow", AlignHorizontalDistributeCenter, false],
      ["Work & Travel Visa Reference", "Working holiday visas", FileBadge, false],
      ["Backpacker Route Planner", "Plan your backpacking route", LucideBriefcaseBusiness, false],
    ]),
  },
  {
    name: "Business Travel",
    tools: mk([
      ["Business Trip Checklist", "Don't forget a thing", AlignHorizontalDistributeEnd, false],
      ["Business Expense Tracker", "Track business spend", LucideWalletCards, false],
      ["Conference Travel Planner", "Plan conference trips", CalendarRange, false],
      ["Business Visa Reference", "Business visa lookup", FileBadge2, false],
      ["Corporate Travel Policy Builder", "Build a travel policy", AlignHorizontalDistributeStart, false],
      ["Meeting Time Zone Scheduler", "Schedule across zones", AlignHorizontalJustifyCenter, false],
      ["Hotel Loyalty Points Tracker", "Track loyalty points", BedSingle, false],
      ["Travel Reimbursement Form Builder", "Build a reimbursement form", AlignHorizontalJustifyEnd, false],
    ]),
  },
  {
    name: "Travel Content & Memory",
    tools: mk([
      ["Travel Journal Builder", "Write a travel journal", Camera, false],
      ["Travel Photo Caption Generator", "Generate photo captions", CameraOff, false],
      ["Travel Blog Post Template", "Start a travel blog post", LucideCamera, false],
      ["Destination Review Template", "Review a destination", AlignHorizontalJustifyStart, false],
      ["Travel Memory Timeline", "Build a memory timeline", CalendarSearch, false],
      ["Trip Statistics Summary", "Summarize trip stats", AlignHorizontalSpaceAround, false],
      ["Travel Map Pin Builder", "Pin destinations on a map", AlignHorizontalSpaceBetween, false],
      ["Travel Bucket List Tracker", "Track your bucket list", AlignJustify, false],
    ]),
  },
  {
    name: "Group & Events Travel",
    tools: mk([
      ["Group Tour Coordinator", "Coordinate group tours", LucideUserSquare2, false],
      ["Wedding Destination Planner", "Plan a destination wedding", CalendarSync, false],
      ["Reunion Trip Planner", "Plan reunion trips", CalendarX, false],
      ["Team Retreat Planner", "Plan a team retreat", CalendarX2, false],
      ["Sports Tour Planner", "Plan a sports tour", LucideCalendar, false],
      ["Religious Pilgrimage Planner", "Plan a pilgrimage", LucideCalendar1, false],
      ["Educational Trip Planner", "Plan educational tours", LucideCalendarArrowDown, false],
      ["Volunteer Travel Planner", "Plan volunteer trips", LucideCalendarArrowUp, false],
      ["Festival Trip Planner", "Plan around festivals", LucideCalendarCheck, false],
      ["Cruise Itinerary Planner", "Plan a cruise itinerary", LucideCalendarCheck2, false],
    ]),
  },
];

export const allTools: Tool[] = categories.flatMap((c) => c.tools);
export const totalCount = allTools.length;

export const findTool = (slug: string) => allTools.find((t) => (t as any).slug === slug);
export const findCategoryOfTool = (slug: string) =>
  categories.find((c) => c.tools.some((t) => (t as any).slug === slug));

export const SEARCH_REGISTRY: ToolResult[] = categories.flatMap((cat) =>
  cat.tools.map((tool) => ({
    name: tool.name,
    description: tool.desc,
    slug: tool.slug,
    href: `/travel/tool/${tool.slug}`,
    category: cat.name,
    isBuilt: tool.status === "live",
  }))
);
