import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "/Users/i/Documents/work/swimbuddz/outputs/july_2026_revenue_sprint_restrategy/daniel_july_12_31_2026_revenue_restrategy.xlsx";
const outputPath = "/Users/i/Documents/work/swimbuddz/outputs/july_2026_revenue_sprint_restrategy/daniel_july_14_31_2026_revenue_research_system.xlsx";
const previewDir = "/private/tmp/codex-revenue-v3/workbook-previews";

const COLORS = {
  navy: "#0F172A",
  teal: "#0F766E",
  blue: "#0E7490",
  cyan: "#D9EEF7",
  paleBlue: "#EAF4F8",
  paleYellow: "#FFF4CC",
  paleGreen: "#DCFCE7",
  paleRed: "#FEE2E2",
  paleOrange: "#FFEDD5",
  orange: "#C2410C",
  gray: "#F1F5F9",
  midGray: "#CBD5E1",
  muted: "#475569",
  white: "#FFFFFF",
  black: "#111827",
};

const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);

function setTitle(sheet, title, subtitle, lastCol) {
  sheet.getRange(`A1:${lastCol}1`).merge();
  sheet.getRange("A1").values = [[title]];
  sheet.getRange(`A2:${lastCol}2`).merge();
  sheet.getRange("A2").values = [[subtitle]];
  sheet.getRange(`A1:${lastCol}1`).format = {
    fill: COLORS.navy,
    font: { bold: true, color: COLORS.white, size: 18 },
    verticalAlignment: "center",
  };
  sheet.getRange(`A2:${lastCol}2`).format = {
    fill: COLORS.gray,
    font: { italic: true, color: COLORS.muted, size: 10 },
    wrapText: true,
    verticalAlignment: "center",
  };
  sheet.getRange("1:1").format.rowHeightPx = 34;
  sheet.getRange("2:2").format.rowHeightPx = 32;
  sheet.showGridLines = false;
}

function setHeader(range, fill = COLORS.blue) {
  range.format = {
    fill,
    font: { bold: true, color: COLORS.white, size: 10 },
    wrapText: true,
    verticalAlignment: "center",
    borders: { preset: "all", style: "thin", color: COLORS.midGray },
  };
  range.format.rowHeightPx = 40;
}

function setBody(range) {
  range.format = {
    font: { color: COLORS.black, size: 10 },
    wrapText: true,
    verticalAlignment: "center",
    borders: {
      insideHorizontal: { style: "thin", color: "#E2E8F0" },
      insideVertical: { style: "thin", color: "#E2E8F0" },
      bottom: { style: "thin", color: "#E2E8F0" },
    },
  };
}

function sectionLabel(sheet, cellRange, text, fill = COLORS.teal) {
  sheet.getRange(cellRange).merge();
  const anchor = cellRange.split(":")[0];
  sheet.getRange(anchor).values = [[text]];
  sheet.getRange(cellRange).format = {
    fill,
    font: { bold: true, color: COLORS.white, size: 11 },
    verticalAlignment: "center",
  };
  sheet.getRange(cellRange).format.rowHeightPx = 26;
}

function setColumnWidths(sheet, widths) {
  for (const [column, widthPx] of Object.entries(widths)) {
    sheet.getRange(`${column}:${column}`).format.columnWidthPx = widthPx;
  }
}

function applyScoreValidation(sheet, ranges) {
  for (const range of ranges) {
    sheet.getRange(range).dataValidation = {
      rule: { type: "list", values: [0, 1, 2] },
    };
  }
}

// Update the current workbook's navigation and clarify the urgent cash floor.
const dashboard = workbook.worksheets.getItem("Dashboard");
dashboard.getRange("A2").values = [[
  "Urgent floor: collect $1,500; target: $2,000 by July 31. Direct cash conversations come first; platforms and the swim niche run as controlled parallel tests.",
]];
dashboard.getRange("A30:E30").merge();
dashboard.getRange("A30").values = [["Where To Work In This Workbook"]];
dashboard.getRange("A30:E30").format = {
  fill: COLORS.navy,
  font: { bold: true, color: COLORS.white, size: 12 },
};
dashboard.getRange("A31:E36").values = [
  ["Need", "Use Sheet", "What You Produce", "Time Limit", "Rule"],
  ["Understand today's priority", "Start Here", "One clear next action", "5 minutes", "Start here each morning."],
  ["Qualify a swim/sports company", "Swim Research", "Score, decision maker, pain hypothesis, next action", "15-20 minutes", "Do not message unqualified companies."],
  ["Identify website friction", "Friction Library", "Friction IDs and evidence", "During review", "Record only what you can observe; label assumptions."],
  ["Understand and sell the $400 audit", "Lead Audit", "Paid diagnostic scope and closing script", "Before calls", "One free observation only; the full audit is paid."],
  ["Allocate time for urgent cash", "Cash Now Plan", "Daily output targets and stop rules", "Daily", "Do not treat every channel equally."],
];
setHeader(dashboard.getRange("A31:E31"), COLORS.blue);
setBody(dashboard.getRange("A32:E36"));
dashboard.getRange("A32:E36").format.fill = COLORS.white;

