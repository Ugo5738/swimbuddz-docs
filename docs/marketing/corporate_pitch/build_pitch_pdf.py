#!/usr/bin/env python3
"""Build the SwimBuddz Corporate Wellness pitch PDF.

Usage:
    python build_pitch_pdf.py                    # Generic version (for broad distribution)
    python build_pitch_pdf.py "Flutterwave"      # Personalized version with company name

Outputs to the same directory as this script.
"""
import sys
from pathlib import Path
from typing import Optional

from reportlab.lib import colors
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT
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


def register_fonts():
    """Register a Unicode-capable font family so the Naira (₦) glyph renders.

    Falls back to Helvetica + 'NGN' string substitution if Arial isn't found.
    """
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
                "Sans",
                normal="Sans",
                bold="Sans-Bold",
                italic="Sans-Italic",
                boldItalic="Sans-Bold",
            )
            return "Sans", "Sans-Bold", "Sans-Italic"
    return "Helvetica", "Helvetica-Bold", "Helvetica-Oblique"


FONT_REG, FONT_BOLD, FONT_ITALIC = register_fonts()

HERE = Path(__file__).resolve().parent
LOGO_PATH = (
    HERE.parent.parent.parent
    / "store"
    / "branding"
    / "duffel-bag"
    / "swimbuddz-logo-full-BLACK.png"
)

BRAND_DEEP = colors.HexColor("#0B3E6F")
BRAND_BLUE = colors.HexColor("#1E6FB8")
BRAND_AQUA = colors.HexColor("#4FB3D9")
BRAND_INK = colors.HexColor("#1A1A1A")
BRAND_GREY = colors.HexColor("#5C6770")
BRAND_BG = colors.HexColor("#F4F8FB")


def styles():
    base = getSampleStyleSheet()
    return {
        "pretitle": ParagraphStyle(
            "PreTitle",
            parent=base["Normal"],
            fontName=FONT_BOLD,
            fontSize=10,
            leading=12,
            textColor=BRAND_AQUA,
            spaceAfter=8,
        ),
        "title": ParagraphStyle(
            "BrandTitle",
            parent=base["Title"],
            fontName=FONT_BOLD,
            fontSize=34,
            leading=40,
            textColor=BRAND_DEEP,
            alignment=TA_LEFT,
            spaceAfter=10,
        ),
        "subtitle": ParagraphStyle(
            "BrandSubtitle",
            parent=base["Normal"],
            fontName=FONT_REG,
            fontSize=15,
            leading=22,
            textColor=BRAND_BLUE,
            spaceAfter=6,
        ),
        "prepared": ParagraphStyle(
            "PreparedFor",
            parent=base["Normal"],
            fontName=FONT_ITALIC,
            fontSize=12,
            leading=16,
            textColor=BRAND_GREY,
            spaceAfter=6,
        ),
        "h1": ParagraphStyle(
            "H1",
            parent=base["Heading1"],
            fontName=FONT_BOLD,
            fontSize=20,
            leading=24,
            textColor=BRAND_DEEP,
            spaceBefore=14,
            spaceAfter=10,
        ),
        "h2": ParagraphStyle(
            "H2",
            parent=base["Heading2"],
            fontName=FONT_BOLD,
            fontSize=13,
            leading=16,
            textColor=BRAND_BLUE,
            spaceBefore=12,
            spaceAfter=6,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=base["Normal"],
            fontName=FONT_REG,
            fontSize=10.5,
            leading=15,
            textColor=BRAND_INK,
            spaceAfter=8,
            alignment=TA_JUSTIFY,
        ),
        "bullet": ParagraphStyle(
            "Bullet",
            parent=base["Normal"],
            fontName=FONT_REG,
            fontSize=10.5,
            leading=15,
            textColor=BRAND_INK,
            alignment=TA_LEFT,
        ),
        "small": ParagraphStyle(
            "Small",
            parent=base["Normal"],
            fontName=FONT_REG,
            fontSize=9,
            leading=12,
            textColor=BRAND_GREY,
        ),
        "contact": ParagraphStyle(
            "Contact",
            parent=base["Normal"],
            fontName=FONT_REG,
            fontSize=10.5,
            leading=15,
            textColor=BRAND_INK,
        ),
        "cta_title": ParagraphStyle(
            "CTATitle",
            parent=base["Normal"],
            fontName=FONT_BOLD,
            fontSize=18,
            leading=22,
            textColor=colors.white,
            spaceAfter=4,
        ),
        "cta_body": ParagraphStyle(
            "CTABody",
            parent=base["Normal"],
            fontName=FONT_REG,
            fontSize=10.5,
            leading=15,
            textColor=colors.white,
            spaceAfter=10,
        ),
        "cta_contact": ParagraphStyle(
            "CTAContact",
            parent=base["Normal"],
            fontName=FONT_BOLD,
            fontSize=10.5,
            leading=16,
            textColor=colors.white,
            spaceAfter=2,
        ),
    }


