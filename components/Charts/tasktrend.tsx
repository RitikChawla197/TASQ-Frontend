"use client";

import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const defaultChartData = [
  { day: "Mon", tasks: 4 },
  { day: "Tue", tasks: 7 },
  { day: "Wed", tasks: 5 },
  { day: "Thu", tasks: 9 },
  { day: "Fri", tasks: 6 },
  { day: "Sat", tasks: 3 },
  { day: "Sun", tasks: 8 },
];

const chartConfig = {
  tasks: {
    label: "Tasks Created",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

interface TaskTrendChartProps {
  data?: { day: string; tasks: number }[];
}

export function TaskTrendChart({ data = defaultChartData }: TaskTrendChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <LineChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent />}
        />
        <Line
          type="monotone"
          dataKey="tasks"
          stroke="var(--color-tasks)"
          strokeWidth={3}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ChartContainer>
  );
}
