"use client";

import { useState } from "react";
import { Clock, RotateCcw, User, Hash } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { VersionEntry, SkillModuleId } from "@/data/skills";

interface Props {
  versions: VersionEntry[];
  moduleId: SkillModuleId;
}

export function HistoryTab({ versions, moduleId }: Props) {
  const [restoring, setRestoring] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleRestore = async (versionId: string) => {
    setRestoring(versionId);
    try {
      await fetch(`/api/skills/${moduleId}/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", versionId }),
      });
    } catch (error) {
      console.error("Failed to restore:", error);
    } finally {
      setRestoring(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Version History</CardTitle>
          <p className="text-sm text-muted-foreground">
            Lịch sử thay đổi system prompt. Giữ tối đa 20 versions gần nhất.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {versions.map((version, index) => (
              <div
                key={version.id}
                className="px-6 py-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3 min-w-0">
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center pt-1">
                      <div
                        className={`h-3 w-3 rounded-full border-2 ${
                          index === 0
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/30 bg-background"
                        }`}
                      />
                      {index < versions.length - 1 && (
                        <div className="w-px flex-1 bg-border mt-1" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant={index === 0 ? "default" : "outline"}
                          className="text-xs font-mono"
                        >
                          v{version.version}
                        </Badge>
                        {index === 0 && (
                          <Badge variant="secondary" className="text-[10px]">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium mt-1.5">
                        {version.changeSummary}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {version.changedBy}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(version.changedAt).toLocaleString("vi-VN")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          {version.tokenCount} tokens
                        </span>
                      </div>

                      {/* Expandable prompt preview */}
                      {expandedId === version.id && (
                        <div className="mt-3 rounded-lg bg-muted p-3 font-mono text-xs whitespace-pre-wrap max-h-48 overflow-y-auto">
                          {version.prompt}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedId(
                          expandedId === version.id ? null : version.id
                        )
                      }
                      className="text-xs"
                    >
                      {expandedId === version.id ? "Ẩn" : "Xem"}
                    </Button>
                    {index > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(version.id)}
                        disabled={restoring === version.id}
                        className="gap-1 text-xs"
                      >
                        <RotateCcw className="h-3 w-3" />
                        {restoring === version.id ? "..." : "Restore"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
