"use client";

import {
  Activity,
  FileText,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AggregateStats {
  totalSkills: number;
  activeSkills: number;
  totalGenerated: number;
  totalTokensUsed: number;
  thisMonthGenerated: number;
  thisMonthTokens: number;
  avgSuccessRate: number;
}

export function StatsCards({ stats }: { stats: AggregateStats }) {
  const cards = [
    {
      title: "Tổng tài liệu tạo",
      value: stats.totalGenerated.toLocaleString(),
      subtitle: `${stats.thisMonthGenerated} tháng này`,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "Tokens sử dụng",
      value: (stats.totalTokensUsed / 1000).toFixed(1) + "K",
      subtitle: `${(stats.thisMonthTokens / 1000).toFixed(1)}K tháng này`,
      icon: Zap,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-950/30",
    },
    {
      title: "Skill modules",
      value: `${stats.activeSkills}/${stats.totalSkills}`,
      subtitle: "đang hoạt động",
      icon: Activity,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      title: "Tỷ lệ thành công",
      value: stats.avgSuccessRate.toFixed(1) + "%",
      subtitle: "trung bình tất cả skills",
      icon: TrendingUp,
      color: "text-violet-600",
      bg: "bg-violet-50 dark:bg-violet-950/30",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`rounded-lg p-2 ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Sparkles className="h-3 w-3" />
              {card.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
