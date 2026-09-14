"use client";

import { RefTable } from "./ui";

/**
 * G-Code Reference Viewer — the everyday G and M codes for milling centres
 * (ISO 6983 / Fanuc-style dialect). Codes shown are the ones a CAD/CAM user
 * actually sees in posted output and needs to read when proving out a program.
 */

const CODE: [string, string, string, string, string][] = [
  ["G00", "Rapid motion", "Move at maximum rate", "G00 X25.4 Y10.", "Never position to a feature with G00 — always a clearance plane first."],
  ["G01", "Linear feed", "Straight cut at feed rate", "G01 X25.4 Y10. F300", "F is per-minute feed. G01 cancels G00/G02/G03."],
  ["G02 / G03", "Circular feed", "Arc CW (G02) / CCW (G03)", "G02 X10. Y10. I5. J0 F200", "I/J = arc centre offset from start. R format (G02 X.. Y.. R..) is simpler but ambiguous past 180°."],
  ["G04", "Dwell", "Pause for P milliseconds", "G04 P1000", "Used to let a spindle reach speed or a tool clean a hole bottom."],
  ["G17 / G18 / G19", "Plane select", "XY / XZ / YZ work plane", "G17", "G17 (XY) is the default for most milling."],
  ["G20 / G21", "Units", "Inch / metric", "G21", "G21 = mm. Confirm before running — the most common unit mistake is a missing G21."],
  ["G28", "Return home", "Rapid to machine reference", "G28 G91 Z0", "G91 Z0 first lifts to the tool-change position, then rapids home."],
  ["G40 / G41 / G42", "Cutter compensation", "Off / left / right", "G41 D1", "Comp is applied on a lead-in move ≥ tool radius; D holds the offset. G40 cancels."],
  ["G43 / G49", "Tool length", "Compensate / cancel", "G43 H1 Z10.", "H holds the length offset. Never cut without an active G43."],
  ["G54 – G59", "Work offsets", "Fixture coordinate systems", "G54", "G54 is the primary fixture. A program with one part per fixture repeats on G55, G56…"],
  ["G80", "Canned cycle cancel", "Cancel drill/bore cycles", "G80", "Always cancel after the cycle block or the next move will repeat the cycle."],
  ["G81", "Drill cycle", "Spot / through drill", "G81 X10. Y10. Z-12. R2. F150", "R = rapid plane above the part; Z = hole bottom."],
  ["G83", "Peck drill cycle", "Deep-hole pecking", "G83 X10. Y10. Z-40. R2. Q5. F120", "Q = peck depth per pass. Needed below ~3× diameter in most materials."],
  ["G84", "Tap cycle", "Rigid tapping", "G84 X10. Y10. Z-15. R2. F450", "F must equal lead × spindle speed. Rigid tapping synchronises spindle and axis."],
  ["G90 / G91", "Positioning", "Absolute / incremental", "G90", "Absolute (G90) is the norm for CAM output; G91 appears inside cycles and at G28."],
  ["G94 / G95", "Feed mode", "Per minute / per revolution", "G94", "G95 (feed per rev) is standard for turning; milling posts usually emit G94."],
  ["M00 / M01", "Program stop", "Full stop / optional stop", "M00", "M01 stops only when the optional-stop switch is on — used for mid-program inspection."],
  ["M03 / M04 / M05", "Spindle", "CW / CCW / stop", "M03 S8000", "S = spindle speed (rev/min). Never reverse a spindle with the tool in the cut."],
  ["M06", "Tool change", "Exchange tool", "M06 T3", "Most machines require G28 or a safe Z before M06."],
  ["M08 / M09", "Coolant", "On / off", "M08", "Flood (M08) vs mist (M07) is machine dependent."],
  ["M30", "Program end", "End + rewind", "M30", "Ends the program, returns to the top, clears modal state."],
];

export default function GCodeReferenceViewer() {
  return (
    <RefTable
      title="G & M codes"
      search
      cols={["Code", "Group", "Meaning", "Example", "Notes"]}
      rows={CODE.map((r) => r)}
      note="Modal codes (G00/G01, G90/G91, G21, cutter comp, work offsets) stay active until changed — a program is read top-down, so an early G21 or G90 without a later switch applies to the whole file. This is a Fanuc-style summary: check the control's own manual for dialect differences."
    />
  );
}
