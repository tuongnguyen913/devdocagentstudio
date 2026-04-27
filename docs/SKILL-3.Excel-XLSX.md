---
name: xlsx
description: "Use this skill whenever the user wants to create, read, edit, or generate Excel spreadsheet files (.xlsx). Triggers include: any mention of 'Excel', 'bảng tính', '.xlsx', 'spreadsheet', or requests to produce structured data tables with formatting like merged cells, color-coded rows, number formatting, currency, formulas, multi-sheet workbooks, freeze panes, auto-filter, or conditional formatting. Also use when generating: bảng báo giá phần mềm, bảng theo dõi tính năng, bảng tracking lỗi, bảng kế hoạch triển khai, bảng tổng hợp dữ liệu, or any tabular report destined for Excel. Do NOT use for Word documents, PowerPoint slides, CSV-only output, or general coding tasks unrelated to spreadsheet generation."
license: Proprietary. LICENSE.txt has complete terms
---

# XLSX creation, editing, and export

## Overview

A `.xlsx` file is a ZIP archive containing XML files following the Open Packaging Conventions (OPC) and SpreadsheetML standard.

Primary engine: **SheetJS (xlsx)** — runs natively in Node.js Serverless Functions on Vercel.
No binary dependencies, no LibreOffice required, no Docker needed.

```
workbook (.xlsx)
├── SheetNames[]          → tên các sheet
└── Sheets{}
    └── [SheetName]
        ├── [CellAddress] → cell data ({ t, v, f, s })
        ├── !ref          → used range ("A1:H30")
        ├── !merges[]     → merge regions
        ├── !cols[]       → column widths
        ├── !rows[]       → row heights/hidden
        └── !freeze       → freeze pane config
```

**Cell object anatomy:**

| Field | Meaning | Values |
|-------|---------|--------|
| `t`   | Type    | `n` number, `s` string, `b` boolean, `d` date, `e` error |
| `v`   | Value   | raw value |
| `f`   | Formula | `"SUM(B2:B10)"` (without `=`) |
| `s`   | Style   | style object (requires `xlsx-js-style` or style patch) |
| `z`   | Format  | number format string |
| `l`   | Link    | `{ Target: "https://..." }` |
| `c`   | Comment | `[{ a: "Author", t: "Text" }]` |

---

## Quick Reference

| Task | Approach |
|------|----------|
| Tạo workbook mới | `XLSX.utils.book_new()` + `XLSX.utils.aoa_to_sheet()` |
| Tạo từ array of objects | `XLSX.utils.json_to_sheet(data)` |
| Đọc file có sẵn | `XLSX.readFile()` hoặc `XLSX.read(buffer)` |
| Xuất file | `XLSX.writeFile()` hoặc `XLSX.write(wb, {type:'buffer'})` |
| Merge cells | `ws['!merges'] = [{s:{r,c}, e:{r,c}}]` |
| Freeze panes | `ws['!freeze'] = {xSplit:0, ySplit:1}` |
| Column widths | `ws['!cols'] = [{wch:20}, {wch:15}]` |
| Row heights | `ws['!rows'] = [undefined, {hpt:30}]` |
| Style (color, bold, border) | Dùng `xlsx-js-style` — xem phần Styling |
| Number format tiền VNĐ | `z: '#,##0 "₫"'` |
| Formula | `f: 'SUM(B2:B10)'` (không có dấu `=`) |
| Bảng báo giá phần mềm | Xem template `QuoteSheet` |
| Bảng theo dõi tính năng | Xem template `FeatureTrackSheet` |
| Bảng tracking bugs | Xem template `BugTrackSheet` |
| Bảng kế hoạch triển khai | Xem template `DeployPlanSheet` |

---

## Installation & Setup

```bash
# Core SheetJS (free, MIT)
npm install xlsx

# SheetJS với full styling support (khuyên dùng cho production)
npm install xlsx-js-style
```

```typescript
// Vercel Serverless Function — /api/skills/xlsx/route.ts
import XLSX from 'xlsx-js-style';
// hoặc: import * as XLSX from 'xlsx';

export async function POST(req: Request) {
  const body = await req.json();
  const wb = buildWorkbook(body);
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(body.filename || 'export')}.xlsx"`,
    },
  });
}
```

---

## Core API

### Tạo workbook và sheet

```typescript
import XLSX from 'xlsx-js-style';

// 1. Tạo workbook rỗng
const wb = XLSX.utils.book_new();

// 2a. Tạo sheet từ Array of Arrays (AOA) — cách thủ công, full control
const aoa = [
  ['STT', 'Tên tính năng', 'Mô tả', 'Đơn giá', 'Ghi chú'],
  [1, 'Quản lý người dùng', 'Phân quyền, tạo tài khoản', 15000000, ''],
  [2, 'Báo cáo thống kê', 'Xuất Excel, PDF', 8000000, ''],
];
const ws = XLSX.utils.aoa_to_sheet(aoa);

