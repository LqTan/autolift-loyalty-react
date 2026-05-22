import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { EconomicComparison } from "@/lib/api";

interface EconomicComparisonChartProps {
  data: EconomicComparison;
}

interface ChartDataItem {
  name: string;
  targeted: number;
  conversions: number;
  cost: number;
  revenue: number;
  profit: number;
}

export default function EconomicComparisonChart({ data }: EconomicComparisonChartProps) {
  const chartData: ChartDataItem[] = [
    {
      name: "Mass Campaign",
      targeted: data.massCampaign.numTargeted,
      conversions: data.massCampaign.expectedIncrementalConversions,
      cost: data.massCampaign.promotionCost,
      revenue: data.massCampaign.expectedRevenue,
      profit: data.massCampaign.netProfit,
    },
    {
      name: "Response Targeting",
      targeted: data.responseTargeting.numTargeted,
      conversions: data.responseTargeting.expectedIncrementalConversions,
      cost: data.responseTargeting.promotionCost,
      revenue: data.responseTargeting.expectedRevenue,
      profit: data.responseTargeting.netProfit,
    },
    {
      name: "Uplift Targeting",
      targeted: data.upliftTargeting.numTargeted,
      conversions: data.upliftTargeting.expectedIncrementalConversions,
      cost: data.upliftTargeting.promotionCost,
      revenue: data.upliftTargeting.expectedRevenue,
      profit: data.upliftTargeting.netProfit,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis
          yAxisId="left"
          orientation="left"
          label={{ value: "Targeted / Conversions", angle: -90, position: "insideLeft" }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          label={{ value: "Revenue / Cost / Profit", angle: 90, position: "insideRight" }}
        />
        <Tooltip formatter={(value) => Number(value).toLocaleString()} />
        <Legend />
        <Bar yAxisId="left" dataKey="targeted" name="Num Targeted" fill="#8884d8" />
        <Bar yAxisId="left" dataKey="conversions" name="Expected Conversions" fill="#82ca9d" />
        <Bar yAxisId="right" dataKey="cost" name="Promotion Cost" fill="#ffc658" />
        <Bar yAxisId="right" dataKey="revenue" name="Expected Revenue" fill="#ff7300" />
        <Bar yAxisId="right" dataKey="profit" name="Net Profit" fill="#00C49F" />
      </BarChart>
    </ResponsiveContainer>
  );
}