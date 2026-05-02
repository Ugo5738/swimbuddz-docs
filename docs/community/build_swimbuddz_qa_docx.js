const fs = require("fs");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  LevelFormat,
  ExternalHyperlink,
  BorderStyle,
  PageBreak,
} = require("docx");

const ARIAL = "Arial";

const p = (text, opts = {}) =>
  new Paragraph({
    spacing: { after: 120 },
    ...opts,
    children: [new TextRun({ text, font: ARIAL, ...(opts.run || {}) })],
  });

const runs = (parts, opts = {}) =>
  new Paragraph({
    spacing: { after: 120 },
    ...opts,
    children: parts.map(
      (part) =>
        new TextRun({
          font: ARIAL,
          ...(typeof part === "string" ? { text: part } : part),
        })
    ),
  });

const bullet = (children) =>
  new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 80 },
    children: children.map((c) =>
      typeof c === "string"
        ? new TextRun({ text: c, font: ARIAL })
        : new TextRun({ font: ARIAL, ...c })
    ),
  });

const subBullet = (children) =>
  new Paragraph({
    numbering: { reference: "bullets", level: 1 },
    spacing: { after: 80 },
    children: children.map((c) =>
      typeof c === "string"
        ? new TextRun({ text: c, font: ARIAL })
        : new TextRun({ font: ARIAL, ...c })
    ),
  });

const numbered = (children) =>
  new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    spacing: { after: 80 },
    children: children.map((c) =>
      typeof c === "string"
        ? new TextRun({ text: c, font: ARIAL })
        : new TextRun({ font: ARIAL, ...c })
    ),
  });

const h1 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 160 },
    children: [new TextRun({ text, font: ARIAL, bold: true, size: 32 })],
  });

const h2 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 120 },
    children: [new TextRun({ text, font: ARIAL, bold: true, size: 26 })],
  });

const h3 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 160, after: 100 },
    children: [new TextRun({ text, font: ARIAL, bold: true, size: 22 })],
  });

const divider = () =>
  new Paragraph({
    spacing: { before: 120, after: 120 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: "BFBFBF", space: 1 },
    },
    children: [new TextRun({ text: "" })],
  });