// 2b. Tạo sheet từ Array of Objects — tiện khi có data từ DB/API
const data = [
  { stt: 1, tenTinhNang: 'Quản lý người dùng', donGia: 15000000 },
  { stt: 2, tenTinhNang: 'Báo cáo thống kê',   donGia: 8000000 },
];
const ws2 = XLSX.utils.json_to_sheet(data, {
  header: ['stt', 'tenTinhNang', 'donGia'], // chỉ định thứ tự cột
  skipHeader: false,                         // true = không in header row
});

// 3. Gắn sheet vào workbook
XLSX.utils.book_append_sheet(wb, ws, 'Báo giá');
XLSX.utils.book_append_sheet(wb, ws2, 'Tính năng');
```

### Đọc cell và ghi cell thủ công

```typescript
// Địa chỉ cell: encode/decode
const addr = XLSX.utils.encode_cell({ r: 0, c: 0 }); // 'A1' (r=row 0-indexed, c=col 0-indexed)
const ref  = XLSX.utils.decode_cell('B5');            // { r: 4, c: 1 }

// Đọc
const cell = ws['A1']; // { t: 's', v: 'STT' }

// Ghi / override 1 cell
ws['D2'] = { t: 'n', v: 15000000, z: '#,##0 "₫"' };

// Ghi formula
ws['D12'] = { t: 'n', f: 'SUM(D2:D11)', z: '#,##0 "₫"' };

// Cập nhật used range sau khi thêm cell ngoài range cũ
ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 30, c: 10 } });
```

---

## Styling (xlsx-js-style)

`xlsx-js-style` thêm field `s` (style object) vào mỗi cell.
Bắt buộc khi cần: màu nền header, font bold, border, alignment, number format màu đỏ/xanh.

### Style object anatomy

```typescript
type CellStyle = {
  font?: {
    name?: string;        // 'Arial', 'Calibri', 'Times New Roman'
    sz?: number;          // pt size: 11, 12, 13
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    color?: { rgb: string }; // hex không có #: 'FFFFFF', 'FF0000'
  };
  fill?: {
    fgColor?: { rgb: string };  // nền ô
    patternType?: 'solid' | 'none'; // mặc định 'solid'
  };
  border?: {
    top?:    { style: BorderStyle; color?: { rgb: string } };
    bottom?: { style: BorderStyle; color?: { rgb: string } };
    left?:   { style: BorderStyle; color?: { rgb: string } };
    right?:  { style: BorderStyle; color?: { rgb: string } };
  };
  alignment?: {
    horizontal?: 'left' | 'center' | 'right';
    vertical?:   'top' | 'middle' | 'bottom';
    wrapText?: boolean;
    indent?: number;      // 0-255
  };
  numFmt?: string; // number format string (xem bảng bên dưới)
};

// BorderStyle values
type BorderStyle =
  | 'thin' | 'medium' | 'thick'
  | 'dotted' | 'dashed' | 'hair'
  | 'mediumDashed' | 'dashDot' | 'mediumDashDot'
  | 'dashDotDot' | 'mediumDashDotDot' | 'slantDashDot';
