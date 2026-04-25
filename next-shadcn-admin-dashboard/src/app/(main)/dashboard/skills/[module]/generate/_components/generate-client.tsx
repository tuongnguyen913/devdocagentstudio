"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Loader2,
  Play,
  Square,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { SkillModuleId } from "@/data/skills";

interface Props {
  moduleId: SkillModuleId;
  moduleName: string;
  moduleColor: string;
}

export function GenerateClient({ moduleId, moduleName, moduleColor }: Props) {
  const [userRequest, setUserRequest] = useState("");
  const [response, setResponse] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [tokenCount, setTokenCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!userRequest.trim()) return;

    setResponse("");
    setIsStreaming(true);
    setIsDone(false);
    setTokenCount(0);

    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(((Date.now() - startTime) / 1000));
    }, 100);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`/api/skills/${moduleId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userRequest }),
        signal: controller.signal,
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No reader");

      let buffer = "";
      let tokens = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "text") {
                setResponse((prev) => prev + data.content);
                tokens += data.content.split(" ").filter(Boolean).length;
                setTokenCount(tokens);
              } else if (data.type === "done") {
                setIsDone(true);
              } else if (data.type === "error") {
                setResponse((prev) => prev + `\n\n❌ Error: ${data.content}`);
              }
            } catch {
              // skip malformed JSON
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setResponse((prev) => prev + "\n\n⏹ Đã dừng.");
      } else {
        setResponse(
          (prev) =>
            prev +
            `\n\n❌ Error: ${error instanceof Error ? error.message : "Unknown"}`
        );
      }
    } finally {
      setIsStreaming(false);
      setIsDone(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [userRequest, moduleId]);

  const handleStop = () => {
    abortRef.current?.abort();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/skills/${moduleId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-5 w-5" style={{ color: moduleColor }} />
            Generate — {moduleName}
          </h1>
          <p className="text-sm text-muted-foreground">
            Nhập yêu cầu và AI sẽ tạo tài liệu cho bạn
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">Yêu cầu</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            <Textarea
              value={userRequest}
              onChange={(e) => setUserRequest(e.target.value)}
              placeholder={`Ví dụ: Tạo ${
                moduleId === "docx"
                  ? "công văn đề nghị triển khai phần mềm"
                  : moduleId === "pptx"
                    ? "slide giới thiệu phần mềm cho Sở Nội vụ"
                    : moduleId === "excel"
                      ? "bảng báo giá phần mềm quản lý văn bản"
                      : moduleId === "uml"
                        ? "Use Case Diagram cho hệ thống quản lý hồ sơ"
                        : moduleId === "bug-release"
                          ? "release notes cho version 3.0.0"
                          : moduleId === "transfer"
                            ? "tài liệu bàn giao dự án cho team mới"
                            : "roadmap Q3 2026 cho phần mềm QLVB"
              }`}
              className="min-h-[200px] resize-y flex-1"
            />
            <div className="flex gap-2">
              {isStreaming ? (
                <Button
                  onClick={handleStop}
                  variant="destructive"
                  className="gap-2"
                >
                  <Square className="h-4 w-4" />
                  Dừng
                </Button>
              ) : (
                <Button
                  onClick={handleGenerate}
                  disabled={!userRequest.trim()}
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  Generate
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Output */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              Kết quả
              {isStreaming && (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {(isStreaming || isDone) && (
                <>
                  <Badge variant="outline" className="text-xs font-mono">
                    {elapsed.toFixed(1)}s
                  </Badge>
                  <Badge variant="outline" className="text-xs font-mono">
                    ~{tokenCount} tokens
                  </Badge>
                </>
              )}
              {isDone && response && (
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            {response ? (
              <div className="rounded-lg bg-muted p-4 font-mono text-sm whitespace-pre-wrap min-h-[200px] max-h-[500px] overflow-y-auto leading-relaxed">
                {response}
                {isStreaming && (
                  <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5" />
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] rounded-lg border-2 border-dashed text-muted-foreground">
                <div className="text-center">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    Nhập yêu cầu và nhấn Generate để bắt đầu
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
