---
name: docx
version: 2.0.0
updated: 2026-04-25
description: "Use this skill whenever the user wants to create, read, edit, or manipulate Word documents (.docx files). Triggers include: any mention of 'Word doc', 'word document', '.docx', or requests to produce professional documents with formatting like tables of contents, headings, page numbers, or letterheads. Also use when extracting or reorganizing content from .docx files, inserting or replacing images in documents, performing find-and-replace in Word files, working with tracked changes or comments, or converting content into a polished Word document. If the user asks for a 'report', 'memo', 'letter', 'template', 'công văn', 'biên bản', 'tờ trình', 'báo cáo', 'hướng dẫn sử dụng', or similar deliverable as a Word or .docx file, use this skill. Do NOT use for PDFs, spreadsheets, Google Docs, or general coding tasks unrelated to document generation."
tags: [docx, word, document, vietnamese, hanh-chinh, nghi-dinh-30, software-guide]
license: Proprietary. LICENSE.txt has complete terms
---

# DOCX — Tạo, chỉnh sửa và phân tích văn bản Word

## Tổng quan

Một file `.docx` là một ZIP archive chứa các file XML theo chuẩn OpenXML. Skill này hỗ trợ hai luồng làm việc chính: tạo mới bằng `docx-js` (high-level API) và chỉnh sửa XML trực tiếp (low-level, full control).

**Phạm vi sử dụng trong DevDocs Studio:**
- Hướng dẫn sử dụng phần mềm cho khách hàng nhà nước
- Công văn / Tờ trình / Báo cáo chuẩn Nghị định 30/2020/NĐ-CP
- Biên bản họp, biên bản nghiệm thu
- Tài liệu kỹ thuật nội bộ (tech spec, API doc, README)

---

## Quick Reference

| Task | Approach |
|------|----------|
| Tạo văn bản hành chính VN | Dùng template `vn-hanh-chinh` — xem phần Vietnamese Document Templates |
| Tạo hướng dẫn sử dụng phần mềm | Dùng template `software-guide` — xem phần Vietnamese Document Templates |
| Tạo file mới (general) | Dùng `docx-js` — xem phần Creating New Documents |
| Chỉnh sửa file có sẵn | Unpack → sửa XML → pack lại — xem phần Editing Existing Documents |
| Đọc / extract nội dung | `extract-text`, hoặc unpack để xem raw XML |

---

## ⭐ VIETNAMESE GOVERNMENT DOCUMENT STANDARDS

> **Quy chuẩn bắt buộc** theo Nghị định 30/2020/NĐ-CP về Công tác văn thư.
> Áp dụng cho tất cả văn bản hành chính gửi cơ quan nhà nước Việt Nam.

### Thông số trang chuẩn A4

```javascript
// Công thức quy đổi: 1 inch = 25.4mm = 1440 DXA
// A4: 210mm × 297mm = 11906 × 16838 DXA
// Content width = 11906 - 1701 - 1134 = 9071 DXA

const VN_PAGE = {
  size: {
    width: 11906,   // A4 width (210mm)
    height: 16838,  // A4 height (297mm)
  },
  margin: {
    top:    1417,   // 25mm — cách mép trên
    bottom: 1417,   // 25mm — cách mép dưới
    left:   1701,   // 30mm — cách mép trái  (lề trái rộng hơn để đóng gáy)
    right:  1134,   // 20mm — cách mép phải
  }
};
// CONTENT_WIDTH = 9071 DXA (dùng cho tất cả table width)
```

> ⚠️ **KHÔNG dùng A4 default của docx-js** — phải set margin rõ ràng. Default margin của docx-js là 1440 DXA (1 inch) tất cả các phía — sai chuẩn.

### Font và cỡ chữ chuẩn

| Thành phần | Font | Cỡ chữ | Kiểu | Căn lề |
|---|---|---|---|---|
| **Quốc hiệu** (CHXHCN VIỆT NAM) | Times New Roman | 12–13pt | IN HOA, đậm | Giữa |
| **Tiêu ngữ** (Độc lập – Tự do – Hạnh phúc) | Times New Roman | 12–13pt | IN HOA, đậm | Giữa |
| **Tên cơ quan ban hành** | Times New Roman | 12–13pt | IN HOA, đậm | Giữa |
| **Loại văn bản** (CÔNG VĂN / BÁO CÁO...) | Times New Roman | 14pt | IN HOA, đậm | Giữa |
| **Số, ký hiệu** | Times New Roman | 13pt | Đứng | Giữa |
| **Trích yếu nội dung** | Times New Roman | 13pt | Đứng, đậm | Giữa |
| **Địa danh, ngày tháng năm** | Times New Roman | 13pt | Nghiêng | Giữa |
| **Nội dung văn bản** | Times New Roman | 13–14pt | Đứng | Đều 2 lề |
| **Chức vụ người ký** | Times New Roman | 13pt | Đứng, đậm | Phải |
| **Tên người ký** | Times New Roman | 13pt | Đứng, đậm | Phải |

```
Quy đổi sang docx-js (half-points = pt × 2):
  12pt = size: 24
  13pt = size: 26    ← Default nội dung
  14pt = size: 28    ← Loại văn bản
```

### Khoảng cách dòng và đoạn văn chuẩn

```javascript
// Nội dung thông thường: dãn dòng 1.3 (đơn đến 1.5 lines — NĐ30 quy định)
const VN_BODY_SPACING = {
  line: 312,           // 1.3 lines (1 line = 240 twips, 1.3 × 240 = 312)
  lineRule: "auto",    // "auto" = multiple of line height
  before: 0,
  after: 120,          // 6pt spacing after paragraph (tối thiểu theo NĐ30)
};

// Tiêu đề Heading: spacing trước và sau rõ hơn
const VN_HEADING_SPACING = {
  line: 312,
  lineRule: "auto",
  before: 240,         // 12pt trước heading
  after: 120,          // 6pt sau heading
};

// Thụt đầu dòng nội dung: 1cm = 567 DXA (hoặc 1.27cm = 720 DXA)
const VN_FIRST_LINE_INDENT = 567; // 1cm
```

### Bộ Paragraph Styles chuẩn Nghị định 30