```

### Bộ style chuẩn — tái sử dụng

```typescript
const S = {
  // Header hàng tiêu đề
  header: {
    font:  { name: 'Arial', sz: 11, bold: true, color: { rgb: 'FFFFFF' } },
    fill:  { fgColor: { rgb: '1D4ED8' }, patternType: 'solid' },
    border: {
      top:    { style: 'thin', color: { rgb: 'BFDBFE' } },
      bottom: { style: 'thin', color: { rgb: 'BFDBFE' } },
      left:   { style: 'thin', color: { rgb: 'BFDBFE' } },
      right:  { style: 'thin', color: { rgb: 'BFDBFE' } },
    },
    alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
  },

  // Tiêu đề lớn (merge cells)
  title: {
    font:  { name: 'Arial', sz: 14, bold: true, color: { rgb: '0B3A6E' } },
    fill:  { fgColor: { rgb: 'DBEAFE' }, patternType: 'solid' },
    alignment: { horizontal: 'center', vertical: 'middle' },
  },

  // Dòng dữ liệu thường
  cell: {
    font:   { name: 'Arial', sz: 11 },
    border: {
      top:    { style: 'thin', color: { rgb: 'E5E7EB' } },
      bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
      left:   { style: 'thin', color: { rgb: 'E5E7EB' } },
      right:  { style: 'thin', color: { rgb: 'E5E7EB' } },
    },
    alignment: { vertical: 'middle' },
  },

  // Dòng dữ liệu — zebra stripe (xám nhạt)
  cellAlt: {
    font:   { name: 'Arial', sz: 11 },
    fill:   { fgColor: { rgb: 'F9FAFB' }, patternType: 'solid' },
    border: {
      top:    { style: 'thin', color: { rgb: 'E5E7EB' } },
      bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
      left:   { style: 'thin', color: { rgb: 'E5E7EB' } },
      right:  { style: 'thin', color: { rgb: 'E5E7EB' } },
    },
    alignment: { vertical: 'middle' },
  },

  // Số tiền (right-align)
  money: {
    font:      { name: 'Arial', sz: 11 },
    numFmt:    '#,##0 "₫"',
    alignment: { horizontal: 'right', vertical: 'middle' },
    border: {
      top:    { style: 'thin', color: { rgb: 'E5E7EB' } },
      bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
      left:   { style: 'thin', color: { rgb: 'E5E7EB' } },
      right:  { style: 'thin', color: { rgb: 'E5E7EB' } },
    },
  },

  // Tổng cộng
  total: {
    font:      { name: 'Arial', sz: 11, bold: true, color: { rgb: '0B3A6E' } },
    fill:      { fgColor: { rgb: 'DBEAFE' }, patternType: 'solid' },
    numFmt:    '#,##0 "₫"',
    alignment: { horizontal: 'right', vertical: 'middle' },
    border: {
      top:    { style: 'medium', color: { rgb: '1D4ED8' } },
      bottom: { style: 'medium', color: { rgb: '1D4ED8' } },
      left:   { style: 'thin',   color: { rgb: 'BFDBFE' } },
      right:  { style: 'thin',   color: { rgb: 'BFDBFE' } },
    },
  },

  // Badge trạng thái
  statusDone:      { font: { sz: 10, bold: true, color: { rgb: '15803D' } }, fill: { fgColor: { rgb: 'DCFCE7' }, patternType: 'solid' }, alignment: { horizontal: 'center' } },
  statusInProgress:{ font: { sz: 10, bold: true, color: { rgb: '1D4ED8' } }, fill: { fgColor: { rgb: 'DBEAFE' }, patternType: 'solid' }, alignment: { horizontal: 'center' } },
  statusPending:   { font: { sz: 10, bold: true, color: { rgb: '92400E' } }, fill: { fgColor: { rgb: 'FEF3C7' }, patternType: 'solid' }, alignment: { horizontal: 'center' } },
  statusCancelled: { font: { sz: 10, bold: true, color: { rgb: '991B1B' } }, fill: { fgColor: { rgb: 'FEE2E2' }, patternType: 'solid' }, alignment: { horizontal: 'center' } },

  // Priority
  priorityHigh:   { font: { sz: 10, bold: true, color: { rgb: '991B1B' } }, fill: { fgColor: { rgb: 'FEE2E2' }, patternType: 'solid' }, alignment: { horizontal: 'center' } },
  priorityMedium: { font: { sz: 10, bold: true, color: { rgb: '92400E' } }, fill: { fgColor: { rgb: 'FEF3C7' }, patternType: 'solid' }, alignment: { horizontal: 'center' } },
  priorityLow:    { font: { sz: 10, bold: true, color: { rgb: '166534' } }, fill: { fgColor: { rgb: 'DCFCE7' }, patternType: 'solid' }, alignment: { horizontal: 'center' } },
};
```

---

## Number Formats

```typescript
// Tiền Việt Nam
'#,##0 "₫"'            // 15,000,000 ₫
'#,##0.00 "₫"'         // 15,000,000.00 ₫
'_(#,##0 "₫"_)'        // có padding cho alignment

// USD
'"$"#,##0.00'          // $1,500.00
'"$"#,##0'             // $1,500

// Phần trăm
'0%'                   // 15%
'0.0%'                 // 15.3%
'0.00%'                // 15.27%

// Số nguyên có dấu phẩy
'#,##0'                // 1,500,000
'#,##0.00'             // 1,500,000.00

// Ngày tháng (Việt Nam)
'dd/mm/yyyy'           // 25/04/2026
'dd/mm/yyyy hh:mm'     // 25/04/2026 14:30
'mm/yyyy'              // 04/2026

// Text (bắt buộc hiển thị dạng text, không auto-convert)
'@'                    // "001" hiển thị đúng "001", không bị thành 1
```

---

## Layout Utilities

### Merge cells

```typescript
// ws['!merges'] nhận array của CellRange
// CellRange: { s: {r, c}, e: {r, c} } — đều 0-indexed
ws['!merges'] = [
  { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, // A1:H1 — title row
  { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } }, // A2:D2 — subtitle left
  { s: { r: 1, c: 4 }, e: { r: 1, c: 7 } }, // E2:H2 — subtitle right
];

// CRITICAL: Chỉ set style/value trên cell GÓC TRÊN TRÁI của merge range
// Các cell còn lại trong range bỏ trống (không set gì)
ws['A1'] = { t: 's', v: 'BẢNG BÁO GIÁ PHẦN MỀM', s: S.title };
// ws['B1'], ws['C1']... không cần set
```

### Column widths

```typescript
// wch = width in characters (1 wch ≈ 7px at default DPI)
ws['!cols'] = [
  { wch: 5  },  // A: STT
  { wch: 30 },  // B: Tên tính năng
  { wch: 40 },  // C: Mô tả
  { wch: 12 },  // D: Số lượng
  { wch: 18 },  // E: Đơn giá
  { wch: 18 },  // F: Thành tiền
  { wch: 10 },  // G: Ghi chú
];

