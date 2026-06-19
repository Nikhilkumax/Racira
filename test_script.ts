import { calculate3DPrint, ThreeDPrintInputs } from "./src/calculators/threeDPrintLogic";

const inputs: ThreeDPrintInputs = {
  modelVolume: 50,
  modelHeight: 100,
  infill: 20,
  wallCount: 3,
  layerHeight: 0.20,
  printSpeed: 60,
  material: "PLA",
  supportUsage: "None",
  printerClass: "Standard FDM",
  nozzleDiameter: 0.4,
  lineWidth: 0.48,
  travelSpeed: 150,
  acceleration: 1000,
  topLayers: 5,
  bottomLayers: 5,
  filamentPrice: 20,
  electricityRate: 0.15,
  printerPower: 150,
  efficiencyFactor: 90,
  brimRaftMaterial: 0,
  failedPrintBuffer: 0,
};

const resBaseline = calculate3DPrint(inputs);
console.log("BASELINE: Travel 150, Accel 1000");
console.log("Time (seconds):", resBaseline.actualPrintTimeSeconds);

const inputsTest1 = { ...inputs, travelSpeed: 300 };
const resTest1 = calculate3DPrint(inputsTest1);
console.log("\nTEST 1: Travel 300, Accel 1000");
console.log("Time (seconds):", resTest1.actualPrintTimeSeconds);

const inputsTest2 = { ...inputs, acceleration: 300 };
const resTest2 = calculate3DPrint(inputsTest2);
console.log("\nTEST 2: Travel 150, Accel 300");
console.log("Time (seconds):", resTest2.actualPrintTimeSeconds);
