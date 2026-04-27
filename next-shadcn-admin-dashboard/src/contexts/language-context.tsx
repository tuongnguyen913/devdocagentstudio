"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type Language = "vi" | "en";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  vi: {
    dashboard: "Tổng quan",
    "skill.modules": "Skill Modules",
    generate: "Tạo tài liệu",
    overview: "Tổng quan",
    "system.prompt": "System Prompt",
    config: "Cấu hình",
    history: "Lịch sử",
    login: "Đăng nhập",
    logout: "Đăng xuất",
    search: "Tìm kiếm",
    "search.placeholder": "Tìm kiếm module, tính năng...",
    account: "Tài khoản",
    notifications: "Thông báo",
    "total.docs": "Tổng tài liệu tạo",
    "tokens.used": "Tokens sử dụng",
    "success.rate": "Tỷ lệ thành công",
    "this.month": "Tháng này",
    "recent.activity": "Hoạt động gần đây",
    save: "Lưu",
    reset: "Đặt lại",
    copy: "Sao chép",
    restore: "Khôi phục",
    active: "Đang hoạt động",
    inactive: "Tạm dừng",
    "ai.suggest": "✨ AI Gợi ý",
    "generate.form": "Tạo từ Form",
    "no.results": "Không tìm thấy kết quả.",
  },
  en: {
    dashboard: "Dashboard",
    "skill.modules": "Skill Modules",
    generate: "Generate",
    overview: "Overview",
    "system.prompt": "System Prompt",
    config: "Config",
    history: "History",
    login: "Login",
    logout: "Log out",
    search: "Search",
    "search.placeholder": "Search modules, features...",
    account: "Account",
    notifications: "Notifications",
    "total.docs": "Total Documents",
    "tokens.used": "Tokens Used",
    "success.rate": "Success Rate",
    "this.month": "This Month",
    "recent.activity": "Recent Activity",
    save: "Save",
    reset: "Reset",
    copy: "Copy",
    restore: "Restore",
    active: "Active",
    inactive: "Inactive",
    "ai.suggest": "✨ AI Suggest",
    "generate.form": "Generate from Form",
    "no.results": "No results found.",
  },
};

const LanguageContext = createContext<LanguageContextValue>({
  language: "vi",
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("devdocs_lang") as Language) || "vi";
    }
    return "vi";
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("devdocs_lang", lang);
    }
  };

  const t = (key: string) => translations[language][key] ?? key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
