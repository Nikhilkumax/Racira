"use client";
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, Cell as TooltipCell } from 'recharts';

// ======================
// TYPES & DEFAULTS
// ======================

interface Inputs {
  propertySize: number;
  propertyType: string;
  numberOfDoors: number;
  numberOfWindows: number;
  // Advanced Options
  cameras: number;
  motionSensors: number;
  doorContacts: number;
  windowSensors: number;
  controlPanel: number;
  monthlyMonitoring: number;
  contractLength: number;
  installationFee: number;
}

interface Results {
  equipmentCost: number;
  laborCost: number;
  permitCost: number;
  wiringCost: number;
  programmingCost: number;
  monitoringCost: number;
  totalCost: number;
  monthlyCost: number;
  totalDeviceCount: number;
  totalDeviceDistance: number;
}

const DEFAULTS: Inputs = {
  propertySize: 2000,
  propertyType: 'Commercial Office',
  numberOfDoors: 10,
  numberOfWindows: 20,
  cameras: 8,
  motionSensors: 15,
  doorContacts: 10,
  windowSensors: 20,
  controlPanel: 1,
  monthlyMonitoring: 35,
  contractLength: 36,
  installationFee: 200,
};

const DEFAULTS_RESULTS: Results = {
  equipmentCost: 0,
  laborCost: 0,
  permitCost: 0,
  wiringCost: 0,
  programmingCost: 0,
  monitoringCost: 0,
  totalCost: 0,
  monthlyCost: 0,
  totalDeviceCount: 0,
  totalDeviceDistance: 0,
};

// ======================
// CALCULATION LOGIC (PURE FUNCTION)
// ======================

const calculate = (inputs: Inputs): Results => {
  // Input validation and sanitization
  const propertySize = Math.max(0, inputs.propertySize);
  const numberOfDoors = Math.max(0, inputs.numberOfDoors);
  const numberOfWindows = Math.max(0, inputs.numberOfWindows);
  const cameras = Math.max(0, inputs.cameras);
  const motionSensors = Math.max(0, inputs.motionSensors);
  const doorContacts = Math.max(0, inputs.doorContacts);
  const windowSensors = Math.max(0, inputs.windowSensors);
  const controlPanel = Math.max(0, inputs.controlPanel);
  const monthlyMonitoring = Math.max(0, inputs.monthlyMonitoring);
  const contractLength = Math.max(0, inputs.contractLength);
  const installationFee = Math.max(0, inputs.installationFee);

  // Property type cost per sq ft
  const costPerSqFtMap: Record<string, number> = {
    'Commercial Office': 3.5,
    'Retail Store': 4.0,
    'Warehouse': 2.5,
    'Residential': 3.0,
    'Industrial': 2.0,
    'Other': 3.0,
  };
  const costPerSqFt = costPerSqFtMap[inputs.propertyType] || 3.0;

  // Device unit costs
  const deviceCosts = {
    camera: 150,
    motionSensor: 80,
    doorContact: 30,
    windowSensor: 25,
    controlPanel: 400,
  };

  // Equipment costs
  const equipmentCost =
    propertySize * costPerSqFt +
    cameras * deviceCosts.camera +
    motionSensors * deviceCosts.motionSensor +
    doorContacts * deviceCosts.doorContact +
    windowSensors * deviceCosts.windowSensor +
    controlPanel * deviceCosts.controlPanel;

  // Labor calculations
  const minutesPerDevice = 15; // avg minutes per device installation
  const totalDeviceCount =
    cameras + motionSensors + doorContacts + windowSensors + controlPanel;
  const laborHours = (totalDeviceCount * minutesPerDevice) / 60;
  const hourlyRate = 65; // $/hour
  const laborCost = laborHours * hourlyRate;

  // Permit cost
  const permitBaseFee = 100;
  const permitPerSqFt = 0.15;
  const permitCost = permitBaseFee + propertySize * permitPerSqFt;

  // Wiring cost
  const avgDistancePerDevice = 20; // feet
  const costPerFoot = 1.25;
  const terminalBlockCost = 15;
  const totalDeviceDistance = totalDeviceCount * avgDistancePerDevice;
  const wiringCost =
    totalDeviceDistance * costPerFoot + terminalBlockCost * Math.ceil(totalDeviceCount / 10);

  // Programming cost
  const programmingBaseFee = 150;
  const programmingPerDevice = 12;
  const programmingCost =
    programmingBaseFee + totalDeviceCount * programmingPerDevice;

  // Monitoring cost
  const monthlyCost = monthlyMonitoring; // base monitoring fee
  const monitoringCost = monthlyCost * contractLength;

  // Total cost
  const totalCost =
    equipmentCost +
    laborCost +
    permitCost +
    wiringCost +
    programmingCost +
    monitoringCost;

  return {
    equipmentCost,
    laborCost,
    permitCost,
    wiringCost,
    programmingCost,
    monitoringCost,
    totalCost,
    monthlyCost,
    totalDeviceCount,
    totalDeviceDistance,
  };
};

