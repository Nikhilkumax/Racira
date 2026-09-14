"use client";

import { RefTable } from "./ui";

/**
 * Seismic Zone Reference — seismic design categories (ASCE 7 / IBC), how they
 * are derived from the mapped spectral accelerations, and the risk categories
 * that combine with them.
 */

const SDC_ROWS: [string, string, string, string][] = [
  ["A", "Very low", "Ss < 0.15 g or S1 < 0.04 g", "Very low hazard; minimal seismic detailing (still follow Chapter 11 basics)"],
  ["B", "Low", "Ss < 0.15 g / S1 < 0.04 g not met, but below moderate thresholds", "Most of the central/eastern US interior"],
  ["C", "Moderate", "Moderate mapped accelerations", "Ordinary detailing with some restrictions"],
  ["D", "High", "Higher mapped accelerations (common on the US West Coast)", "Special detailing required; most California design"],
  ["E", "Very high", "S1 ≥ 0.75 g", "Near-fault zones; more restrictions (e.g. certain systems prohibited)"],
  ["F", "Extreme", "Site-specific ground motion required", "Near very large faults; geotechnical site response study mandatory"],
];

const RISK_ROWS: [string, string][] = [
  ["I", "Low occupancy / low hazard to life (agricultural, minor storage)"],
  ["II", "Most buildings (default category)"],
  ["III", "Substantial hazard to life or high occupancy (schools > 250, assembly > 300)"],
  ["IV", "Essential facilities (hospitals, fire stations, emergency comms)"],
];

export default function SeismicZoneReference() {
  return (
    <div className="space-y-5">
      <RefTable
        title="Seismic Design Categories (ASCE 7-22 / IBC)"
        search
        cols={["SDC", "Hazard", "Indicator values", "Meaning for design"]}
        rows={SDC_ROWS.map((r) => r)}
      />
      <RefTable
        title="Risk categories (IBC Table 1604.5)"
        search
        cols={["Category", "Typical assignment"]}
        rows={RISK_ROWS.map((r) => r)}
        note="SDC is found from the mapped Ss and S1 at the site (ASCE 7 maps / USGS tools), the site class, and the risk category — the tables above summarize the outcome, not the lookup. Seismic design category is not the same as the old UBC seismic zone numbers (1–4), which this table intentionally replaces."
      />
    </div>
  );
}
