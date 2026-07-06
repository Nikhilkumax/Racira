export type PrinterClass = "Budget FDM" | "Standard FDM" | "Fast CoreXY" | "High Speed CoreXY" | "Custom";
export type MaterialType = "PLA" | "PLA+" | "PETG" | "ABS" | "ASA" | "TPU" | "Nylon";
export type SupportUsage = "None" | "Light" | "Medium" | "Heavy";

export interface ThreeDPrintInputs {
  modelVolume: number; // cm³
  modelHeight: number; // mm
  infill: number; // %
  wallCount: number;
  layerHeight: number; // mm
  printSpeed: number; // mm/s
  material: MaterialType;
  supportUsage: SupportUsage;
  printerClass: PrinterClass;

  // Advanced
  nozzleDiameter: number; // mm
  lineWidth: number; // mm
  travelSpeed: number; // mm/s
  acceleration: number; // mm/s²
  topLayers: number;
  bottomLayers: number;
  filamentPrice: number; // $/kg
  electricityRate: number; // $/kWh
  printerPower: number; // Watts
  efficiencyFactor: number; // %
  brimRaftMaterial: number; // %
  failedPrintBuffer: number; // %
}

export interface Recommendation {
  title: string;
  description: string;
}

export interface TimeImpact {
  label: string;
  timeSeconds: number;
}

export interface ThreeDPrintResults {
  actualPrintTimeSeconds: number;
  estimatedCompletionTime: Date;
  layerCount: number;
  averageLayerTime: number; // seconds
  filamentWeightKg: number;
  filamentLengthMeters: number;
  
  // Costs
  modelMaterialCost: number;
  supportMaterialCost: number;
  wasteBufferCost: number;
  electricityCost: number;
  totalCost: number;

  // Quality
  qualityScore: number;
  qualityBadge: string;
  
  // Complexity
  printComplexity: string;
  
  // Breakdown for pie chart
  pieData: { name: string; value: number }[];

  // Timeline for line chart
  timelineData: { timeHrs: number; layer: number }[];

  // Impact analysis
  timeImpacts: TimeImpact[];

  recommendations: Recommendation[];
}

export const DENSITIES: Record<MaterialType, number> = {
  "PLA": 1.24,
  "PLA+": 1.25,
  "PETG": 1.27,
  "ABS": 1.04,
  "ASA": 1.07,
  "TPU": 1.21,
  "Nylon": 1.15
};

const SUPPORT_MULTIPLIERS: Record<SupportUsage, number> = {
  "None": 0,
  "Light": 0.05,
  "Medium": 0.10,
  "Heavy": 0.20
};

export const PRINTER_PROFILES: Record<Exclude<PrinterClass, "Custom">, { acceleration: number, travelSpeed: number, efficiency: number }> = {
  "Budget FDM": { acceleration: 500, travelSpeed: 100, efficiency: 80 },
  "Standard FDM": { acceleration: 1000, travelSpeed: 150, efficiency: 90 },
  "Fast CoreXY": { acceleration: 5000, travelSpeed: 300, efficiency: 95 },
  "High Speed CoreXY": { acceleration: 10000, travelSpeed: 500, efficiency: 100 },
};

function calcKinematicTime(distanceMm: number, speed: number, accel: number): number {
    if (distanceMm <= 0 || speed <= 0 || accel <= 0) return 0;
    const distanceToReachSpeed = (speed * speed) / accel;
    if (distanceToReachSpeed > distanceMm) {
        return 2 * Math.sqrt(distanceMm / accel);
    } else {
        return (2 * speed / accel) + (distanceMm - distanceToReachSpeed) / speed;
    }
}

