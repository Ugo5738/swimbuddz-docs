#!/usr/bin/env python3
"""Build the Rowe Park partnership proposal PDF from PROPOSAL_SOURCE.md.

PROPOSAL_SOURCE.md is the source of truth — edit it, then run:

    cd docs/company/rowe_park_proposal
    python3 build_proposal_pdf.py            # writes ../ROWE_PARK_PARTNERSHIP_PROPOSAL.pdf
    python3 build_proposal_pdf.py out.pdf    # custom output path

Supported markdown is documented in the comment at the top of PROPOSAL_SOURCE.md.
To refresh the attendance chart from production data, run refresh_attendance_chart.py.
"""
import re
import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Image,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

HERE = Path(__file__).resolve().parent
SOURCE = HERE / "PROPOSAL_SOURCE.md"
DEFAULT_OUT = HERE.parent / "ROWE_PARK_PARTNERSHIP_PROPOSAL.pdf"

NAVY = colors.HexColor("#0f172a")
TEAL = colors.HexColor("#0e7490")
CYAN = colors.HexColor("#06b6d4")
INK = colors.HexColor("#334155")
GREY = colors.HexColor("#64748b")
CARD_BG = colors.HexColor("#f1f5f9")
CALLOUT_BG = colors.HexColor("#eef2f6")
HAIRLINE = colors.HexColor("#cbd5e1")


def register_fonts():
    """Register a Unicode font family so the Naira (N) glyph renders."""
    candidates = [
        (
            "/System/Library/Fonts/Supplemental/Arial.ttf",
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
            "/System/Library/Fonts/Supplemental/Arial Italic.ttf",
        ),
        (
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf",
        ),
    ]
    for regular, bold, italic in candidates:
        if all(Path(p).exists() for p in (regular, bold, italic)):
            pdfmetrics.registerFont(TTFont("Sans", regular))
            pdfmetrics.registerFont(TTFont("Sans-Bold", bold))
            pdfmetrics.registerFont(TTFont("Sans-Italic", italic))
            registerFontFamily(
                "Sans", normal="Sans", bold="Sans-Bold",
                italic="Sans-Italic", boldItalic="Sans-Bold",
            )
            return "Sans", "Sans-Bold", "Sans-Italic"
    return "Helvetica", "Helvetica-Bold", "Helvetica-Oblique"


FONT_REG, FONT_BOLD, FONT_ITALIC = register_fonts()


def styles():
    base = getSampleStyleSheet()
    return {
        "pretitle": ParagraphStyle("pretitle", parent=base["Normal"], fontName=FONT_BOLD,
                                   fontSize=11, leading=14, textColor=TEAL, spaceAfter=6),
        "title": ParagraphStyle("title", parent=base["Title"], fontName=FONT_BOLD,
                                fontSize=30, leading=36, textColor=NAVY, alignment=0, spaceAfter=8),
        "tagline": ParagraphStyle("tagline", parent=base["Normal"], fontName=FONT_REG,
                                  fontSize=12.5, leading=18, textColor=INK, spaceAfter=10),
        "label": ParagraphStyle("label", parent=base["Normal"], fontName=FONT_BOLD,
                                fontSize=8.5, leading=11, textColor=GREY, spaceAfter=2),
        "labelval": ParagraphStyle("labelval", parent=base["Normal"], fontName=FONT_REG,
                                   fontSize=10.5, leading=14, textColor=INK),
        "h1": ParagraphStyle("h1", parent=base["Heading1"], fontName=FONT_BOLD,
                             fontSize=15, leading=19, textColor=NAVY, spaceBefore=16, spaceAfter=7),
        "h2": ParagraphStyle("h2", parent=base["Heading2"], fontName=FONT_BOLD,
                             fontSize=11.5, leading=15, textColor=TEAL, spaceBefore=10, spaceAfter=5),
        "body": ParagraphStyle("body", parent=base["Normal"], fontName=FONT_REG,
                               fontSize=10, leading=14.5, textColor=INK, spaceAfter=7),
        "bullet": ParagraphStyle("bullet", parent=base["Normal"], fontName=FONT_REG,
                                 fontSize=10, leading=14, textColor=INK),
        "note": ParagraphStyle("note", parent=base["Normal"], fontName=FONT_ITALIC,
                               fontSize=8.5, leading=11.5, textColor=GREY, spaceBefore=4, spaceAfter=6),
        "caption": ParagraphStyle("caption", parent=base["Normal"], fontName=FONT_ITALIC,
                                  fontSize=8.5, leading=11, textColor=GREY,
                                  alignment=TA_CENTER, spaceBefore=3, spaceAfter=8),
        "callout_title": ParagraphStyle("callout_title", parent=base["Normal"], fontName=FONT_BOLD,
                                        fontSize=10, leading=13, textColor=TEAL, spaceAfter=3),
        "callout_body": ParagraphStyle("callout_body", parent=base["Normal"], fontName=FONT_REG,
                                       fontSize=9.5, leading=13.5, textColor=INK),
        "stat_num": ParagraphStyle("stat_num", parent=base["Normal"], fontName=FONT_BOLD,
                                   fontSize=19, leading=23, textColor=TEAL, alignment=TA_CENTER),
        "stat_label": ParagraphStyle("stat_label", parent=base["Normal"], fontName=FONT_REG,
                                     fontSize=7.5, leading=10, textColor=GREY, alignment=TA_CENTER),
        "th": ParagraphStyle("th", parent=base["Normal"], fontName=FONT_BOLD,
                             fontSize=9.5, leading=12.5, textColor=colors.white),
        "td": ParagraphStyle("td", parent=base["Normal"], fontName=FONT_REG,
                             fontSize=9.5, leading=12.5, textColor=INK),
    }


