import {
  ArrowRightLeft,
  Bug,
  FileSpreadsheet,
  FileText,
  GitBranch,
  Key,
  LayoutDashboard,
  type LucideIcon,
  Presentation,
  Zap,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Tổng quan",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard/default",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: 2,
    label: "Skill Modules",
    items: [
      {
        title: "DOCX — Công văn",
        url: "/dashboard/skills/docx",
        icon: FileText,
      },
      {
        title: "PPTX — Thuyết trình",
        url: "/dashboard/skills/pptx",
        icon: Presentation,
      },
      {
        title: "Excel — Bảng tính",
        url: "/dashboard/skills/excel",
        icon: FileSpreadsheet,
      },
      {
        title: "UML — Sơ đồ",
        url: "/dashboard/skills/uml",
        icon: GitBranch,
      },
      {
        title: "Bug & Release",
        url: "/dashboard/skills/bug-release",
        icon: Bug,
      },
      {
        title: "Transfer KN",
        url: "/dashboard/skills/transfer",
        icon: ArrowRightLeft,
      },
      {
        title: "Feature Track",
        url: "/dashboard/skills/feature",
        icon: Zap,
        isNew: true,
      },
    ],
  },
];