const starter = workbook.worksheets.getItem("Starter Prospects");
starter.getRange("A2").values = [[
  "This is a seed list, not a ready-to-message list. Qualify swim/sports rows in the Swim Research sheet before outreach; target a reachable local owner/operator, not only brand HQ.",
]];

const swimSeedRows = starter.getRange("A15:L29").values;

// Start Here
const start = workbook.worksheets.add("Start Here");
setTitle(
  start,
  "Start Here: $1,500-$2,000 Immediate Cash System",
  "Use this sheet every morning. The workbook supports execution; it does not replace daily conversations, follow-ups, calls, and paid asks.",
  "F",
);

sectionLabel(start, "A4:F4", "1. Cash Rule");
start.getRange("A5:F8").values = [
  ["Urgent floor", 1500, "Target", 2000, "Deadline", new Date("2026-07-31T12:00:00")],
  ["Primary path", "Warm-network tech/ops work", "Secondary", "Agency/operator work", "Controlled test", "Swim/sports paid audit"],
  ["Fast offers", "$400 paid audit", "Main offer", "$1,500-$2,500 sprint", "Platform rule", "Apply truthfully; never spoof location."],
  ["Decision rule", "A conversation, call, proposal, deposit, or useful rejection is progress. Research without outreach is preparation, not progress.", null, null, null, null],
];
start.getRange("A5:F8").format = { wrapText: true, verticalAlignment: "center" };
start.getRange("A5:F8").format.borders = { preset: "all", style: "thin", color: COLORS.midGray };
start.getRange("B5").format.numberFormat = '"$"#,##0';
start.getRange("D5").format.numberFormat = '"$"#,##0';
start.getRange("F5").format.numberFormat = "yyyy-mm-dd";
start.getRange("B5:F8").format.fill = COLORS.paleYellow;
start.getRange("A5:A8").format.font = { bold: true, color: COLORS.black };

sectionLabel(start, "A10:F10", "2. Swim/Sports Conversion Path");
start.getRange("A11:F17").values = [
  ["Step", "Your Goal", "Workbook Sheet", "Required Output", "Exit Condition", "Do Not Do"],
  [1, "Choose a real operating unit", "Swim Research", "Specific location, franchise, or company", "Commercial operation found", "Do not target a logo without a buyer."],
  [2, "Review the customer journey", "Swim Research + Friction Library", "Observed friction IDs and evidence", "One credible hypothesis", "Do not submit registration, waivers, payment, or personal data."],
  [3, "Find the buyer", "Swim Research", "Named owner/operator and contact route", "Reachability score at least 1", "Do not rely only on info@ email."],
  [4, "Qualify", "Swim Research", "Score and automatic decision", "CONTACT NOW or RESEARCH MORE", "Do not message rows marked REPLACE."],
  [5, "Start a conversation", "Lead Audit", "Permission to share one observation", "Reply or useful rejection", "Do not send a full free audit."],
  [6, "Sell the diagnostic", "Lead Audit", "$400 paid audit", "Payment received", "Do not begin the full audit before payment."],
];
setHeader(start.getRange("A11:F11"), COLORS.blue);
setBody(start.getRange("A12:F17"));

sectionLabel(start, "A19:F19", "3. Qualification Score");
start.getRange("A20:F24").values = [
  ["Criterion", "0", "1", "2", "Workbook Field", "Purpose"],
  ["Decision maker reachability", "No person or route", "Role or generic route", "Named buyer + direct route", "Reachability", "Can you reach the person who can approve $400?"],
  ["Operational volume", "Solo/volunteer/tiny", "Small commercial operation", "Several instructors/classes/locations", "Volume", "Is the workflow repeated enough to matter?"],
  ["Budget evidence", "No commercial evidence", "Commercial but uncertain", "Scale/pricing suggests ability to pay", "Budget", "Could the buyer reasonably fund the audit?"],
  ["Pain + relevance", "Generic guess", "Plausible hypothesis", "Clear evidence + unique reason", "Pain Evidence + Relevance", "Is your message grounded and specific?"],
];
setHeader(start.getRange("A20:F20"), COLORS.blue);
setBody(start.getRange("A21:F24"));

sectionLabel(start, "A26:F26", "4. Score Decision");
start.getRange("A27:F30").values = [
  ["Score", "Decision", "Meaning", "Next Action", "Time", "Notes"],
  ["8-10", "CONTACT NOW", "Qualified and specific", "Send personalized opener today", "Same day", "Must also have reachability and pain evidence."],
  ["6-7", "RESEARCH MORE", "Promising but incomplete", "Find buyer or stronger evidence", "10 more minutes", "Do not endlessly research."],
  ["0-5", "REPLACE", "Weak July prospect", "Replace with smaller/reachable operator", "Immediately", "The seed list is disposable."],
];
setHeader(start.getRange("A27:F27"), COLORS.orange);
setBody(start.getRange("A28:F30"));