def inline(text):
    """Markdown inline markup -> reportlab paragraph markup."""
    text = text.replace("&", "&amp;").replace("<br/>", "@@BR@@")
    text = text.replace("<", "&lt;").replace(">", "&gt;")
    text = text.replace("@@BR@@", "<br/>")
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<i>\1</i>", text)
    return text


def parse_front_matter(lines):
    meta, i = {}, 0
    while i < len(lines) and lines[i].strip() != "---":
        i += 1
    i += 1
    while i < len(lines) and lines[i].strip() != "---":
        line = lines[i]
        if ":" in line:
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip()
        i += 1
    return meta, i + 1


def styled_table(rows, col_pcts, s, usable_width, header=True):
    col_widths = [usable_width * p / 100.0 for p in col_pcts]
    data = []
    for ri, row in enumerate(rows):
        style = s["th"] if (header and ri == 0) else s["td"]
        data.append([Paragraph(inline(cell), style) for cell in row])
    t = Table(data, colWidths=col_widths, repeatRows=1 if header else 0)
    cmds = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("LINEBELOW", (0, -1), (-1, -1), 0.4, HAIRLINE),
    ]
    if header:
        cmds += [
            ("BACKGROUND", (0, 0), (-1, 0), NAVY),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, CARD_BG]),
        ]
    else:
        cmds += [("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, CARD_BG])]
    t.setStyle(TableStyle(cmds))
    return t


def stat_cards(rows, s, usable_width):
    nums, labels = rows[0], rows[1]
    n = len(nums)
    gap = 0.35 * cm
    card_w = (usable_width - gap * (n - 1)) / n
    cells = []
    for num, label in zip(nums, labels):
        inner = Table(
            [[Paragraph(inline(num), s["stat_num"])], [Paragraph(inline(label), s["stat_label"])]],
            colWidths=[card_w],
        )
        inner.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), CARD_BG),
            ("TOPPADDING", (0, 0), (0, 0), 9),
            ("BOTTOMPADDING", (0, 1), (0, 1), 9),
            ("TOPPADDING", (0, 1), (0, 1), 1),
            ("BOTTOMPADDING", (0, 0), (0, 0), 1),
        ]))
        cells.append(inner)
    spaced = []
    for i, cell in enumerate(cells):
        spaced.append(cell)
        if i < n - 1:
            spaced.append(Spacer(gap, 1))
    wrap = Table([spaced], colWidths=[card_w if i % 2 == 0 else gap for i in range(2 * n - 1)])
    wrap.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    return wrap


def callout(title, body_lines, s, usable_width):
    flow = []
    if title:
        flow.append(Paragraph(inline(title), s["callout_title"]))
    for b in body_lines:
        flow.append(Paragraph(inline(b), s["callout_body"]))
    t = Table([[flow]], colWidths=[usable_width])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CALLOUT_BG),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))
    return t


TABLE_ROW = re.compile(r"^\s*\|(.+)\|\s*$")
SEPARATOR = re.compile(r"^\s*\|[\s\-:|]+\|\s*$")
DIRECTIVE = re.compile(r"^\s*<!--\s*(\w+)\s*:?\s*(.*?)\s*-->\s*$")