```javascript
const VN_STYLES = {
  default: {
    document: {
      run: { font: "Times New Roman", size: 26, color: "000000" } // 13pt default
    }
  },
  paragraphStyles: [
    // ── PHẦN TIÊU ĐỀ VĂN BẢN ──────────────────────────────────────────────

    // Quốc hiệu: CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
    {
      id: "QuocHieu",
      name: "Quoc Hieu",
      basedOn: "Normal",
      run: {
        font: "Times New Roman", size: 26, bold: true, allCaps: true
      },
      paragraph: {
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 0, line: 276, lineRule: "auto" }
      }
    },

    // Tiêu ngữ: Độc lập - Tự do - Hạnh phúc (có gạch chân)
    {
      id: "TieuNgu",
      name: "Tieu Ngu",
      basedOn: "Normal",
      run: {
        font: "Times New Roman", size: 26, bold: true, allCaps: true,
        underline: { type: UnderlineType.SINGLE }
      },
      paragraph: {
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 240, line: 276, lineRule: "auto" }
      }
    },

    // Tên cơ quan ban hành (IN HOA, có đường kẻ dưới ngắn — implement bằng border)
    {
      id: "TenCoQuan",
      name: "Ten Co Quan",
      basedOn: "Normal",
      run: {
        font: "Times New Roman", size: 26, bold: true, allCaps: true
      },
      paragraph: {
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 60, line: 276, lineRule: "auto" }
      }
    },

    // Loại văn bản: CÔNG VĂN / BÁO CÁO / TỜ TRÌNH / QUYẾT ĐỊNH...
    {
      id: "LoaiVanBan",
      name: "Loai Van Ban",
      basedOn: "Normal",
      run: {
        font: "Times New Roman", size: 28, bold: true, allCaps: true // 14pt
      },
      paragraph: {
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 60, line: 276, lineRule: "auto" }
      }
    },

    // Số, ký hiệu văn bản
    {
      id: "SoKyHieu",
      name: "So Ky Hieu",
      basedOn: "Normal",
      run: {
        font: "Times New Roman", size: 26
      },
      paragraph: {
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 60, line: 276, lineRule: "auto" }
      }
    },

    // Trích yếu nội dung
    {
      id: "TrichYeu",
      name: "Trich Yeu",
      basedOn: "Normal",
      run: {
        font: "Times New Roman", size: 26, bold: true
      },
      paragraph: {
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 240, line: 276, lineRule: "auto" }
      }
    },

    // Địa danh, ngày tháng năm (nghiêng, bên phải hoặc giữa)
    {
      id: "DiaDanhNgay",
      name: "Dia Danh Ngay",
      basedOn: "Normal",
      run: {
        font: "Times New Roman", size: 26, italics: true
      },
      paragraph: {
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 120, line: 276, lineRule: "auto" }
      }
    },

    // ── NỘI DUNG VĂN BẢN ───────────────────────────────────────────────────

    // Nội dung chính: in thường, canh đều 2 lề, thụt đầu dòng 1cm
    {
      id: "NoiDung",
      name: "Noi Dung",
      basedOn: "Normal",
      run: {
        font: "Times New Roman", size: 26
      },
      paragraph: {
        alignment: AlignmentType.BOTH,
        indent: { firstLine: 567 },           // 1cm thụt đầu dòng
        spacing: { before: 0, after: 120, line: 312, lineRule: "auto" }
      }
    },

    // Heading chuẩn NĐ30 — Phần / Chương / Điều
    {
      id: "Heading1",
      name: "Heading 1",
      basedOn: "Normal",
      next: "NoiDung",
      quickFormat: true,
      run: { font: "Times New Roman", size: 26, bold: true, allCaps: true },
      paragraph: {
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 120, line: 312, lineRule: "auto" },
        outlineLevel: 0
      }
    },
    {
      id: "Heading2",
      name: "Heading 2",
      basedOn: "Normal",
      next: "NoiDung",
      quickFormat: true,
      run: { font: "Times New Roman", size: 26, bold: true },
      paragraph: {
        alignment: AlignmentType.BOTH,
        spacing: { before: 180, after: 60, line: 312, lineRule: "auto" },
        outlineLevel: 1
      }
    },
    {
      id: "Heading3",
      name: "Heading 3",
      basedOn: "Normal",
      next: "NoiDung",
      quickFormat: true,
      run: { font: "Times New Roman", size: 26, bold: true, italics: true },
      paragraph: {
        alignment: AlignmentType.BOTH,
        spacing: { before: 120, after: 60, line: 312, lineRule: "auto" },
        outlineLevel: 2
      }
    },

    // ── PHẦN CHỮ KÝ ────────────────────────────────────────────────────────

    // Chức vụ người ký
    {
      id: "ChuVuKy",
      name: "Chu Vu Ky",
      basedOn: "Normal",
      run: { font: "Times New Roman", size: 26, bold: true, allCaps: true },
      paragraph: {
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 0, line: 276, lineRule: "auto" }
      }
    },

    // Tên người ký (in đậm, căn giữa)
    {
      id: "TenNguoiKy",
      name: "Ten Nguoi Ky",
      basedOn: "Normal",
      run: { font: "Times New Roman", size: 26, bold: true },
      paragraph: {
        alignment: AlignmentType.CENTER,
        spacing: { before: 1800, after: 0, line: 276, lineRule: "auto" } // khoảng trống ký tên
      }
    },

    // ── PHẦN PHỤ LỤC / GHI CHÚ ────────────────────────────────────────────

    {
      id: "GhiChu",
      name: "Ghi Chu",
      basedOn: "Normal",
      run: { font: "Times New Roman", size: 22, italics: true }, // 11pt
      paragraph: {
        alignment: AlignmentType.BOTH,
        spacing: { before: 0, after: 60, line: 276, lineRule: "auto" }
      }
    },
  ]
};
```

> **Import cần thiết cho styles trên:**
> ```javascript
> const { UnderlineType, AlignmentType } = require('docx');
> ```

---

## Creating New Documents

Generate .docx files với JavaScript, sau đó validate. Install: `npm install -g docx`

### Setup