setColumnWidths(start, { A: 165, B: 220, C: 170, D: 235, E: 155, F: 235 });
start.freezePanes.freezeRows(2);

// Swim Research
const research = workbook.worksheets.add("Swim Research");
setTitle(
  research,
  "Swim/Sports Prospect Research & Qualification",
  "Review only: follow the public customer journey, but do not submit registration, personal data, a waiver, or payment. Stop before any final submission.",
  "AI",
);

const researchHeaders = [
  "Prospect",
  "Segment",
  "Market",
  "Target Location / Unit",
  "Website",
  "Review Status",
  "Decision Maker",
  "Role",
  "Contact / LinkedIn",
  "Reachability (0-2)",
  "Volume Evidence",
  "Volume (0-2)",
  "Budget Evidence",
  "Budget (0-2)",
  "CTA / Offer Clarity (0-2)",
  "Pricing / Availability (0-2)",
  "Inquiry Form (0-2)",
  "Assessment / Trial (0-2)",
  "Level / Location Match (0-2)",
  "Registration / Payment (0-2)",
  "Confirmation / Follow-up (0-2)",
  "Waitlist / Reschedule (0-2)",
  "Friction Total",
  "Pain Evidence (0-2)",
  "Top Friction ID(s)",
  "Specific Pain Hypothesis",
  "Personalized Reason",
  "Relevance (0-2)",
  "Qualification Score",
  "Decision",
  "Next Action",
  "Stage",
  "Last Touch",
  "Follow-up Date",
  "Notes",
];
research.getRange("A4:AI4").values = [researchHeaders];
setHeader(research.getRange("A4:AI4"), COLORS.blue);

const researchRows = swimSeedRows.map((row) => [
  row[3],
  row[1],
  row[2],
  null,
  row[5],
  "Not Started",
  row[4],
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  "Choose a specific location/unit, review the journey, and identify a buyer.",
  "Not Contacted",
  null,
  null,
  `Starter hypothesis only: ${row[6]} Verify before using it in outreach.`,
]);
research.getRange(`A5:AI${4 + researchRows.length}`).values = researchRows;

for (let row = 5; row <= 54; row += 1) {
  research.getRange(`W${row}`).formulas = [[`=IF(A${row}="","",SUM(O${row}:V${row}))`]];
  research.getRange(`X${row}`).formulas = [[`=IF(A${row}="","",IF(W${row}>=8,2,IF(W${row}>=3,1,0)))`]];
  research.getRange(`AC${row}`).formulas = [[`=IF(A${row}="","",SUM(J${row},L${row},N${row},X${row},AB${row}))`]];
  research.getRange(`AD${row}`).formulas = [[
    `=IF(A${row}="","",IF(F${row}<>"Reviewed","REVIEW",IF(AND(AC${row}>=8,J${row}>=1,X${row}>=1),"CONTACT NOW",IF(AC${row}>=6,"RESEARCH MORE","REPLACE"))))`,
  ]];
}

setBody(research.getRange("A5:AI54"));
research.getRange("D5:V54").format.fill = COLORS.paleYellow;
research.getRange("Y5:AB54").format.fill = COLORS.paleYellow;
research.getRange("AE5:AI54").format.fill = COLORS.paleYellow;
research.getRange("W5:X54").format.fill = COLORS.paleBlue;
research.getRange("AC5:AD54").format.fill = COLORS.cyan;
research.getRange("J5:J54").format.horizontalAlignment = "center";
research.getRange("L5:L54").format.horizontalAlignment = "center";
research.getRange("N5:X54").format.horizontalAlignment = "center";
research.getRange("AB5:AD54").format.horizontalAlignment = "center";
research.getRange("AG5:AH54").format.numberFormat = "yyyy-mm-dd";
research.getRange("F5:F54").dataValidation = {
  rule: { type: "list", values: ["Not Started", "In Review", "Reviewed"] },
};
research.getRange("AF5:AF54").dataValidation = {
  rule: { type: "list", values: ["Not Contacted", "Qualified", "Messaged", "Replied", "Call Booked", "Call Held", "Audit Offered", "Audit Paid", "Proposal Sent", "Won", "Lost"] },
};
applyScoreValidation(research, ["J5:J54", "L5:L54", "N5:V54", "AB5:AB54"]);
research.getRange("AD5:AD54").conditionalFormats.add("containsText", {
  text: "CONTACT NOW",
  format: { fill: COLORS.paleGreen, font: { bold: true, color: "#166534" } },
});
research.getRange("AD5:AD54").conditionalFormats.add("containsText", {
  text: "RESEARCH MORE",
  format: { fill: COLORS.paleOrange, font: { bold: true, color: "#9A3412" } },
});
research.getRange("AD5:AD54").conditionalFormats.add("containsText", {
  text: "REPLACE",
  format: { fill: COLORS.paleRed, font: { bold: true, color: "#991B1B" } },
});
research.freezePanes.freezeRows(4);
research.freezePanes.freezeColumns(5);
setColumnWidths(research, {
  A: 190, B: 130, C: 85, D: 180, E: 210, F: 100, G: 150, H: 125, I: 210,
  J: 90, K: 210, L: 80, M: 210, N: 80, O: 92, P: 100, Q: 90, R: 92, S: 100,
  T: 105, U: 105, V: 100, W: 85, X: 90, Y: 110, Z: 260, AA: 240, AB: 85,
  AC: 95, AD: 120, AE: 230, AF: 110, AG: 100, AH: 105, AI: 260,
});

