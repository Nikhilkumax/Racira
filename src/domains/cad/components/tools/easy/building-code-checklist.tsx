"use client";

import { Checklist, Panel, PanelTitle } from "./ui";

/**
 * Building Code Checklist — common code-review items for a set of drawings
 * (IBC-based, generalized). A live checklist: check items off, progress tracks
 * at the top. Not a substitute for the jurisdiction's adopted code.
 */
export default function BuildingCodeChecklist() {
  return (
    <Panel>
      <PanelTitle>Code review checklist — drawings</PanelTitle>
      <Checklist
        testid="code-checklist"
        groups={[
          {
            name: "Egress & exits",
            items: [
              "At least two means of egress from every occupied space where required",
              "Exit / egress travel distance within allowable limits for the occupancy",
              "Exit doors swing in the direction of travel (occupant loads > 50)",
              "Door clear width ≥ 32 in and corridor width ≥ 44 in (or per occupancy)",
              "No exit path passes through a room that can be locked",
            ],
          },
          {
            name: "Accessibility (ADA / IBC Ch. 11)",
            items: [
              "Accessible route from arrival point to all accessible spaces",
              "Ramp slope ≤ 1:12 with landings at top, bottom and every 30 in of rise",
              "Clear floor space at doors: 30×48 in, maneuvering clearance on pull side",
              "Restroom clearances: 60 in turning space (or T-turn), clearances at fixtures",
              "Signage with raised characters / braille at permanent rooms",
            ],
          },
          {
            name: "Fire & separation",
            items: [
              "Fire-resistance ratings of walls/floors match the construction type and separations",
              "Firestopping / fire dampers shown at penetrations of rated assemblies",
              "Vertical openings (stairs, shafts) enclosed per code",
              "Combustible cladding / exterior wall requirements checked",
              "Fire hydrant / access for fire apparatus per local requirements",
            ],
          },
          {
            name: "General drawing review",
            items: [
              "Title block: project, drawing number, scale, north arrow, revision status",
              "Dimension set consistent across plans/sections/elevations",
              "Material and finish schedule matches notes and details",
              "Occupancy classification and construction type noted on cover sheet",
              "Energy code compliance path stated (and envelope details match it)",
            ],
          },
        ]}
      />
      <p className="mt-3 text-xs text-muted-foreground">
        Generalized review list only — verify every item against the edition of the code the jurisdiction has
        adopted and any local amendments.
      </p>
    </Panel>
  );
}
