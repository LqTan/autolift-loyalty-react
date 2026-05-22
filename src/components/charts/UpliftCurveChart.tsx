import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { UpliftCurvePoint } from "@/lib/api";

interface UpliftCurveChartProps {
  data: UpliftCurvePoint[];
}

export default function UpliftCurveChart({ data }: UpliftCurveChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="targetFraction"
          label={{ value: "Target Fraction", position: "insideBottom", offset: -5 }}
          tickFormatter={(v) => v.toFixed(2)}
        />
        <YAxis
          label={{ value: "Observed Uplift", angle: -90, position: "insideLeft" }}
          tickFormatter={(v) => v.toFixed(4)}
        />
        <Tooltip
          formatter={(value) => Number(value).toFixed(4)}
          labelFormatter={(label) => `Target Fraction: ${Number(label).toFixed(2)}`}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="observedUplift"
          name="Observed Uplift"
          stroke="#8884d8"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="treatedResponseRate"
          name="Treatment Response Rate"
          stroke="#82ca9d"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="controlResponseRate"
          name="Control Response Rate"
          stroke="#ffc658"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}