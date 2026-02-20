"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const defaultChartData = [
  { status: "To Do", tasks: 5 },
  { status: "In Progress", tasks: 8 },
  { status: "Backlog", tasks: 3 },
  { status: "Completed", tasks: 12 },
  { status: "Blocked", tasks: 2 },
  { status: "In Review", tasks: 4 },
];

const STATUS_COLORS: Record<string, string> = {
  "To Do": "#2563eb",
  "In Progress": "#eab308",
  Completed: "#16a34a",
  "In Review": "#9333ea",
  Blocked: "#ef4444",
  Backlog: "#ec4899",
};

const chartConfig = {
  tasks: {
    label: "Tasks",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface TasksByStatusChartProps {
  data?: { status: string; tasks: number }[];
}

export function TasksByStatusChart({ data = defaultChartData }: TasksByStatusChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="status"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent />}
        />
        <Bar dataKey="tasks" radius={2}>
          {data.map((entry) => (
            <Cell
              key={entry.status}
              fill={STATUS_COLORS[entry.status] ?? "var(--color-tasks)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