// Friction Library
const friction = workbook.worksheets.add("Friction Library");
setTitle(
  friction,
  "Lead-to-Enrollment Friction Library",
  "Score 0 = no issue observed, 1 = possible/uncertain friction, 2 = clear observable friction. Phrase unverified conclusions as hypotheses.",
  "I",
);
const frictionHeaders = ["ID", "Journey Stage", "Friction", "What To Inspect", "Evidence To Record", "Likely Consequence", "When Score = 2", "Safe Language", "Possible Fix Direction"];
friction.getRange("A4:I4").values = [frictionHeaders];
setHeader(friction.getRange("A4:I4"), COLORS.blue);
const frictionRows = [
  ["F01", "Discovery", "Unclear main call to action", "Can a parent immediately see how to start?", "CTA text, placement, competing buttons", "Visitors hesitate or choose the wrong path", "No obvious assessment/trial/enrollment CTA", "I could not identify a single clear first step.", "Clarify one primary CTA by visitor intent."],
  ["F02", "Decision", "Pricing is hidden or hard to interpret", "Can the buyer estimate cost before inquiry?", "Pricing page, ranges, fees, required call", "Low-intent inquiries and avoidable staff questions", "No price/range and no reason for withholding it", "Pricing may require staff explanation before a buyer can proceed.", "Show starting price, range, or qualification logic."],
  ["F03", "Decision", "Availability is not visible", "Can the customer see suitable slots/classes?", "Class timetable, capacity, location availability", "More inquiries require manual checking", "Customer must call/email to discover any availability", "Availability appears to require a manual check.", "Expose eligible classes or a guided availability request."],
  ["F04", "Inquiry", "Generic inquiry form", "Does the form collect intent, swimmer age/level, location and timing?", "Fields, routing questions, confirmation", "Staff must re-contact and re-qualify every lead", "Form captures only name/email/message", "The current form may leave the team to re-qualify each inquiry manually.", "Use intent-based fields and routing."],
  ["F05", "Assessment", "Assessment/trial booking is separate or manual", "Can a customer book a time immediately?", "Calendar, request form, phone/email handoff", "Delay and drop-off before assessment", "Request is submitted but no slot can be chosen", "There may be a manual handoff between inquiry and assessment booking.", "Add rules-based scheduling and confirmations."],
  ["F06", "Placement", "Level placement is unclear", "Can customers understand level criteria and next step?", "Level descriptions, quiz, assessment requirement", "Wrong class requests and staff clarification", "No way to narrow level without a staff conversation", "Level selection may depend heavily on staff clarification.", "Add level finder or structured assessment path."],
  ["F07", "Placement", "Location routing is unclear", "Can customers select the correct location and see its offerings?", "Location finder, distance, program differences", "Leads reach the wrong team or abandon", "Locations have inconsistent or unclear paths", "The location handoff may create extra routing work.", "Route by postcode/location and program availability."],
  ["F08", "Registration", "Repeated data entry or multiple portals", "Does the user re-enter details across inquiry, registration and waiver?", "Portal changes, duplicate fields, separate logins", "Longer completion time and errors", "Same details are requested in separate systems", "The journey appears to repeat information across steps.", "Carry data forward or integrate systems."],
  ["F09", "Registration", "Waiver is a separate handoff", "Is the waiver embedded in registration?", "Email link, PDF, separate portal", "Incomplete registrations and staff chasing", "Registration can proceed while waiver remains separate", "Waiver completion may require separate follow-up.", "Embed e-signature and status tracking."],
  ["F10", "Payment", "Payment is delayed or separate", "Can the customer complete payment in the same flow?", "Invoice later, phone payment, separate checkout", "Reserved slots without payment and manual reconciliation", "Payment requires a later staff action or different system", "Payment may be a separate operational handoff.", "Integrate checkout, deposits and payment status."],
  ["F11", "Confirmation", "No immediate clear confirmation", "Does the customer know the request succeeded?", "Confirmation page/email, reference number", "Duplicate inquiries and uncertainty", "No explicit success message or next-step timing", "The post-submit confirmation may not set a clear expectation.", "Immediate confirmation with owner and timing."],
  ["F12", "Follow-up", "Next steps and response time are unclear", "Does the site state what happens and when?", "Response SLA, assessment instructions, owner", "Customers wait without knowing when to act", "No timeline or responsible team is shown", "The customer may not know what happens after submitting.", "State SLA and automate status updates."],
  ["F13", "Waitlist", "Waitlist status is manual", "Can customers join, update or leave a waitlist?", "Waitlist form, status page, notifications", "Staff chasing and stale lists", "Waitlist has no visible status or update mechanism", "Waitlist communication may depend on manual follow-up.", "Automated waitlist status and slot offers."],
  ["F14", "Scheduling", "Rescheduling/cancellation depends on calls or email", "Can customers self-serve within policy?", "Portal controls, phone-only instructions", "High support workload and missed slots", "No self-service path for common changes", "Routine schedule changes may require staff intervention.", "Policy-aware self-service rescheduling."],
  ["F15", "Matching", "Instructor matching is manual", "For private lessons, how are location, skill and availability matched?", "Questionnaire, matching promise, response delay", "Slow fulfillment and coordination overhead", "No guided matching or immediate next step", "Instructor matching may require several manual coordination steps.", "Rules-based matching with human approval."],
  ["F16", "Mobile", "Mobile journey is difficult", "Repeat the journey on a narrow screen", "Clipped controls, long forms, hard-to-tap CTAs", "Higher abandonment on phones", "Critical step is unusable or confusing on mobile", "The mobile path may add avoidable completion friction.", "Responsive form and shorter mobile steps."],
  ["F17", "Operations", "Multi-location experience is inconsistent", "Compare two locations or programs", "Different CTAs, tools, forms, policies", "Uneven conversion and fragmented reporting", "Locations use materially different lead paths", "Different locations appear to use inconsistent enrollment steps.", "Standardize core flow with local configuration."],
  ["F18", "Recovery", "No visible abandoned-inquiry recovery", "Ask during discovery; do not claim from website alone", "CRM reminders, email/SMS sequences, owner", "Interested leads are forgotten", "Buyer confirms there is no systematic follow-up", "I could not verify how incomplete inquiries are recovered.", "CRM stages, reminders and limited follow-up sequence."],
];
friction.getRange(`A5:I${4 + frictionRows.length}`).values = frictionRows;
setBody(friction.getRange(`A5:I${4 + frictionRows.length}`));
friction.getRange(`A5:A${4 + frictionRows.length}`).format = {
  fill: COLORS.cyan,
  font: { bold: true, color: COLORS.black },
  horizontalAlignment: "center",
  verticalAlignment: "center",
};
friction.freezePanes.freezeRows(4);
setColumnWidths(friction, { A: 60, B: 105, C: 180, D: 240, E: 225, F: 220, G: 225, H: 255, I: 230 });

