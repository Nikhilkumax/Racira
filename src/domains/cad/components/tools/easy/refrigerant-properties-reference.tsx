"use client";

import { RefTable } from "./ui";

/**
 * Refrigerant Properties Reference — key physical/environmental properties of
 * common refrigerants. Values are typical published figures (ASHRAE 34 safety
 * class shown); always confirm against the current standard edition.
 */

const ROWS: [string, string, string, string, string, string, string][] = [
  ["R-22 (HCFC)", "HCFC", "−40.8 °C", "96.1 °C", "1810", "0.05", "Legacy AC — being phased out (Montreal Protocol)"],
  ["R-134a (HFC)", "HFC", "−26.1 °C", "101.1 °C", "1430", "0", "Legacy auto & medium-temp; being phased down"],
  ["R-410A (HFC blend)", "HFC blend", "−51.4 °C", "72.8 °C", "2088", "0", "Residential/commercial DX AC (transitioning to A2L)"],
  ["R-32 (HFC)", "HFC", "−51.7 °C", "78.1 °C", "675", "0", "New residential AC — mildly flammable (A2L)"],
  ["R-404A (HFC blend)", "HFC blend", "−46.6 °C", "72.1 °C", "3922", "0", "Legacy supermarket low-temp; high GWP"],
  ["R-507A (azeotrope)", "HFC azeotrope", "−46.7 °C", "70.6 °C", "3985", "0", "Low-temp / freezer systems"],
  ["R-290 (propane)", "HC", "−42.1 °C", "96.7 °C", "3", "0", "Small hermetic systems — flammable (A3), charge limits apply"],
  ["R-744 (CO₂)", "Natural", "−78.5 °C (subl.)", "31.1 °C", "1", "0", "Transcritical systems, supermarket & heat pump"],
  ["R-1234yf (HFO)", "HFO", "−29.5 °C", "94.7 °C", "<1", "0", "Automotive AC — mildly flammable (A2L)"],
  ["R-717 (ammonia)", "Natural", "−33.3 °C", "132.4 °C", "0", "0", "Industrial refrigeration — toxic (B2L), machine rooms"],
];

export default function RefrigerantPropertiesReference() {
  return (
    <RefTable
      title="Refrigerant properties (typical published values)"
      search
      cols={["Refrigerant", "Class", "Boiling pt (1 atm)", "Critical temp", "GWP (100-yr)", "ODP", "Typical use / notes"]}
      rows={ROWS.map((r) => r)}
      note="GWP values vary by reporting period (AR4 vs AR5) and edition; treat them as comparison magnitudes. Regulation is moving fast: F-Gas phase-downs (EU 2024+) and Kigali Amendment targets drive selection toward A2L and natural refrigerants."
    />
  );
}