```javascript
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  Header, Footer, AlignmentType, PageOrientation, LevelFormat, ExternalHyperlink,
  InternalHyperlink, Bookmark, FootnoteReferenceRun, PositionalTab,
  PositionalTabAlignment, PositionalTabRelativeTo, PositionalTabLeader,
  TabStopType, TabStopPosition, Column, SectionType, UnderlineType,
  TableOfContents, HeadingLevel, BorderStyle, WidthType, ShadingType,
  VerticalAlign, PageNumber, PageBreak
} = require('docx');
const fs = require('fs');

const doc = new Document({ sections: [{ children: [/* content */] }] });
Packer.toBuffer(doc).then(buffer => fs.writeFileSync("doc.docx", buffer));
```

### Validation

Sau khi tạo file, validate ngay. Nếu fail, unpack → sửa XML → repack.

```bash
python scripts/office/validate.py doc.docx
```

### Page Size

```javascript
// ⚠️ docx-js defaults to A4 với margin 1 inch — LUÔN set rõ ràng

// Văn bản hành chính Việt Nam → dùng VN_PAGE constants ở trên
sections: [{
  properties: {
    page: {
      size: { width: 11906, height: 16838 },  // A4
      margin: { top: 1417, bottom: 1417, left: 1701, right: 1134 } // NĐ30
    }
  },
  children: [/* content */]
}]

// Tài liệu kỹ thuật / hướng dẫn (A4 lề đều 20mm)
sections: [{
  properties: {
    page: {
      size: { width: 11906, height: 16838 },
      margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } // 20mm đều
    }
  },
  children: [/* content */]
}]
```

**Common page sizes (DXA units — 1440 DXA = 1 inch = 25.4mm):**

