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
