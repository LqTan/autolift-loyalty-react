import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { QiniCurvePoint } from "@/lib/api";

interface QiniCurveChartProps {
  data: QiniCurvePoint[];
}

export default function QiniCurveChart({ data }: QiniCurveChartProps) {
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
          label={{ value: "Qini", angle: -90, position: "insideLeft" }}
          tickFormatter={(v) => v.toFixed(0)}
        />
        <Tooltip
          formatter={(value) => Number(value).toFixed(2)}
          labelFormatter={(label) => `Target Fraction: ${Number(label).toFixed(2)}`}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="qini"
          name="Qini"
          stroke="#8884d8"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}