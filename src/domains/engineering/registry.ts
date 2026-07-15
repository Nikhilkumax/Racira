import { ToolResult } from "@/components/CategorySearch";

export type Category = {
  id: string;
  name: string;
  description: string;
};

export type Tool = {
  slug: string;
  name: string;
  description: string;
  category: string;
  icon: string; // lucide icon name
  status: "live" | "soon";
};

export const categories: Category[] = [
  { id: "electrical", name: "Electrical Engineering", description: "Circuits, components, power & wiring tools" },
  { id: "electronic", name: "Electronic Components", description: "Op-amps, timers, transistors & semiconductor references" },
  { id: "mechanical", name: "Mechanical Engineering", description: "Stress, strain, beams, gears & machine design" },
  { id: "civil", name: "Civil & Structural", description: "Beams, concrete, steel sections & loads" },
  { id: "chemical", name: "Chemical Engineering", description: "Reactions, balances, flow & gas laws" },
  { id: "thermo", name: "Thermodynamics & Heat Transfer", description: "Heat, cycles, insulation & thermal references" },
  { id: "fluid", name: "Fluid Mechanics", description: "Flow, pressure, pumps & pipe calculations" },
  { id: "control", name: "Control Systems", description: "PID, transfer functions, Bode & stability" },
  { id: "signal", name: "Signal Processing", description: "FFT, filters, sampling & modulation" },
  { id: "environmental", name: "Environmental Engineering", description: "Carbon, water, air & green compliance" },
  { id: "manufacturing", name: "Manufacturing & Process", description: "Lean, OEE, Six Sigma & SPC tools" },
  { id: "standards", name: "Engineering Standards Reference", description: "Units, ANSI, ISO, thread & symbol references" },
];

const t = (
  category: string,
  name: string,
  description: string,
  icon: string,
  built = false,
): Tool => ({
  slug: name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, ""),
  name,
  description,
  category,
  icon,
  status: built ? "live" : "soon",
});