// wpx = width in pixels (ít dùng hơn wch)
// hidden: true — ẩn cột
{ wch: 0, hidden: true }
```

### Row heights

```typescript
// hpt = height in points (1pt = 1/72 inch)
ws['!rows'] = [
  { hpt: 40 },   // row 0 (title)
  { hpt: 30 },   // row 1 (header)
  { hpt: 20 },   // row 2 (data)
  // undefined = default height
];
```

### Freeze panes

```typescript
// Freeze dòng đầu tiên (header)
ws['!freeze'] = { xSplit: 0, ySplit: 1 };

// Freeze 2 cột đầu + 1 dòng đầu
ws['!freeze'] = { xSplit: 2, ySplit: 1 };
```

### Auto-filter

```typescript
// Bật auto-filter cho header row
ws['!autofilter'] = { ref: 'A2:G2' };
// hoặc dùng toàn bộ range
ws['!autofilter'] = { ref: ws['!ref'] };
```

---

## Helper: setCells

```typescript
// Helper để ghi nhiều cell với style dễ hơn
function setCell(
  ws: XLSX.WorkSheet,
  row: number,
  col: number,
  value: string | number | Date | null,
  style?: object,
  formula?: string
) {
  const addr = XLSX.utils.encode_cell({ r: row, c: col });
  const type = typeof value === 'number' ? 'n'
             : value instanceof Date    ? 'd'
             : value === null           ? 'z'
             :                            's';
  ws[addr] = {
    t: type,
    v: value ?? '',
    ...(formula ? { f: formula } : {}),
    ...(style   ? { s: style }   : {}),
  };
}

function mergeRange(ws: XLSX.WorkSheet, r1: number, c1: number, r2: number, c2: number) {
  if (!ws['!merges']) ws['!merges'] = [];
  ws['!merges'].push({ s: { r: r1, c: c1 }, e: { r: r2, c: c2 } });
}

