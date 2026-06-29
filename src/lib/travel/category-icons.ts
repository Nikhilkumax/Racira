import { Compass, Map, Wallet, Plane, Building2, Globe, ShieldCheck, Mountain, Briefcase, BookOpen, Users, Backpack, Camera, type LucideIcon } from "lucide-react";

export const categoryIcons: Record<string, LucideIcon> = {
  "Trip Planning": Map,
  "Packing & Preparation": Backpack,
  "Flights & Transport": Plane,
  "Accommodation": Building2,
  "Currency & Budget": Wallet,
  "Visa & Documents": BookOpen,
  "Culture & Etiquette": Globe,
  "Safety & Health": ShieldCheck,
  "Solo & Adventure Travel": Mountain,
  "Business Travel": Briefcase,
  "Travel Content & Memory": Camera,
  "Group & Events Travel": Users,
};

export const fallbackIcon = Compass;