function simulatePrint(inputs: ThreeDPrintInputs, overrideProps: Partial<ThreeDPrintInputs>) {
    const sim = { ...inputs, ...overrideProps };
    const volumeMm3 = sim.modelVolume * 1000;
    const heightMm = sim.modelHeight > 0 ? sim.modelHeight : Math.pow(volumeMm3, 1/3);
    const baseAreaMm2 = volumeMm3 / heightMm;
    const sideLengthMm = Math.sqrt(baseAreaMm2);

    const wallThicknessMm = sim.wallCount * sim.lineWidth;
    const topThicknessMm = sim.topLayers * sim.layerHeight;
    const bottomThicknessMm = sim.bottomLayers * sim.layerHeight;

    const innerSideMm = Math.max(0, sideLengthMm - 2 * wallThicknessMm);
    const innerHeightMm = Math.max(0, heightMm - topThicknessMm - bottomThicknessMm);

    const innerVolumeMm3 = innerSideMm * innerSideMm * innerHeightMm;
    const outerVolumeMm3 = sideLengthMm * sideLengthMm * heightMm;
    
    const shellVolumeMm3 = Math.max(0, outerVolumeMm3 - innerVolumeMm3);
    const infillVolumeMm3 = innerVolumeMm3 * (sim.infill / 100);

    const modelPlasticMm3 = shellVolumeMm3 + infillVolumeMm3;
    const supportMult = SUPPORT_MULTIPLIERS[sim.supportUsage] || 0;
    const supportPlasticMm3 = modelPlasticMm3 * supportMult;
    const brimPlasticMm3 = modelPlasticMm3 * (sim.brimRaftMaterial / 100);
    const totalPlasticMm3 = modelPlasticMm3 + supportPlasticMm3 + brimPlasticMm3;

    const extLenMm = totalPlasticMm3 / (sim.lineWidth * sim.layerHeight);
    
    // Print time
    const pSegs = extLenMm / 20; 
    const pTime = pSegs * calcKinematicTime(20, sim.printSpeed, sim.acceleration);
    
    // Travel time
    const tSegs = (extLenMm * 0.2) / 30; 
    const tTime = tSegs * calcKinematicTime(30, sim.travelSpeed, sim.acceleration);
    
    // Layer changes & retractions
    const layerCount = Math.ceil(heightMm / sim.layerHeight);
    const layerChangeTime = layerCount * 1.0;
    
    const retractionsPerLayer = Math.max(1, Math.min(20, Math.sqrt(baseAreaMm2) / 10));
    const totalRetractions = layerCount * retractionsPerLayer;
    const retractDistance = 6;
    const retractSpeed = 45;
    const timePerRetraction = (retractDistance / retractSpeed) * 2;
    const retractionTime = totalRetractions * timePerRetraction;
    
    const baseTimeSeconds = pTime + tTime + layerChangeTime + retractionTime;
    
    let eff = sim.efficiencyFactor / 100;
    
    const failMultiplier = 1 + (sim.failedPrintBuffer / 100);
    const actualTime = (baseTimeSeconds / eff) * failMultiplier;
    
    return {
      modelPlasticMm3,
      supportPlasticMm3,
      brimPlasticMm3,
      totalPlasticMm3,
      actualTime,
      layerCount
    };
}