function updateRef(ws: XLSX.WorkSheet, maxRow: number, maxCol: number) {
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: maxRow, c: maxCol } });
}
```

---

## Template 1 — Bảng Báo Giá Phần Mềm (`QuoteSheet`)

**Mục đích:** Bảng báo giá phần mềm gửi cho lãnh đạo cơ quan nhà nước.
Chuẩn: tiêu đề rõ, cột đơn giá/thành tiền định dạng VNĐ, tổng cộng có formula, logo/thông tin đơn vị.

**Cấu trúc sheet:**

```
Row 0    : [MERGE A1:G1] Tiêu đề: BẢNG BÁO GIÁ PHẦN MỀM
Row 1    : [MERGE A2:D2] Tên đơn vị | [MERGE E2:G2] Ngày lập: dd/mm/yyyy
Row 2    : [MERGE A3:G3] Dự án / phần mềm
Row 3    : Blank spacer
Row 4    : Header — STT | Tên module/tính năng | Mô tả | ĐVT | Số lượng | Đơn giá | Thành tiền
Row 5-N  : Data rows — mỗi dòng 1 tính năng/module
Row N+1  : [MERGE A:E] blank | Subtotal (SUM)
Row N+2  : [MERGE A:E] Thuế VAT (10%) | formula
Row N+3  : [MERGE A:E] TỔNG CỘNG | formula
Row N+5  : Ghi chú/điều khoản
Row N+8  : Chữ ký bên bán | Chữ ký bên mua
```

**Input schema:**

```typescript
type QuoteSheetInput = {
  orgName:    string;          // Tên đơn vị lập báo giá
  projectName:string;          // Tên dự án / phần mềm
  date?:      string;          // dd/mm/yyyy (default: hôm nay)
  vatRate?:   number;          // 0.1 = 10% (default)
  currency?:  'VND' | 'USD';  // default VND
  items: Array<{
    stt?:        number;
    tenModule:   string;       // Tên module / tính năng
    moTa?:       string;       // Mô tả chi tiết
    dvt?:        string;       // Đơn vị tính (default: 'Module')
    soLuong?:    number;       // default: 1
    donGia:      number;       // Đơn giá
    ghiChu?:     string;
  }>;
  notes?: string[];            // Điều khoản, ghi chú cuối
  sellerInfo?: {
    name?:    string;
    title?:   string;
    company?: string;
  };
};
```

**Mẫu code sinh sheet:**

```typescript
function buildQuoteSheet(input: QuoteSheetInput): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  const COL = { STT:0, TEN:1, MOTA:2, DVT:3, SL:4, DONGIA:5, THANHTIEN:6 };
  const DATA_START = 5; // row index (0-based) của dòng data đầu tiên

  // === TITLE ===
  setCell(ws, 0, 0, 'BẢNG BÁO GIÁ PHẦN MỀM', S.title);
  mergeRange(ws, 0, 0, 0, 6);

  setCell(ws, 1, 0, input.orgName, { ...S.cell, font: { ...S.cell.font, bold: true } });
  mergeRange(ws, 1, 0, 1, 3);
  setCell(ws, 1, 4, `Ngày lập: ${input.date ?? new Date().toLocaleDateString('vi-VN')}`, { ...S.cell, alignment: { horizontal: 'right' } });
  mergeRange(ws, 1, 4, 1, 6);

  setCell(ws, 2, 0, `Dự án: ${input.projectName}`, { ...S.cell, font: { name: 'Arial', sz: 12, bold: true, color: { rgb: '0B3A6E' } } });
  mergeRange(ws, 2, 0, 2, 6);

  // === HEADER ===
  const headers = ['STT', 'Tên module / Tính năng', 'Mô tả chi tiết', 'ĐVT', 'SL', 'Đơn giá (VNĐ)', 'Thành tiền (VNĐ)'];
  headers.forEach((h, c) => setCell(ws, DATA_START - 1, c, h, S.header));

  // === DATA ROWS ===
  input.items.forEach((item, i) => {
    const r = DATA_START + i;
    const style = i % 2 === 0 ? S.cell : S.cellAlt;
    setCell(ws, r, COL.STT,      item.stt ?? i + 1,        { ...style, alignment: { horizontal: 'center' } });
    setCell(ws, r, COL.TEN,      item.tenModule,             style);
    setCell(ws, r, COL.MOTA,     item.moTa ?? '',            { ...style, alignment: { wrapText: true } });
    setCell(ws, r, COL.DVT,      item.dvt ?? 'Module',       { ...style, alignment: { horizontal: 'center' } });
    setCell(ws, r, COL.SL,       item.soLuong ?? 1,          { ...style, alignment: { horizontal: 'center' } });
    setCell(ws, r, COL.DONGIA,   item.donGia,                { ...style, ...S.money });
    // Thành tiền = SL * Đơn giá (formula)
    const slCol   = XLSX.utils.encode_cell({ r, c: COL.SL });
    const dgCol   = XLSX.utils.encode_cell({ r, c: COL.DONGIA });
    setCell(ws, r, COL.THANHTIEN, item.donGia * (item.soLuong ?? 1), { ...style, ...S.money }, `${slCol}*${dgCol}`);
  });

  // === SUBTOTAL / VAT / TOTAL ===
  const lastDataRow = DATA_START + input.items.length - 1;
  const subR = lastDataRow + 1;
  const vatR = subR + 1;
  const totR = vatR + 1;

  const thanhTienColLetter = XLSX.utils.encode_col(COL.THANHTIEN);
  const subFormula = `SUM(${thanhTienColLetter}${DATA_START + 1}:${thanhTienColLetter}${lastDataRow + 1})`;

  setCell(ws, subR, 0, 'Cộng', { ...S.total, alignment: { horizontal: 'right' } });
  mergeRange(ws, subR, 0, subR, COL.THANHTIEN - 1);
  setCell(ws, subR, COL.THANHTIEN, 0, S.total, subFormula);

  setCell(ws, vatR, 0, `Thuế VAT (${(input.vatRate ?? 0.1) * 100}%)`, { ...S.total, alignment: { horizontal: 'right' } });
  mergeRange(ws, vatR, 0, vatR, COL.THANHTIEN - 1);
  setCell(ws, vatR, COL.THANHTIEN, 0, S.total,
    `${XLSX.utils.encode_cell({ r: subR, c: COL.THANHTIEN })}*${input.vatRate ?? 0.1}`);

  setCell(ws, totR, 0, 'TỔNG CỘNG', {
    ...S.total,
    font: { ...S.total.font, sz: 13 },
    alignment: { horizontal: 'right' },
    fill: { fgColor: { rgb: '0B3A6E' }, patternType: 'solid' },
  });
  mergeRange(ws, totR, 0, totR, COL.THANHTIEN - 1);
  setCell(ws, totR, COL.THANHTIEN, 0, {
    ...S.total,
    font: { ...S.total.font, sz: 13, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '0B3A6E' }, patternType: 'solid' },
  }, `${XLSX.utils.encode_cell({ r: subR, c: COL.THANHTIEN })}+${XLSX.utils.encode_cell({ r: vatR, c: COL.THANHTIEN })}`);

  // === NOTES ===
  if (input.notes?.length) {
    const noteStart = totR + 2;
    setCell(ws, noteStart, 0, 'GHI CHÚ VÀ ĐIỀU KHOẢN', { font: { name: 'Arial', sz: 11, bold: true, color: { rgb: '0B3A6E' } } });
    mergeRange(ws, noteStart, 0, noteStart, 6);
    input.notes.forEach((note, i) => {
      setCell(ws, noteStart + 1 + i, 0, `• ${note}`, { font: { name: 'Arial', sz: 10 }, alignment: { wrapText: true } });
      mergeRange(ws, noteStart + 1 + i, 0, noteStart + 1 + i, 6);
    });
  }

  // === LAYOUT ===
  ws['!cols'] = [
    { wch: 5  }, // STT
    { wch: 32 }, // Tên module
    { wch: 40 }, // Mô tả
    { wch: 10 }, // ĐVT
    { wch: 8  }, // SL
    { wch: 20 }, // Đơn giá
    { wch: 20 }, // Thành tiền
  ];
  ws['!rows'] = [
    { hpt: 36 }, // title
    { hpt: 24 }, // org/date
    { hpt: 24 }, // project
    { hpt: 8  }, // spacer
    { hpt: 32 }, // header
  ];
  ws['!freeze'] = { xSplit: 0, ySplit: DATA_START };
  ws['!autofilter'] = { ref: `A${DATA_START}:G${DATA_START}` };
  updateRef(ws, totR + 10, 6);

  return ws;
}
```

---

## Template 2 — Bảng Theo Dõi Tính Năng (`FeatureTrackSheet`)

**Mục đích:** Theo dõi tiến độ phát triển từng tính năng phần mềm.
Dùng nội bộ hoặc báo cáo với lãnh đạo kỹ thuật.

**Cấu trúc:**

```
Header: STT | Tên tính năng | Module | Priority | Status | Phiên bản | Ngày bắt đầu | Ngày hoàn thành | Dev phụ trách | Ghi chú
```

**Input schema:**

```typescript
type FeatureTrackInput = {
  projectName: string;
  version?:    string;
  items: Array<{
    stt?:         number;
    tenTinhNang:  string;
    module?:      string;
    priority?:    'High' | 'Medium' | 'Low';
    status?:      'Done' | 'In Progress' | 'Pending' | 'Cancelled';
    version?:     string;
    ngayBatDau?:  string;  // dd/mm/yyyy
    ngayHoanThanh?: string;
    devPhuTrach?: string;
    ghiChu?:      string;
  }>;
};
```

**Status → Style mapping:**

```typescript
function getStatusStyle(status?: string) {
  switch (status) {
    case 'Done':        return S.statusDone;
    case 'In Progress': return S.statusInProgress;
    case 'Pending':     return S.statusPending;
    case 'Cancelled':   return S.statusCancelled;
    default:            return S.cell;
  }
}

