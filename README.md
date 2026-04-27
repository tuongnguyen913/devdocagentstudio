<p align="center">
  <img src="docs/assets/banner.png" alt="DevDocs Studio Banner" width="100%" />
</p>

<h1 align="center">DevDocs Studio</h1>

<p align="center">
  <strong>AI-powered document factory dành cho developer làm phần mềm nhà nước Việt Nam</strong>
</p>

<p align="center">
  <a href="#-giới-thiệu">Giới thiệu</a> ·
  <a href="#-tính-năng">Tính năng</a> ·
  <a href="#-kiến-trúc">Kiến trúc</a> ·
  <a href="#-stack-công-nghệ">Stack</a> ·
  <a href="#-quick-start">Quick Start</a> ·
  <a href="#-roadmap">Roadmap</a>
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs&style=flat-square" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&style=flat-square" />
  <img alt="Vercel" src="https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel&style=flat-square" />
  <img alt="OpenAI API" src="https://img.shields.io/badge/AI-OpenAI-green?style=flat-square" />
  <img alt="License" src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
</p>

***

## 🎯 Giới thiệu

Làm phần mềm cho khách hàng nhà nước Việt Nam không chỉ đòi hỏi code tốt — mà còn đòi hỏi **tài liệu đúng chuẩn, đúng format, đúng văn phong hành chính**.

Một developer thường xuyên phải xử lý:

- 📄 **Tài liệu Word** theo chuẩn Nghị định 30 (Times New Roman 13pt, lề chuẩn, Quốc hiệu – Tiêu ngữ đúng vị trí)
- 📊 **Slide PowerPoint** để demo phần mềm với lãnh đạo UBND, Sở, Phòng
- 📋 **Bảng Excel** báo giá, theo dõi tính năng, tracking tiến độ
- 🔷 **Sơ đồ UML** cho hệ thống mới
- 🐛 **Bug reports & Release notes** chuyên nghiệp
- 📦 **Tài liệu bàn giao kỹ thuật** cho team mới
- 🗺️ **Feature roadmap & sprint board** để quản lý phát triển

Mỗi loại có quy chuẩn riêng, format riêng, và mất nhiều giờ để làm đúng — trong khi đây đều là **công việc lặp đi lặp lại**.

**DevDocs Studio** giải quyết bài toán đó bằng cách cung cấp bộ công cụ tạo tài liệu tự động, được điều phối bởi AI (OpenAI API), chạy hoàn toàn trên **Vercel Free/Pro**, không cần server riêng.

***

## ✨ Tính năng

DevDocs Studio gồm **7 skill module độc lập**, mỗi module là một Vercel Serverless Function chuyên biệt:

| # | Module | Mô tả | Output |
|---|--------|--------|--------|
| 1 | 📝 **DOCX** | Tài liệu hành chính, hướng dẫn sử dụng, công văn chuẩn Nghị định 30 | `.docx` |
| 2 | 📊 **PPTX** | Slide demo phần mềm, triển khai, thuyết trình cho lãnh đạo | `.pptx` |
| 3 | 📋 **Excel** | Bảng báo giá, theo dõi tính năng, tracking trạng thái dự án | `.xlsx` |
| 4 | 🔷 **UML** | Use case, class diagram, sequence, ERD — render ra SVG/PNG | `.svg` / `.png` |
| 5 | 🐛 **Bug & Release** | Theo dõi lỗi, release notes, changelog theo version | `.docx` / `.xlsx` |
| 6 | 📦 **Transfer KN** | Tài liệu bàn giao kỹ thuật, onboarding developer mới | `.docx` |
| 7 | 🗺️ **Feature Track** | Roadmap theo quý, sprint board, backlog management | `.xlsx` |

### 🔧 Admin Panel

Mỗi skill có **system prompt và template riêng**, quản lý qua `/admin/skills`:

- ✏️ Xem và sửa system prompt của từng module
- 📁 Upload template mới (`.docx` / `.pptx` / `.xlsx`)
- 🕐 Version history — lưu tối đa 10 bản thay đổi
- 🔐 Bảo vệ bằng JWT Authentication (bảo mật cao)
- 🚀 Thay prompt không cần deploy lại code

***

## 🏗️ Kiến trúc