def bullet_list(items, body_style):
    list_items = [ListItem(Paragraph(t, body_style), leftIndent=8) for t in items]
    return ListFlowable(
        list_items,
        bulletType="bullet",
        start="•",
        bulletColor=BRAND_AQUA,
        leftIndent=18,
        bulletFontSize=11,
    )


def cover_decoration(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(BRAND_AQUA)
    canvas.rect(0, A4[1] - 0.6 * cm, A4[0], 0.6 * cm, stroke=0, fill=1)
    canvas.setFillColor(BRAND_DEEP)
    canvas.rect(0, 0, A4[0], 0.6 * cm, stroke=0, fill=1)
    canvas.restoreState()


def page_decoration(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(BRAND_AQUA)
    canvas.rect(0, A4[1] - 0.3 * cm, A4[0], 0.3 * cm, stroke=0, fill=1)
    canvas.setFont(FONT_REG, 8.5)
    canvas.setFillColor(BRAND_GREY)
    canvas.drawString(2 * cm, 1 * cm, "SwimBuddz · Corporate Wellness")
    canvas.drawRightString(A4[0] - 2 * cm, 1 * cm, f"Page {doc.page}")
    canvas.restoreState()


def build(output_path: Path, company: Optional[str] = None):
    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
        title="SwimBuddz Corporate Wellness",
        author="SwimBuddz",
        subject="Corporate Wellness Pitch",
    )
    s = styles()
    story = []

    # ============ COVER ============
    if LOGO_PATH.exists():
        logo = Image(str(LOGO_PATH), width=4.5 * cm, height=2.83 * cm)
        logo.hAlign = "LEFT"
        story.append(Spacer(1, 1 * cm))
        story.append(logo)
        story.append(Spacer(1, 1.2 * cm))
    else:
        story.append(Spacer(1, 3 * cm))

    story.append(Paragraph("CORPORATE WELLNESS · LAGOS", s["pretitle"]))
    story.append(Paragraph("The wellness benefit<br/>your team will actually finish.", s["title"]))
    story.append(
        Paragraph(
            "A 12-week structured adult swim program for Lagos employers.",
            s["subtitle"],
        )
    )

    if company:
        story.append(Spacer(1, 0.4 * cm))
        story.append(Paragraph(f"Prepared for {company}", s["prepared"]))

    story.append(Spacer(1, 0.5 * cm))
    line = Table([[""]], colWidths=[6 * cm], rowHeights=[0.08 * cm])
    line.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), BRAND_AQUA)]))
    story.append(line)
    story.append(Spacer(1, 0.6 * cm))

    cover_para = (
        "Most adults in Lagos never learned to swim, or learned badly as kids "
        "and gave up. SwimBuddz turns that quiet anxiety into a structured, "
        "photogenic, lifelong skill — delivered as a wellness benefit your "
        "employees will actually use, finish, and remember."
    )
    story.append(Paragraph(cover_para, s["body"]))

    story.append(Spacer(1, 4.5 * cm))

    contact_rows = [
        [Paragraph("<b>Get in touch</b>", s["contact"]), ""],
        [Paragraph("Email", s["small"]), Paragraph("swimbuddz@gmail.com", s["contact"])],
        [
            Paragraph("WhatsApp / Call", s["small"]),
            Paragraph("+234 703 358 8400", s["contact"]),
        ],
        [
            Paragraph("Instagram", s["small"]),
            Paragraph("instagram.com/swimbuddz", s["contact"]),
        ],
        [
            Paragraph("TikTok", s["small"]),
            Paragraph("tiktok.com/swimbuddzglobe", s["contact"]),
        ],
    ]
    contact_table = Table(contact_rows, colWidths=[4 * cm, 9 * cm])
    contact_table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("LINEABOVE", (0, 1), (-1, 1), 0.5, BRAND_AQUA),
            ]
        )
    )
    story.append(contact_table)

    story.append(PageBreak())

    # ============ PAGE 2 ============
    story.append(Paragraph("The wellness budget you don't waste", s["h1"]))
    story.append(
        Paragraph(
            "Your professionals work 50+ hours a week. Sedentary, screen-heavy, stressed. "
            "Wellness budgets get spent on gym memberships nobody uses past March, mental "
            "health apps that go unopened, and team yoga classes attended by the same five people.",
            s["body"],
        )
    )
    story.append(
        Paragraph(
            "Adults across Lagos share one quiet anxiety: <b>most of them never learned to swim</b>. "
            "Some are afraid of water. Some learned badly as kids and gave up. Most have never been "
            "given a structured way to fix it as adults.",
            s["body"],
        )
    )
    story.append(
        Paragraph(
            "The <b>SwimBuddz 12-Week Adult Swim Program</b> is an alternative wellness benefit "
            "that gets used, finished, and remembered.",
            s["body"],
        )
    )

    story.append(Paragraph("What employees get", s["h2"]))
    story.append(
        bullet_list(
            [
                "12-week structured swim cohort, beginner-friendly",
                "Saturday mornings, 90-minute sessions, Lagos partner pool",
                "Trauma-informed coaching — designed for adults who never learned",
                "Distance-based milestones, structured curriculum, community of peers",
                "WhatsApp group, milestone certificates, post-program access to SwimBuddz Club",
                "A skill that lasts a lifetime — and doesn't require daily discipline",
            ],
            s["bullet"],
        )
    )

    story.append(Paragraph("Why swimming, specifically", s["h2"]))
    story.append(
        bullet_list(
            [
                "<b>Zero impact</b> — lower injury rate than gym, accessible to all body types",
                "<b>Real recovery</b> — water is regulating; cortisol drops measurably during swim",
                "<b>Lifelong skill</b> — once learned, never forgotten",
                "<b>Community-driven</b> — group format builds bonds your team retreats can't",
                "<b>Photogenic outcomes</b> — your CSR / employer brand team will thank you",
            ],
            s["bullet"],
        )
    )

    story.append(PageBreak())

    # ============ PAGE 3: BEYOND THE OFFICE ============
    story.append(Paragraph("More than a wellness benefit", s["h1"]))
    story.append(
        Paragraph(
            "Most wellness perks expire at the office door. Once an employee learns to swim, "
            "the skill ripples outward — into their family, their weekends, and the next thirty "
            "years of their life.",
            s["body"],
        )
    )

    story.append(Paragraph("At work", s["h2"]))
    story.append(
        bullet_list(
            [
                "<b>Stress regulation that lasts beyond Saturday</b> — water is uniquely down-regulating; calmer baselines carry into the weekday",
                "<b>Cohesion across departments</b> — cohort friendships outlast team retreats and build informal cross-team networks",
                "<b>Internal storytelling that earns its keep</b> — completion rates, before/after testimonials, and photo content HR can actually use",
                "<b>Sleep, energy, and presence</b> — regular swimmers report better sleep and steadier energy through the week",
            ],
            s["bullet"],
        )
    )

    story.append(Paragraph("At home", s["h2"]))
    story.append(
        bullet_list(
            [
                "<b>Employees teach their kids</b> — one trained adult raises a generation that swims",
                "<b>Real water safety</b> — in a city surrounded by water, household risk drops when adults can swim and teach their children",
                "<b>Shared family activity</b> — partners and parents who swim together; weekends that don't revolve around screens",
                "<b>A quiet anxiety, finally resolved</b> — the embarrassment most adults carry about not swimming gets put down for good",
            ],
            s["bullet"],
        )
    )

    story.append(Paragraph("For life", s["h2"]))
    story.append(
        bullet_list(
            [
                "<b>Vacation confidence</b> — beaches, hotel pools, and boat rides become destinations, not stressors",
                "<b>Mental health regulation</b> — repetitive, low-impact, sensory-rich; one of the most sustainable stress outlets adults find",
                "<b>Exercise that ages with you</b> — joints intact past 60, unlike high-impact alternatives",
                "<b>A hobby that grows</b> — open water, masters meets, coaching others — long after the 12 weeks end",
            ],
            s["bullet"],
        )
    )

    story.append(PageBreak())

    # ============ PAGE 4: PRICING + PILOT ============
    story.append(Paragraph("Pricing", s["h1"]))

    pricing = [
        ["Employees enrolled", "Per-employee cost", "Total"],
        ["1 – 4", "₦150,000 (full price)", "—"],
        ["5 – 9 (recommended)", "₦135,000 (10% off)", "₦675k – ₦1.215M"],
        ["10+", "₦127,500 (15% off)", "₦1.275M+"],
    ]
    pricing_table = Table(pricing, colWidths=[5.5 * cm, 5.5 * cm, 5 * cm])
    pricing_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), BRAND_DEEP),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), FONT_BOLD),
                ("FONTSIZE", (0, 0), (-1, 0), 10.5),
                ("ALIGN", (0, 0), (-1, 0), "LEFT"),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 9),
                ("TOPPADDING", (0, 0), (-1, 0), 9),
                ("FONTNAME", (0, 1), (-1, -1), FONT_REG),
                ("FONTSIZE", (0, 1), (-1, -1), 10.5),
                ("TEXTCOLOR", (0, 1), (-1, -1), BRAND_INK),
                ("ALIGN", (0, 1), (-1, -1), "LEFT"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, BRAND_BG]),
                ("BOTTOMPADDING", (0, 1), (-1, -1), 8),
                ("TOPPADDING", (0, 1), (-1, -1), 8),
                ("BACKGROUND", (0, 2), (-1, 2), BRAND_AQUA),
                ("FONTNAME", (0, 2), (-1, 2), FONT_BOLD),
                ("LINEBELOW", (0, -1), (-1, -1), 0.4, BRAND_GREY),
            ]
        )
    )
    story.append(pricing_table)
    story.append(
        Paragraph(
            "Pricing includes coaching, curriculum, onboarding, HR reporting, and pool access at a confirmed standard partner pool. Premium, island, private, or exclusive-use venues are quoted separately.",
            s["small"],
        )
    )

    story.append(Paragraph("Optional add-ons", s["h2"]))
    story.append(
        bullet_list(
            [
                '<b>Company-sponsored "Intro to Water" pilot</b> — 2-hour beginner-friendly water-confidence session, priced by headcount/location',
                "Starter swim kits and branded merchandise (caps, goggles, swimwear, towels), quoted separately",
                "Quarterly SwimBuddz Wrapped report for HR (attendance, milestones, employee testimonials)",
            ],
            s["bullet"],
        )
    )

    story.append(Paragraph("Pilot offer (limited)", s["h1"]))
    story.append(
        Paragraph(
            "The first 5 corporate partners get the pilot package:",
            s["body"],
        )
    )
    story.append(
        bullet_list(
            [
                "No setup or admin fees",
                "Preferred pricing on the first company-sponsored Intro to Water pilot",
                "Outcome report shared with HR at week 6 and week 12",
                "Optional employer co-branding on graduation certificates",
            ],
            s["bullet"],
        )
    )

    story.append(PageBreak())

    # ============ PAGE 5: LOGISTICS + OUTCOMES + CTA ============
    story.append(Paragraph("Logistics", s["h1"]))
    story.append(
        bullet_list(
            [
                "<b>Cohort schedule</b> — new cohorts start every 8 – 12 weeks",
                "<b>Location</b> — Lagos partner pools (Ikoyi, VI, Yaba, Festac — confirmed per cohort)",
                "<b>Time commitment</b> — 90 – 120 mins per week, Saturday mornings",
                "<b>Onboarding</b> — each employee gets a SwimBuddz account, individual progress tracking, and access to the broader SwimBuddz community",
                "<b>Privacy</b> — health-relevant data (skill level, fears, conditions) stays with the coach. Never shared with the employer.",
            ],
            s["bullet"],
        )
    )

    story.append(Paragraph("Outcomes you can measure", s["h1"]))
    story.append(
        bullet_list(
            [
                "Attendance rate per cohort (target: &gt;85%)",
                "Completion rate (target: &gt;75% reach 50m freestyle)",
                "Self-reported wellness improvement (pre/post survey)",
                "Net Promoter Score from employees",
                "Photo / video assets for internal comms and CSR reporting",
            ],
            s["bullet"],
        )
    )

    story.append(Spacer(1, 0.5 * cm))

    cta_rows = [
        [Paragraph("Get started", s["cta_title"])],
        [
            Paragraph(
                "Reply to schedule a 20-minute intro call. We'll walk through the curriculum, "
                "answer questions, and confirm whether SwimBuddz is the right fit for your team.",
                s["cta_body"],
            )
        ],
        [Paragraph("Email &nbsp;&nbsp;&nbsp;swimbuddz@gmail.com", s["cta_contact"])],
        [
            Paragraph(
                "WhatsApp / Call &nbsp;&nbsp;&nbsp;+234 703 358 8400",
                s["cta_contact"],
            )
        ],
        [
            Paragraph(
                "Instagram &nbsp;&nbsp;&nbsp;instagram.com/swimbuddz",
                s["cta_contact"],
            )
        ],
        [
            Paragraph(
                "TikTok &nbsp;&nbsp;&nbsp;tiktok.com/swimbuddzglobe",
                s["cta_contact"],
            )
        ],
    ]
    cta_table = Table(cta_rows, colWidths=[17 * cm])
    cta_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), BRAND_DEEP),
                ("LEFTPADDING", (0, 0), (-1, -1), 18),
                ("RIGHTPADDING", (0, 0), (-1, -1), 18),
                ("TOPPADDING", (0, 0), (0, 0), 18),
                ("BOTTOMPADDING", (0, -1), (-1, -1), 18),
                ("TOPPADDING", (0, 1), (-1, -1), 2),
                ("BOTTOMPADDING", (0, 0), (-1, -2), 2),
            ]
        )
    )
    story.append(cta_table)

    doc.build(story, onFirstPage=cover_decoration, onLaterPages=page_decoration)


def main():
    company = sys.argv[1] if len(sys.argv) > 1 else None
    if company:
        safe = "".join(c for c in company if c.isalnum() or c in " _-").strip().replace(" ", "_")
        out = HERE / f"SwimBuddz_Corporate_Wellness_Pitch_{safe}.pdf"
    else:
        out = HERE / "SwimBuddz_Corporate_Wellness_Pitch.pdf"
    build(out, company)
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()