export const tools: Tool[] = [
  // Electrical (16) — 7 built
  t("electrical", "Ohm's Law Calculator", "Solve V, I, R or P from any two values", "Zap", true),
  t("electrical", "Voltage Divider Calculator", "Compute output voltage of a resistive divider", "GitFork", true),
  t("electrical", "Current Divider Calculator", "Compute branch current in parallel resistors", "Split", true),
  t("electrical", "Resistor Color Code Decoder", "Decode 4, 5 and 6-band resistor color codes", "Palette"),
  t("electrical", "Resistor Series/Parallel Calculator", "Equivalent resistance for any network", "Network"),
  t("electrical", "Capacitor Calculator", "Energy, charge and impedance of a capacitor", "Battery", true),
  t("electrical", "Inductor Calculator", "Energy stored and reactance of an inductor", "Magnet", true),
  t("electrical", "RC Time Constant Calculator", "Tau, charge & discharge of RC circuits", "Timer", true),
  t("electrical", "LC Resonance Calculator", "Resonant frequency of LC tank circuits", "Activity"),
  t("electrical", "Power Factor Calculator", "Real, reactive, apparent power & PF correction", "Gauge", true),
  t("electrical", "Three-Phase Power Calculator", "Star/Delta voltages, currents and power", "Triangle"),
  t("electrical", "Transformer Ratio Calculator", "Turns ratio, voltage and current relations", "Repeat"),
  t("electrical", "Wire Gauge Current Capacity", "AWG ampacity reference tables", "Cable"),
  t("electrical", "Fuse Rating Calculator", "Select fuse rating for a load", "ShieldAlert"),
  t("electrical", "PCB Trace Current Calculator", "IPC-2221 trace width for current", "CircuitBoard"),
  t("electrical", "Heat Sink Thermal Calculator", "Thermal resistance and junction temperature", "Thermometer"),

  // Electronic Components (12)
  t("electronic", "Op-Amp Circuit Reference", "Common op-amp topologies & gain equations", "Sigma"),
  t("electronic", "555 Timer Calculator", "Astable & monostable mode timing", "Clock"),
  t("electronic", "BJT Transistor Bias Calculator", "Compute Q-point and bias resistors", "Cpu"),
  t("electronic", "MOSFET Drive Calculator", "Gate drive and switching loss reference", "Server"),
  t("electronic", "Zener Diode Reference", "Zener selection, voltage and current ratings", "BookOpen"),
  t("electronic", "LED Driver Calculator", "Series resistor and current for LEDs", "Lightbulb"),
  t("electronic", "Voltage Regulator Reference", "Linear & switching regulator topologies", "Power"),
  t("electronic", "ADC/DAC Resolution Calculator", "Bit resolution, LSB and SNR", "BarChart3"),
  t("electronic", "Sampling Rate Calculator", "Nyquist rate and sampling intervals", "Waves"),
  t("electronic", "Signal Integrity Reference", "Impedance, reflections and ringing", "Signal"),
  t("electronic", "EMI/EMC Checklist", "Common EMI/EMC compliance checks", "ShieldCheck"),
  t("electronic", "ESD Protection Reference", "ESD device classes and protection", "Flashlight"),

  // Mechanical (16)
  t("mechanical", "Stress & Strain Calculator", "Axial stress, strain and modulus", "Wrench"),
  t("mechanical", "Factor of Safety Calculator", "Allowable vs. applied stress ratio", "HardHat"),
  t("mechanical", "Beam Deflection Calculator", "Deflection formulas for common beams", "Ruler"),
  t("mechanical", "Column Buckling Calculator", "Euler critical load for columns", "Columns3"),
  t("mechanical", "Shaft Torsion Calculator", "Shear stress and angle of twist", "RotateCw"),
  t("mechanical", "Bearing Life Calculator (L10)", "L10 life from load and rating", "CircleDot"),
  t("mechanical", "Gear Design Reference", "Module, pitch, ratio and forces", "Cog"),
  t("mechanical", "Material Properties Comparator", "Compare metals, alloys, polymers", "Layers"),
  t("mechanical", "Heat Transfer Calculator", "Conduction & convection rates", "Flame"),
  t("mechanical", "Fluid Pressure Calculator", "Pressure from depth and density", "Droplets"),
  t("mechanical", "Pressure Vessel Reference", "ASME design stress references", "Container"),
  t("mechanical", "Fastener Torque Reference", "Torque values for bolt sizes & grades", "Hexagon"),
  t("mechanical", "Surface Finish Ra Reference", "Ra ranges by manufacturing process", "AlignJustify"),
  t("mechanical", "Tolerance Stack Calculator", "Worst-case & RSS tolerance stack", "Sliders"),
  t("mechanical", "Failure Mode Reference (FMEA)", "Common failure modes & severity", "AlertTriangle"),
  t("mechanical", "Reliability Calculation Reference", "MTBF, MTTF and reliability formulas", "HeartPulse"),

  // Civil (12)
  t("civil", "Beam Bending Moment Calculator", "Bending moment for common loadings", "TrendingDown"),
  t("civil", "Shear Force Diagram Builder", "Plot shear & moment along a beam", "Scissors"),
  t("civil", "Concrete Mix Design Reference", "Mix ratios and strength classes", "Box"),
  t("civil", "Steel Section Properties Table", "I, S, Z for standard steel sections", "Table"),
  t("civil", "Load Combination Reference", "ASCE/IBC load combinations", "Boxes"),
  t("civil", "Soil Bearing Capacity Reference", "Allowable bearing by soil type", "Mountain"),
  t("civil", "Pile Load Calculator", "End bearing & friction capacity", "AlignVerticalSpaceAround"),
  t("civil", "Drainage Slope Calculator", "Slope from rise and run", "ArrowDownRight"),
  t("civil", "Concrete Volume Estimator", "Cubic volume for slabs, footings, columns", "BoxSelect"),
  t("civil", "Masonry Wall Design Reference", "Allowable stresses & reinforcement", "Brick"),
  t("civil", "Bridge Deck Load Reference", "HS-20, HL-93 and similar loads", "Construction"),
  t("civil", "Traffic Load Reference", "Vehicle load classes and impact", "Car"),

  // Chemical (12)
  t("chemical", "Stoichiometry Calculator", "Balance and quantify reactions", "FlaskConical"),
  t("chemical", "Molar Mass Calculator", "Molar mass from formula", "Atom"),
  t("chemical", "Reaction Yield Calculator", "Theoretical, actual and percent yield", "Percent"),
  t("chemical", "Mass & Energy Balance Tool", "Steady-state mass and energy balance", "Scale"),
  t("chemical", "Distillation Concept Tool", "McCabe-Thiele concept & stages", "Beaker"),
  t("chemical", "Heat Exchanger Reference", "LMTD, NTU and effectiveness", "ArrowRightLeft"),
  t("chemical", "Mixing Tank Volume Calculator", "Cylindrical & conical tank volume", "Cylinder"),
  t("chemical", "Viscosity Temperature Reference", "Viscosity vs. temperature for fluids", "Pipette"),
  t("chemical", "Reynolds Number Calculator", "Laminar/turbulent flow regime", "Milestone"),
  t("chemical", "Bernoulli's Equation Tool", "Pressure, velocity & elevation head", "Wind"),
  t("chemical", "Phase Diagram Reference", "P-T diagrams for common substances", "Component"),
  t("chemical", "Ideal Gas Law Calculator", "PV = nRT solver", "CloudFog"),

  // Thermo (10)
  t("thermo", "Thermal Conductivity Reference", "k-values for common materials", "ThermometerSnowflake"),
  t("thermo", "Convection Coefficient Calculator", "h for natural & forced convection", "Tornado"),
  t("thermo", "Radiation Heat Transfer Calculator", "Stefan-Boltzmann radiation", "Sun"),
  t("thermo", "Thermal Expansion Calculator", "Linear & volumetric expansion", "MoveHorizontal"),
  t("thermo", "Specific Heat Capacity Reference", "Cp values for materials", "GaugeCircle"),
  t("thermo", "Rankine Cycle Visualizer", "Steam power cycle T-s diagram", "Workflow"),
  t("thermo", "Brayton Cycle Reference", "Gas turbine cycle reference", "Plane"),
  t("thermo", "Refrigeration COP Calculator", "Coefficient of performance", "Snowflake"),
  t("thermo", "Insulation R-Value Calculator", "R-value from k and thickness", "ShieldHalf"),
  t("thermo", "Heat Load Estimator", "Sensible & latent load estimate", "SunDim"),

  // Fluid (10)
  t("fluid", "Flow Rate Calculator", "Volumetric and mass flow rate", "ArrowRightToLine"),
  t("fluid", "Pipe Head Loss Calculator", "Friction head loss in pipes", "ArrowDownToLine"),
  t("fluid", "Pump Power Calculator", "Hydraulic and shaft power", "BatteryCharging"),
  t("fluid", "Bernoulli's Principle Tool", "Energy equation along a streamline", "TrendingUp"),
  t("fluid", "Darcy-Weisbach Calculator", "Friction factor head loss", "MoveDownRight"),
  t("fluid", "Moody Diagram Explorer", "f vs Re for pipe roughness", "Spline"),
  t("fluid", "Orifice Plate Flow Calculator", "Differential pressure flow measurement", "Circle"),
  t("fluid", "Venturi Flow Calculator", "Flow from venturi pressure drop", "ChevronsRight"),
  t("fluid", "Compressible Flow Reference", "Isentropic & shock relations", "Minimize2"),
  t("fluid", "Hydrostatic Pressure Calculator", "Pressure with depth", "ArrowDown"),

  // Control (8)
  t("control", "PID Controller Tuner (simulation)", "Tune Kp, Ki, Kd interactively", "SlidersHorizontal"),
  t("control", "Transfer Function Explorer", "Build and analyze transfer functions", "Binary"),
  t("control", "Bode Plot Visualizer", "Magnitude & phase plots", "LineChart"),
  t("control", "Nyquist Plot Reference", "Nyquist stability criterion", "Radar"),
  t("control", "Root Locus Concept Tool", "Root locus shapes and rules", "GitBranch"),
  t("control", "Step Response Simulator", "Time-domain step response", "Trello"),
  t("control", "Feedback Control Concept Builder", "Build closed-loop diagrams", "GitPullRequest"),
  t("control", "Control System Stability Checker", "Routh-Hurwitz stability test", "Anchor"),

  // Signal (10)
  t("signal", "FFT Visualizer", "Frequency spectrum of a signal", "AudioWaveform"),
  t("signal", "Fourier Series Builder", "Reconstruct waveforms from harmonics", "AudioLines"),
  t("signal", "Sampling Theorem Demonstrator", "Aliasing & Nyquist demo", "ScatterChart"),
  t("signal", "Filter Design Reference", "Butterworth, Chebyshev, Bessel", "Filter"),
  t("signal", "Digital Filter Visualizer", "FIR/IIR response plotter", "Settings2"),
  t("signal", "Noise Power Spectral Density Reference", "PSD types and units", "Wifi"),
  t("signal", "Convolution Concept Tool", "Visualize signal convolution", "Combine"),
  t("signal", "Autocorrelation Visualizer", "Autocorrelation of common signals", "ChartArea"),
  t("signal", "Signal Modulation Reference", "AM, FM, PM, QAM references", "Radio"),
  t("signal", "Nyquist Rate Calculator", "Minimum sampling rate for a signal", "Podcast"),

  // Environmental (10)
  t("environmental", "Carbon Footprint Estimator (basic)", "Estimate basic CO₂e emissions", "Leaf"),
  t("environmental", "Wastewater Treatment Reference", "Treatment stages and parameters", "Recycle"),
  t("environmental", "Air Quality Index Calculator", "AQI from pollutant concentration", "Cloud"),
  t("environmental", "Noise Level Reference", "dB levels of common sources", "Volume2"),
  t("environmental", "Water Quality Parameter Reference", "pH, BOD, COD, TDS ranges", "TestTube"),
  t("environmental", "Stormwater Runoff Estimator", "Rational method runoff", "CloudRain"),
  t("environmental", "Soil Contamination Reference", "Common contaminants & thresholds", "Biohazard"),
  t("environmental", "Renewable Energy Sizing Tool", "Solar/wind sizing basics", "TreePine"),
  t("environmental", "Environmental Impact Checklist", "EIA project checklist", "ClipboardCheck"),
  t("environmental", "Green Building Compliance Reference", "LEED & similar criteria", "Building2"),

  // Manufacturing (10)
  t("manufacturing", "Cycle Time Calculator", "Production cycle time", "RefreshCcw"),
  t("manufacturing", "Takt Time Calculator", "Demand-paced takt time", "Hourglass"),
  t("manufacturing", "Overall Equipment Effectiveness (OEE) Calculator", "OEE = A × P × Q", "Settings"),
  t("manufacturing", "Lean Waste Identification Tool", "Identify 8 wastes of lean", "Trash2"),
  t("manufacturing", "Six Sigma DPMO Calculator", "Defects per million opportunities", "Target"),
  t("manufacturing", "Control Chart Builder (SPC)", "X-bar & R control charts", "GanttChart"),
  t("manufacturing", "Process Capability Calculator (Cp, Cpk)", "Capability indices", "BarChart"),
  t("manufacturing", "Kaizen Event Planner", "Plan a kaizen event", "ClipboardList"),
  t("manufacturing", "PFMEA Template", "Process FMEA worksheet", "FileWarning"),
  t("manufacturing", "Root Cause Analysis Tool (Fishbone/5-Whys)", "Ishikawa & 5-Whys helper", "Fish"),

  // Standards (12)
  t("standards", "Unit Conversion Reference", "Convert SI and imperial units", "ArrowLeftRight"),
  t("standards", "SI Unit Reference", "Base & derived SI units", "Globe"),
  t("standards", "ANSI Standard Reference", "Common ANSI standards index", "BookMarked"),
  t("standards", "ISO Standard Reference", "Common ISO standards index", "BookOpenCheck"),
  t("standards", "Engineering Material Database", "Common engineering materials", "Database"),
  t("standards", "Screw Thread Reference", "Metric & UN thread tables", "List"),
  t("standards", "Tolerance Grade Reference", "IT grades and fits", "ListOrdered"),
  t("standards", "Weld Symbol Reference", "AWS weld symbols", "Sparkles"),
  t("standards", "NDT Method Reference", "UT, RT, MT, PT, ET overview", "Search"),
  t("standards", "Safety Factor Reference", "Typical safety factors by domain", "LifeBuoy"),
  t("standards", "Material Hardness Scale Reference", "Brinell, Rockwell, Vickers", "Diamond"),
  t("standards", "Engineering Drawing Symbol Reference", "GD&T & drawing symbols", "PencilRuler"),
];

export const toolsBySlug = new Map(tools.map((tool) => [tool.slug, tool]));
export const toolsByCategory = categories.map((category) => ({
  category,
  items: tools.filter((tool) => tool.category === category.id),
}));

export const SEARCH_REGISTRY: ToolResult[] = tools.map((tool) => {
  const categoryName = categories.find((c) => c.id === tool.category)?.name || tool.category;
  return {
    name: tool.name,
    description: tool.description,
    slug: tool.slug,
    href: `/engineering/tool/${tool.slug}`,
    category: categoryName,
    isBuilt: tool.built ?? false,
  };
});