// ======================
// COMPONENT
// ======================

const SecuritySystemInstallationCostCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [results, setResults] = useState<Results>(() => calculate(DEFAULTS));

  // Calculate on mount and when inputs change
  useEffect(() => {
    setResults(calculate(inputs));
  }, [inputs]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]:
        type === 'number'
          ? Math.max(0, parseFloat(value) || 0)
          : type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleCalculate = () => {
    setResults(calculate(inputs));
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(DEFAULTS_RESULTS);
  };

  // Format currency
  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);

  // Format number
  const formatNumber = (value: number): string =>
    new Intl.NumberFormat('en-US').format(value);

  // Pie chart data
  const pieChartData = [
    { name: 'Equipment', value: results.equipmentCost, fill: '#8884d8' },
    { name: 'Labor', value: results.laborCost, fill: '#82ca9d' },
    { name: 'Permits', value: results.permitCost, fill: '#ffc658' },
    { name: 'Wiring', value: results.wiringCost, fill: '#ff7300' },
    { name: 'Programming', value: results.programmingCost, fill: '#82ca9d' },
    { name: 'Monitoring', value: results.monitoringCost, fill: '#ff8b64' },
  ];

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#82ca9d', '#ff8b64'];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Security System Installation Cost Calculator
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: INPUTS */}
        <div className="space-y-6">
          {/* Primary Inputs */}
          <div className="border p-4 rounded-lg">
            <h2 className="text-2xl font-bold mb-3">Property Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Property Size (sq ft)
                </label>
                <input
                  type="number"
                  name="propertySize"
                  value={inputs.propertySize}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Property Type
                </label>
                <select
                  name="propertyType"
                  value={inputs.propertyType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="Commercial Office">Commercial Office</option>
                  <option value="Retail Store">Retail Store</option>
                  <option value="Warehouse">Warehouse</option>
                  <option value="Residential">Residential</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Number of Doors
                </label>
                <input
                  type="number"
                  name="numberOfDoors"
                  value={inputs.numberOfDoors}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Number of Windows
                </label>
                <input
                  type="number"
                  name="numberOfWindows"
                  value={inputs.numberOfWindows}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="border p-4 rounded-lg">
            <h2 className="text-2xl font-bold mb-3">Advanced Options</h2>
            <div className="space-y-4">
              {/* System Components */}
              <div>
                <h3 className="font-semibold mb-2">System Components</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Cameras
                    </label>
                    <input
                      type="number"
                      name="cameras"
                      value={inputs.cameras}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Motion Sensors
                    </label>
                    <input
                      type="number"
                      name="motionSensors"
                      value={inputs.motionSensors}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Door Contacts
                    </label>
                    <input
                      type="number"
                      name="doorContacts"
                      value={inputs.doorContacts}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Window Sensors
                    </label>
                    <input
                      type="number"
                      name="windowSensors"
                      value={inputs.windowSensors}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Control Panel
                    </label>
                    <input
                      type="number"
                      name="controlPanel"
                      value={inputs.controlPanel}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Monitoring */}
              <div>
                <h3 className="font-semibold mb-2">Monitoring</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Monthly Monitoring ($)
                    </label>
                    <input
                      type="number"
                      name="monthlyMonitoring"
                      value={inputs.monthlyMonitoring}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Contract Length (months)
                    </label>
                    <input
                      type="number"
                      name="contractLength"
                      value={inputs.contractLength}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Installation Fee ($)
                    </label>
                    <input
                      type="number"
                      name="installationFee"
                      value={inputs.installationFee}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Reset
            </button>
            <button
              onClick={handleCalculate}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Calculate
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: RESULTS */}
        <div className="space-y-6">
          {/* Primary Result Card */}
          <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
            <h2 className="text-lg font-semibold mb-2">Total Installation Cost</h2>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(results.totalCost)}
            </p>
            <p className="text-sm text-gray-500">
              Includes equipment, labor, permits, wiring, programming, and {inputs.contractLength
              } months of monitoring
            </p>
          </div>

          {/* 3-Stat Bar */}
          <div className="flex space-x-4">
            <div className="flex-1 border p-4 rounded-lg text-center">
              <h3 className="font-semibold mb-1">Equipment Cost</h3>
              <p className="text-xl font-bold">{formatCurrency(results.equipmentCost)}</p>
            </div>
            <div className="flex-1 border p-4 rounded-lg text-center">
              <h3 className="font-semibold mb-1">Labor Cost</h3>
              <p className="text-xl font-bold">{formatCurrency(results.laborCost)}</p>
            </div>
            <div className="flex-1 border p-4 rounded-lg text-center">
              <h3 className="font-semibold mb-1">Monitoring Cost</h3>
              <p className="text-xl font-bold">{formatCurrency(results.monitoringCost)}</p>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="border p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">Cost Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      Equipment
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {formatCurrency(results.equipmentCost)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {results.totalCost > 0 ? `${((results.equipmentCost / results.totalCost) * 100).toFixed(1)}%` : '0%'}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      Labor
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {formatCurrency(results.laborCost)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {results.totalCost > 0 ? `${((results.laborCost / results.totalCost) * 100).toFixed(1)}%` : '0%'}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      Permits
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {formatCurrency(results.permitCost)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {results.totalCost > 0 ? `${((results.permitCost / results.totalCost) * 100).toFixed(1)}%` : '0%'}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      Wiring
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {formatCurrency(results.wiringCost)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {results.totalCost > 0 ? `${((results.wiringCost / results.totalCost) * 100).toFixed(1)}%` : '0%'}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      Programming
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {formatCurrency(results.programmingCost)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {results.totalCost > 0 ? `${((results.programmingCost / results.totalCost) * 100).toFixed(1)}%` : '0%'}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      Monitoring ({inputs.contractLength} months)
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {formatCurrency(results.monitoringCost)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {results.totalCost > 0 ? `${((results.monitoringCost / results.totalCost) * 100).toFixed(1)}%` : '0%'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="border p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">Cost Distribution</h2>
            <div className="h-96 w-full">
              <PieChart>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  labelLine={false}
                  label={({ name, value, percent }) =>
                    `${name}: ${formatCurrency(value)} (${(percent * 100).toFixed(1)}%)`
                  }
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `$${value}`}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="border p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">Summary Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Monthly Monitoring Cost:</p>
                <p className="font-medium">{formatCurrency(results.monthlyCost)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Devices:</p>
                <p className="font-medium">{formatNumber(results.totalDeviceCount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Wiring Distance:</p>
                <p className="font-medium">{formatNumber(results.totalDeviceDistance)} ft</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Labor Hours:</p>
                <p className="font-medium">
                  {((results.totalDeviceCount * 15) / 60).toFixed(1)} hrs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Content - 3 sections, ~400 words */}
      <section className="mt-8 pt-6 border-t">
        <h2 className="text-2xl font-bold mb-3">Understanding Security System Installation Costs</h2>
        <p className="mb-4">
          Security system installation costs vary significantly based on property type, system complexity, 
          and geographic location. A comprehensive security system includes multiple interconnected 
          components working together to protect people, assets, and property. The total investment 
          encompasses not only the upfront equipment and installation costs but also ongoing monitoring 
          fees, maintenance contracts, and potential system upgrades over time. Our calculator provides 
          transparent, itemized cost estimates that account for all these factors, enabling property 
          owners and facility managers to make informed budgeting decisions.
        </p>
        
        <h2 className="text-2xl font-bold mb-3">Key Cost Components in Security System Installation</h2>
        <p className="mb-4">
          A complete security system installation involves several distinct cost categories. 
          Equipment costs include cameras, motion sensors, door/window contacts, control panels, 
          and networking infrastructure. Labor costs cover professional installation, wiring, 
          system configuration, and programming. Permit and inspection fees vary by jurisdiction 
          but typically include electrical permits and fire marshal reviews for commercial properties. 
          Wiring infrastructure costs cover cable runs, conduit, connectors, and termination hardware. 
          Programming and commissioning ensure all devices communicate properly with the control panel 
          and monitoring center. Finally, ongoing monitoring costs cover 24/7 professional surveillance 
          with emergency dispatch capabilities.
        </p>
        
        <h2 className="text-2xl font-bold mb-3">Budget Planning and ROI Considerations</h2>
        <p className="mb-4">
          Understanding the total cost of ownership is essential for budget planning and return on 
          investment analysis. Upfront installation typically represents 60-70% of first-year costs, 
          with ongoing monitoring and maintenance comprising the remainder. Many insurance providers 
          offer premium reductions of 5-20% for professionally monitored security systems, which can 
          offset monitoring costs over time. Property owners should also factor in future scalability — 
          systems designed with expansion in mind avoid costly retrofits when adding coverage areas 
          or upgrading to newer technologies. Our calculator helps you model different scenarios 
          by adjusting property size, device counts, and monitoring plans to find the optimal 
          balance between coverage and budget.
        </p>
      </section>
    </div>
  );
};

export default SecuritySystemInstallationCostCalculator;