// Lead Audit
const audit = workbook.worksheets.add("Lead Audit");
setTitle(
  audit,
  "Lead-to-Enrollment Leak Audit",
  "A paid 48-hour diagnostic for a swim school, private-lesson operator, or sports academy. One free observation opens the conversation; the complete diagnosis is paid.",
  "E",
);

sectionLabel(audit, "A4:E4", "Commercial Definition");
audit.getRange("A5:E13").values = [
  ["Field", "Definition", "Client Outcome", "Boundary", "Your Action"],
  ["Buyer", "Owner, franchisee, general manager, operations/enrollment leader", "A decision maker owns the result", "Avoid brand HQ unless you have a warm path", "Confirm authority before scoping"],
  ["Problem", "Leads or staff time are lost between inquiry, assessment, placement, registration, payment and follow-up", "A clearer, measurable enrollment workflow", "Do not claim losses you have not verified", "Use hypothesis language"],
  ["Price", 400, "Low-risk paid diagnostic", "Paid upfront", "Send invoice/payment link before starting"],
  ["Delivery", "Within 48 hours after discovery and required access", "Fast decision support", "Timer starts when inputs are available", "Confirm inputs in writing"],
  ["Credit", "The $400 is credited toward a sprint started within 30 days", "Reduces double payment concern", "Credit is not a refund", "State this in proposal"],
  ["Free preview", "One specific observation or a 2-3 minute Loom", "Shows relevance and competence", "Not a full teardown", "Stop after one useful point"],
  ["Next offer", "$1,500-$2,500 fixed-scope implementation sprint", "One workflow improved end to end", "One workflow only", "Request 50% deposit to reserve delivery"],
  ["Proof", "SwimBuddz operations plus your backend/AI systems experience", "Domain and implementation credibility", "Do not overstate StrokeLab results", "Show relevant architecture or workflow evidence"],
];
setHeader(audit.getRange("A5:E5"), COLORS.blue);
setBody(audit.getRange("A6:E13"));
audit.getRange("B8").format.numberFormat = '"$"#,##0';

