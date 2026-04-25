"use client";

import {
  ArrowRightLeft,
  Bug,
  FileSpreadsheet,
  FileText,
  GitBranch,
  Presentation,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SkillConfig } from "@/data/skills";

const iconMap: Record<string, LucideIcon> = {
  FileText,
  Presentation,
  Sheet: FileSpreadsheet,
  GitBranch,
  Bug,
  ArrowRightLeft,
  Zap,
};

interface SkillCardProps {
  config: SkillConfig;
  stats?: {
    totalGenerated: number;
    thisMonthGenerated: number;
    successRate: number;
  };
}

export function SkillCard({ config, stats }: SkillCardProps) {
  const Icon = iconMap[config.icon] ?? FileText;

  return (
    <Link href={`/dashboard/skills/${config.id}`}>
      <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer border-border/50 hover:border-border">
        {/* Color accent bar */}
        <div
          className="absolute inset-x-0 top-0 h-1 transition-all duration-300 group-hover:h-1.5"
          style={{ backgroundColor: config.color }}
        />

        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${config.color}15` }}
            >
              <Icon className="h-5 w-5" style={{ color: config.color }} />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{config.name}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">v{config.version}</p>
            </div>
          </div>
          <Badge variant={config.active ? "default" : "secondary"} className="text-[10px] px-2 py-0.5">
            {config.active ? "Active" : "Inactive"}
          </Badge>
        </CardHeader>

        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {config.description}
          </p>

          {stats && (
            <div className="grid grid-cols-3 gap-2 border-t pt-3">
              <div className="text-center">
                <p className="text-lg font-bold" style={{ color: config.color }}>
                  {stats.totalGenerated}
                </p>
                <p className="text-[10px] text-muted-foreground">Total</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">{stats.thisMonthGenerated}</p>
                <p className="text-[10px] text-muted-foreground">This month</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-emerald-600">
                  {stats.successRate.toFixed(0)}%
                </p>
                <p className="text-[10px] text-muted-foreground">Success</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
