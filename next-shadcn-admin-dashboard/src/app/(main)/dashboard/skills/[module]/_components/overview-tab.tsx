"use client";

import {
  CheckCircle,
  Download,
  FileText,
  TrendingUp,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SkillModuleData } from "@/data/skills";

export function OverviewTab({ data }: { data: SkillModuleData }) {
  const { config, stats, documents } = data;

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng tài liệu</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGenerated}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.thisMonthGenerated} tháng này
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tokens đã dùng</CardTitle>
            <Zap className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.totalTokensUsed / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-muted-foreground">
              ~{stats.avgTokensPerRequest} tokens/request
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tỷ lệ thành công</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {stats.successRate}%
            </div>
            <p className="text-xs text-muted-foreground">trong 30 ngày</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tháng này</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonthGenerated}</div>
            <p className="text-xs text-muted-foreground">
              {(stats.thisMonthTokens / 1000).toFixed(1)}K tokens
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Chart - Simple bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sử dụng 7 ngày gần nhất</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-32">
            {stats.dailyUsage.map((day) => {
              const maxCount = Math.max(
                ...stats.dailyUsage.map((d) => d.count),
                1
              );
              const height = (day.count / maxCount) * 100;
              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span className="text-xs font-medium">{day.count}</span>
                  <div
                    className="w-full rounded-t transition-all duration-500"
                    style={{
                      height: `${Math.max(height, 4)}%`,
                      backgroundColor:
                        day.count > 0 ? config.color : "hsl(var(--muted))",
                      opacity: day.count > 0 ? 1 : 0.3,
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(day.date).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tài liệu gần đây</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between px-6 py-3 hover:bg-muted/50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{doc.fileName}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {doc.userRequest}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {(doc.fileSize / 1024).toFixed(0)} KB
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {doc.tokensUsed} tokens
                  </span>
                  <Badge
                    variant={doc.status === "success" ? "default" : "destructive"}
                    className="text-[10px]"
                  >
                    {doc.status}
                  </Badge>
                  <Download className="h-3.5 w-3.5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