sectionLabel(audit, "A15:E15", "Client Deliverables");
audit.getRange("A16:E22").values = [
  ["#", "Deliverable", "What It Contains", "Why It Matters", "Not Included"],
  [1, "Current journey map", "Inquiry through enrollment with systems and owners", "Makes handoffs visible", "Implementation"],
  [2, "Evidence-based friction list", "Observed issues separated from assumptions", "Prevents generic recommendations", "Claims about unverified conversion loss"],
  [3, "Prioritized leak assessment", "Impact, confidence and effort for each issue", "Focuses the buyer on the first decision", "Full analytics rebuild"],
  [4, "Three quick wins", "Changes the team can make without a full build", "Creates immediate value", "Unlimited consulting"],
  [5, "Implementation blueprint", "One recommended workflow, integrations, safeguards and scope", "Makes build/no-build decision concrete", "Production code"],
  [6, "Review call", "30-minute walkthrough and questions", "Creates the sprint decision point", "Open-ended support"],
];
setHeader(audit.getRange("A16:E16"), COLORS.blue);
setBody(audit.getRange("A17:E22"));

sectionLabel(audit, "A24:E24", "Discovery Questions");
audit.getRange("A25:E35").values = [
  ["#", "Question", "What You Learn", "Strong Buying Signal", "Warning Signal"],
  [1, "How many inquiries do you receive in a normal week or month?", "Volume", "Repeated flow with meaningful volume", "Cannot estimate and does not care"],
  [2, "How quickly does someone respond to a new inquiry?", "Response process", "Delay or inconsistent ownership", "Already instant and measured"],
  [3, "How are assessments or trials booked?", "Scheduling handoff", "Calls, spreadsheets or back-and-forth", "Fully self-service and reliable"],
  [4, "How is level, instructor, location or class selected?", "Matching complexity", "Manual judgment repeated often", "No meaningful matching step"],
  [5, "What systems hold inquiry, booking, waiver and payment status?", "Tool fragmentation", "Several disconnected systems", "One system covers the workflow well"],
  [6, "Where does your team spend the most time chasing people or correcting information?", "Operational pain", "Specific recurring workload", "No concrete pain"],
  [7, "What happens to people who inquire but do not complete registration?", "Recovery process", "No owner or systematic follow-up", "Strong measured recovery process"],
  [8, "What is one additional enrollment or retained customer worth?", "Economic value", "Audit can pay back quickly", "Value too low for a paid engagement"],
  [9, "Who would approve a $400 diagnostic or implementation project?", "Authority", "Buyer is present or accessible", "No path to decision maker"],
  [10, "If we found a worthwhile fix, when would you want it implemented?", "Urgency", "This month/quarter", "No urgency or budget window"],
];
setHeader(audit.getRange("A25:E25"), COLORS.blue);
setBody(audit.getRange("A26:E35"));

sectionLabel(audit, "A37:E37", "Messages and Close");
audit.getRange("A38:E43").values = [
  ["Stage", "Message", "Goal", "Next Step", "Rule"],
  ["Cold opener", "Hi [Name], I run SwimBuddz and build backend/workflow systems. I reviewed the public enrollment path for [location] and noticed [specific observation]. There may be a manual handoff between [step] and [step]. Would it be useful if I sent one short observation showing what I mean?", "Permission", "Send one observation", "No full free audit"],
  ["After interest", "There may be two or three related points in the full workflow. Before recommending automation, I would want to understand how your team handles inquiries, assessments and follow-up. Are you open to a 15-minute call this week?", "Discovery call", "Offer two times", "Ask directly"],
  ["Paid audit close", "Based on what you described, I would start with a 48-hour Lead-to-Enrollment Leak Audit. I will map the current journey, identify the main leak and admin points, recommend quick wins, and give you a scoped implementation plan. It is $400 paid upfront, and I credit it toward a sprint started within 30 days. Shall I send the scope and payment link?", "Payment", "Send scope and invoice", "Do not end with 'let me know'"],
  ["Sprint close", "The sprint will improve one workflow end to end: [workflow]. It includes [deliverables], implementation, error handling and handover. Timeline is 10 business days. Price is [amount], with a 50% deposit to reserve the delivery window.", "Deposit", "Send proposal", "One workflow only"],
  ["No reply", "Quick follow-up: is [specific workflow] currently a real operational problem for your team, or is it already handled well enough?", "Useful answer", "Close or schedule", "Follow up once or twice, then move on"],
];
setHeader(audit.getRange("A38:E38"), COLORS.orange);
setBody(audit.getRange("A39:E43"));
setColumnWidths(audit, { A: 115, B: 430, C: 210, D: 210, E: 220 });
audit.freezePanes.freezeRows(2);