```
Trình duyệt / Developer
        │
        ▼
Vercel Platform (CDN + Serverless Functions)
        │
        ▼
Next.js 14 Frontend (React + TypeScript + Tailwind)
Trang chủ · Skill Dashboard · Skill Editor · Preview · Export
        │
        │  7 Skill Modules — mỗi module 1 Vercel Serverless Function
        │  /api/skills/[module]
        │
        ▼
┌─────────────────────────────────────────────────────┐
│         Vercel Serverless Functions                 │
│  OpenAI API · docx-js · SheetJS · pptxgenjs · Kroki │
└──────────────┬──────────────────────┬───────────────┘
               │                      │
               ▼                      ▼
    Database (Neon Postgres)   File Output Store
    Drizzle ORM                Vercel Blob
    Users + Skill Configs      .docx / .pptx
    + style per module         .xlsx / .pdf
               │
               ▼
    Skill Admin Panel — /admin/skills
    Xem · Sửa prompt · Cập nhật template · Version history
    Bảo vệ bằng JWT Auth
```

### Luồng xử lý một request

```
1. User nhập form (loại tài liệu, nội dung, thông tin)
        ↓
2. POST /api/skills/[module]
        ↓
3. Đọc system prompt từ Neon DB (Postgres)
4. Đọc template URL từ Database
        ↓
5. Gọi OpenAI API (streaming) → sinh structured JSON
        ↓
6. Thư viện chuyên dụng render JSON → file Buffer
   (docx-js / pptxgenjs / SheetJS / Kroki)
        ↓
7. Upload Buffer lên Vercel Blob → nhận download URL
        ↓
8. Response trả về: { downloadUrl, previewUrl, expiresIn }
        ↓
9. Frontend hiển thị preview + nút tải file
```

***

## 🛠️ Stack công nghệ

| Layer | Công nghệ | Ghi chú |
|-------|-----------|---------|
| **Frontend** | Next.js 14 · React · TypeScript · Tailwind CSS · shadcn/ui | App Router |
| **Backend** | Vercel Serverless Functions | `/api/skills/[module]` |
| **AI** | OpenAI API (`gpt-4o-mini`, `gpt-4o`) | Streaming responses, luân chuyển model |
| **Database** | Neon Postgres (Drizzle ORM) | Users, Prompt + template config |
| **File Store** | Vercel Blob | Output files tạm thời |
| **Auth** | JWT Auth | Custom JWT middleware bảo mật |
| **DOCX** | docx-js (npm `docx`) | Chuẩn Nghị định 30 |
| **PPTX** | pptxgenjs | Slide demo phần mềm |
| **Excel** | SheetJS (xlsx) | Báo giá, tracking |
| **UML** | Kroki.io API | Mermaid / PlantUML → SVG |
| **Deploy** | Vercel Free/Pro | Không cần server riêng |

> 💡 **Toàn bộ infrastructure chạy 100% trên Vercel** — không cần VPS, không cần Docker, không cần database server riêng. Chi phí vận hành: $0 trên Free tier.

***

## 🚀 Quick Start

### Yêu cầu

- Node.js >= 18
- Tài khoản Vercel (Free là đủ)
- OpenAI API key
- Neon Database (Postgres) connection string

### Cài đặt local

```bash
# Clone repo
git clone https://github.com/your-username/devdocs-studio.git
cd devdocs-studio

# Cài dependencies
npm install

# Copy env template
cp .env.example .env.local
```

### Cấu hình `.env.local`

```env
# OpenAI API
OPENAI_API_KEY=sk-proj-...

# Vercel Postgres / Neon DB
DATABASE_URL=postgresql://...
POSTGRES_URL=postgresql://...

# Vercel Blob
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# JWT Auth
JWT_SECRET=your-secure-secret-here
```

### Chạy development

```bash
npm run dev
# Mở http://localhost:3000
```

### Deploy lên Vercel

