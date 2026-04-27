"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  Download,
  FileText,
  Loader2,
  Paperclip,
  Plus,
  Send,
  Sparkles,
  Square,
  Trash2,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { SkillModuleId } from "@/data/skills";
import type { FormField, SkillFormSchema } from "@/data/skills/form-schemas";

interface Props {
  moduleId: SkillModuleId;
  moduleName: string;
  moduleColor: string;
  formSchema: SkillFormSchema;
}

// ── Multiline list field ─────────────────────────────────────────────────────
function MultilineListField({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [newItem, setNewItem] = useState("");

  const addItem = () => {
    if (newItem.trim()) {
      onChange([...value, newItem.trim()]);
      setNewItem("");
    }
  };

  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <Input
            value={item}
            onChange={(e) => {
              const updated = [...value];
              updated[i] = e.target.value;
              onChange(updated);
            }}
            className="flex-1 text-sm"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() => onChange(value.filter((_, idx) => idx !== i))}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={field.placeholder}
          className="flex-1 text-sm"
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem())}
        />
        <Button type="button" variant="outline" size="icon" onClick={addItem}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ── Checkbox group field ─────────────────────────────────────────────────────
function CheckboxGroupField({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      {field.options?.map((opt) => (
        <div key={opt.value} className="flex items-center gap-2">
          <Checkbox
            id={`${field.id}-${opt.value}`}
            checked={value.includes(opt.value)}
            onCheckedChange={(checked) => {
              if (checked) onChange([...value, opt.value]);
              else onChange(value.filter((v) => v !== opt.value));
            }}
          />
          <Label htmlFor={`${field.id}-${opt.value}`} className="font-normal text-sm">
            {opt.label}
          </Label>
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function GenerateClient({
  moduleId,
  moduleName,
  moduleColor,
  formSchema,
}: Props) {
  // Form state — one value per field
  const [formValues, setFormValues] = useState<Record<string, unknown>>(() => {
    const init: Record<string, unknown> = {};
    formSchema.forEach((f) => {
      if (f.type === "multiline-list" || f.type === "checkbox-group") {
        init[f.id] = [];
      } else if (f.type === "number") {
        init[f.id] = f.min ?? "";
      } else {
        init[f.id] = "";
      }
    });
    return init;
  });

  const [aiOutput, setAiOutput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingFieldId, setStreamingFieldId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [tokenCount, setTokenCount] = useState(0);
  
  // Chat Agent state
  const [chatMessage, setChatMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setFieldValue = (id: string, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [id]: value }));
  };

  // Build user request string from form values ONLY (Ignore chat/file)
  const buildFormOnlyRequest = () => {
    return formSchema
      .map((field) => {
        const val = formValues[field.id];
        if (!val || (Array.isArray(val) && val.length === 0)) return null;
        const displayVal = Array.isArray(val) ? val.join(", ") : val;
        return `${field.label}: ${displayVal}`;
      })
      .filter(Boolean)
      .join("\n");
  };

  // Build user request string from form values, chat message, and file content
  const buildUserRequest = () => {
    let requestText = buildFormOnlyRequest();

    if (fileContent) {
      requestText += `\n\n--- TÀI LIỆU ĐÍNH KÈM (${selectedFile?.name}) ---\n${fileContent}\n--------------------------`;
    }

    if (chatMessage.trim()) {
      requestText += `\n\n--- YÊU CẦU BỔ SUNG ---\n${chatMessage.trim()}`;
    }

    return requestText;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      setFileContent(evt.target?.result as string);
    };
    reader.readAsText(file);
  };
  
  const removeFile = () => {
    setSelectedFile(null);
    setFileContent(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Stream from Gemini API
  const startStream = useCallback(
    async (customPrompt?: string) => {
      const userRequest = customPrompt ?? buildUserRequest();
      if (!userRequest.trim()) return;

      setAiOutput("");
      setIsStreaming(true);
      setStreamingFieldId(customPrompt ? null : "full");
      setTokenCount(0);

      const start = Date.now();
      timerRef.current = setInterval(() => setElapsed((Date.now() - start) / 1000), 100);

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
          buffer = lines.pop() ?? "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.type === "text") {
                    setAiOutput((prev) => prev + data.content);
                    tokens += data.content.split(/\s+/).filter(Boolean).length;
                    setTokenCount(tokens);
                  } else if (data.type === "error") {
                    // Check if it's a 429
                    if (data.content.includes("429") || data.content.includes("Too Many Requests")) {
                      setAiOutput((prev) => prev + "\n\n❌ LỖI 429: Vượt quá giới hạn số lượt sử dụng API Gemini miễn phí. Vui lòng thử lại sau.");
                    } else {
                      setAiOutput((prev) => prev + "\n\n❌ LỖI AI: " + data.content);
                    }
                  }
                } catch {
                  /* skip malformed */
                }
              }
            }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          setAiOutput((prev) => prev + "\n\n⏹ Đã dừng.");
        }
      } finally {
        setIsStreaming(false);
        setStreamingFieldId(null);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    },
    [moduleId, formValues, formSchema]
  );

  // AI suggest for a specific field
  const handleAiSuggest = async (field: FormField) => {
    const contextRequest = `Dựa trên thông tin sau, hãy gợi ý nội dung cho trường "${field.label}":\n${buildUserRequest()}`;
    setStreamingFieldId(field.id);
    setIsStreaming(true);
    setAiOutput("");
    setTokenCount(0);

    const start = Date.now();
    timerRef.current = setInterval(() => setElapsed((Date.now() - start) / 1000), 100);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`/api/skills/${moduleId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userRequest: contextRequest }),
        signal: controller.signal,
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      let buffer = "";
      let result = "";
      let tokens = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "text") {
                result += data.content;
                tokens += data.content.split(/\s+/).filter(Boolean).length;
                setTokenCount(tokens);
              } else if (data.type === "error") {
                result += `\n[LỖI AI: ${data.content}]`;
              }
            } catch {/* skip */}
          }
        }
      }
      // Put AI suggestion into the field
      setFieldValue(field.id, result.trim());
    } finally {
      setIsStreaming(false);
      setStreamingFieldId(null);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleStop = () => abortRef.current?.abort();

  // ── Render a single field ─────────────────────────────────────────────────
  const renderField = (field: FormField) => {
    const val = formValues[field.id];
    const isFieldStreaming = isStreaming && streamingFieldId === field.id;

    const aiButton = field.aiSuggest ? (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs shrink-0"
        disabled={isStreaming}
        onClick={() => handleAiSuggest(field)}
      >
        {isFieldStreaming ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5 text-violet-500" />
        )}
        AI Gợi ý
      </Button>
    ) : null;

    const fieldContent = () => {
      switch (field.type) {
        case "textarea":
          return (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor={field.id} className="text-sm font-medium">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {aiButton}
              </div>
              <Textarea
                id={field.id}
                value={val as string}
                onChange={(e) => setFieldValue(field.id, e.target.value)}
                placeholder={field.placeholder}
                rows={field.rows ?? 4}
                className={`resize-y text-sm ${isFieldStreaming ? "border-violet-300 animate-pulse" : ""}`}
              />
            </div>
          );

        case "select":
          return (
            <div className="space-y-1.5">
              <Label htmlFor={field.id} className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              <Select
                value={val as string}
                onValueChange={(v) => setFieldValue(field.id, v)}
              >
                <SelectTrigger id={field.id}>
                  <SelectValue placeholder={`Chọn ${field.label.toLowerCase()}...`} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );

        case "date":
          return (
            <div className="space-y-1.5">
              <Label htmlFor={field.id} className="text-sm font-medium">
                {field.label}
              </Label>
              <Input
                id={field.id}
                type="date"
                value={val as string}
                onChange={(e) => setFieldValue(field.id, e.target.value)}
                className="text-sm"
              />
            </div>
          );

        case "number":
          return (
            <div className="space-y-1.5">
              <Label htmlFor={field.id} className="text-sm font-medium">
                {field.label}
              </Label>
              <Input
                id={field.id}
                type="number"
                value={val as number}
                min={field.min}
                max={field.max}
                onChange={(e) => setFieldValue(field.id, Number(e.target.value))}
                className="text-sm"
              />
            </div>
          );

        case "multiline-list":
          return (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {aiButton}
              </div>
              <MultilineListField
                field={field}
                value={val as string[]}
                onChange={(v) => setFieldValue(field.id, v)}
              />
            </div>
          );

        case "checkbox-group":
          return (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{field.label}</Label>
              <CheckboxGroupField
                field={field}
                value={val as string[]}
                onChange={(v) => setFieldValue(field.id, v)}
              />
            </div>
          );

        default: // text
          return (
            <div className="space-y-1.5">
              <Label htmlFor={field.id} className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              <Input
                id={field.id}
                value={val as string}
                onChange={(e) => setFieldValue(field.id, e.target.value)}
                placeholder={field.placeholder}
                className="text-sm"
              />
            </div>
          );
      }
    };

    return (
      <div key={field.id}>
        {fieldContent()}
      </div>
    );
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
            Tạo tài liệu — {moduleName}
          </h1>
          <p className="text-sm text-muted-foreground">
            Điền form hoặc nhấn ✨ AI Gợi ý trên từng trường để được AI hỗ trợ
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* LEFT: Form */}
        <Card className="overflow-auto max-h-[80vh]">
          <CardHeader className="pb-3 sticky top-0 bg-card z-10 border-b">
            <CardTitle className="text-base">Form nhập liệu</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-5">
            {formSchema.map(renderField)}

            <Separator />

            {/* Agent Chat Box */}
            <div className="space-y-3 pt-2">
              <Label className="text-sm font-medium">Yêu cầu bổ sung cho AI (Tùy chọn)</Label>
              <div className="relative">
                <Textarea
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Gõ yêu cầu bổ sung bằng ngôn ngữ tự nhiên, hoặc đính kèm file text..."
                  className="min-h-[80px] resize-y pr-12 text-sm pb-10"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (!isStreaming) startStream();
                    }
                  }}
                />
                <div className="absolute left-2 bottom-2 flex items-center gap-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".txt,.md,.csv,.json"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                    title="Đính kèm file (.txt, .md, .csv)"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute right-2 bottom-2">
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 w-7 p-0 rounded-full"
                    style={{ backgroundColor: moduleColor }}
                    disabled={isStreaming}
                    onClick={() => startStream()}
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {selectedFile && (
                <div className="flex items-center gap-2 p-2 rounded-md bg-blue-50/50 dark:bg-blue-900/20 text-xs border border-blue-100 dark:border-blue-900">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="flex-1 truncate font-medium text-blue-700 dark:text-blue-300">
                    {selectedFile.name}
                  </span>
                  <span className="text-muted-foreground">({Math.round(selectedFile.size / 1024)} KB)</span>
                  <Button type="button" variant="ghost" size="icon" className="h-5 w-5 text-destructive hover:bg-destructive/10" onClick={removeFile}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex gap-3 pt-1">
              {isStreaming && streamingFieldId === "full" ? (
                <Button onClick={handleStop} variant="destructive" className="flex-1 gap-2">
                  <Square className="h-4 w-4" />
                  Dừng AI
                </Button>
              ) : (
                <Button
                  onClick={() => startStream()}
                  disabled={isStreaming}
                  className="flex-1 gap-2"
                  style={{ backgroundColor: moduleColor }}
                >
                  {isStreaming ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {isStreaming ? "Đang tạo..." : "✨ AI Generate"}
                </Button>
              )}
              <Button
                variant="outline"
                className="flex-1"
                disabled={isStreaming}
                onClick={() => startStream(buildFormOnlyRequest())}
              >
                Tạo từ Form
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: Output */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              Kết quả
              {isStreaming && streamingFieldId === "full" && (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {(isStreaming || aiOutput) && (
                <>
                  <Badge variant="outline" className="text-xs font-mono">
                    {elapsed.toFixed(1)}s
                  </Badge>
                  <Badge variant="outline" className="text-xs font-mono">
                    ~{tokenCount} tokens
                  </Badge>
                </>
              )}
              {aiOutput && !isStreaming && (
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Download className="h-3.5 w-3.5" />
                  Tải xuống
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 pt-4">
            {aiOutput ? (
              <div className="rounded-lg bg-muted p-4 font-mono text-xs whitespace-pre-wrap min-h-[300px] max-h-[65vh] overflow-y-auto leading-relaxed">
                {aiOutput}
                {isStreaming && (
                  <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5" />
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] rounded-lg border-2 border-dashed text-muted-foreground">
                <div className="text-center">
                  <Sparkles
                    className="h-10 w-10 mx-auto mb-3 opacity-30"
                    style={{ color: moduleColor }}
                  />
                  <p className="text-sm font-medium">Chưa có kết quả</p>
                  <p className="text-xs mt-1 text-muted-foreground">
                    Điền form và nhấn "AI Generate" hoặc "Tạo từ Form"
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