function getPriorityStyle(priority?: string) {
  switch (priority) {
    case 'High':   return S.priorityHigh;
    case 'Medium': return S.priorityMedium;
    case 'Low':    return S.priorityLow;
    default:       return S.cell;
  }
}
```

**Mẫu code sinh sheet:**

```typescript
function buildFeatureTrackSheet(input: FeatureTrackInput): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  const HEADERS = ['STT', 'Tên tính năng', 'Module', 'Priority', 'Trạng thái', 'Phiên bản',
                   'Ngày bắt đầu', 'Ngày hoàn thành', 'Dev phụ trách', 'Ghi chú'];
  const DATA_START = 2;

  // Title row
  setCell(ws, 0, 0, `THEO DÕI TÍNH NĂNG — ${input.projectName.toUpperCase()}`, S.title);
  mergeRange(ws, 0, 0, 0, HEADERS.length - 1);

  // Header row
  HEADERS.forEach((h, c) => setCell(ws, 1, c, h, S.header));

  // Data rows
  input.items.forEach((item, i) => {
    const r = DATA_START + i;
    const base = i % 2 === 0 ? S.cell : S.cellAlt;
    setCell(ws, r, 0, item.stt ?? i + 1,      { ...base, alignment: { horizontal: 'center' } });
    setCell(ws, r, 1, item.tenTinhNang,         { ...base, alignment: { wrapText: true } });
    setCell(ws, r, 2, item.module ?? '',        base);
    setCell(ws, r, 3, item.priority ?? '',      getPriorityStyle(item.priority));
    setCell(ws, r, 4, item.status ?? 'Pending', getStatusStyle(item.status));
    setCell(ws, r, 5, item.version ?? '',       { ...base, alignment: { horizontal: 'center' } });
    setCell(ws, r, 6, item.ngayBatDau ?? '',    { ...base, alignment: { horizontal: 'center' } });
    setCell(ws, r, 7, item.ngayHoanThanh ?? '', { ...base, alignment: { horizontal: 'center' } });
    setCell(ws, r, 8, item.devPhuTrach ?? '',   base);
    setCell(ws, r, 9, item.ghiChu ?? '',        { ...base, alignment: { wrapText: true } });
  });

  // Summary row
  const sumR = DATA_START + input.items.length;
  setCell(ws, sumR, 0, 'TỔNG SỐ TÍNH NĂNG:', { ...S.total, alignment: { horizontal: 'right' } });
  mergeRange(ws, sumR, 0, sumR, 3);
  setCell(ws, sumR, 4, input.items.length, { ...S.total, numFmt: '0 "tính năng"', alignment: { horizontal: 'center' } });
  mergeRange(ws, sumR, 4, sumR, 9);

  ws['!cols'] = [
    { wch: 5  }, { wch: 35 }, { wch: 20 }, { wch: 12 },
    { wch: 14 }, { wch: 12 }, { wch: 15 }, { wch: 18 },
    { wch: 20 }, { wch: 30 },
  ];
  ws['!rows'] = [{ hpt: 36 }, { hpt: 32 }];
  ws['!freeze'] = { xSplit: 0, ySplit: 2 };
  ws['!autofilter'] = { ref: `A2:J2` };
  updateRef(ws, sumR, HEADERS.length - 1);

  return ws;
}
```

---

## Template 3 — Bảng Tracking Bugs / Release Notes (`BugTrackSheet`)

**Mục đích:** Theo dõi lỗi phần mềm, trạng thái xử lý và release notes.

**Cấu trúc:**

```
Header: Bug ID | Tiêu đề | Module | Severity | Status | Phiên bản phát hiện | Ngày báo cáo | Người báo cáo | Dev xử lý | Phiên bản fix | Ngày fix | Ghi chú
```

**Severity legend (thêm sheet phụ):**

```typescript
const SEVERITY_LEGEND = [
  { level: 'Critical', mau: 'FEE2E2', moTa: 'Hệ thống không khởi động được hoặc mất dữ liệu' },
  { level: 'High',     mau: 'FECACA', moTa: 'Tính năng chính không hoạt động' },
  { level: 'Medium',   mau: 'FEF3C7', moTa: 'Tính năng phụ bị ảnh hưởng, có workaround' },
  { level: 'Low',      mau: 'DCFCE7', moTa: 'Cosmetic, UI, typo, cải tiến nhỏ' },
];
```

**Mẫu code sinh sheet:**

```typescript
function buildBugTrackSheet(bugInput: BugTrackInput): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  const HEADERS = [
    'Bug ID', 'Tiêu đề lỗi', 'Module', 'Severity',
    'Trạng thái', 'Ver phát hiện', 'Ngày báo cáo',
    'Người báo cáo', 'Dev xử lý', 'Ver fix', 'Ngày fix', 'Ghi chú',
  ];
  const DATA_START = 2;

  setCell(ws, 0, 0, `BUG TRACKER — ${bugInput.projectName.toUpperCase()}  |  Tổng: ${bugInput.bugs.length} bugs`, S.title);
  mergeRange(ws, 0, 0, 0, HEADERS.length - 1);
  HEADERS.forEach((h, c) => setCell(ws, 1, c, h, S.header));

  bugInput.bugs.forEach((bug, i) => {
    const r = DATA_START + i;
    const base = i % 2 === 0 ? S.cell : S.cellAlt;
    const sevStyle = {
      Critical: { ...S.priorityHigh,   font: { ...S.priorityHigh.font,   sz: 10 } },
      High:     { ...S.priorityHigh,   font: { ...S.priorityHigh.font,   sz: 10 } },
      Medium:   { ...S.priorityMedium, font: { ...S.priorityMedium.font, sz: 10 } },
      Low:      { ...S.priorityLow,    font: { ...S.priorityLow.font,    sz: 10 } },
    }[bug.severity ?? 'Low'] ?? base;

    setCell(ws, r, 0,  bug.bugId ?? `BUG-${String(i + 1).padStart(3, '0')}`, { ...base, alignment: { horizontal: 'center' }, font: { ...base.font, bold: true } });
    setCell(ws, r, 1,  bug.tieuDe,             { ...base, alignment: { wrapText: true } });
    setCell(ws, r, 2,  bug.module ?? '',        base);
    setCell(ws, r, 3,  bug.severity ?? 'Low',   sevStyle);
    setCell(ws, r, 4,  bug.status ?? 'Open',    getStatusStyle(bug.status === 'Fixed' ? 'Done' : bug.status === 'Open' ? 'Pending' : 'In Progress'));
    setCell(ws, r, 5,  bug.verPhatHien ?? '',   { ...base, alignment: { horizontal: 'center' } });
    setCell(ws, r, 6,  bug.ngayBaoCao ?? '',    { ...base, alignment: { horizontal: 'center' } });
    setCell(ws, r, 7,  bug.nguoiBaoCao ?? '',   base);
    setCell(ws, r, 8,  bug.devXuLy ?? '',       base);
    setCell(ws, r, 9,  bug.verFix ?? '',        { ...base, alignment: { horizontal: 'center' } });
    setCell(ws, r, 10, bug.ngayFix ?? '',       { ...base, alignment: { horizontal: 'center' } });
    setCell(ws, r, 11, bug.ghiChu ?? '',        { ...base, alignment: { wrapText: true } });
  });

  ws['!cols'] = [
    { wch: 12 }, { wch: 35 }, { wch: 18 }, { wch: 12 },
    { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 20 },
    { wch: 18 }, { wch: 12 }, { wch: 14 }, { wch: 25 },
  ];
  ws['!rows'] = [{ hpt: 36 }, { hpt: 32 }];
  ws['!freeze'] = { xSplit: 0, ySplit: 2 };
  ws['!autofilter'] = { ref: `A2:L2` };
  updateRef(ws, DATA_START + bugInput.bugs.length, HEADERS.length - 1);

  return ws;
}
```

---

## Template 4 — Bảng Kế Hoạch Triển Khai (`DeployPlanSheet`)

**Mục đích:** Kế hoạch triển khai phần mềm gồm các đầu việc, timeline, người phụ trách và trạng thái thực tế.

**Cấu trúc:**

```
Header: STT | Đầu việc | Hạng mục | Ngày bắt đầu KH | Ngày kết thúc KH | Ngày bắt đầu TH | Ngày kết thúc TH | Người phụ trách | Kết quả | Ghi chú
```

**Multisheet workbook — đề xuất cho module XLSX:**

```typescript
function buildFullWorkbook(input: XlsxSkillInput): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Summary dashboard
  const wsSummary = buildSummarySheet(input);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Tổng quan');

  // Sheet 2: Báo giá (nếu có)
  if (input.quote) {
    const wsQuote = buildQuoteSheet(input.quote);
    XLSX.utils.book_append_sheet(wb, wsQuote, 'Báo giá');
  }

  // Sheet 3: Feature tracking
  if (input.features) {
    const wsFeature = buildFeatureTrackSheet(input.features);
    XLSX.utils.book_append_sheet(wb, wsFeature, 'Tính năng');
  }

  // Sheet 4: Bug tracking
  if (input.bugs) {
    const wsBug = buildBugTrackSheet(input.bugs);
    XLSX.utils.book_append_sheet(wb, wsBug, 'Bug Tracker');
  }

  // Sheet 5: Deploy plan
  if (input.deployPlan) {
    const wsDeploy = buildDeployPlanSheet(input.deployPlan);
    XLSX.utils.book_append_sheet(wb, wsDeploy, 'Kế hoạch triển khai');
  }

  return wb;
}
```

---

## System Prompt cho Skill-3

Đưa vào Vercel KV với key `skill:xlsx:prompt`:

```txt
You are the XLSX skill for DevDocs Studio.