```bash
# Cài Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Sau khi deploy, vào **Vercel Dashboard → Settings → Environment Variables** để thêm các biến môi trường cho Database và OpenAI.

***

## 📁 Cấu trúc project

```
devdocs-studio/
├── app/
│   ├── (dashboard)/
│   │   ├── page.tsx              # Trang chủ - skill dashboard
│   │   └── skill/[module]/       # Trang từng skill
│   ├── admin/
│   │   └── skills/               # Admin panel
│   └── api/
│       └── skills/
│           └── [module]/
│               └── route.ts      # Serverless function mỗi skill
├── components/
│   ├── skill-editor/             # Form input cho từng skill
│   ├── preview/                  # File preview component
│   └── admin/                    # Admin panel components
├── lib/
│   ├── skills/                   # Engine từng skill module
│   │   ├── docx.ts
│   │   ├── pptx.ts
│   │   ├── excel.ts
│   │   ├── uml.ts
│   │   ├── bug-release.ts
│   │   ├── transfer-kn.ts
│   │   └── feature-track.ts
│   ├── db/                       # Drizzle ORM config & schema
│   ├── blob.ts                   # Vercel Blob helpers
│   └── openai-client.ts          # OpenAI API client
├── skills/                       # Skill config files (.md)
│   ├── SKILL-1.Tai-Lieu-Word.md
│   ├── SKILL-2.PPTX.md
│   └── ...
└── public/
```

***

## 📄 Skill Modules — Chi tiết

### SKILL-1: DOCX — Tài liệu Word chuẩn hành chính

Tạo file `.docx` theo chuẩn **Nghị định 30/2020/NĐ-CP**:

- Font: Times New Roman 13pt
- Lề: Trái 30mm · Phải 20mm · Trên/Dưới 25mm
- Căn đều 2 bên, dãn dòng Exactly 26pt
- Đầy đủ Quốc hiệu – Tiêu ngữ – Địa danh ngày tháng
- Hỗ trợ: Công văn, Biên bản, Báo cáo, Hướng dẫn sử dụng, CV

### SKILL-2: PPTX — Slide demo phần mềm

Tạo file `.pptx` chuyên nghiệp cho demo và triển khai:

- 3 preset theme: Government Formal · Software Demo Clean · Executive Briefing
- 8 layout cố định: Cover · Agenda · Feature Grid · Screenshot Focus · Workflow · Metrics · Closing
- Phong cách: trang trọng, rõ ràng, không loè loẹt — phù hợp UBND/Sở/Ban

### SKILL-3: Excel — Báo giá & Tracking

Tạo file `.xlsx` với đầy đủ tính năng:

- Bảng báo giá phần mềm, định dạng tiền VNĐ (₫ #,##0)
- Theo dõi tính năng + tracking trạng thái (Đang làm / Hoàn thành / Lỗi)
- Feature tracking với conditional formatting, freeze header, auto-filter

### SKILL-4: UML — Sơ đồ hệ thống

Render sơ đồ qua **Kroki.io API** (không cần Puppeteer/browser):

- Use case diagram, Class diagram, Sequence diagram, ERD
- Input: mô tả bằng text → AI sinh Mermaid/PlantUML → render SVG/PNG
- Nhúng được vào DOCX hoặc tải về trực tiếp

### SKILL-5: Bug & Release

- Bảng theo dõi lỗi: Bug ID · Mô tả · Severity · Assignee · Status · Version fix
- Release notes tự động theo format changelog chuẩn (Keep a Changelog)
- Export ra `.docx` hoặc `.xlsx`

### SKILL-6: Transfer KN — Bàn giao kỹ thuật

Tài liệu bàn giao kỹ thuật nội bộ với cấu trúc chuẩn:

> Tổng quan hệ thống → Kiến trúc → Hướng dẫn setup môi trường → Danh sách API → Cấu hình hệ thống → Liên hệ hỗ trợ

### SKILL-7: Feature Track

File `.xlsx` 3 sheet:
- **Roadmap**: Tính năng theo quý (Q1/Q2/Q3/Q4)
- **Sprint Board**: Kanban-style theo dõi sprint hiện tại
- **Backlog**: Danh sách tính năng chờ phát triển với priority

***

## 🗺️ Roadmap

- [x] Phân tích kiến trúc tổng thể
- [x] Thiết kế SKILL-1 (DOCX) chuẩn Nghị định 30
- [x] Thiết kế SKILL-2 (PPTX) cho demo phần mềm
- [x] Xây dựng Next.js 14 project skeleton
- [x] Admin Panel + JWT Authentication
- [x] Neon Postgres (Drizzle) / Blob integration
- [x] Chuyển đổi toàn diện sang OpenAI (Dynamic Model Routing)
- [x] Implement SKILL-1 (DOCX)
- [x] Implement SKILL-3 (Excel)
- [x] Implement SKILL-5 (Bug & Release)
- [x] Implement SKILL-2 (PPTX)
- [x] Implement SKILL-7 (Feature Track)
- [x] Implement SKILL-6 (Transfer KN)
- [ ] Implement SKILL-4 (UML via Kroki)
- [x] UI/UX hoàn chỉnh
- [x] Testing & Deploy production (Vercel)

***

## 🤝 Đóng góp

Dự án đang trong giai đoạn xây dựng. Mọi ý kiến đóng góp đều được chào đón!

1. Fork repo
2. Tạo feature branch: `git checkout -b feature/ten-tinh-nang`
3. Commit: `git commit -m 'feat: mô tả thay đổi'`
4. Push: `git push origin feature/ten-tinh-nang`
5. Tạo Pull Request

***

## 📜 License

MIT License — xem file [LICENSE](LICENSE) để biết thêm chi tiết.

***

<p align="center">
  Được xây dựng với ❤️ cho các developer Việt Nam phục vụ cơ quan nhà nước
</p>
