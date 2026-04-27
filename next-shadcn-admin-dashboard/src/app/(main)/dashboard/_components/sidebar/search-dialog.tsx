"use client";
import * as React from "react";

import { useRouter } from "next/navigation";

import {
  ArrowRightLeft,
  Bug,
  FileSpreadsheet,
  FileText,
  GitBranch,
  LayoutDashboard,
  Presentation,
  Search,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const skillItems = [
  { label: "Dashboard", icon: LayoutDashboard, url: "/dashboard/default", group: "Tổng quan" },
  { label: "DOCX — Công văn hành chính", icon: FileText, url: "/dashboard/skills/docx", group: "Skill Modules" },
  { label: "PPTX — Slide thuyết trình", icon: Presentation, url: "/dashboard/skills/pptx", group: "Skill Modules" },
  { label: "Excel — Bảng tính & Báo giá", icon: FileSpreadsheet, url: "/dashboard/skills/excel", group: "Skill Modules" },
  { label: "UML — Sơ đồ kỹ thuật", icon: GitBranch, url: "/dashboard/skills/uml", group: "Skill Modules" },
  { label: "Bug & Release Notes", icon: Bug, url: "/dashboard/skills/bug-release", group: "Skill Modules" },
  { label: "Transfer KN — Bàn giao kỹ thuật", icon: ArrowRightLeft, url: "/dashboard/skills/transfer", group: "Skill Modules" },
  { label: "Feature Track — Theo dõi tính năng", icon: Zap, url: "/dashboard/skills/feature", group: "Skill Modules" },
];

export function SearchDialog() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const groups = [...new Set(skillItems.map((item) => item.group))];

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (url: string) => {
    setOpen(false);
    router.push(url);
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="link"
        className="px-0! font-normal text-muted-foreground hover:no-underline"
      >
        <Search data-icon="inline-start" />
        Tìm kiếm
        <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium text-[10px]">
          <span className="text-xs">⌘</span>J
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Tìm kiếm module, tính năng..." />
          <CommandList>
            <CommandEmpty>Không tìm thấy kết quả.</CommandEmpty>
            {groups.map((group) => (
              <CommandGroup key={group} heading={group}>
                {skillItems
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <CommandItem
                      key={item.label}
                      onSelect={() => handleSelect(item.url)}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.label}</span>
                    </CommandItem>
                  ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