def split_row(line):
    return [c.strip() for c in line.strip().strip("|").split("|")]


def build(out_path: Path):
    lines = SOURCE.read_text(encoding="utf-8").split("\n")
    meta, i = parse_front_matter(lines)
    s = styles()
    usable = A4[0] - 4 * cm  # 2cm margins each side

    story = []

    # ---------- cover ----------
    story.append(Spacer(1, 2.2 * cm))
    story.append(Paragraph(inline(meta.get("pretitle", "")), s["pretitle"]))
    story.append(Paragraph(inline(meta.get("title", "")), s["title"]))
    rule = Table([[""]], colWidths=[5.5 * cm], rowHeights=[0.09 * cm])
    rule.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), CYAN)]))
    story.append(rule)
    story.append(Spacer(1, 0.5 * cm))
    story.append(Paragraph(inline(meta.get("tagline", "")), s["tagline"]))
    story.append(Spacer(1, 1.6 * cm))

    info_rows = [
        [Paragraph("PREPARED FOR", s["label"]), Paragraph("PREPARED BY", s["label"])],
        [Paragraph(inline(meta.get("prepared_for", "")), s["labelval"]),
         Paragraph(inline(meta.get("prepared_by", "")), s["labelval"])],
        [Spacer(1, 0.5 * cm), Spacer(1, 0.5 * cm)],
        [Paragraph("DATE", s["label"]), Paragraph("STATUS", s["label"])],
        [Paragraph(inline(meta.get("date", "")), s["labelval"]),
         Paragraph(inline(meta.get("status", "")), s["labelval"])],
    ]
    info = Table(info_rows, colWidths=[usable / 2, usable / 2])
    info.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("LINEABOVE", (0, 0), (-1, 0), 0.5, HAIRLINE),
        ("TOPPADDING", (0, 0), (-1, 0), 8),
    ]))
    story.append(info)
    story.append(Spacer(1, 4.2 * cm))
    story.append(Paragraph(inline(meta.get("disclaimer", "")), s["note"]))
    story.append(PageBreak())

    # ---------- body ----------
    pending_colwidths = None
    n = len(lines)
    while i < n:
        line = lines[i]
        stripped = line.strip()

        if not stripped:
            i += 1
            continue

        d = DIRECTIVE.match(stripped)
        if d:
            name, arg = d.group(1), d.group(2)
            if name == "pagebreak":
                story.append(PageBreak())
            elif name == "colwidths":
                pending_colwidths = [float(x) for x in arg.split(",")]
            elif name == "chart":
                fname, _, caption = (p.strip() for p in arg.partition("|"))
                img_path = HERE / fname
                if img_path.exists():
                    from reportlab.lib.utils import ImageReader
                    iw, ih = ImageReader(str(img_path)).getSize()
                    w = usable
                    img = Image(str(img_path), width=w, height=w * ih / iw)
                    story.append(img)
                    if caption:
                        story.append(Paragraph(inline(caption), s["caption"]))
                else:
                    print(f"WARNING: chart not found: {img_path}")
            elif name == "statcards":
                rows = []
                j = i + 1
                while j < n and TABLE_ROW.match(lines[j]):
                    if not SEPARATOR.match(lines[j]):
                        rows.append(split_row(lines[j]))
                    j += 1
                if len(rows) >= 2:
                    story.append(Spacer(1, 0.15 * cm))
                    story.append(stat_cards(rows[:2], s, usable))
                    story.append(Spacer(1, 0.3 * cm))
                i = j - 1
            i += 1
            continue

        if stripped.startswith("### "):
            story.append(Paragraph(inline(stripped[4:]), s["h2"]))
            i += 1
            continue

        if stripped.startswith("## "):
            story.append(Paragraph(inline(stripped[3:]), s["h1"]))
            i += 1
            continue

        if TABLE_ROW.match(stripped):
            rows = []
            j = i
            while j < n and TABLE_ROW.match(lines[j]):
                if not SEPARATOR.match(lines[j]):
                    rows.append(split_row(lines[j]))
                j += 1
            ncols = max(len(r) for r in rows)
            pcts = pending_colwidths or [100.0 / ncols] * ncols
            pending_colwidths = None
            story.append(styled_table(rows, pcts, s, usable))
            story.append(Spacer(1, 0.25 * cm))
            i = j
            continue

        if stripped.startswith("> "):
            quote_lines = []
            j = i
            while j < n and lines[j].strip().startswith(">"):
                quote_lines.append(lines[j].strip().lstrip(">").strip())
                j += 1
            title = None
            if quote_lines and re.fullmatch(r"\*\*.+\*\*", quote_lines[0]):
                title = quote_lines[0].strip("*")
                quote_lines = quote_lines[1:]
            body = " ".join(q for q in quote_lines if q)
            story.append(Spacer(1, 0.15 * cm))
            story.append(callout(title, [body] if body else [], s, usable))
            story.append(Spacer(1, 0.3 * cm))
            i = j
            continue

        if stripped.startswith("- "):
            items = []
            j = i
            while j < n and lines[j].strip().startswith("- "):
                items.append(lines[j].strip()[2:])
                j += 1
            story.append(ListFlowable(
                [ListItem(Paragraph(inline(t), s["bullet"]), leftIndent=8) for t in items],
                bulletType="bullet", start="•", bulletColor=CYAN,
                leftIndent=16, bulletFontSize=10,
            ))
            story.append(Spacer(1, 0.22 * cm))
            i = j
            continue

        m_num = re.match(r"^(\d+)\.\s+(.*)$", stripped)
        if m_num:
            items = []
            j = i
            while j < n:
                m2 = re.match(r"^(\d+)\.\s+(.*)$", lines[j].strip())
                if not m2:
                    break
                items.append(m2.group(2))
                j += 1
            story.append(ListFlowable(
                [ListItem(Paragraph(inline(t), s["bullet"]), leftIndent=8) for t in items],
                bulletType="1", bulletColor=TEAL, leftIndent=16, bulletFontSize=10,
            ))
            story.append(Spacer(1, 0.22 * cm))
            i = j
            continue

        # italic-only line -> small grey note
        if re.fullmatch(r"\*[^*].*[^*]\*", stripped):
            story.append(Paragraph(inline(stripped[1:-1]), s["note"]))
            i += 1
            continue

        # default: body paragraph (merge soft-wrapped lines)
        para = [stripped]
        j = i + 1
        while j < n:
            nxt = lines[j].strip()
            if (not nxt or nxt.startswith(("#", "-", ">", "|", "<!--", "*"))
                    or re.match(r"^\d+\.\s", nxt)):
                break
            para.append(nxt)
            j += 1
        story.append(Paragraph(inline(" ".join(para)), s["body"]))
        i = j

    # ---------- header/footer decorations ----------
    header_left = meta.get("header_left", "")
    header_right = meta.get("header_right", "")
    footer_left = meta.get("footer_left", "")

    def cover_decoration(canv, doc):
        canv.saveState()
        canv.setFillColor(CYAN)
        canv.rect(0, A4[1] - 0.5 * cm, A4[0], 0.5 * cm, stroke=0, fill=1)
        canv.setFillColor(NAVY)
        canv.rect(0, 0, A4[0], 0.5 * cm, stroke=0, fill=1)
        canv.setFont(FONT_REG, 8.5)
        canv.setFillColor(GREY)
        canv.drawString(2 * cm, 0.85 * cm + 0.5 * cm, "")
        canv.restoreState()

    def page_decoration(canv, doc):
        canv.saveState()
        canv.setFont(FONT_REG, 8)
        canv.setFillColor(GREY)
        canv.drawString(2 * cm, A4[1] - 1.2 * cm, header_left)
        canv.drawRightString(A4[0] - 2 * cm, A4[1] - 1.2 * cm, header_right)
        canv.setStrokeColor(HAIRLINE)
        canv.setLineWidth(0.6)
        canv.line(2 * cm, A4[1] - 1.5 * cm, A4[0] - 2 * cm, A4[1] - 1.5 * cm)
        canv.setFont(FONT_REG, 8)
        canv.drawString(2 * cm, 1 * cm, footer_left)
        canv.drawRightString(A4[0] - 2 * cm, 1 * cm, f"Page {doc.page}")
        canv.restoreState()

    doc = SimpleDocTemplate(
        str(out_path), pagesize=A4,
        leftMargin=2 * cm, rightMargin=2 * cm,
        topMargin=2.2 * cm, bottomMargin=1.8 * cm,
        title=f"{meta.get('title', 'Partnership Proposal')} — Partnership Proposal",
        author="SwimBuddz",
    )
    doc.build(story, onFirstPage=cover_decoration, onLaterPages=page_decoration)
    print(f"Wrote {out_path}")


if __name__ == "__main__":
    out = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else DEFAULT_OUT
    build(out)