export function calculate3DPrint(inputs: ThreeDPrintInputs): ThreeDPrintResults {
  const density = DENSITIES[inputs.material] || 1.24;
  const sim = simulatePrint(inputs, {});

  const totalVolumeCm3 = sim.totalPlasticMm3 / 1000;
  const filamentWeightKg = (totalVolumeCm3 * density) / 1000;
  
  const filamentCrossSectionAreaMm2 = Math.PI * Math.pow(1.75 / 2, 2);
  const filamentLengthMeters = (sim.totalPlasticMm3 / filamentCrossSectionAreaMm2) / 1000;

  const actualPrintTimeSeconds = sim.actualTime;
  const averageLayerTime = actualPrintTimeSeconds / sim.layerCount;

  // Costs
  const modelMaterialCost = ((sim.modelPlasticMm3 / 1000) * density / 1000) * inputs.filamentPrice;
  const supportMaterialCost = ((sim.supportPlasticMm3 / 1000) * density / 1000) * inputs.filamentPrice;
  const brimCost = ((sim.brimPlasticMm3 / 1000) * density / 1000) * inputs.filamentPrice;
  
  const baseMaterialCost = modelMaterialCost + supportMaterialCost + brimCost;
  const wasteBufferCost = baseMaterialCost * (inputs.failedPrintBuffer / 100);
  const electricityCost = ((inputs.printerPower * (actualPrintTimeSeconds / 3600)) / 1000) * inputs.electricityRate;
  const totalCost = baseMaterialCost + wasteBufferCost + electricityCost;

  // Quality Score
  let qs = 90;
  qs -= (inputs.layerHeight - 0.12) * 250; 
  qs -= (inputs.nozzleDiameter - 0.2) * 50;
  qs -= Math.max(0, inputs.printSpeed - 60) * 0.2;
  qs += (inputs.wallCount - 2) * 5;
  
  qs = Math.max(10, Math.min(100, Math.round(qs)));

  let qualityBadge = "Standard";
  if (qs >= 85) qualityBadge = "Fine";
  else if (qs >= 60) qualityBadge = "Standard";
  else if (qs >= 30) qualityBadge = "Draft";
  else qualityBadge = "Prototype";

  // Print Complexity
  let complexityScore = 0;
  if (sim.layerCount > 2000) complexityScore += 2;
  else if (sim.layerCount > 500) complexityScore += 1;
  
  if (inputs.supportUsage === "Heavy") complexityScore += 3;
  else if (inputs.supportUsage === "Medium") complexityScore += 2;
  else if (inputs.supportUsage === "Light") complexityScore += 1;
  
  if (inputs.wallCount > 4) complexityScore += 2;
  else if (inputs.wallCount >= 3) complexityScore += 1;
  
  if (inputs.modelHeight > 150) complexityScore += 2;
  else if (inputs.modelHeight > 50) complexityScore += 1;

  let printComplexity = "Simple";
  if (complexityScore >= 7) printComplexity = "Very Complex";
  else if (complexityScore >= 5) printComplexity = "Complex";
  else if (complexityScore >= 3) printComplexity = "Moderate";

  // Timeline Data
  const timelineData = [];
  const points = 10;
  for(let i=0; i<=points; i++) {
      const p = i / points;
      timelineData.push({
          timeHrs: (actualPrintTimeSeconds / 3600) * p,
          layer: Math.round(sim.layerCount * p)
      });
  }

  // Pie Data
  const pieData = [
      { name: "Model Material", value: modelMaterialCost },
      { name: "Support Material", value: supportMaterialCost + brimCost },
      { name: "Waste Buffer", value: wasteBufferCost },
      { name: "Electricity", value: electricityCost }
  ].filter(d => d.value > 0);

  // Time Impacts
  const fasterSim = simulatePrint(inputs, { 
    layerHeight: Math.min(0.32, inputs.layerHeight * 1.5), 
    infill: 10, 
    printSpeed: inputs.printSpeed * 1.5 
  });
  
  const hqSim = simulatePrint(inputs, { 
    layerHeight: 0.12, 
    printSpeed: inputs.printSpeed * 0.8 
  });

  const timeImpacts: TimeImpact[] = [
      { label: "High Quality", timeSeconds: hqSim.actualTime },
      { label: "Current", timeSeconds: actualPrintTimeSeconds },
      { label: "Faster", timeSeconds: fasterSim.actualTime }
  ];

  // Recommendations
  const recommendations: Recommendation[] = [];
  
  if (inputs.infill > 20) {
      const recSim = simulatePrint(inputs, { infill: 20 });
      const savedTimeHr = (actualPrintTimeSeconds - recSim.actualTime) / 3600;
      const newModelMatCost = ((recSim.modelPlasticMm3 / 1000) * density / 1000) * inputs.filamentPrice;
      const savedMoney = modelMaterialCost - newModelMatCost;
      
      const hr = Math.floor(savedTimeHr);
      const min = Math.round((savedTimeHr - hr) * 60);
      if (hr > 0 || min > 15) {
        recommendations.push({
            title: "High Infill",
            description: `Reducing infill from ${inputs.infill}% to 20% could save ${hr > 0 ? `${hr}h ` : ''}${min}m and $${savedMoney.toFixed(2)}.`
        });
      }
  }

  if (inputs.layerHeight < 0.20) {
      const recSim = simulatePrint(inputs, { layerHeight: 0.20 });
      const savedPct = Math.round(((actualPrintTimeSeconds - recSim.actualTime) / actualPrintTimeSeconds) * 100);
      const savedTimeHr = (actualPrintTimeSeconds - recSim.actualTime) / 3600;
      const hr = Math.floor(savedTimeHr);
      const min = Math.round((savedTimeHr - hr) * 60);
      
      if (savedPct > 5 && (hr > 0 || min > 15)) {
          recommendations.push({
              title: "Fine Layer Height",
              description: `Increasing layer height to 0.20 mm could reduce print duration by ${hr > 0 ? `${hr} hours ` : ''}${hr === 0 ? `${min} minutes` : ''}.`
          });
      }
  }

  if (inputs.nozzleDiameter < 0.6) {
      const recSim = simulatePrint(inputs, { nozzleDiameter: 0.6, lineWidth: 0.6 * 1.2 });
      const savedPct = Math.round(((actualPrintTimeSeconds - recSim.actualTime) / actualPrintTimeSeconds) * 100);
      if (savedPct > 10) {
          recommendations.push({
              title: "Small Nozzle",
              description: `Switching to a 0.6 mm nozzle may reduce print time by up to ${savedPct}%.`
          });
      }
  }
  
  if (inputs.supportUsage === "Heavy" || inputs.supportUsage === "Medium") {
      recommendations.push({
          title: "Heavy Support Generation",
          description: `Consider changing model orientation or using custom painted supports to reduce material waste.`
      });
  }
  
  if (inputs.brimRaftMaterial > 5) {
      recommendations.push({
          title: "Brim / Raft Usage",
          description: `Consider upgrading to a textured PEI sheet to reduce the need for brims and save material.`
      });
  }

  const estimatedCompletionTime = new Date();
  estimatedCompletionTime.setSeconds(estimatedCompletionTime.getSeconds() + actualPrintTimeSeconds);

  return {
      actualPrintTimeSeconds,
      estimatedCompletionTime,
      layerCount: sim.layerCount,
      averageLayerTime,
      filamentWeightKg,
      filamentLengthMeters,
      modelMaterialCost,
      supportMaterialCost,
      wasteBufferCost,
      electricityCost,
      totalCost,
      qualityScore: qs,
      qualityBadge,
      printComplexity,
      pieData,
      timelineData,
      timeImpacts,
      recommendations
  };
}

