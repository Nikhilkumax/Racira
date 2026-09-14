"use client";

import { RefTable } from "./ui";

/**
 * Pipe Material Reference — common piping materials with joining method,
 * typical service and temperature limits (for concept/reference use; always
 * check the governing code — ASME B31.x, IPC, etc.).
 */

const ROWS: [string, string, string, string, string][] = [
  ["Carbon steel (A53/A106)", "Sch 40/80, welded/seamless", "Water, steam, oil, gas up to high pressure", "Up to ~425 °C (A106-B)", "Threaded/welded/flanged; the default industrial pipe"],
  ["Stainless steel 304/316", "Sch 10S–40S", "Corrosive fluids, food/beverage, pharma, ultrapure", "Up to ~400 °C (derates)", "Welded (orbital for clean service); 316L for chlorides"],
  ["Copper (K / L / M)", "ASTM B88 wall grades", "Potable water, HVAC refrigerant & hydronic", "Up to ~200 °C", "Soldered/brazed, press-fit; L for most plumbing, K for buried"],
  ["PVC (uPVC)", "Sch 40/80 (ASTM D1785)", "Cold water drainage, chemical waste", "Up to 60 °C", "Solvent-welded; NOT for hot water or compressed air"],
  ["CPVC", "Sch 40/80", "Hot & cold water (residential/commercial)", "Up to ~93 °C", "Solvent-welded with CPVC cement"],
  ["PEX", "CTS sizes", "Potable water distribution, radiant heating", "Up to ~82 °C (peak higher)", "Crimp/expansion/press fittings; no fittings buried"],
  ["HDPE (PE100)", "SDR 11/17", "Water mains, gas, sewer, trenchless", "Up to ~60 °C water", "Butt/electrofusion; very corrosion resistant"],
  ["Ductile iron", "DI classes 50–56", "Water mains, sewer force mains", "~50 °C typical", "Push-on/mechanical joints, restrained for thrust"],
  ["Cast iron (hub & spigot / no-hub)", "—", "Sanitary drainage (legacy & new no-hub)", "Hot waste OK", "No-hub couplings for DWV; very common in multi-storey"],
  ["Galvanized steel", "Sch 40", "Legacy water, compressed air (discouraged)", "Up to ~65 °C", "Threaded; scale build-up over time; avoid for potable new work"],
];

export default function PipeMaterialReference() {
  return (
    <RefTable
      title="Pipe materials at a glance"
      search
      cols={["Material", "Common schedule/type", "Typical service", "Max temp (nominal)", "Joining / notes"]}
      rows={ROWS.map((r) => r)}
      note="Ratings are indicative, not code values. Sizing and pressure rating must follow the applicable code (ASME B31.1/B31.3/B31.9, IPC, NFPA 13…) and the manufacturer’s published ratings."
    />
  );
}
