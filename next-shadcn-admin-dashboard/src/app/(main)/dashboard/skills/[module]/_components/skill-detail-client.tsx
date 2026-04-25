"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRightLeft,
  Bug,
  Clock,
  FileSpreadsheet,
  FileText,
  GitBranch,
  Play,
  Presentation,
  Settings2,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SkillModuleData, SkillModuleId } from "@/data/skills";

import { OverviewTab } from "./overview-tab";
import { PromptEditorTab } from "./prompt-editor-tab";
import { ConfigTab } from "./config-tab";
import { HistoryTab } from "./history-tab";

const iconMap: Record<string, LucideIcon> = {
  FileText,
  Presentation,
  Sheet: FileSpreadsheet,
  GitBranch,
  Bug,
  ArrowRightLeft,
  Zap,
};

interface Props {
  data: SkillModuleData;
  moduleId: SkillModuleId;
}

export function SkillDetailClient({ data, moduleId }: Props) {
  const [activeTab, setActiveTab] = useState("overview");
  const Icon = iconMap[data.config.icon] ?? FileText;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/default">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${data.config.color}15` }}
          >
            <Icon className="h-6 w-6" style={{ color: data.config.color }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {data.config.name}
              </h1>
              <Badge
                variant={data.config.active ? "default" : "secondary"}
                className="text-xs"
              >
                {data.config.active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {data.config.description} · v{data.config.version}
            </p>
          </div>
        </div>
        <Link href={`/dashboard/skills/${moduleId}/generate`}>
          <Button className="gap-2">
            <Play className="h-4 w-4" />
            Generate
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="prompt" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            System Prompt
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-1.5">
            <Settings2 className="h-3.5 w-3.5" />
            Config
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab data={data} />
        </TabsContent>

        <TabsContent value="prompt" className="mt-6">
          <PromptEditorTab config={data.config} moduleId={moduleId} />
        </TabsContent>

        <TabsContent value="config" className="mt-6">
          <ConfigTab config={data.config} moduleId={moduleId} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <HistoryTab versions={data.versions} moduleId={moduleId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
