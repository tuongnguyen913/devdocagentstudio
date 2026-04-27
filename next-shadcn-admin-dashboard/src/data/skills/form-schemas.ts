// ============================================================================
// Form Field Definitions for all 7 Skill Modules
// Designed for highly detailed and professional document generation.
// ============================================================================

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "date"
  | "number"
  | "multiline-list" // Dynamic list of items (add/remove)
  | "checkbox-group" // Multi-select checkboxes
  | "color";

export interface FormField {
  id: string;
  label: string;
  placeholder?: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[]; // for select / checkbox-group
  min?: number;
  max?: number;
  aiSuggest?: boolean; // Show ✨ AI Gợi ý button next to this field
  rows?: number; // For textarea
}

export type SkillFormSchema = FormField[];

export const formSchemas: Record<string, SkillFormSchema> = {
  // ── 1. DOCX ─────────────────────────────────────────────────────────────
  docx: [
    {
      id: "documentType",
      label: "Loại văn bản",
      type: "select",
      required: true,
      options: [
        { value: "cong-van", label: "Công văn" },
        { value: "to-trinh", label: "Tờ trình" },
        { value: "thong-bao", label: "Thông báo" },
        { value: "quyet-dinh", label: "Quyết định" },
        { value: "bien-ban", label: "Biên bản họp" },
        { value: "bao-cao", label: "Báo cáo tiến độ" },
      ],
    },
    {
      id: "tieuDe",
      label: "Tiêu đề văn bản / Trích yếu",
      type: "text",
      required: true,
      placeholder: "VD: V/v triển khai phần mềm quản lý văn bản quý 3",
    },
    {
      id: "mucDich",
      label: "Mục đích phát hành",
      type: "textarea",
      rows: 2,
      placeholder: "Lý do viết văn bản này...",
    },
    {
      id: "canCu",
      label: "Căn cứ pháp lý / Chỉ đạo",
      type: "multiline-list",
      placeholder: "Căn cứ Nghị định... / Căn cứ Biên bản...",
      aiSuggest: true,
    },
    {
      id: "donViGui",
      label: "Cơ quan ban hành (Bên gửi)",
      type: "text",
      required: true,
      placeholder: "VD: Công ty TNHH VPSTech",
    },
    {
      id: "donViNhan",
      label: "Nơi nhận (Kính gửi)",
      type: "text",
      placeholder: "VD: Ban Giám đốc; Các phòng ban",
    },
    {
      id: "noiDung",
      label: "Nội dung chính",
      type: "textarea",
      required: true,
      rows: 6,
      aiSuggest: true,
      placeholder: "Nhập diễn giải chi tiết nội dung cần truyền đạt...",
    },
    {
      id: "deXuat",
      label: "Đề xuất / Kiến nghị (Nếu có)",
      type: "textarea",
      rows: 3,
      aiSuggest: true,
      placeholder: "Kính đề nghị Ban giám đốc phê duyệt...",
    },
    {
      id: "nguoiKy",
      label: "Người ký",
      type: "text",
      placeholder: "VD: Nguyễn Văn A",
    },
    {
      id: "chucVu",
      label: "Chức vụ người ký",
      type: "text",
      placeholder: "VD: Giám đốc",
    },
    {
      id: "doMat",
      label: "Độ mật",
      type: "select",
      options: [
        { value: "normal", label: "Bình thường" },
        { value: "mat", label: "Mật" },
        { value: "toi-mat", label: "Tối Mật" },
      ],
    },
  ],

  // ── 2. PPTX ─────────────────────────────────────────────────────────────
  pptx: [
    {
      id: "tenSanPham",
      label: "Tên Chủ đề / Sản phẩm",
      type: "text",
      required: true,
      placeholder: "VD: Ra mắt tính năng AI Copilot",
    },
    {
      id: "doiTuong",
      label: "Đối tượng khán giả",
      type: "select",
      required: true,
      options: [
        { value: "lanh-dao", label: "Ban giám đốc / C-level (Tập trung chiến lược, số liệu)" },
        { value: "ky-thuat", label: "Đội kỹ thuật (Tập trung kiến trúc, code)" },
        { value: "khach-hang", label: "Khách hàng (Tập trung lợi ích, giải pháp)" },
        { value: "sales", label: "Đội Sales/Marketing (Tập trung USP, điểm bán hàng)" },
      ],
    },
    {
      id: "thoiLuong",
      label: "Thời lượng dự kiến (Phút)",
      type: "number",
      min: 5,
      max: 120,
    },
    {
      id: "phongCach",
      label: "Phong cách thiết kế",
      type: "select",
      options: [
        { value: "professional", label: "Chuyên nghiệp / Trịnh trọng" },
        { value: "modern", label: "Hiện đại / Sáng tạo" },
        { value: "minimalist", label: "Tối giản (Minimalist)" },
        { value: "storytelling", label: "Kể chuyện (Storytelling)" },
      ],
    },
    {
      id: "diemChinh",
      label: "Dàn ý / Các điểm chính (Key Takeaways)",
      type: "textarea",
      rows: 5,
      aiSuggest: true,
      placeholder: "Mỗi dòng là một điểm chính.\nVD:\n- Thực trạng hiện tại\n- Giải pháp đề xuất\n- Lộ trình triển khai",
    },
    {
      id: "callToAction",
      label: "Kêu gọi hành động (Call to Action)",
      type: "text",
      placeholder: "Mục đích cuối cùng sau buổi thuyết trình là gì?",
      aiSuggest: true,
    },
    {
      id: "ghiChu",
      label: "Ghi chú thêm cho AI",
      type: "textarea",
      rows: 3,
      placeholder: "VD: Cần 1 slide phân tích SWOT, không dùng quá nhiều chữ...",
    },
  ],

  // ── 3. EXCEL ────────────────────────────────────────────────────────────
  excel: [
    {
      id: "loaiFile",
      label: "Loại bảng tính",
      type: "select",
      required: true,
      options: [
        { value: "bao-gia", label: "Báo giá dự án / Khối lượng" },
        { value: "feature-matrix", label: "Feature Tracking Matrix" },
        { value: "timeline", label: "Timeline / Kế hoạch (Gantt)" },
        { value: "kpi", label: "Bảng theo dõi KPI" },
        { value: "so-sanh", label: "Bảng so sánh giải pháp" },
      ],
    },
    {
      id: "tenDuAn",
      label: "Tên dự án / Hạng mục",
      type: "text",
      required: true,
      placeholder: "VD: Dự án Số hóa Tài liệu Q3",
    },
    {
      id: "thoiGian",
      label: "Giai đoạn áp dụng",
      type: "text",
      placeholder: "VD: Quý 3/2026 hoặc Tháng 10/2026",
    },
    {
      id: "danhSachHangMuc",
      label: "Danh sách Row (Hạng mục/Task)",
      type: "multiline-list",
      aiSuggest: true,
      placeholder: "Nhập các hạng mục công việc...",
    },
    {
      id: "cacCotChinh",
      label: "Danh sách Column (Các cột cần có)",
      type: "multiline-list",
      aiSuggest: true,
      placeholder: "VD: STT, Tên CV, Người phụ trách, Deadline, Trạng thái...",
    },
    {
      id: "congThucBatBuoc",
      label: "Công thức toán học yêu cầu",
      type: "textarea",
      rows: 2,
      placeholder: "VD: Cột Thành tiền = Đơn giá * Số lượng, Dòng Tổng cộng ở cuối bảng",
    },
    {
      id: "donViTien",
      label: "Đơn vị tiền tệ (Nếu có)",
      type: "select",
      options: [
        { value: "VND", label: "VNĐ (Việt Nam Đồng)" },
        { value: "USD", label: "USD (Đô la Mỹ)" },
        { value: "none", label: "Không áp dụng" },
      ],
    },
  ],

  // ── 4. UML ──────────────────────────────────────────────────────────────
  uml: [
    {
      id: "loaiDiagram",
      label: "Loại mô hình (UML/Sơ đồ)",
      type: "select",
      required: true,
      options: [
        { value: "use-case", label: "Use Case Diagram (Ca sử dụng)" },
        { value: "class", label: "Class Diagram (Cấu trúc lớp)" },
        { value: "sequence", label: "Sequence Diagram (Biểu đồ tuần tự)" },
        { value: "activity", label: "Activity Diagram (Biểu đồ hoạt động)" },
        { value: "erd", label: "ERD (Entity Relationship - Cơ sở dữ liệu)" },
        { value: "state", label: "State Diagram (Trạng thái)" },
      ],
    },
    {
      id: "tenHeThong",
      label: "Tên hệ thống / Chức năng",
      type: "text",
      required: true,
      placeholder: "VD: Chức năng Thanh toán VNPay",
    },
    {
      id: "moTaNghiepVu",
      label: "Mô tả nghiệp vụ tổng quan",
      type: "textarea",
      required: true,
      rows: 4,
      aiSuggest: true,
      placeholder: "Người dùng chọn mặt hàng -> Thanh toán -> Hệ thống trừ tiền...",
    },
    {
      id: "actorChinh",
      label: "Các Tác nhân / Đối tượng tham gia (Actors/Entities)",
      type: "multiline-list",
      aiSuggest: true,
      placeholder: "VD: User, Payment Gateway, Database, Admin",
    },
    {
      id: "luongChinh",
      label: "Luồng hoạt động chính (Happy Path)",
      type: "textarea",
      rows: 3,
      aiSuggest: true,
      placeholder: "Mô tả từng bước thành công liên tiếp...",
    },
    {
      id: "luongReNhanh",
      label: "Luồng rẽ nhánh / Ngoại lệ (Exception)",
      type: "textarea",
      rows: 3,
      aiSuggest: true,
      placeholder: "VD: Thanh toán thất bại -> Hủy đơn hàng -> Gửi email thông báo",
    },
    {
      id: "renderEngine",
      label: "Công cụ Render",
      type: "select",
      options: [
        { value: "mermaid", label: "Mermaid (Trực quan, hỗ trợ tốt)" },
        { value: "plantuml", label: "PlantUML" },
      ],
    },
  ],

  // ── 5. BUG-RELEASE ────────────────────────────────────────────────────────
  "bug-release": [
    {
      id: "loaiTaiLieu",
      label: "Loại tài liệu",
      type: "select",
      required: true,
      options: [
        { value: "bug-report", label: "Bug Report (Báo cáo lỗi)" },
        { value: "release-notes", label: "Release Notes (Ghi chú phát hành)" },
        { value: "rca", label: "Root Cause Analysis (Phân tích nguyên nhân gốc)" },
      ],
    },
    {
      id: "version",
      label: "Phiên bản (Version)",
      type: "text",
      required: true,
      placeholder: "VD: v3.2.0-hotfix",
    },
    {
      id: "tieuDe",
      label: "Tiêu đề",
      type: "text",
      required: true,
      placeholder: "VD: Lỗi timeout khi xuất file Excel",
    },
    {
      id: "moiTruong",
      label: "Môi trường (Environment)",
      type: "select",
      options: [
        { value: "production", label: "🔴 Production (Môi trường thật)" },
        { value: "staging", label: "🟡 Staging (Môi trường test)" },
        { value: "local", label: "🟢 Local (Máy dev)" },
      ],
    },
    {
      id: "severity",
      label: "Mức độ nghiêm trọng",
      type: "select",
      options: [
        { value: "blocker", label: "Blocker (Tê liệt hệ thống)" },
        { value: "critical", label: "Critical (Nghiêm trọng)" },
        { value: "major", label: "Major (Ảnh hưởng chức năng chính)" },
        { value: "minor", label: "Minor (Lỗi nhỏ, giao diện)" },
      ],
    },
    {
      id: "stepsToReproduce",
      label: "Các bước tái hiện (Steps to Reproduce)",
      type: "textarea",
      rows: 4,
      aiSuggest: true,
      placeholder: "1. Đăng nhập\n2. Nhấn nút X\n3. Màn hình báo lỗi Y",
    },
    {
      id: "expectedVsActual",
      label: "Kết quả mong đợi vs Thực tế",
      type: "textarea",
      rows: 3,
      aiSuggest: true,
      placeholder: "Mong đợi: Xuất thành công\nThực tế: Load 5p rồi văng lỗi 504",
    },
    {
      id: "danhSachFix",
      label: "Danh sách Fix / Tính năng mới (Cho Release Notes)",
      type: "multiline-list",
      aiSuggest: true,
      placeholder: "Thêm ghi chú release...",
    },
  ],

  // ── 6. TRANSFER ──────────────────────────────────────────────────────────
  transfer: [
    {
      id: "tenDuAn",
      label: "Tên Dự án / Module cần bàn giao",
      type: "text",
      required: true,
      placeholder: "VD: Module Kế toán lõi",
    },
    {
      id: "teamBanGiao",
      label: "Team / Người bàn giao",
      type: "text",
      required: true,
      placeholder: "VD: Team Backend (Nguyễn Văn A)",
    },
    {
      id: "teamNhan",
      label: "Team / Người tiếp nhận",
      type: "text",
      required: true,
      placeholder: "VD: Team Vận hành (Trần Thị B)",
    },
    {
      id: "tinhTrang",
      label: "Tình trạng hiện tại",
      type: "select",
      options: [
        { value: "dev-done", label: "Hoàn thành Dev, chờ UAT" },
        { value: "live", label: "Đang chạy Production" },
        { value: "legacy", label: "Hệ thống cũ (Legacy)" },
      ],
    },
    {
      id: "techStack",
      label: "Công nghệ sử dụng (Tech Stack)",
      type: "multiline-list",
      placeholder: "VD: React 18, Node.js, Redis...",
      aiSuggest: true,
    },
    {
      id: "taiKhoanLienQuan",
      label: "Các loại tài khoản / Server cần bàn giao",
      type: "textarea",
      rows: 3,
      placeholder: "Không điền mật khẩu thật. VD: Tài khoản AWS, DB Prod, Admin CMS...",
    },
    {
      id: "sections",
      label: "Cấu trúc tài liệu bàn giao",
      type: "checkbox-group",
      options: [
        { value: "setup", label: "Hướng dẫn cài đặt Local (Local Setup)" },
        { value: "architecture", label: "Kiến trúc hệ thống (Architecture)" },
        { value: "database", label: "Cấu trúc Database (ERD/Schema)" },
        { value: "deploy", label: "Quy trình Deploy (CI/CD Pipeline)" },
        { value: "troubleshoot", label: "Hướng dẫn xử lý lỗi thường gặp (Troubleshoot)" },
        { value: "contact", label: "Thông tin liên hệ khi hệ thống sập" },
      ],
    },
    {
      id: "knownIssues",
      label: "Known Issues / Công nợ kỹ thuật (Tech Debt)",
      type: "textarea",
      rows: 3,
      aiSuggest: true,
      placeholder: "Ghi chú các lỗi chưa fix, các đoạn code cần refactor...",
    },
  ],

  // ── 7. FEATURE ───────────────────────────────────────────────────────────
  feature: [
    {
      id: "tenSanPham",
      label: "Tên Sản phẩm / Epic",
      type: "text",
      required: true,
      placeholder: "VD: Ứng dụng Mobile Banking",
    },
    {
      id: "loaiTaiLieu",
      label: "Loại tài liệu quản lý",
      type: "select",
      required: true,
      options: [
        { value: "prd", label: "PRD (Product Requirements Document)" },
        { value: "feature-spec", label: "Đặc tả tính năng (Feature Spec)" },
        { value: "sprint", label: "Kế hoạch Sprint (Sprint Plan)" },
        { value: "user-stories", label: "Danh sách User Stories" },
      ],
    },
    {
      id: "mucTieuBusiness",
      label: "Mục tiêu Business (Business Goals)",
      type: "textarea",
      rows: 3,
      required: true,
      aiSuggest: true,
      placeholder: "Tính năng này giúp giải quyết bài toán gì cho công ty / người dùng?",
    },
    {
      id: "danhSachTinhNang",
      label: "Danh sách các Module / Tính năng con",
      type: "multiline-list",
      aiSuggest: true,
      placeholder: "VD: Chức năng Đăng nhập vân tay...",
    },
    {
      id: "userStories",
      label: "User Stories (Nếu có)",
      type: "textarea",
      rows: 4,
      aiSuggest: true,
      placeholder: "As a [role], I want [action] so that [benefit]...",
    },
    {
      id: "acceptanceCriteria",
      label: "Tiêu chí nghiệm thu (Acceptance Criteria)",
      type: "textarea",
      rows: 4,
      aiSuggest: true,
      placeholder: "Mô tả các điều kiện để tính năng được coi là 'Hoàn thành' (Done).",
    },
    {
      id: "outOfScope",
      label: "Nằm ngoài phạm vi (Out of Scope)",
      type: "multiline-list",
      placeholder: "Những tính năng sẽ KHÔNG LÀM trong đợt này...",
    },
    {
      id: "phuThuoc",
      label: "Phụ thuộc (Dependencies)",
      type: "textarea",
      rows: 2,
      placeholder: "VD: Cần API từ đội Core Banking hoàn thành trước...",
    },
  ],
};
