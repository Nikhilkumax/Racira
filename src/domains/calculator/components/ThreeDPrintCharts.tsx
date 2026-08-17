"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"];

export const ThreeDPrintPieChart = React.memo(({ data }: { data: { name: string; value: number }[] }) => {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `$${value.toFixed(2)}`}
            contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

export const ThreeDPrintTimelineChart = React.memo(({ data }: { data: { timeHrs: number; layer: number }[] }) => {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="timeHrs" 
            tickFormatter={(val) => `${val.toFixed(1)}h`}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            formatter={(value: number) => [Math.round(value), "Layers"]}
            labelFormatter={(label) => `Time: ${Number(label).toFixed(2)}h`}
            contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
          />
          <Line type="monotone" dataKey="layer" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

export const ThreeDPrintImpactChart = React.memo(({ data }: { data: { label: string; timeSeconds: number }[] }) => {
  const chartData = data.map(d => ({
    ...d,
    timeHrs: d.timeSeconds / 3600
  }));

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
          <XAxis 
            type="number"
            tickFormatter={(val) => `${val}h`}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            type="category" 
            dataKey="label" 
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))", fontWeight: "bold" }}
            tickLine={false}
            axisLine={false}
            width={90}
          />
          <Tooltip 
            formatter={(value: number) => [`${Math.floor(value)}h ${Math.round((value % 1) * 60)}m`, "Est. Time"]}
            contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
          />
          <Bar dataKey="timeHrs" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={30}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.label === 'Current' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

// Reference charts page for the "3D Print Material Charts" registry entry.
// Composes the reusable charts above with static reference data.
export default function ThreeDPrintCharts() {
  const materialCostData = [
    { name: "PLA", value: 22 },
    { name: "PETG", value: 30 },
    { name: "ABS", value: 34 },
    { name: "TPU", value: 45 },
    { name: "Nylon", value: 62 },
  ];

  const layerTimelineData = [
    { timeHrs: 0.5, layer: 60 },
    { timeHrs: 1.0, layer: 130 },
    { timeHrs: 1.5, layer: 195 },
    { timeHrs: 2.0, layer: 260 },
    { timeHrs: 2.5, layer: 330 },
    { timeHrs: 3.0, layer: 400 },
  ];

  const printTimeImpactData = [
    { label: "Layer Height 0.28mm", timeSeconds: 10800 },
    { label: "Layer Height 0.20mm", timeSeconds: 14400 },
    { label: "Layer Height 0.12mm", timeSeconds: 23400 },
    { label: "Infill 15%", timeSeconds: 14400 },
    { label: "Infill 50%", timeSeconds: 21600 },
    { label: "Current", timeSeconds: 14400 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3 tracking-tight">
          3D Print Material Charts
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          Reference charts for common 3D printing materials, layer timelines, and
          print-time settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-3xl border border-border/50 shadow-xl p-6">
          <h2 className="text-xl font-bold text-foreground mb-1">Material Cost per kg</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Typical filament prices for popular materials.
          </p>
          <ThreeDPrintPieChart data={materialCostData} />
        </div>

        <div className="bg-card rounded-3xl border border-border/50 shadow-xl p-6">
          <h2 className="text-xl font-bold text-foreground mb-1">Layers Printed Over Time</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Layer progression for a standard 0.2mm layer-height print.
          </p>
          <ThreeDPrintTimelineChart data={layerTimelineData} />
        </div>

        <div className="bg-card rounded-3xl border border-border/50 shadow-xl p-6 lg:col-span-2">
          <h2 className="text-xl font-bold text-foreground mb-1">Print Time by Setting</h2>
          <p className="text-sm text-muted-foreground mb-4">
            How layer height and infill affect total print time.
          </p>
          <ThreeDPrintImpactChart data={printTimeImpactData} />
        </div>
      </div>

      <div className="mt-8 space-y-4 text-sm text-muted-foreground max-w-3xl mx-auto">
        <h3 className="font-semibold text-foreground">Reading These Charts</h3>
        <p>
          Material cost varies by brand, color, and vendor — prices above are
          typical retail ranges per kilogram. Layer height is the biggest lever on
          print time: halving it roughly doubles the layer count and duration.
          Infill percentage affects strength and material use, but has a smaller
          effect on time than layer height for most models.
        </p>
      </div>
    </div>
  );
}
