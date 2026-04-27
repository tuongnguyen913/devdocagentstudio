"use client";

import { useState } from "react";
import { Check, Copy, RotateCcw, Save } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { SkillConfig, SkillModuleId } from "@/data/skills";

interface Props {
  config: SkillConfig;
  moduleId: SkillModuleId;
}

export function PromptEditorTab({ config, moduleId }: Props) {
  const [prompt, setPrompt] = useState(config.prompt);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const charCount = prompt.length;
  const tokenEstimate = Math.ceil(charCount / 4);
  const hasChanges = prompt !== config.prompt;

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/skills/${moduleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPrompt(config.prompt);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Editor */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">System Prompt</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Prompt được gửi đến Gemini AI mỗi khi skill này được gọi. Thay đổi có hiệu lực ngay lập tức.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-1.5"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={!hasChanges}
              className="gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="gap-1.5"
            >
              {saved ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {saving ? "Saving..." : saved ? "Saved!" : "Save"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[400px] font-mono text-sm leading-relaxed resize-y"
            placeholder="Enter system prompt..."
          />
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs">
                {charCount.toLocaleString()} ký tự
              </Badge>
              <Badge variant="outline" className="text-xs">
                ~{tokenEstimate.toLocaleString()} tokens
              </Badge>
            </div>
            {hasChanges && (
              <Badge variant="secondary" className="text-xs text-amber-600">
                Chưa lưu
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">💡 Mẹo viết prompt hiệu quả</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• Định nghĩa rõ vai trò (role) và nhiệm vụ (task) cho AI</p>
          <p>• Chỉ định output format cụ thể (JSON schema)</p>
          <p>• Thêm ràng buộc (constraints) để kiểm soát chất lượng</p>
          <p>• Cung cấp ví dụ mẫu cho các trường hợp phổ biến</p>
          <p>• Giữ prompt dưới 2000 tokens để tối ưu chi phí</p>
        </CardContent>
      </Card>
    </div>
  );
}