// Cash Now Plan
const cash = workbook.worksheets.add("Cash Now Plan");
setTitle(
  cash,
  "Immediate Cash Allocation: July 14-31",
  "The strategy is diversified but not equal-weighted. Protect most of your time for trusted conversations and paid asks; cap speculative platform and research time.",
  "G",
);

sectionLabel(cash, "A4:G4", "Daily Time Allocation");
cash.getRange("A5:G10").values = [
  ["Priority", "Path", "Time Share", "Daily Minimum Output", "Revenue Mechanism", "Deadline Role", "Stop / Continue Rule"],
  [1, "Warm-network tech/ops", 0.5, "10 direct asks/follow-ups + all active calls", "$400 audit or $1.5k-$2.5k sprint", "Primary", "Continue until every credible warm path has a next action."],
  [2, "Agency subcontracting + high-fit platform jobs", 0.25, "2 agency asks + 3 highly matched applications", "Hourly, fixed project or sprint", "Parallel cash", "Cap at 90 minutes/day until replies, interviews or tasks appear."],
  [3, "Swim/sports research and outreach", 0.15, "2 qualified reviews + 2 personalized messages", "$400 Lead-to-Enrollment Audit", "Controlled niche test", "Reduce sharply if the gate produces no replies/calls/paid interest."],
  [4, "Corporate wellness / cohorts", 0.1, "Only warm follow-ups, deposits and existing leads", "Cohort payment or corporate booking", "Backup", "No broad new campaign before urgent cash stabilizes."],
  [5, "StrokeLab", 0, "Use as proof only", "Supports authority", "Proof asset", "Do not spend July building new features for speculative sales."],
];
setHeader(cash.getRange("A5:G5"), COLORS.blue);
setBody(cash.getRange("A6:G10"));
cash.getRange("C6:C10").format.numberFormat = "0%";

sectionLabel(cash, "A12:G12", "Revenue Combinations");
cash.getRange("A13:G17").values = [
  ["Option", "Paid Audits", "Audit Cash", "Sprint / Deposit", "Other Cash", "Total", "Interpretation"],
  ["A", 0, 0, 2000, 0, null, "One full sprint closes the target."],
  ["B", 1, 400, 1500, 100, null, "One sprint plus one audit and small additional cash."],
  ["C", 5, 2000, 0, 0, null, "Five paid audits; requires a high conversation volume."],
  ["D", 2, 800, 1000, 200, null, "Two audits plus a project deposit and smaller work."],
];
for (let row = 14; row <= 17; row += 1) {
  cash.getRange(`F${row}`).formulas = [[`=C${row}+D${row}+E${row}`]];
}
setHeader(cash.getRange("A13:G13"), COLORS.blue);
setBody(cash.getRange("A14:G17"));
cash.getRange("C14:F17").format.numberFormat = '"$"#,##0';

sectionLabel(cash, "A19:G19", "Daily Operating Sequence");
cash.getRange("A20:G26").values = [
  ["Order", "Block", "Time Cap", "Action", "Success Measure", "If Blocked", "Where To Record"],
  [1, "Replies and follow-ups", "45 min", "Move every live conversation to a call, paid audit, proposal or clear no", "Next action on every live lead", "Offer two call times", "Pipeline Tracker"],
  [2, "Warm direct asks", "75 min", "Send specific asks to people who know your work", "10 quality touches", "Ask for one introduction", "Pipeline Tracker"],
  [3, "Calls/proposals/delivery", "90 min", "Hold calls, send scopes, collect deposits or deliver paid work", "Cash-stage movement", "Create a concise scope", "Pipeline Tracker + Daily Metrics"],
  [4, "Platforms/agencies", "60-90 min", "Apply only where your proof strongly matches", "3 strong applications + 2 agency asks", "Stop browsing after the cap", "Platform Tracker"],
  [5, "Swim niche", "30-45 min", "Research and contact two qualified local operators", "2 reviews + 2 messages", "Replace weak seed companies", "Swim Research"],
  [6, "Daily score", "15 min", "Record replies, calls, proposals, cash and market signal", "Metrics completed", "Write the next adjustment", "Daily Metrics"],
];
setHeader(cash.getRange("A20:G20"), COLORS.orange);
setBody(cash.getRange("A21:G26"));
setColumnWidths(cash, { A: 75, B: 215, C: 100, D: 280, E: 220, F: 210, G: 185 });
cash.freezePanes.freezeRows(2);