const children = [
  // Title
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [
      new TextRun({
        text: "SwimBuddz Skincare Q&A",
        font: ARIAL,
        bold: true,
        size: 40,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [
      new TextRun({
        text: "Key Takeaways",
        font: ARIAL,
        italics: true,
        size: 26,
        color: "555555",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [
      new TextRun({
        text: "Session held January 08",
        font: ARIAL,
        size: 22,
        color: "555555",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 240 },
    children: [
      new TextRun({ text: "Recording: ", font: ARIAL, size: 22 }),
      new ExternalHyperlink({
        link: "https://fathom.video/share/jDDmCCd9JvdQsr2wSb74s1o1CJ9zX231",
        children: [
          new TextRun({
            text: "View on Fathom (50 mins)",
            font: ARIAL,
            size: 22,
            style: "Hyperlink",
            color: "1155CC",
            underline: {},
          }),
        ],
      }),
    ],
  }),

  divider(),

  // Speaker
  h2("About the Speaker"),
  runs([
    { text: "Dr. Adaeze Viola Ikebudu", bold: true },
    { text: " (MWACP, FWACP) — board-certified dermatologist and venereologist, founder of Sankora Dermatology and Aesthetic Clinic, Lagos." },
  ]),

  // Why
  h1("Why Swimming Affects Our Skin"),
  runs([
    { text: "Pool water contains irritants — " },
    { text: "chlorine, bromine, and pH imbalances", bold: true },
    { text: " — that strip the natural oils that protect the skin and disrupt the skin barrier." },
  ]),

  h3("Immediate reactions"),
  bullet(["Itching, tightness, and dry feeling right after exiting the pool."]),
  bullet(["More pronounced in people with sensitive skin."]),

  h3("Delayed / cumulative reactions"),
  bullet([
    { text: "Folliculitis", bold: true },
    { text: " — inflammation of the hair follicles, worsened by friction from tight swimwear and prolonged wetness." },
  ]),
  bullet([
    { text: "Chronic dryness", bold: true },
    { text: " from a weakened skin barrier." },
  ]),
  bullet([
    { text: "Post-inflammatory hyperpigmentation (PIH)", bold: true },
    { text: " — dark spots and darkened scars. Melanin-rich (darker) skin is more prone because melanocytes are more active." },
  ]),

  // Pre-swim
  h1("The Pre-Swim Routine"),
  runs([
    { text: "Goal: ", italics: true },
    { text: "create a barrier between your skin and the pool water.", italics: true },
  ]),
  numbered([
    { text: "Rinse with fresh water before entering the pool.", bold: true },
    { text: " Pre-soaked skin absorbs less chlorinated water." },
  ]),
  numbered([
    { text: "Apply a barrier:", bold: true },
  ]),
  subBullet([
    "Thin layer of a gentle, occlusive moisturizer (e.g. petroleum jelly), especially under swimwear, to reduce friction.",
  ]),
  subBullet([
    "Skip heavy occlusives on the face if you are acne-prone.",
  ]),
  subBullet([
    { text: "Water-resistant, broad-spectrum physical sunscreen", bold: true },
    { text: " on the body — also acts as a partial barrier." },
  ]),

  // Post-swim
  h1("The Post-Swim Routine"),
  runs([
    { text: "Rinse, Restore, Repair", bold: true },
    { text: " — perform this ritual ", italics: true },
    { text: "immediately", italics: true, bold: true },
    { text: " after exiting the pool.", italics: true },
  ]),
  numbered([
    { text: "Shower immediately ", bold: true },
    { text: "with a " },
    { text: "sulfate-free, hydrating cleanser", bold: true },
    { text: ". Avoid harsh soaps and antiseptics — sulfates are irritants too." },
  ]),
  numbered([
    { text: "Pat dry within ~3 minutes ", bold: true },
    { text: "— leave the skin slightly damp." },
  ]),
  numbered([
    { text: "Moisturize on damp skin ", bold: true },
    { text: "with a " },
    { text: "fragrance-free moisturizer", bold: true },
    { text: " containing " },
    { text: "ceramides, hyaluronic acid, or glycerin", bold: true },
    { text: " to seal in hydration." },
  ]),

  // Discoloration
  h1("On Discoloration (the “swim trunk line” effect)"),
  p(
    "Post-inflammatory hyperpigmentation (PIH) is a healing response — any inflammation, friction, or irritation triggers melanocytes to overproduce melanin. Sun exposure dramatically worsens this, especially on melanin-rich skin."
  ),
  h3("To minimize discoloration"),
  bullet([
    { text: "Sunscreen is non-negotiable.", bold: true },
    { text: " Use broad-spectrum and reapply every 2–3 hours." },
  ]),
  bullet([
    { text: "Time your swims wisely.", bold: true },
    { text: " Prefer early morning or evening; avoid 10am–4pm when the sun is strongest." },
  ]),
  bullet(["Swim in shaded pools where possible."]),
  bullet([
    { text: "Be consistent with the post-swim routine.", bold: true },
    { text: " Recovery from PIH takes time — measured in weeks, not days." },
  ]),

  // Q&A
  h1("Q&A Highlights"),

  h3("Are children more vulnerable?"),
  p(
    "Yes. Their skin barrier is still developing, making them more sensitive to irritants. They are also rougher on themselves through play, friction, and minor scrapes."
  ),

  h3("Does repeated chlorine exposure accelerate skin aging?"),
  p(
    "Yes. Chlorine combined with UV exposure (UVA, UVB, infrared) compounds wrinkles, texture loss, and pigment damage. Sunscreen is the single most important defense."
  ),

  h3("Does it affect wound healing or minor injuries?"),
  p(
    "Yes. A disrupted skin barrier worsens existing injuries and increases the risk of darkened scars."
  ),

  h3("Does shaved or waxed skin increase chlorine irritation?"),
  p(
    "Freshly shaved or waxed skin has a temporarily compromised barrier and is more reactive to chlorine. Allow time before swimming and follow the pre-swim barrier routine."
  ),

  // When to see a derm
  h1("When to See a Dermatologist"),
  p("Stop self-treating and book a visit if you have any of the following:"),
  bullet([
    { text: "A rash that is severe, painful, oozing, or producing pus", bold: true },
    { text: "." },
  ]),
  bullet([
    { text: "Signs of infection", bold: true },
    { text: ": redness, yellow crusts, or swelling." },
  ]),
  bullet([
    { text: "Fungal rashes", bold: true },
    { text: " (e.g. ringworm) — these need prescription antifungals; do not self-medicate." },
  ]),
  bullet([
    { text: "Persistent acne or folliculitis", bold: true },
    { text: " that does not respond to over-the-counter products." },
  ]),
  bullet([
    { text: "A mole or growth that is new or changing", bold: true },
    { text: " in size, color, or that becomes itchy." },
  ]),
  bullet([
    { text: "Hyperpigmentation that won’t fade", bold: true },
    { text: " despite sun protection and routine." },
  ]),
  bullet([
    { text: "No improvement after 1–2 weeks", bold: true },
    { text: " of consistent skincare." },
  ]),

  h3("Routine check-ups"),
  p(
    "Roughly every 3 months for a full body skin check is reasonable, especially for frequent swimmers. Your dermatologist will tailor the interval to your skin type during the first visit."
  ),

  divider(),

  // TL;DR
  h1("TL;DR for Swimmers"),
  runs(
    [
      { text: "Before: ", bold: true },
      { text: "Rinse with fresh water → apply moisturizer + sunscreen." },
    ]
  ),
  runs(
    [
      { text: "After: ", bold: true },
      { text: "Shower immediately with a sulfate-free cleanser → pat dry → moisturize on damp skin." },
    ]
  ),
  runs(
    [
      { text: "Always: ", bold: true },
      { text: "Sunscreen (broad-spectrum, reapplied every 2–3 hours). Avoid midday sun." },
    ]
  ),
  runs(
    [
      { text: "See a dermatologist ", bold: true },
      { text: "for anything painful, infected, persistent, or changing." },
    ]
  ),

  divider(),

  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200 },
    children: [
      new TextRun({
        text: "This session was for general education and prevention only — not a substitute for individual diagnosis or treatment.",
        font: ARIAL,
        italics: true,
        size: 20,
        color: "777777",
      }),
    ],
  }),
];

const doc = new Document({
  creator: "SwimBuddz",
  title: "SwimBuddz Skincare Q&A — Key Takeaways",
  styles: {
    default: { document: { run: { font: ARIAL, size: 24 } } },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 32, bold: true, font: ARIAL, color: "1F3864" },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 0 },
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 26, bold: true, font: ARIAL, color: "2E5599" },
        paragraph: { spacing: { before: 220, after: 120 }, outlineLevel: 1 },
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 22, bold: true, font: ARIAL, color: "333333" },
        paragraph: { spacing: { before: 160, after: 100 }, outlineLevel: 2 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "•",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
          {
            level: 1,
            format: LevelFormat.BULLET,
            text: "◦",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 1440, hanging: 360 } } },
          },
        ],
      },
      {
        reference: "numbers",
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
        ],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children,
    },
  ],
});

const outPath = "/Users/i/Documents/work/paservices/docs/swimbuddz_skincare_qa_summary.docx";
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outPath, buffer);
  console.log("Wrote " + outPath);
});
