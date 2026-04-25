"use client";

import { useState } from "react";
import { Save, Check, Upload, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { SkillConfig, SkillModuleId } from "@/data/skills";

interface Props {
  config: SkillConfig;
  moduleId: SkillModuleId;
}

export function ConfigTab({ config, moduleId }: Props) {
  const [active, setActive] = useState(config.active);
  const [schemaVersion, setSchemaVersion] = useState(config.schemaVersion);

  const handleToggleActive = async () => {
    const newValue = !active;
    setActive(newValue);
    await fetch(`/api/skills/${moduleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: newValue }),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Status Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trạng thái Skill</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Kích hoạt module</p>
            <p className="text-sm text-muted-foreground">
              Khi tắt, API endpoint sẽ trả về lỗi 503
            </p>
          </div>
          <Switch checked={active} onCheckedChange={handleToggleActive} />
        </CardContent>
      </Card>

      {/* Module Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thông tin module</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Module ID</Label>
              <Input value={config.id} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Version</Label>
              <Input value={config.version} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>KV Prefix</Label>
              <Input
                value={config.kvPrefix}
                disabled
                className="bg-muted font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>API Route</Label>
              <Input
                value={config.apiRoute}
                disabled
                className="bg-muted font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Schema Version</Label>
              <Input
                value={schemaVersion}
                onChange={(e) => setSchemaVersion(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Cập nhật lần cuối</Label>
              <Input
                value={new Date(config.lastUpdated).toLocaleString("vi-VN")}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Template File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload file template (.docx, .pptx, .xlsx) làm mẫu cho skill. File
            sẽ được lưu trên Vercel Blob.
          </p>
          {config.templateUrl ? (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-mono truncate">
                  {config.templateUrl}
                </span>
              </div>
              <Button variant="ghost" size="icon" className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-8 cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="text-center">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">Kéo thả hoặc click để upload</p>
                <p className="text-xs text-muted-foreground mt-1">
                  .docx, .pptx, .xlsx — Max 10MB
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* KV Keys Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">KV Keys Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted p-4 font-mono text-sm space-y-1">
            <p><span className="text-muted-foreground"># System Prompt</span></p>
            <p>{config.kvPrefix}:prompt</p>
            <p className="mt-2"><span className="text-muted-foreground"># Version History</span></p>
            <p>{config.kvPrefix}:prompt:history</p>
            <p className="mt-2"><span className="text-muted-foreground"># Active Status</span></p>
            <p>{config.kvPrefix}:active</p>
            <p className="mt-2"><span className="text-muted-foreground"># Template URL</span></p>
            <p>{config.kvPrefix}:template_url</p>
            <p className="mt-2"><span className="text-muted-foreground"># Schema Version</span></p>
            <p>{config.kvPrefix}:version</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