Your job is to generate structured, professional Excel spreadsheet data for Vietnamese software projects and government clients.

Core objectives:
1. Produce clean, well-organized tabular data suitable for Excel/LibreOffice rendering.
2. Prioritize clarity: use descriptive column headers, consistent value formats, and accurate Vietnamese terminology.
3. For pricing sheets: list modules individually, include unit price and quantity, compute totals with formulas.
4. For feature tracking: map each feature to a module, assign priority and status accurately.
5. For bug tracking: assign unique Bug IDs, classify severity using Critical/High/Medium/Low scale.
6. For deployment plans: break tasks into phases, assign responsible parties, use realistic timelines.
7. Never fabricate business data — use the user's input as the source of truth.
8. Apply Vietnamese number formats for currency: #,##0 "₫".
9. Use dd/mm/yyyy for all dates.
10. Prefer formal Vietnamese terminology appropriate for government reports.

Output format:
Return strict JSON matching the target template schema.
Available templates: QuoteSheet, FeatureTrackSheet, BugTrackSheet, DeployPlanSheet, MultiSheet.

Constraints:
- Maximum 200 rows per sheet (split into multiple sheets if larger).
- Column headers must be in Vietnamese unless technical terms have no equivalent.
- All monetary values must be in VNĐ unless explicitly specified otherwise.
- Bug IDs format: BUG-001, BUG-002...
- Feature IDs format: FEA-001, FEA-002... (optional)
- Version numbers format: v1.0.0, v1.1.0...
```

---

## Admin Config cho Skill-3

Lưu trong Vercel KV:

```
skill:xlsx:prompt              → system prompt (trên)
skill:xlsx:templates           → JSON danh sách templates có sẵn
skill:xlsx:theme:default       → bộ màu/style mặc định
skill:xlsx:theme:gov           → theme dành cho văn bản nhà nước (xanh navy + gold)
skill:xlsx:currency            → VND | USD (default: VND)
skill:xlsx:date-format         → dd/mm/yyyy (default)
skill:xlsx:versions            → version history của prompt
```

---

## Critical Rules cho SheetJS

- **Luôn set `ws['!ref']`** sau khi ghi cell ngoài range ban đầu — thiếu ref → Excel báo lỗi file hỏng
- **Merge chỉ set style/value tại cell góc trên trái** — các cell còn lại trong merge range bỏ trống
- **Không để formula và value xung đột** — khi có `f`, Excel tính lại và bỏ `v`; vẫn nên set `v` hợp lệ để phòng khi formula bị disable
- **Dùng `xlsx-js-style`** thay `xlsx` thuần nếu cần màu sắc, border, font bold — `xlsx` thuần không support style
- **`numFmt` và `z` là như nhau** trong xlsx-js-style — dùng `numFmt` trong `s` object
- **Row/col index đều 0-based** trong `setCell(ws, r, c)` — nhưng `encode_cell` trả về địa chỉ 1-based ('A1')
- **`!autofilter` phải trỏ đúng header row** — sai row dẫn đến filter bị đặt nhầm
- **Column width `wch`** = số ký tự, không phải pixel — 1 ký tự tiếng Việt (unicode) ≈ 1.5x chiều rộng ký tự Latin
- **Ngày tháng** nên truyền dưới dạng string `dd/mm/yyyy` với `t: 's'` thay vì `t: 'd'` vì Excel đọc serial date khác nhau trên các platform
- **Không dùng ký tự đặc biệt trong tên sheet** — không có: `\ / ? * [ ]` và không quá 31 ký tự
- **Vercel Serverless Free tier** timeout 10s — với workbook lớn (>500 rows) cần upgrade Pro (60s) hoặc tách thành nhiều requests
- **Bundle size** của `xlsx-js-style` ≈ 2.8MB — dùng dynamic import để tránh cold start nặng:
  ```typescript
  const XLSX = await import('xlsx-js-style');
  ```