// Platform Tracker
const platforms = workbook.worksheets.add("Platform Tracker");
setTitle(
  platforms,
  "Nigeria-Accessible Work Platform Tracker",
  "Use genuine Nigeria location and identity information. A VPN is acceptable for privacy only when it does not misrepresent eligibility; never use it to bypass country restrictions.",
  "J",
);
platforms.getRange("A4:J4").values = [["Platform", "Nigeria / Location Position", "Best Fit", "Realistic Role In July", "Payment / Timing Note", "First Action", "Daily Time Cap", "Status", "Outcome / Next Step", "Official Source"]];
setHeader(platforms.getRange("A4:J4"), COLORS.blue);
platforms.getRange("A5:J8").values = [
  ["Outlier", "Role- and location-dependent; not every registration or project accepts every country. Use Nigeria as your primary location.", "Coding, AI evaluation, backend/agent workflows", "Worth one application, but task availability is not guaranteed", "Outlier advertises weekly pay on eligible projects; onboarding, verification and project supply still apply.", "Apply only to a Global role that accepts your real residence; complete identity/location verification truthfully.", "One setup block, then 15 min/day", "Not Started", null, "https://outlier.ai/legal/working-location-policy"],
  ["Upwork", "Nigeria is supported and Nigerian freelancer pages/tax guidance are published.", "Fixed-scope backend, AI automation, integrations", "High-intent job source, but a new profile may take time to win", "Fixed-price funds generally become available after client approval plus a five-day security period.", "Build one narrow profile and submit three tailored proposals daily; use funded milestones.", "60 min/day", "Not Started", null, "https://support.upwork.com/hc/en-us/articles/15156139408147-How-VAT-works-for-freelancers-in-Nigeria"],
  ["Andela", "Nigeria is explicitly listed as an approved region.", "Senior engineering and AI systems roles", "Good medium-term channel; screening and matching make it unreliable for immediate cash", "Engagement payment follows matching and contracting, not instant task access.", "Apply once, complete the assessment and interview honestly, then monitor matches.", "One application block", "Not Started", null, "https://help.andela.com/hc/en-us/articles/32941472534035-Where-must-I-live-to-work-at-Andela"],
  ["Contra", "Supports international contractor payments; verify your payout options during onboarding.", "Packaged audit/sprint offer and portfolio", "Useful storefront and direct-contract layer; not dependable as an instant job feed", "Contra advertises commission-free contractor earnings; payment options depend on onboarding and method.", "Publish the $400 audit and implementation sprint as two services; reuse your proof assets.", "One setup block, then 15 min/day", "Not Started", null, "https://contra.com/features/global-payments"],
];
setBody(platforms.getRange("A5:J20"));
platforms.getRange("A5:J8").format.fill = COLORS.white;
platforms.getRange("H5:H20").dataValidation = {
  rule: { type: "list", values: ["Not Started", "Applied", "Assessment", "Interview", "Active Tasks", "Rejected", "Paused"] },
};
platforms.getRange("H5:I20").format.fill = COLORS.paleYellow;
platforms.freezePanes.freezeRows(4);
setColumnWidths(platforms, { A: 100, B: 260, C: 220, D: 235, E: 250, F: 290, G: 130, H: 110, I: 220, J: 330 });

// Add an explicit pointer to the existing offer sheet.
const offers = workbook.worksheets.getItem("Offers & Templates");
offers.getRange("A14:E14").values = [[
  "Navigation",
  "Lead-to-Enrollment Leak Audit",
  "The complete scope, deliverables, discovery questions, outreach messages, and paid close are in the Lead Audit sheet.",
  "Before swim/sports outreach or calls",
  "This is a paid diagnostic. Give only one observation for free.",
]];
setBody(offers.getRange("A14:E14"));
offers.getRange("A14:E14").format.fill = COLORS.paleYellow;
offers.getRange("A14:B14").format.font = { bold: true, color: COLORS.black };

await fs.mkdir(previewDir, { recursive: true });
for (const sheetName of ["Dashboard", "Start Here", "Swim Research", "Friction Library", "Lead Audit", "Cash Now Plan", "Platform Tracker"]) {
  const preview = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(`${previewDir}/${sheetName.replaceAll(" ", "-")}.png`, new Uint8Array(await preview.arrayBuffer()));
}

const exportBlob = await SpreadsheetFile.exportXlsx(workbook);
await exportBlob.save(outputPath);

const checks = {};
for (const spec of [
  { sheetId: "Start Here", range: "A1:F30" },
  { sheetId: "Swim Research", range: "A1:AI20" },
  { sheetId: "Lead Audit", range: "A1:E43" },
  { sheetId: "Cash Now Plan", range: "A1:G26" },
  { sheetId: "Platform Tracker", range: "A1:J12" },
]) {
  checks[spec.sheetId] = (await workbook.inspect({
    kind: "table",
    ...spec,
    include: "values,formulas",
    tableMaxRows: 50,
    tableMaxCols: 40,
    maxChars: 20000,
  })).ndjson;
}
const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
});

console.log(JSON.stringify({ outputPath, previewDir, checks, errors: errors.ndjson }, null, 2));