| Paper | Width | Height | NĐ30 Content Width |
|-------|-------|--------|-------------------|
| A4 (chuẩn VN) | 11,906 | 16,838 | **9,071** (left 30mm, right 20mm) |
| A4 lề đều 20mm | 11,906 | 16,838 | 9,638 |
| US Letter | 12,240 | 15,840 | 9,360 (1" margins) |

**Landscape orientation:**

```javascript
size: {
  width: 11906,   // Truyền chiều NGẮN làm width
  height: 16838,  // Truyền chiều DÀI làm height
  orientation: PageOrientation.LANDSCAPE  // docx-js tự swap trong XML
},
// Content width khi landscape = 16838 - left - right
```

### Styles — Override Built-in Headings

Sử dụng bộ `VN_STYLES` đã định nghĩa ở phần Vietnamese Government Document Standards cho văn bản nhà nước. Cho tài liệu kỹ thuật (không phải hành chính):

```javascript
const TECH_STYLES = {
  default: {
    document: { run: { font: "Arial", size: 24 } } // 12pt cho tech doc
  },
  paragraphStyles: [
    {
      id: "Heading1",
      name: "Heading 1",
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true,
      run: { size: 32, bold: true, font: "Arial" },
      paragraph: {
        spacing: { before: 240, after: 120 },
        outlineLevel: 0  // BẮT BUỘC cho TOC
      }
    },
    {
      id: "Heading2",
      name: "Heading 2",
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true,
      run: { size: 28, bold: true, font: "Arial" },
      paragraph: {
        spacing: { before: 180, after: 60 },
        outlineLevel: 1
      }
    },
    {
      id: "Heading3",
      name: "Heading 3",
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true,
      run: { size: 26, bold: true, italics: true, font: "Arial" },
      paragraph: {
        spacing: { before: 120, after: 60 },
        outlineLevel: 2
      }
    },
  ]
};
```

### Lists (NEVER use unicode bullets)

```javascript
// ❌ SAI — không bao giờ insert ký tự bullet thủ công
new Paragraph({ children: [new TextRun("• Item")] })           // BAD
new Paragraph({ children: [new TextRun("\u2022 Item")] })      // BAD

// ✅ ĐÚNG — dùng numbering config với LevelFormat.BULLET
const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: "–",                    // Dấu gạch ngang kiểu VN hành chính
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }, {
          level: 1,
          format: LevelFormat.BULLET,
          text: "+",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1080, hanging: 360 } } }
        }]
      },
      {
        reference: "numbers",
        levels: [{
          level: 0,
          format: LevelFormat.DECIMAL,
          text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }, {
          level: 1,
          format: LevelFormat.LOWER_LETTER,
          text: "%2)",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1080, hanging: 360 } } }
        }]
      },
    ]
  },
  sections: [{
    children: [
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Bullet item")]
      }),
      new Paragraph({
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Numbered item")]
      }),
      new Paragraph({
        numbering: { reference: "numbers", level: 1 }, // level 1 = a), b), c)
        children: [new TextRun("Sub-item a)")]
      }),
    ]
  }]
});

// ⚠️ Cùng reference = tiếp tục đánh số (1,2,3 → 4,5,6)
// Khác reference = đánh số lại từ đầu (1,2,3 → 1,2,3)
```

### Tables

**CRITICAL: Tables cần dual widths** — set cả `columnWidths` trên table VÀ `width` trên từng cell. Thiếu một trong hai → render sai trên nhiều platform.

```javascript
// Dùng CONTENT_WIDTH cho văn bản hành chính VN = 9071 DXA
const CONTENT_WIDTH = 9071;

const border = { style: BorderStyle.SINGLE, size: 4, color: "000000" }; // Đường kẻ đen chuẩn VN
const headerBorder = { style: BorderStyle.SINGLE, size: 8, color: "000000" }; // Header dày hơn
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };

// Table chia 2 cột đều
const col1 = Math.floor(CONTENT_WIDTH / 2);  // 4535
const col2 = CONTENT_WIDTH - col1;           // 4536

new Table({
  width: { size: CONTENT_WIDTH, type: WidthType.DXA },
  columnWidths: [col1, col2],
  rows: [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          borders: {
            top: headerBorder, bottom: headerBorder,
            left: headerBorder, right: headerBorder
          },
          width: { size: col1, type: WidthType.DXA },
          shading: { fill: "D9D9D9", type: ShadingType.CLEAR }, // Header xám nhạt
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Tiêu đề cột 1", bold: true, font: "Times New Roman", size: 26 })]
          })]
        }),
        new TableCell({
          borders: {
            top: headerBorder, bottom: headerBorder,
            left: headerBorder, right: headerBorder
          },
          width: { size: col2, type: WidthType.DXA },
          shading: { fill: "D9D9D9", type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Tiêu đề cột 2", bold: true, font: "Times New Roman", size: 26 })]
          })]
        }),
      ]
    }),
    new TableRow({
      children: [
        new TableCell({
          borders: { top: border, bottom: border, left: border, right: border },
          width: { size: col1, type: WidthType.DXA },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({
            children: [new TextRun({ text: "Nội dung", font: "Times New Roman", size: 26 })]
          })]
        }),
        // ... more cells
      ]
    })
  ]
})
```

**Table width rules:**
- **Luôn dùng `WidthType.DXA`** — `WidthType.PERCENTAGE` hỏng trong Google Docs
- `width` của table = tổng `columnWidths`
- `width` của từng cell = `columnWidths[i]` tương ứng
- `margins` là internal padding — KHÔNG cộng vào cell width
- Full-width table: dùng CONTENT_WIDTH (9071 DXA cho NĐ30)

**Merged cells (rowSpan / colSpan):**

```javascript
new TableRow({
  children: [
    new TableCell({
      columnSpan: 2, // merge 2 cột ngang
      rowSpan: 2,    // merge 2 hàng dọc
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      children: [new Paragraph({ children: [new TextRun("Ô merged")] })]
    }),
    // Các ô bị merge cần có children rỗng
    new TableCell({ children: [new Paragraph({})] }),
  ]
})
```

### Images

```javascript
// CRITICAL: type parameter là BẮT BUỘC
new Paragraph({
  alignment: AlignmentType.CENTER, // Ảnh thường căn giữa trong văn bản VN
  children: [new ImageRun({
    type: "png",  // BẮT BUỘC: png, jpg, jpeg, gif, bmp, svg
    data: fs.readFileSync("image.png"),
    transformation: {
      width: 400,  // pixels (docx-js tự convert sang EMU)
      height: 300
    },
    altText: { title: "Tên ảnh", description: "Mô tả ảnh", name: "image-name" } // Bắt buộc cả 3
  })]
})
```

**Logo đơn vị trong header — pattern phổ biến:**

```javascript
new Header({
  children: [
    new Paragraph({
      children: [
        new ImageRun({
          type: "png",
          data: fs.readFileSync("logo.png"),
          transformation: { width: 60, height: 60 }
        }),
        new TextRun({ text: "\tTÊN ĐƠN VỊ", font: "Times New Roman", size: 24, bold: true }),
      ],
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    })
  ]
})
```

### Page Breaks

```javascript
// CRITICAL: PageBreak PHẢI nằm trong Paragraph
new Paragraph({ children: [new PageBreak()] })

// Hoặc dùng pageBreakBefore
new Paragraph({ pageBreakBefore: true, children: [new TextRun("Trang mới")] })
```

### Hyperlinks

```javascript
// External link
new Paragraph({
  children: [new ExternalHyperlink({
    children: [new TextRun({ text: "Xem tại đây", style: "Hyperlink" })],
    link: "https://example.com",
  })]
})

// Internal link (bookmark + reference)
// 1. Tạo bookmark tại đích
new Paragraph({
  heading: HeadingLevel.HEADING_1,
  children: [new Bookmark({ id: "chuong1", children: [new TextRun("Chương 1")] })]
})
// 2. Link đến bookmark
new Paragraph({
  children: [new InternalHyperlink({
    children: [new TextRun({ text: "Xem Chương 1", style: "Hyperlink" })],
    anchor: "chuong1",
  })]
})
```

### Footnotes

```javascript
const doc = new Document({
  footnotes: {
    1: { children: [new Paragraph({ children: [new TextRun("Nguồn: Báo cáo thường niên 2024")] })] },
    2: { children: [new Paragraph({ children: [new TextRun("Xem phụ lục A để biết thêm chi tiết")] })] },
  },
  sections: [{
    children: [new Paragraph({
      children: [
        new TextRun("Doanh thu tăng 15%"),
        new FootnoteReferenceRun(1),
        new TextRun(" sử dụng số liệu điều chỉnh"),
        new FootnoteReferenceRun(2),
      ],
    })]
  }]
});
```

### Tab Stops

```javascript
// Căn phải — dùng trong phần địa danh/ngày tháng (bên phải) và tên công ty (bên trái)
new Paragraph({
  children: [
    new TextRun({ text: "TÊN CƠ QUAN", font: "Times New Roman", size: 26, bold: true }),
    new TextRun({ text: "\t", font: "Times New Roman", size: 26 }),
    new TextRun({ text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", font: "Times New Roman", size: 26, bold: true }),
  ],
  tabStops: [{ type: TabStopType.CENTER, position: Math.floor(9071 / 2) }],
})

// Dot leader (kiểu mục lục)
new Paragraph({
  children: [
    new TextRun("I. Giới thiệu"),
    new TextRun({ children: [
      new PositionalTab({
        alignment: PositionalTabAlignment.RIGHT,
        relativeTo: PositionalTabRelativeTo.MARGIN,
        leader: PositionalTabLeader.DOT,
      }),
      "3",
    ]}),
  ],
})
```

### Multi-Column Layouts

```javascript
sections: [{
  properties: {
    column: {
      count: 2,
      space: 720,     // 0.5 inch = 720 DXA
      equalWidth: true,
      separate: false,
    },
  },
  children: [/* nội dung chạy tự động qua các cột */]
}]
```

### Table of Contents

```javascript
// CRITICAL: Heading phải dùng HeadingLevel — KHÔNG dùng custom styles với TOC
new TableOfContents("MỤC LỤC", { hyperlink: true, headingStyleRange: "1-3" })
```

### Headers / Footers

```javascript
sections: [{
  properties: {
    page: {
      margin: { top: 1417, bottom: 1417, left: 1701, right: 1134 }
    }
  },
  headers: {
    default: new Header({
      children: [new Paragraph({
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000", space: 1 }
        },
        children: [
          new TextRun({ text: "Hướng dẫn sử dụng phần mềm XYZ", font: "Times New Roman", size: 22, italics: true }),
          new TextRun({ text: "\tv1.0", font: "Times New Roman", size: 22, italics: true }),
        ],
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      })]
    })
  },
  footers: {
    default: new Footer({
      children: [new Paragraph({
        border: {
          top: { style: BorderStyle.SINGLE, size: 6, color: "000000", space: 1 }
        },
        children: [
          new TextRun({ text: "Trang ", font: "Times New Roman", size: 22 }),
          new TextRun({ children: [PageNumber.CURRENT], font: "Times New Roman", size: 22 }),
          new TextRun({ text: " / ", font: "Times New Roman", size: 22 }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], font: "Times New Roman", size: 22 }),
        ],
        alignment: AlignmentType.CENTER,
      })]
    })
  },
  children: [/* content */]
}]
```

### Critical Rules for docx-js

- **Set page size & margin rõ ràng** — default của docx-js là A4 với margin 1 inch, KHÔNG đúng chuẩn NĐ30
- **Font Times New Roman cho văn bản nhà nước** — KHÔNG dùng Arial
- **CONTENT_WIDTH = 9071 DXA** cho A4 lề NĐ30 — dùng nhất quán trong mọi table
- **Landscape: truyền portrait dimensions** — docx-js tự swap; truyền cạnh NGẮN làm width
- **Không dùng `\n`** — tạo Paragraph mới cho mỗi dòng
- **Không dùng unicode bullets** — dùng `LevelFormat.BULLET` với numbering config
- **PageBreak phải nằm trong Paragraph** — standalone tạo XML không hợp lệ
- **ImageRun bắt buộc có `type`** — luôn khai báo png/jpg/v.v.
- **Luôn dùng `WidthType.DXA`** — `WidthType.PERCENTAGE` hỏng trong Google Docs
- **Tables cần dual widths** — `columnWidths` array VÀ cell `width`, phải khớp nhau
- **Table width = tổng columnWidths** — đảm bảo cộng đúng
- **Luôn có cell margins** — `{ top: 80, bottom: 80, left: 120, right: 120 }` cho dễ đọc
- **Dùng `ShadingType.CLEAR`** — KHÔNG dùng SOLID (nền đen)
- **Không dùng table làm divider/ruler** — dùng Paragraph border thay thế
- **TOC chỉ nhận HeadingLevel** — không dùng custom styles trên heading cho TOC
- **Override built-in styles** — dùng đúng ID: "Heading1", "Heading2", v.v.
- **Khai báo `outlineLevel`** — bắt buộc cho TOC (0 cho H1, 1 cho H2...)
- **Smart quotes cho văn bản chuyên nghiệp** — dùng `&#x201C;` / `&#x201D;` khi edit XML trực tiếp

---

## ⭐ VIETNAMESE DOCUMENT TEMPLATES

> Các template này dùng trong DevDocs Studio serverless function `/api/skills/docx`.
> Claude API nhận JSON data, function render ra DOCX theo template tương ứng.

### Template 1: Công văn hành chính (NĐ30)

**Cấu trúc layout (trục ngang chia đôi trang):**

```
┌─────────────────────────────────────────────────────────┐
│  TÊN CƠ QUAN CHỦ QUẢN          CỘNG HÒA XÃ HỘI         │
│  ─────────────────              CHỦ NGHĨA VIỆT NAM       │
│  TÊN ĐƠN VỊ BAN HÀNH           Độc lập – Tự do – HP    │
│  ────────────                   ──────────────────────   │
│                                                          │
│  Số: ___/20XX/CV-[KH]          [Địa danh], ngày... tháng│
│                                                          │
│                      CÔNG VĂN                           │
│            V/v: [Trích yếu nội dung]                     │
│                                                          │
│  Kính gửi: [Tên cơ quan nhận]                           │
│                                                          │
│  [Nội dung văn bản — căn đều 2 lề, thụt đầu dòng 1cm]  │
│                                                          │
│                              [Địa danh, ngày ký]        │
│                          CHỨC VỤ NGƯỜI KÝ               │
│                                                          │
│                          (Chữ ký + con dấu)             │
│                                                          │
│                          Nguyễn Văn A                   │
│                                                          │
│  Nơi nhận:                                              │
│  - [Cơ quan nhận];                                       │
│  - Lưu: VT, ...                                          │
└─────────────────────────────────────────────────────────┘
```

**Code template Công văn:**

```javascript
function buildCongVan({ coQuanChuQuan, tenDonVi, soKyHieu, diaDanh, ngayKy,
                         loaiVanBan = "CÔNG VĂN", trichYeu, kinhGui, noiDung,
                         chuVuKy, tenNguoiKy, noiNhan }) {

  const CONTENT_W = 9071;
  const halfW = Math.floor(CONTENT_W / 2);

  // Hàm helper tạo đường kẻ ngắn (1/3 chiều rộng text, căn giữa)
  const underlineShort = (text, styleId) => new Paragraph({
    style: styleId,
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000", space: 1 } },
    children: [new TextRun({ text, font: "Times New Roman", size: 26, bold: true, allCaps: true })],
    // Note: Dòng kẻ sẽ dài bằng chiều rộng paragraph — đặt trong cell có width phù hợp
  });

  return new Document({
    styles: VN_STYLES,
    numbering: { config: [/* bullet/number configs */] },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1417, bottom: 1417, left: 1701, right: 1134 }
        }
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            border: { top: { style: BorderStyle.SINGLE, size: 4, color: "000000", space: 1 } },
            children: [
              new TextRun({ text: "Trang ", font: "Times New Roman", size: 20 }),
              new TextRun({ children: [PageNumber.CURRENT], font: "Times New Roman", size: 20 }),
            ]
          })]
        })
      },
      children: [
        // ── PHẦN TIÊU ĐỀ: Bảng 2 cột không viền ──────────────────────────
        new Table({
          width: { size: CONTENT_W, type: WidthType.DXA },
          columnWidths: [halfW, CONTENT_W - halfW],
          borders: {
            top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
            insideH: { style: BorderStyle.NONE }, insideV: { style: BorderStyle.NONE }
          },
          rows: [
            new TableRow({ children: [
              // Cột TRÁI: Tên cơ quan chủ quản + Tên đơn vị
              new TableCell({
                width: { size: halfW, type: WidthType.DXA },
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                           left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: coQuanChuQuan.toUpperCase(),
                      font: "Times New Roman", size: 24, bold: true })]
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000", space: 1 } },
                    children: [new TextRun({ text: tenDonVi.toUpperCase(),
                      font: "Times New Roman", size: 24, bold: true })]
                  }),
                ]
              }),
              // Cột PHẢI: Quốc hiệu + Tiêu ngữ
              new TableCell({
                width: { size: CONTENT_W - halfW, type: WidthType.DXA },
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                           left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                children: [
                  new Paragraph({
                    style: "QuocHieu",
                    children: [new TextRun({ text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
                      font: "Times New Roman", size: 26, bold: true })]
                  }),
                  new Paragraph({
                    style: "TieuNgu",
                    children: [new TextRun({ text: "Độc lập – Tự do – Hạnh phúc",
                      font: "Times New Roman", size: 26, bold: true,
                      underline: { type: UnderlineType.SINGLE } })]
                  }),
                ]
              }),
            ]})
          ]
        }),

        // ── SỐ VĂN BẢN + ĐỊA DANH NGÀY (2 cột) ─────────────────────────
        new Table({
          width: { size: CONTENT_W, type: WidthType.DXA },
          columnWidths: [halfW, CONTENT_W - halfW],
          borders: { top:{style:BorderStyle.NONE}, bottom:{style:BorderStyle.NONE},
                     left:{style:BorderStyle.NONE}, right:{style:BorderStyle.NONE},
                     insideH:{style:BorderStyle.NONE}, insideV:{style:BorderStyle.NONE} },
          rows: [new TableRow({ children: [
            new TableCell({
              width: { size: halfW, type: WidthType.DXA },
              borders: { top:{style:BorderStyle.NONE}, bottom:{style:BorderStyle.NONE},
                         left:{style:BorderStyle.NONE}, right:{style:BorderStyle.NONE} },
              children: [new Paragraph({
                children: [new TextRun({ text: `Số: ${soKyHieu}`,
                  font: "Times New Roman", size: 26 })]
              })]
            }),
            new TableCell({
              width: { size: CONTENT_W - halfW, type: WidthType.DXA },
              borders: { top:{style:BorderStyle.NONE}, bottom:{style:BorderStyle.NONE},
                         left:{style:BorderStyle.NONE}, right:{style:BorderStyle.NONE} },
              children: [new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: `${diaDanh}, ngày ${ngayKy}`,
                  font: "Times New Roman", size: 26, italics: true })]
              })]
            }),
          ]})]
        }),

        // ── TÊN LOẠI VĂN BẢN ─────────────────────────────────────────────
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 240, after: 60 },
          children: [new TextRun({ text: loaiVanBan,
            font: "Times New Roman", size: 28, bold: true })]
        }),

        // ── TRÍCH YẾU ─────────────────────────────────────────────────────
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 240 },
          children: [new TextRun({ text: `V/v: ${trichYeu}`,
            font: "Times New Roman", size: 26, bold: true })]
        }),

        // ── KÍNH GỬI ──────────────────────────────────────────────────────
        new Paragraph({
          spacing: { before: 0, after: 120 },
          children: [
            new TextRun({ text: "Kính gửi: ", font: "Times New Roman", size: 26, bold: true }),
            new TextRun({ text: kinhGui, font: "Times New Roman", size: 26 }),
          ]
        }),

        // ── NỘI DUNG VĂN BẢN (Claude inject các Paragraph) ───────────────
        ...noiDung, // Array<Paragraph> với style "NoiDung"

        // ── PHẦN CHỮ KÝ (2 cột: Nơi nhận | Chức vụ người ký) ────────────
        new Table({
          width: { size: CONTENT_W, type: WidthType.DXA },
          columnWidths: [halfW, CONTENT_W - halfW],
          borders: { top:{style:BorderStyle.NONE}, bottom:{style:BorderStyle.NONE},
                     left:{style:BorderStyle.NONE}, right:{style:BorderStyle.NONE},
                     insideH:{style:BorderStyle.NONE}, insideV:{style:BorderStyle.NONE} },
          rows: [new TableRow({ children: [
            // NƠI NHẬN
            new TableCell({
              width: { size: halfW, type: WidthType.DXA },
              borders: { top:{style:BorderStyle.NONE}, bottom:{style:BorderStyle.NONE},
                         left:{style:BorderStyle.NONE}, right:{style:BorderStyle.NONE} },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Nơi nhận:",
                    font: "Times New Roman", size: 26, bold: true, italics: true })]
                }),
                ...noiNhan.map(item => new Paragraph({
                  numbering: { reference: "bullets", level: 0 },
                  children: [new TextRun({ text: item, font: "Times New Roman", size: 24 })]
                })),
                new Paragraph({
                  numbering: { reference: "bullets", level: 0 },
                  children: [new TextRun({ text: "Lưu: VT.", font: "Times New Roman", size: 24 })]
                }),
              ]
            }),
            // CHỮ KÝ
            new TableCell({
              width: { size: CONTENT_W - halfW, type: WidthType.DXA },
              borders: { top:{style:BorderStyle.NONE}, bottom:{style:BorderStyle.NONE},
                         left:{style:BorderStyle.NONE}, right:{style:BorderStyle.NONE} },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 0, after: 60 },
                  children: [new TextRun({ text: chuVuKy.toUpperCase(),
                    font: "Times New Roman", size: 26, bold: true })]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 0, after: 0 },
                  children: [new TextRun({ text: "(Chữ ký, con dấu)",
                    font: "Times New Roman", size: 24, italics: true })]
                }),
                // Khoảng trắng để ký
                new Paragraph({ spacing: { before: 1200, after: 0 }, children: [] }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: tenNguoiKy,
                    font: "Times New Roman", size: 26, bold: true })]
                }),
              ]
            }),
          ]})]
        }),
      ]
    }]
  });
}
```

### Template 2: Biên bản họp

```javascript
function buildBienBanHop({ tieuDe, thoiGian, diaDiem, thanhPhan, chuToa,
                            thuKy, noiDung, ketLuan, chuyenVien }) {
  // Cấu trúc:
  // [Header: Quốc hiệu + Tiêu ngữ]
  // BIÊN BẢN HỌP
  // Về việc: [tiêu đề]
  // Thời gian: ... | Địa điểm: ...
  // Thành phần tham dự: [bảng hoặc danh sách]
  // Chủ tọa: ... | Thư ký: ...
  // ───────────
  // NỘI DUNG
  // 1. Báo cáo của...
  // 2. Ý kiến thảo luận
  // 3. Kết luận
  // ───────────
  // [Ký: Thư ký | Chủ tọa]
}
```

### Template 3: Hướng dẫn sử dụng phần mềm

```javascript
function buildSoftwareGuide({ tenPhanMem, phienBan, ngayBanHanh,
                               donViThucHien, noiDungChuong }) {
  // Cấu trúc:
  // [Bìa: Logo + Tên phần mềm + Phiên bản + Đơn vị]
  // [Trang mục lục — TOC tự động]
  // Chương 1: Giới thiệu tổng quan
  // Chương 2: Yêu cầu hệ thống
  // Chương 3: Cài đặt và cấu hình
  // Chương 4: Hướng dẫn sử dụng (từng chức năng)
  // Chương 5: Xử lý lỗi thường gặp
  // Phụ lục: Danh sách thuật ngữ, Liên hệ hỗ trợ
}
```

---

## Converting .doc to .docx

Legacy `.doc` phải convert trước khi chỉnh sửa:

```bash
python scripts/office/soffice.py --headless --convert-to docx document.doc
```

## Reading Content

```bash
# Text extraction as markdown
extract-text document.docx

# Show tracked changes thay vì accept
pandoc --track-changes=all document.docx -o output.md

# Raw XML access
python scripts/office/unpack.py document.docx unpacked/
```

## Converting to Images

```bash
python scripts/office/soffice.py --headless --convert-to pdf document.docx
pdftoppm -jpeg -r 150 document.pdf page
```

## Accepting Tracked Changes

```bash
python scripts/accept_changes.py input.docx output.docx
```

---

## Editing Existing Documents

**Tuân thủ đúng 3 bước theo thứ tự.**

### Step 1: Unpack

```bash
python scripts/office/unpack.py document.docx unpacked/
```

Extract XML, pretty-print, merge adjacent runs, và convert smart quotes sang XML entities. Dùng `--merge-runs false` để skip run merging.

### Step 2: Edit XML

Edit các file trong `unpacked/word/`. Xem XML Reference bên dưới.

**Dùng "DevDocs" làm author** cho tracked changes và comments (thay vì "Claude" trong context này).

**KHÔNG viết Python script để replace** — dùng trực tiếp Edit tool, rõ ràng hơn.

**CRITICAL: Dùng smart quotes cho nội dung mới.** Khi thêm text với apostrophe hoặc dấu ngoặc:

```xml
<!-- Dùng XML entities cho typography chuyên nghiệp -->
<w:t>Đây là &#x201C;trích dẫn&#x201D; và từ vi&#x1EBB;t</w:t>
```

| Entity | Ký tự |
|--------|-------|
| `&#x2018;` | ' (nháy đơn trái) |
| `&#x2019;` | ' (nháy đơn phải / apostrophe) |
| `&#x201C;` | " (nháy kép trái) |
| `&#x201D;` | " (nháy kép phải) |

**Thêm comments:**

```bash
python scripts/comment.py unpacked/ 0 "Nội dung comment với &amp; và &#x2019;"
python scripts/comment.py unpacked/ 1 "Reply" --parent 0
python scripts/comment.py unpacked/ 0 "Text" --author "Reviewer"
```

### Step 3: Pack

```bash
python scripts/office/pack.py unpacked/ output.docx --original document.docx
```

**Auto-repair sẽ fix:**
- `durableId` >= 0x7FFFFFFF (tạo lại ID hợp lệ)
- Thiếu `xml:space="preserve"` trên `<w:t>` có whitespace

**Auto-repair KHÔNG fix:**
- Malformed XML, element nesting sai, thiếu relationships, vi phạm schema

### Common Pitfalls

- **Replace toàn bộ `<w:r>` element**: Khi thêm tracked changes, thay cả block `<w:r>...</w:r>` bằng `<w:del>...<w:ins>...` là siblings. KHÔNG inject tracked change tags bên trong run.
- **Giữ `<w:rPr>` formatting**: Copy block `<w:rPr>` từ run gốc vào tracked change runs để giữ bold, font size, v.v.

---

## XML Reference

### Schema Compliance

- **Thứ tự element trong `<w:pPr>`**: `<w:pStyle>`, `<w:numPr>`, `<w:spacing>`, `<w:ind>`, `<w:jc>`, `<w:rPr>` ở CUỐI
- **Whitespace**: Thêm `xml:space="preserve"` vào `<w:t>` có leading/trailing spaces
- **RSIDs**: Phải là 8-digit hex (ví dụ: `00AB1234`)

### Tracked Changes

**Insertion:**
```xml
<w:ins w:id="1" w:author="DevDocs" w:date="2026-04-25T00:00:00Z">
  <w:r><w:t>văn bản được chèn thêm</w:t></w:r>
</w:ins>
```

**Deletion:**
```xml
<w:del w:id="2" w:author="DevDocs" w:date="2026-04-25T00:00:00Z">
  <w:r><w:delText>văn bản bị xóa</w:delText></w:r>
</w:del>
```

**Bên trong `<w:del>`**: Dùng `<w:delText>` thay `<w:t>`, và `<w:delInstrText>` thay `<w:instrText>`.

**Minimal edits** — chỉ đánh dấu những gì thay đổi:

```xml
<!-- Đổi "30 ngày" thành "60 ngày" -->
<w:r><w:t xml:space="preserve">Thời hạn là </w:t></w:r>
<w:del w:id="1" w:author="DevDocs" w:date="2026-04-25T00:00:00Z">
  <w:r><w:delText>30</w:delText></w:r>
</w:del>
<w:ins w:id="2" w:author="DevDocs" w:date="2026-04-25T00:00:00Z">
  <w:r><w:t>60</w:t></w:r>
</w:ins>
<w:r><w:t xml:space="preserve"> ngày.</w:t></w:r>
```

**Xóa toàn bộ paragraph/list item** — đánh dấu cả paragraph mark:

```xml
<w:p>
  <w:pPr>
    <w:numPr>...</w:numPr>
    <w:rPr>
      <w:del w:id="1" w:author="DevDocs" w:date="2026-04-25T00:00:00Z"/>
    </w:rPr>
  </w:pPr>
  <w:del w:id="2" w:author="DevDocs" w:date="2026-04-25T00:00:00Z">
    <w:r><w:delText>Toàn bộ nội dung paragraph bị xóa...</w:delText></w:r>
  </w:del>
</w:p>
```

**Reject insertion của tác giả khác:**
```xml
<w:ins w:author="NguoiKhac" w:id="5">
  <w:del w:author="DevDocs" w:id="10">
    <w:r><w:delText>text họ đã chèn</w:delText></w:r>
  </w:del>
</w:ins>
```

**Restore deletion của tác giả khác:**
```xml
<w:del w:author="NguoiKhac" w:id="5">
  <w:r><w:delText>văn bản bị xóa</w:delText></w:r>
</w:del>
<w:ins w:author="DevDocs" w:id="10">
  <w:r><w:t>văn bản bị xóa</w:t></w:r>
</w:ins>
```

### Comments

Sau khi chạy `comment.py`, thêm markers vào document.xml:

**CRITICAL: `<w:commentRangeStart>` và `<w:commentRangeEnd>` là siblings của `<w:r>`, KHÔNG nằm trong `<w:r>`.**

```xml
<!-- Markers là direct children của w:p, không phải trong w:r -->
<w:commentRangeStart w:id="0"/>
<w:r><w:t>text được comment</w:t></w:r>
<w:commentRangeEnd w:id="0"/>
<w:r><w:rPr><w:rStyle w:val="CommentReference"/></w:rPr><w:commentReference w:id="0"/></w:r>
```

### Images

1. Thêm file ảnh vào `word/media/`
2. Thêm relationship vào `word/_rels/document.xml.rels`:
```xml
<Relationship Id="rId5" Type=".../image" Target="media/image1.png"/>
```
3. Thêm content type vào `[Content_Types].xml`:
```xml
<Default Extension="png" ContentType="image/png"/>
```
4. Reference trong document.xml:
```xml
<w:drawing>
  <wp:inline>
    <wp:extent cx="914400" cy="914400"/>  <!-- EMUs: 914400 = 1 inch -->
    <a:graphic>
      <a:graphicData uri=".../picture">
        <pic:pic>
          <pic:blipFill><a:blip r:embed="rId5"/></pic:blipFill>
        </pic:pic>
      </a:graphicData>
    </a:graphic>
  </wp:inline>
</w:drawing>
```

---

## DevDocs Studio — System Prompt Config

> Phần này dành cho Admin Panel (`/admin/skills`).
> System prompt được lưu trong Vercel KV: `skill:docx:prompt`
> Cập nhật không cần deploy lại — thay đổi có hiệu lực ngay lập tức.

### Default System Prompt (v2.0)

```
Bạn là trợ lý sinh tài liệu Word chuyên nghiệp cho developer phần mềm phục vụ cơ quan nhà nước Việt Nam.

## NHIỆM VỤ
Khi nhận yêu cầu, hãy:
1. Xác định loại văn bản (công văn / báo cáo / biên bản / hướng dẫn sử dụng / tài liệu kỹ thuật)
2. Trả về JSON data theo schema phù hợp để serverless function render DOCX
3. Đảm bảo nội dung đúng văn phong, đúng thể thức

## CHUẨN VĂN BẢN HÀNH CHÍNH
- Font: Times New Roman, Unicode TCVN 6909:2001
- Cỡ chữ: 13pt nội dung, 14pt tên loại văn bản
- Lề: Trái 30mm, Phải 20mm, Trên 25mm, Dưới 25mm (Nghị định 30/2020/NĐ-CP)
- Khoảng cách dòng: 1.3 (tối thiểu đơn, tối đa 1.5)
- Căn lề nội dung: Đều 2 lề (justify)
- Thụt đầu dòng: 1cm (1 cm = 567 DXA)

## VĂN PHONG
- Ngôn ngữ trang trọng, súc tích, rõ ràng
- Không dùng từ viết tắt chưa được giải thích lần đầu
- Câu chủ động, tránh câu bị động khi không cần thiết
- Đối với văn bản gửi lãnh đạo: tôn trọng, lịch sự
- Đối với hướng dẫn sử dụng: đơn giản, dễ hiểu, từng bước rõ ràng

## OUTPUT FORMAT
Trả về JSON với cấu trúc:
{
  "documentType": "cong-van|bao-cao|bien-ban|huong-dan|tech-doc",
  "metadata": { "tieuDe": "...", "soKyHieu": "...", ... },
  "sections": [ { "heading": "...", "content": [...] } ],
  "signature": { "chuVuKy": "...", "tenNguoiKy": "..." }
}
```

### Admin Panel — Các trường cấu hình per Skill

| Trường | KV Key | Mô tả |
|--------|--------|-------|
| System Prompt | `skill:docx:prompt` | Hướng dẫn cho Claude AI |
| Template URL | `skill:docx:template_url` | Vercel Blob URL của file .docx mẫu |
| Version History | `skill:docx:prompt:history` | JSON array, giữ 10 versions gần nhất |
| Schema Version | `skill:docx:version` | Version của output JSON schema |
| Active | `skill:docx:active` | Boolean — bật/tắt skill |

---

## DevDocs Studio — Serverless Function Flow

```
POST /api/skills/docx
Body: { userRequest: string, orgName: string, documentType: string }

1. Đọc system prompt từ Vercel KV: skill:docx:prompt
2. Gọi Claude API (claude-sonnet, streaming):
   - System: [system prompt từ KV]
   - User: [userRequest]
   → Output: JSON data
3. Parse JSON → validate schema
4. Chọn template function dựa vào documentType
5. Gọi buildDocument(template, jsonData) → Buffer
6. Upload Buffer lên Vercel Blob
   → Trả về: { downloadUrl, fileName, expiresIn: "1h" }
7. Response: { success: true, downloadUrl, preview }
```

**Timeout handling (Vercel limits):**
- Hobby plan: 10s → Dùng Claude `max_tokens: 1024` để giới hạn
- Pro plan: 60s → Cho phép document dài hơn
- Edge Function: Không hỗ trợ Node.js Buffer → KHÔNG dùng cho skill này

---

## Dependencies

- **docx**: `npm install docx` — tạo documents mới (Node.js)
- **pandoc**: Text extraction và format conversion
- **LibreOffice**: PDF conversion (auto-configured qua `scripts/office/soffice.py`)
- **Poppler**: `pdftoppm` để convert PDF sang images
- **Vercel KV** (`@vercel/kv`): Lưu skill config và system prompt
- **Vercel Blob** (`@vercel/blob`): Lưu tạm file output (TTL 1 giờ)
