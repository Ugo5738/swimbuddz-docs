import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = "/Users/i/Documents/work/swimbuddz/outputs/tech_gig_revenue_plan_july_2026";
const outputPath = `${outputDir}/daniel_july_2026_revenue_plan.xlsx`;

const workbook = Workbook.create();

const colors = {
  navy: "#0F172A",
  slate: "#334155",
  paleSlate: "#F1F5F9",
  border: "#CBD5E1",
  tech: "#0F766E",
  corp: "#2563EB",
  academy: "#16A34A",
  stroke: "#7C3AED",
  admin: "#64748B",
  amber: "#F59E0B",
  white: "#FFFFFF",
  lightTech: "#CCFBF1",
  lightCorp: "#DBEAFE",
  lightAcademy: "#DCFCE7",
  lightStroke: "#EDE9FE",
  lightAdmin: "#E2E8F0",
};

const channels = [
  "Tech Gigs",
  "Corporate Wellness",
  "Academy Cohorts",
  "StrokeLab",
  "Admin/Review",
];
const statuses = ["Not Started", "In Progress", "Waiting", "Done", "Skipped"];
const priorities = ["P0", "P1", "P2"];
const yesNo = ["TRUE", "FALSE"];
const pipelineStatuses = ["Not Started", "Contacted", "Replied", "Call Booked", "Audit Offered", "Proposal Sent", "Won", "Lost", "Nurture"];
const currencies = ["USD", "NGN", "USD Eq Manual"];

function d(day) {
  return new Date(2026, 6, day);
}

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function dayName(date) {
  return dayNames[date.getDay()];
}

function row(day, start, end, channel, priority, task, actions, output, metric, asset, reminder = true, lead = 15) {
  const date = d(day);
  return [
    date,
    dayName(date),
    start,
    end,
    channel,
    priority,
    task,
    actions,
    output,
    metric,
    asset,
    "Not Started",
    reminder ? "TRUE" : "FALSE",
    lead,
    "",
    "",
  ];
}

const dailyRows = [
  row(8, "07:30", "08:00", "Tech Gigs", "P0", "Lock July $2k sales focus", "Write the July rule: $2k from one sprint or 4-5 paid audits. Pick founder-led service businesses, small SaaS teams, agencies, and operators as the first buyer set.", "Buyer focus locked", "$2k path written", "Dashboard"),
  row(8, "12:30", "13:00", "Tech Gigs", "P0", "Build first buyer list", "Add 40 prospects: warm contacts, founder-led startups, agencies, SaaS teams, operators, and businesses with visible manual workflow pain.", "Prospect list seeded", "40 prospects listed", "Pipeline Tracker"),
  row(8, "19:30", "21:00", "Tech Gigs", "P0", "Draft SwimBuddz OS proof case", "Write the proof story: problem, architecture, 18-service platform, admin operations, registrations, payments, community workflows, and what a buyer should trust from it.", "Proof case draft", "1 proof case drafted", "SwimBuddz OS"),
  row(8, "21:00", "21:30", "Tech Gigs", "P0", "Send first warm tech asks", "Send 5 messages asking for intros to founders/operators with manual follow-up, reporting, onboarding, or AI prototype problems.", "Warm asks sent", "5 conversations started", "Warm network"),

  row(9, "07:30", "08:00", "Tech Gigs", "P0", "Update LinkedIn headline/about", "Use the sharper angle: AI/backend systems for manual ops, internal tools, workflow automation, dashboards, and production AI reliability.", "LinkedIn updated", "Headline + About updated", "LinkedIn"),
  row(9, "12:30", "13:00", "Tech Gigs", "P0", "Send founder/operator batch 1", "Send 8 specific messages. Each message must name one likely workflow pain and offer a 20-minute workflow teardown.", "Founder messages sent", "8 conversations started", "Tech prospects"),
  row(9, "19:30", "20:30", "Tech Gigs", "P0", "Package paid audit offer", "Write the $300-$500 AI Workflow Audit scope: one workflow map, automation opportunities, ROI estimate, clickable/demo mockup, build/no-build call.", "Paid audit offer ready", "1 offer ready", "Offers & Templates"),
  row(9, "20:30", "21:30", "Corporate Wellness", "P1", "Map corporate warm paths", "List HR/People/Ops warm paths at Flutterwave, PiggyVest, GTBank, Fidelity, RiseVest, Paystack, Andela, and founder/operator friends.", "Corporate target shortlist", "10 companies or contacts mapped", "Corporate Wellness"),

  row(10, "07:30", "08:00", "Tech Gigs", "P1", "Publish proof post 1", "Post the practical angle: real AI/backend work is not demos; it is reliable workflows, logs, handoffs, dashboards, and fallbacks.", "LinkedIn post live", "1 post published", "LinkedIn"),
  row(10, "12:30", "13:00", "Tech Gigs", "P0", "Send founder/operator batch 2", "Send 8 more messages based on the same buyer pain pattern. Log every person, pain, and next step.", "Founder messages sent", "8 conversations started", "Tech prospects"),
  row(10, "19:30", "20:30", "Corporate Wellness", "P1", "Prepare corporate wellness send pack", "Confirm pitch, pricing, pilot framing, one-page summary, and call CTA for People/Ops teams.", "Corporate send pack ready", "1 pack ready", "Corporate Wellness"),
  row(10, "20:30", "21:30", "Admin/Review", "P0", "Weekly scorecard", "Record conversations, replies, calls, offers, proposals, and committed revenue. Decide whether buyer, pain, proof, or message is weak.", "Week 1 scorecard", "Metrics recorded", "Daily Metrics"),

  row(11, "10:00", "12:00", "Tech Gigs", "P0", "Build simple proof page", "Create a simple page or doc with the offer, SwimBuddz OS proof, StrokeLab proof, and one CTA: book a workflow teardown.", "Proof page live/draft", "1 page created", "Portfolio"),
  row(11, "12:30", "14:00", "Tech Gigs", "P0", "Send weekend high-quality batch", "Send 15 precise messages to warm contacts, founders, agencies, and operators. Ask for a workflow teardown call or the right person.", "Weekend outreach sent", "15 conversations started", "Tech prospects"),
  row(11, "15:00", "16:30", "Academy Cohorts", "P1", "Send academy batch 1", "Send 10 personal academy DMs. Ask for referral if the person is not a fit.", "Academy DMs sent", "10 conversations started", "Academy leads"),
  row(11, "16:30", "17:00", "StrokeLab", "P1", "Turn StrokeLab into proof", "Write 5 bullets showing upload flow, async AI analysis, result UX, credits/paywall path, and why this proves production AI/product skill.", "StrokeLab proof bullets", "5 proof bullets", "StrokeLab"),

  row(12, "17:00", "18:00", "Admin/Review", "P0", "Sunday review and reset", "Update pipeline statuses, identify replies, list call slots for next week, and adjust message if replies are below 10%.", "Clean tracker + next actions", "All active leads updated", "Dashboard", true, 30),

  row(13, "07:30", "08:00", "Tech Gigs", "P1", "Helpful public reply block", "Answer 2 real AI/backend automation questions on LinkedIn, Reddit, or X without pitching. Use buyer pain language.", "Useful replies", "2 replies posted", "Communities"),
  row(13, "12:30", "13:00", "Tech Gigs", "P0", "Follow up tech batch 1", "Follow up Jul 8-11 non-replies with a shorter message and a specific workflow hypothesis.", "Tech follow-ups sent", "15 follow-ups", "Tech prospects"),
  row(13, "19:30", "20:30", "Corporate Wellness", "P1", "Send corporate warm asks", "Ask 5 warm contacts to forward the corporate wellness pitch to HR/People/Ops.", "Corporate forward asks", "5 asks sent", "Corporate leads"),
  row(13, "20:30", "21:30", "Academy Cohorts", "P1", "Academy follow-up block", "Follow up academy DMs and push interested people to a 15-minute call or free assessment.", "Academy follow-ups", "10 follow-ups", "Academy leads"),

  row(14, "07:30", "08:00", "Tech Gigs", "P1", "Publish AI reliability post", "Post why AI prototypes fail in production: unclear owner, no logging, no fallback path, weak integration, no human approval.", "LinkedIn post live", "1 post published", "LinkedIn"),
  row(14, "12:30", "13:00", "Tech Gigs", "P0", "Send founder/operator batch 3", "Send 10 messages to prospects with visible ops complexity. Personalize with one workflow hypothesis.", "Founder messages sent", "10 conversations started", "Tech prospects"),
  row(14, "19:30", "21:00", "Tech Gigs", "P0", "Send one public teardown", "Pick one target business and map 3 repeated workflows plus one low-risk automation proposal. Send it as useful proof.", "Teardown memo sent", "1 teardown sent", "Tech prospect"),
  row(14, "21:00", "21:30", "StrokeLab", "P2", "Build StrokeLab reviewer list", "List 10 coaches, creators, swimmers, or triathlon communities that can critique result usefulness or paid-credit interest.", "Reviewer list", "10 targets listed", "StrokeLab"),

  row(15, "07:30", "08:00", "Corporate Wellness", "P1", "Send corporate batch 2", "Send 5 more corporate wellness pitches or warm-forward asks with a 20-minute intro call CTA.", "Corporate touches", "5 touches", "Corporate leads"),
  row(15, "12:30", "13:00", "Tech Gigs", "P0", "Apply to contract roles", "Apply to 5 high-quality AI/backend/LLM contract roles with custom notes and proof links.", "Applications sent", "5 applications", "Job boards"),
  row(15, "19:30", "20:30", "Tech Gigs", "P0", "Send founder/operator batch 4", "Send 8 messages. Use the best-performing pain language from replies so far.", "Founder messages sent", "8 conversations started", "Tech prospects"),
  row(15, "20:30", "21:30", "Academy Cohorts", "P1", "Send academy batch 2", "Send 10 more academy DMs. Prioritize people with beginner-adult fear, tech/finance circles, and referral potential.", "Academy DMs sent", "10 conversations started", "Academy leads"),

  row(16, "07:30", "08:00", "Tech Gigs", "P0", "Book teardown calls", "Ask every reply for a 20-minute workflow teardown call. Offer two time windows and keep the ask simple.", "Call asks sent", "5 call asks", "Tech prospects"),
  row(16, "12:30", "13:00", "Corporate Wellness", "P1", "Book corporate intro calls", "Push corporate replies toward a 20-minute intro call. If they resist, ask for the right People/Ops owner.", "Corporate call asks", "3 call asks", "Corporate leads"),
  row(16, "19:30", "21:00", "Tech Gigs", "P0", "Discovery call block", "Run booked calls or simulate with notes. Ask about repeated workflow, tools, owner, urgency, budget, and current workaround.", "Discovery notes", "1-3 calls or run-throughs", "Tech prospects"),
  row(16, "21:00", "21:30", "Admin/Review", "P0", "Log market signals", "Write exact objections and repeated pains in Daily Metrics. Adjust Friday outreach around what buyers actually said.", "Market signals logged", "Signals entered", "Daily Metrics"),

  row(17, "07:30", "08:00", "Tech Gigs", "P1", "Publish proof post 2", "Publish a short SwimBuddz OS case-study post: what you built, what it coordinates, and the business process angle.", "LinkedIn post live", "1 post published", "LinkedIn"),
  row(17, "12:30", "13:00", "Tech Gigs", "P0", "Make paid audit asks", "For warm replies, ask directly: should I send a 5-day paid workflow audit proposal?", "Paid audit asks", "5 asks", "Tech prospects"),
  row(17, "19:30", "20:30", "Tech Gigs", "P0", "Write proposal template", "Write proposal template: problem, scope, deliverables, timeline, price, assumptions, deposit, and next step.", "Proposal template ready", "1 template", "Offers & Templates"),
  row(17, "20:30", "21:30", "Admin/Review", "P0", "Weekly scorecard", "Measure week 2: conversations, replies, calls, offers, proposals, and committed revenue. Identify the bottleneck.", "Week 2 scorecard", "Metrics recorded", "Daily Metrics"),

  row(18, "10:00", "12:00", "Tech Gigs", "P0", "Build mini demo/storyboard", "Build or storyboard a demo: AI lead intake + proposal generator, admin dashboard, or workflow summary with human approval.", "Mini-demo ready", "1 demo/storyboard", "Tech proof"),
  row(18, "12:30", "14:00", "Tech Gigs", "P0", "Send demo to prospects", "Send the mini-demo or storyboard to 10 relevant prospects with one specific workflow question.", "Demo sent", "10 sends", "Tech prospects"),
  row(18, "15:00", "16:00", "Academy Cohorts", "P1", "Free assessment promo batch", "Invite 15 people to a free assessment or 1:1 swim-readiness call. Ask members to bring one friend.", "Assessment invites", "15 invites", "Academy leads"),
  row(18, "16:00", "17:00", "StrokeLab", "P1", "Send StrokeLab reviewer asks", "Send 5 targeted messages to coaches, creators, swimmers, or triathletes asking them to critique a free result.", "Reviewer asks sent", "5 asks", "StrokeLab"),

  row(19, "17:00", "18:00", "Admin/Review", "P0", "Sunday close-list review", "Update lead statuses and select top 10 active closes for week 3. Decide if the bottleneck is message, proof, call, proposal, or price.", "Week 3 close list", "10 close targets", "Dashboard", true, 30),

  row(20, "07:30", "08:00", "Tech Gigs", "P0", "Follow up demo recipients", "Follow up the 10 mini-demo recipients with a direct question: is this workflow painful enough to fix now?", "Demo follow-ups", "10 follow-ups", "Tech prospects"),
  row(20, "12:30", "13:00", "Corporate Wellness", "P1", "Corporate follow-up 1", "Follow up all corporate pitches from Jul 13 and Jul 15. Ask for redirect if they are the wrong person.", "Corporate follow-ups", "10 follow-ups", "Corporate leads"),
  row(20, "19:30", "20:30", "Tech Gigs", "P0", "Direct paid audit close ask", "Ask warm leads: should I send a 5-day paid audit proposal, or is this not a priority this month?", "Close asks sent", "5 direct asks", "Tech prospects"),
  row(20, "20:30", "21:30", "Academy Cohorts", "P1", "Academy call block", "Call or WhatsApp interested academy leads. Diagnose fear, timing, location, budget, and referral potential.", "Academy call notes", "3 conversations", "Academy leads"),

  row(21, "07:30", "08:00", "Corporate Wellness", "P1", "Publish corporate wellness post", "Post why structured swim cohorts can be a better wellness benefit than unused gym memberships.", "LinkedIn post live", "1 post published", "Corporate Wellness"),
  row(21, "12:30", "13:00", "Tech Gigs", "P0", "Send founder/operator batch 5", "Send 10 messages using the best reply pattern from the first two weeks.", "Founder messages sent", "10 conversations started", "Tech prospects"),
  row(21, "19:30", "21:00", "Tech Gigs", "P0", "Send proposals", "Turn serious discovery calls into scoped audit or sprint proposals. Keep the first paid step small enough to approve.", "Proposals sent", "1-2 proposals", "Tech prospects"),
  row(21, "21:00", "21:30", "StrokeLab", "P2", "StrokeLab paid-credit check", "Ask high-intent testers if paid credits or a coach pack is compelling. Capture objections, not opinions.", "Paid-credit feedback", "3 feedback asks", "StrokeLab"),

  row(22, "07:30", "08:00", "Academy Cohorts", "P1", "Academy payment follow-up", "Follow up every interested academy lead with date, price, payment option, and next call or assessment CTA.", "Academy follow-ups", "15 follow-ups", "Academy leads"),
  row(22, "12:30", "13:00", "Corporate Wellness", "P1", "Send corporate batch 3", "Send 5 new corporate pitches or warm-forward requests based on the decision-maker map.", "Corporate touches", "5 touches", "Corporate leads"),
  row(22, "19:30", "20:30", "Tech Gigs", "P0", "Apply to contract roles", "Apply to 5 more AI/backend/LLM roles with custom notes and proof links.", "Applications sent", "5 applications", "Job boards"),
  row(22, "20:30", "21:30", "Tech Gigs", "P0", "Discovery call block", "Run calls or follow-up voice notes. Convert real pain into audit/sprint next steps.", "Discovery notes", "1-3 calls or follow-ups", "Tech prospects"),

  row(23, "07:30", "08:00", "Tech Gigs", "P1", "Publish StrokeLab build post", "Post technical/business lessons from building public AI analysis with async queue, result UX, and paywall paths.", "LinkedIn post live", "1 post published", "LinkedIn"),
  row(23, "12:30", "13:00", "Tech Gigs", "P0", "Proposal follow-up", "Follow up open proposals with a binary next step: proceed, revise scope, or revisit later.", "Proposal follow-ups", "2 follow-ups", "Tech prospects"),
  row(23, "19:30", "20:30", "Corporate Wellness", "P1", "Corporate intro call prep", "For each booked or likely corporate call, prepare context, SwimBuddz fit, pilot scope, and next decision.", "Corporate call prep", "1-3 call packs", "Corporate leads"),
  row(23, "20:30", "21:30", "Academy Cohorts", "P1", "Academy closing calls", "Call high-intent academy leads. Ask for payment decision, payment-plan need, or referral.", "Academy close notes", "3 closes attempted", "Academy leads"),

  row(24, "07:30", "08:00", "Tech Gigs", "P0", "Send direct tech asks", "Send 10 direct messages to active and new leads: one workflow, one pain, one teardown/audit CTA.", "Direct asks sent", "10 conversations started", "Tech prospects"),
  row(24, "12:30", "13:00", "Corporate Wellness", "P1", "Corporate redirects", "Ask nonresponsive warm contacts for the right HR/People person. Do not let leads die silently.", "Redirect asks", "5 asks", "Corporate leads"),
  row(24, "19:30", "20:30", "Tech Gigs", "P0", "Close paid audit or sprint", "Ask active tech leads to start with a paid audit or scoped sprint next week. Push for deposit or start date.", "Close asks", "3 asks", "Tech prospects"),
  row(24, "20:30", "21:30", "Admin/Review", "P0", "Weekly scorecard", "Measure week 3 and decide if you need more calls, clearer offer, smaller first step, or stronger proof.", "Week 3 scorecard", "Metrics recorded", "Daily Metrics"),

  row(25, "10:00", "12:00", "Academy Cohorts", "P1", "Run or simulate assessment event", "If possible, run the event. If not, run 1:1 assessment calls and collect objections.", "Assessment outcomes", "12 attendees or 8 calls", "Academy"),
  row(25, "12:30", "14:00", "Tech Gigs", "P0", "Send high-quality tech batch", "Send 20 precise messages to founder/operator prospects. Include proof link or mini-demo when relevant.", "Tech messages sent", "20 conversations started", "Tech prospects"),
  row(25, "15:00", "16:00", "Corporate Wellness", "P1", "Corporate second follow-up", "Follow up all corporate leads with pilot framing and a 20-minute intro call CTA.", "Corporate follow-ups", "10 follow-ups", "Corporate leads"),
  row(25, "16:00", "17:00", "StrokeLab", "P2", "StrokeLab usage review", "Review uploads, replies, paid interest, objections, and next content idea. Keep this limited to proof and signal.", "StrokeLab review", "5 insights", "StrokeLab"),

  row(26, "17:00", "18:00", "Admin/Review", "P0", "Sunday close-list review", "Create Jul 27-31 close list: tech proposals, academy payments, corporate calls, and any StrokeLab paid tests.", "Final-week close list", "15 close targets", "Dashboard", true, 30),

  row(27, "07:30", "08:00", "Tech Gigs", "P0", "End-of-month availability message", "Message active leads: one audit/sprint slot open before August. Ask if this workflow is priority now.", "Availability messages", "10 sends", "Tech prospects"),
  row(27, "12:30", "13:00", "Academy Cohorts", "P1", "Academy last-call batch", "Send last-call cohort or assessment follow-up with payment link or call CTA.", "Academy last calls", "15 sends", "Academy leads"),
  row(27, "19:30", "20:30", "Corporate Wellness", "P1", "Corporate pilot close", "Ask active corporate leads for internal champion, decision timeline, and pilot package interest.", "Corporate close asks", "5 asks", "Corporate leads"),
  row(27, "20:30", "21:30", "Tech Gigs", "P0", "Proposal revisions", "Revise open proposals to the smallest credible paid first step if price or scope friction appears.", "Revised proposals", "1-2 revisions", "Tech prospects"),

  row(28, "07:30", "08:00", "Corporate Wellness", "P1", "Publish corporate proof post", "Post a calm founder-led corporate wellness story and CTA for People/Ops leads.", "Post live", "1 post", "LinkedIn"),
  row(28, "12:30", "13:00", "Tech Gigs", "P0", "Proposal decision follow-up", "Ask a direct binary question on every open tech proposal.", "Proposal decision asks", "2-3 asks", "Tech prospects"),
  row(28, "19:30", "20:30", "Academy Cohorts", "P1", "Academy payment conversations", "Call interested academy leads and handle location, fear, timing, and price objections.", "Payment call notes", "3 calls", "Academy leads"),
  row(28, "20:30", "21:30", "StrokeLab", "P2", "StrokeLab paid test push", "Offer a small paid credit or coach-pack test to high-intent users or coaches.", "Paid-test asks", "5 asks", "StrokeLab"),

  row(29, "07:30", "08:00", "Tech Gigs", "P0", "Apply to contract roles batch", "Apply to 10 contract roles or gigs with proof links and production AI/backend positioning.", "Applications sent", "10 applications", "Job boards"),
  row(29, "12:30", "13:00", "Corporate Wellness", "P1", "Corporate final follow-up", "Send final July follow-up: worth scheduling an August pilot discussion, or should I circle back later?", "Corporate final asks", "10 asks", "Corporate leads"),
  row(29, "19:30", "20:30", "Tech Gigs", "P0", "Close audit or sprint", "Get verbal yes/no from active tech leads. On yes, ask for deposit and start date.", "Close outcomes", "All active leads touched", "Tech prospects"),
  row(29, "20:30", "21:30", "Academy Cohorts", "P1", "Academy referral push", "Ask engaged members and leads for 2 specific introductions each.", "Referral asks", "10 asks", "Academy leads"),

  row(30, "07:30", "08:00", "Tech Gigs", "P1", "Publish month-end learning post", "Publish what SwimBuddz and StrokeLab taught you about production AI, messy workflows, and real users.", "Post live", "1 post", "LinkedIn"),
  row(30, "12:30", "13:00", "Tech Gigs", "P0", "Every active lead direct ask", "Ask every active tech lead: should I send/start a scoped paid audit, or is this not a priority now?", "Direct asks", "All active leads touched", "Tech prospects"),
  row(30, "19:30", "20:30", "Corporate Wellness", "P1", "Corporate August pipeline", "Move non-closing July leads into August next-touch dates. Confirm top 5 for August calls.", "August corporate pipeline", "5 priority leads", "Corporate leads"),
  row(30, "20:30", "21:30", "Academy Cohorts", "P1", "Academy August pipeline", "Move non-closing academy leads into nurture. Identify top 10 for August cohort.", "August academy pipeline", "10 priority leads", "Academy leads"),

  row(31, "07:30", "08:00", "Tech Gigs", "P0", "Final tech close follow-up", "Send final July close messages and ask for payment or start-date decision.", "Final close messages", "All open tech leads touched", "Tech prospects"),
  row(31, "12:30", "13:00", "StrokeLab", "P2", "StrokeLab month-end review", "Record uploads, replies, paid interest, objections, and next product experiment.", "StrokeLab scorecard", "Metrics recorded", "StrokeLab"),
  row(31, "19:30", "20:30", "Admin/Review", "P0", "July scorecard", "Record conversations, replies, calls, proposals, revenue committed, corporate replies, academy enrollments, and StrokeLab usage.", "July scorecard complete", "All metrics filled", "Dashboard"),
  row(31, "20:30", "21:30", "Admin/Review", "P0", "August decision", "Decide what to double down on, what to pause, and the single highest-value revenue bet for August.", "August priorities", "3 decisions made", "Dashboard"),
];

const metricRows = [];
for (let day = 8; day <= 31; day++) {
  const date = d(day);
  metricRows.push([date, dayName(date), "", "", "", "", "", "", "", ""]);
}

const pipelineRows = [
  ["Lead / Account", "Company", "Channel", "Buyer Type", "Warm Path", "Pain Hypothesis", "Proof to Show", "Offer to Make", "Next Step", "Status", "Last Touch", "Next Touch", "Potential Value", "Currency", "USD Eq Manual", "Probability", "Weighted USD Eq", "Notes"],
  ["Warm founder/operator intro 1", "", "Tech Gigs", "Founder-led service business", "Warm network", "Lead follow-up and onboarding are manual or inconsistent", "SwimBuddz OS proof", "$300-$500 Workflow Audit", "Ask for intro or teardown call", "Not Started", "", d(9), 500, "USD", 500, 0.2, "", ""],
  ["Warm founder/operator intro 2", "", "Tech Gigs", "Small SaaS / agency", "Warm network", "Reporting, support, or client operations repeat every week", "SwimBuddz OS proof", "$1,500-$2,500 Automation Sprint", "Send workflow hypothesis", "Not Started", "", d(9), 2000, "USD", 2000, 0.15, "", ""],
  ["Agency ops prospect", "", "Tech Gigs", "Agency/operator", "LinkedIn", "Proposal writing, reporting, and handoffs are repetitive", "Mini-demo/storyboard", "$300-$500 Workflow Audit", "Send teardown", "Not Started", "", d(14), 500, "USD", 500, 0.15, "", ""],
  ["AI prototype cleanup prospect", "", "Tech Gigs", "Founder-led startup", "LinkedIn", "AI prototype exists but lacks logging, fallback, queue, or dashboard", "StrokeLab proof", "$1,500-$2,500 Automation Sprint", "Ask for teardown call", "Not Started", "", d(14), 2000, "USD", 2000, 0.15, "", ""],
  ["Contract role batch", "", "Tech Gigs", "Hiring team", "Job board", "Needs AI/backend implementation capacity", "Portfolio proof page", "Contract role / sprint", "Apply with proof link", "Not Started", "", d(15), 2000, "USD", 2000, 0.1, "", ""],
  ["Flutterwave People/Ops", "Flutterwave", "Corporate Wellness", "Corporate HR/People", "Warm intro", "Wellness budget needs high-completion program", "Corporate wellness pack", "12-week SwimBuddz pilot", "Ask for HR forward", "Not Started", "", d(13), 675000, "NGN", "", 0.15, "", ""],
  ["PiggyVest People/Ops", "PiggyVest", "Corporate Wellness", "Corporate HR/People", "Warm intro", "Young workforce and employer-brand angle", "Corporate wellness pack", "12-week SwimBuddz pilot", "Ask for HR forward", "Not Started", "", d(13), 675000, "NGN", "", 0.15, "", ""],
  ["GTBank HR", "GTBank", "Corporate Wellness", "Bank/finance HR", "Warm intro", "Structured wellness and team-cohesion program", "Corporate wellness pack", "12-week SwimBuddz pilot", "Send pitch pack", "Not Started", "", d(15), 675000, "NGN", "", 0.1, "", ""],
  ["Academy warm lead batch", "", "Academy Cohorts", "Working professionals", "Personal network", "Adult beginner fear, timing, and trust barrier", "Academy cohort proof", "12-week academy cohort", "Send personal DM", "Not Started", "", d(11), 150000, "NGN", "", 0.2, "", ""],
  ["Free assessment attendees", "", "Academy Cohorts", "High-intent learners", "Event / calls", "Try-before-buy and fear reduction", "Assessment plan", "12-week academy cohort", "Invite to assessment", "Not Started", "", d(18), 150000, "NGN", "", 0.35, "", ""],
  ["StrokeLab coach reviewers", "", "StrokeLab", "Coaches / creators", "LinkedIn / IG", "Need scalable video feedback or content angle", "Free analysis result", "Paid credits / coach pack test", "Invite to critique", "Not Started", "", d(18), 29, "USD", 29, 0.1, "", ""],
  ["StrokeLab beta swimmers", "", "StrokeLab", "Swimmers / triathletes", "Community", "Want quick freestyle feedback", "Free analysis result", "Paid credits test", "Invite free upload", "Not Started", "", d(18), 12, "USD", 12, 0.1, "", ""],
];

const offerRows = [
  ["Section", "Item", "Details"],
  ["July Decision Frame", "Money target", "$2,000 closed or contractually committed by July 31, 2026."],
  ["July Decision Frame", "Main cash lane", "Tech gigs are the primary cash lane. SwimBuddz corporate/academy are secondary revenue and proof lanes. StrokeLab is proof, signal, and optional small paid tests."],
  ["Tech Gigs", "Primary buyer", "Founder-led service businesses, small SaaS teams, agencies, and operators with repeated manual workflows and no reliable internal system."],
  ["Tech Gigs", "Pain to sell against", "Manual lead follow-up, onboarding, payment tracking, client reporting, internal dashboards, disconnected tools, and AI prototypes stuck in demo mode."],
  ["Tech Gigs", "Proof available today", "SwimBuddz OS, cohort registration flow, corporate wellness docs, StrokeLab AI-analysis concept, backend/API work, automation/calendar system, and product planning docs."],
  ["Tech Gigs", "Positioning", "I help small teams fix manual follow-up, onboarding, payment tracking, reporting, and internal workflow bottlenecks using backend systems and AI-assisted automation."],
  ["Tech Gigs", "Offer A: AI Workflow Audit", "$300-$500. 5 days. Map one painful workflow, identify automation opportunities, estimate ROI, produce one clickable/demo mockup, and recommend build/no-build decision."],
  ["Tech Gigs", "Offer B: Automation Sprint", "$1,500-$2,500. 2 weeks. Build one workflow end-to-end: form/intake, backend logic, integration, dashboard, notifications, logs, and deployment notes."],
  ["Tech Gigs", "Offer C: Support Retainer", "$500-$1,000/month. After sprint: monitoring, improvements, error handling, and new workflow backlog."],
  ["Tech Gigs", "Warm outreach message", "Hey [Name], I’m doing focused AI/backend automation work for founder-led teams. I’m looking for teams with repeated manual follow-up, onboarding, reporting, or AI prototype problems. If that sounds like someone you know, could you intro me? I can do a quick workflow teardown before pitching anything."],
  ["Tech Gigs", "Founder/operator cold-lite message", "Saw [specific signal]. It made me wonder if [workflow] is still manual for you. I help small teams turn that kind of repeated ops work into reliable internal tools and AI-assisted workflows. Open to a 20-minute teardown? If there is no real pain, I’ll say so."],
  ["Tech Gigs", "Direct close ask", "Would it make sense for me to send a 5-day paid workflow audit proposal, or is this not a priority this month?"],
  ["Tech Gigs", "Discovery questions", "What repeats weekly? Who owns it? What tool breaks? What happens if it is late? What does it cost in time/money? Who approves fixing it? What would make this worth paying for now?"],
  ["Corporate Wellness", "Primary pitch", "SwimBuddz 12-week adult swim program for Lagos teams. Structured Saturday cohorts, beginner-friendly, measurable outcomes, employer-brand story, 5-9 employees at ₦135k each, 10+ at ₦127.5k each."],
  ["Corporate Wellness", "Warm forward ask", "Could you forward this to whoever owns People/Ops or wellness? One line is enough: Daniel runs SwimBuddz and is piloting adult swim wellness cohorts for Lagos teams. Worth a look."],
  ["Academy Cohorts", "Warm academy DM", "Quick one: I’m enrolling a 12-week adult beginner swim cohort. It’s built for people who never learned or learned badly and gave up. Saturday mornings, structured coaches, milestones. ₦150k for 3 months. If it’s not for you, who do you know that would benefit?"],
  ["Academy Cohorts", "Free assessment invite", "I’m running a free adult swim assessment. No commitment. You leave with a clear read on your level and what it would take to learn properly. Want me to reserve a spot?"],
  ["StrokeLab", "CTA", "Upload a side-on freestyle clip. StrokeLab reads body line, recovery, breathing/head position, and entry, then turns it into drills. First analysis is free; paid credits for more analysis."],
  ["StrokeLab", "Coach/creator ask", "I built a public AI freestyle-analysis tool and would value a coach’s critique. Could I send you a free result link and ask what feels useful, wrong, or sellable?"],
];

const sourceRows = [
  ["Source", "Path / URL", "Used For"],
  ["SwimBuddz Pricing Strategy", "/Users/i/Documents/work/swimbuddz/docs/club/PRICING_STRATEGY.md", "Academy, club, community pricing and unit economics"],
  ["Cohort Enrollment Playbook", "/Users/i/Documents/work/swimbuddz/docs/academy/COHORT_ENROLLMENT_PLAYBOOK.md", "Academy 30-day enrollment actions and conversion assumptions"],
  ["Corporate Wellness", "/Users/i/Documents/work/swimbuddz/docs/marketing/CORPORATE_WELLNESS.md", "Corporate buyer, pitch, pricing, outreach sequence"],
  ["StrokeLab Public Analyzer Design", "/Users/i/Documents/work/swimbuddz/docs/design/STROKELAB_PUBLIC_ANALYZER_DESIGN.md", "StrokeLab public funnel, credits, async analysis, positioning"],
  ["AI Swim Analyzer Design", "/Users/i/Documents/work/swimbuddz/docs/design/AI_SWIM_ANALYZER_DESIGN.md", "StrokeLab product bet, founding price, validation logic"],
  ["Founder LinkedIn Playbook", "/Users/i/Documents/work/swimbuddz/docs/marketing/FOUNDER_LINKEDIN_PLAYBOOK.md", "LinkedIn positioning and content themes"],
  ["Founder Network Plan", "/Users/i/Documents/work/swimbuddz/docs/company/FOUNDER_NETWORK_PLAN.md", "Corporate and operator relationship strategy"],
];

const appScriptCode = String.raw`const PLAN_SHEET_NAME = 'Daily Plan';
const CONFIG_SHEET_NAME = 'Reminder Config';

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Revenue Plan')
    .addItem('Create/update calendar reminders', 'syncPlanReminders')
    .addItem('Send today guide now', 'sendTodayGuide')
    .addItem('Install daily 7am guide trigger', 'installDailyGuideTrigger')
    .addToUi();
}

function getConfig_() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(CONFIG_SHEET_NAME);
  const values = sheet.getDataRange().getValues();
  const config = {};
  values.slice(1).forEach(row => {
    if (row[0]) config[String(row[0]).trim()] = row[1];
  });
  return config;
}

function getPlan_() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(PLAN_SHEET_NAME);
  const values = sheet.getDataRange().getValues();

  const headerRowIndex = values.findIndex(row =>
    row.includes('Date') &&
    row.includes('Task') &&
    row.includes('Create Reminder')
  );

  if (headerRowIndex === -1) {
    throw new Error('Could not find Daily Plan header row.');
  }

  const headers = values[headerRowIndex];
  const h = {};
  headers.forEach((header, i) => {
    h[String(header).trim()] = i;
  });

  return {
    sheet,
    values,
    headers: h,
    firstDataRowIndex: headerRowIndex + 1,
  };
}

function truthy_(value) {
  return (
    value === true ||
    value === 1 ||
    String(value).trim().toUpperCase() === 'TRUE' ||
    String(value).trim() === '1' ||
    String(value).trim().toUpperCase() === 'YES'
  );
}

function parseTime_(dateValue, timeText) {
  const d = new Date(dateValue);
  const parts = String(timeText).trim().split(':').map(Number);
  d.setHours(parts[0] || 0, parts[1] || 0, 0, 0);
  return d;
}

function eventDescription_(row, h) {
  return [
    'Channel: ' + row[h['Channel']],
    'Priority: ' + row[h['Priority']],
    '',
    'Action steps:',
    row[h['Action Steps']],
    '',
    'Expected output:',
    row[h['Expected Output']],
    '',
    'Success metric:',
    row[h['Success Metric']],
    '',
    'Notes:',
    row[h['Notes']]
  ].join('\n');
}

function syncPlanReminders() {
  const plan = getPlan_();
  const sheet = plan.sheet;
  const h = plan.headers;
  const values = plan.values;
  const config = getConfig_();

  const maxCreates = Number(config['Calendar Batch Create Limit'] || 10);
  const sleepMs = Number(config['Calendar Write Sleep Ms'] || 300);
  const calendarId = config['Calendar ID'];
  const calendar = calendarId
    ? CalendarApp.getCalendarById(calendarId)
    : CalendarApp.getDefaultCalendar();

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let staleIds = 0;

  for (let r = plan.firstDataRowIndex; r < values.length; r++) {
    const row = values[r];

    if (!row[h['Date']] || !row[h['Task']]) {
      skipped++;
      continue;
    }

    const shouldCreate = truthy_(row[h['Create Reminder']]);
    const status = String(row[h['Status']] || '').trim();

    if (!shouldCreate || status === 'Done' || status === 'Skipped') {
      skipped++;
      continue;
    }

    const start = parseTime_(row[h['Date']], row[h['Start Time']]);
    const end = parseTime_(row[h['Date']], row[h['End Time']]);
    const title = row[h['Channel']] + ': ' + row[h['Task']];
    const desc = eventDescription_(row, h);
    const lead = Number(row[h['Reminder Lead Mins']] || 15);

    const eventIdCol = h['Calendar Event ID'] + 1;
    const eventIdCell = sheet.getRange(r + 1, eventIdCol);
    const existingId = row[h['Calendar Event ID']];

    let event = null;
    if (existingId) {
      try {
        event = CalendarApp.getEventById(existingId);
      } catch (e) {
        event = null;
      }

      if (!event) {
        eventIdCell.clearContent();
        staleIds++;
      }
    }

    if (event) {
      event.setTitle(title);
      event.setTime(start, end);
      event.setDescription(desc);
      updated++;
      Utilities.sleep(sleepMs);
      continue;
    }

    if (created >= maxCreates) {
      Logger.log('Create limit reached. Run syncPlanReminders again later.');
      break;
    }

    event = calendar.createEvent(title, start, end, { description: desc });
    event.addPopupReminder(lead);
    eventIdCell.setValue(event.getId());
    created++;
    Utilities.sleep(sleepMs);
  }

  Logger.log('Created: ' + created + ', Updated: ' + updated + ', Stale IDs cleared: ' + staleIds + ', Skipped: ' + skipped);
  SpreadsheetApp.getActive().toast('Calendar sync done. Created ' + created + ', updated ' + updated + ', stale IDs cleared ' + staleIds + '.', 'Revenue Plan');
}

function sendTodayGuide() {
  const plan = getPlan_();
  const h = plan.headers;
  const values = plan.values;
  const config = getConfig_();

  const email = config['Daily Guide Email'] || Session.getActiveUser().getEmail();
  const now = new Date();
  const todayKey = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd');

  const todays = values.slice(plan.firstDataRowIndex).filter(row => {
    if (!row[h['Date']]) return false;
    const key = Utilities.formatDate(new Date(row[h['Date']]), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const status = String(row[h['Status']] || '').trim();
    return key === todayKey && status !== 'Done' && status !== 'Skipped';
  });

  if (!todays.length) {
    MailApp.sendEmail(email, 'Revenue Plan: no pending tasks today', 'No pending tasks for today.');
    return;
  }

  const body = todays.map(row => [
    row[h['Start Time']] + '-' + row[h['End Time']] + ' | ' + row[h['Channel']] + ' | ' + row[h['Priority']],
    row[h['Task']],
    'Action: ' + row[h['Action Steps']],
    'Output: ' + row[h['Expected Output']],
    'Metric: ' + row[h['Success Metric']]
  ].join('\n')).join('\n\n---\n\n');

  MailApp.sendEmail(email, 'Revenue Plan guide for ' + todayKey, body);
}

function installDailyGuideTrigger() {
  const config = getConfig_();
  const hour = Number(config['Daily Guide Hour'] || 7);

  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'sendTodayGuide')
    .forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('sendTodayGuide')
    .timeBased()
    .everyDays(1)
    .atHour(hour)
    .create();
}`;

function addTitle(sheet, title, subtitle, lastCol = "P") {
  sheet.getRange(`A1:${lastCol}1`).merge();
  sheet.getRange("A1").values = [[title]];
  sheet.getRange("A1").format.fill = colors.navy;
  sheet.getRange("A1").format.font = { color: colors.white, bold: true, size: 16 };
  sheet.getRange("A1").format.rowHeight = 30;
  sheet.getRange(`A2:${lastCol}2`).merge();
  sheet.getRange("A2").values = [[subtitle]];
  sheet.getRange("A2").format.fill = colors.paleSlate;
  sheet.getRange("A2").format.font = { color: colors.slate, italic: true };
  sheet.getRange("A2").format.wrapText = true;
}

function styleHeader(range) {
  range.format.fill = colors.slate;
  range.format.font = { color: colors.white, bold: true };
  range.format.wrapText = true;
}

function setWidths(sheet, widths) {
  for (const [col, width] of Object.entries(widths)) {
    sheet.getRange(`${col}1:${col}220`).format.columnWidth = width;
  }
}

function channelFill(channel) {
  if (channel === "Tech Gigs") return colors.lightTech;
  if (channel === "Corporate Wellness") return colors.lightCorp;
  if (channel === "Academy Cohorts") return colors.lightAcademy;
  if (channel === "StrokeLab") return colors.lightStroke;
  return colors.lightAdmin;
}

function channelFont(channel) {
  if (channel === "Tech Gigs") return colors.tech;
  if (channel === "Corporate Wellness") return colors.corp;
  if (channel === "Academy Cohorts") return colors.academy;
  if (channel === "StrokeLab") return colors.stroke;
  return colors.admin;
}

const maxPlanRow = dailyRows.length + 4;
const maxMetricsRow = metricRows.length + 4;
const maxPipelineRow = 200;

const dashboard = workbook.worksheets.add("Dashboard");
dashboard.showGridLines = false;
addTitle(dashboard, "July 2026 Revenue Execution Dashboard", "Goal: $2,000 closed or contractually committed by July 31. Tech gigs are the main cash lane; SwimBuddz and StrokeLab support revenue, proof, and market signal.", "N");
dashboard.getRange("A4:B17").values = [
  ["Metric", "Value"],
  ["Revenue target by Jul 31", 2000],
  ["Committed revenue (USD)", ""],
  ["Remaining gap", ""],
  ["Conversations started", ""],
  ["Replies", ""],
  ["Calls booked", ""],
  ["Offers made", ""],
  ["Proposals sent", ""],
  ["Tasks done", ""],
  ["Total planned tasks", ""],
  ["Completion rate", ""],
  ["Primary execution question", "Did I create enough real buyer conversations today?"],
  ["Decision rule", "If replies stay low, sharpen buyer pain and proof before sending more volume."],
];
dashboard.getRange("B6:B15").formulas = [
  [`=SUM('Daily Metrics'!H5:H${maxMetricsRow})`],
  ["=MAX(0,B5-B6)"],
  [`=SUM('Daily Metrics'!C5:C${maxMetricsRow})`],
  [`=SUM('Daily Metrics'!D5:D${maxMetricsRow})`],
  [`=SUM('Daily Metrics'!E5:E${maxMetricsRow})`],
  [`=SUM('Daily Metrics'!F5:F${maxMetricsRow})`],
  [`=SUM('Daily Metrics'!G5:G${maxMetricsRow})`],
  [`=COUNTIF('Daily Plan'!L5:L${maxPlanRow},"Done")`],
  [`=COUNTA('Daily Plan'!G5:G${maxPlanRow})`],
  ["=IF(B14=0,0,B13/B14)"],
];
styleHeader(dashboard.getRange("A4:B4"));
dashboard.getRange("A5:A17").format.font = { bold: true };
dashboard.getRange("B5:B7").setNumberFormat("\"$\"#,##0");
dashboard.getRange("B8:B14").setNumberFormat("#,##0");
dashboard.getRange("B15").setNumberFormat("0.0%");
dashboard.getRange("B16:B17").format.wrapText = true;
dashboard.getRange("A4:B17").format.borders = { preset: "all", style: "thin", color: colors.border };

dashboard.getRange("D4:H12").values = [
  ["Question", "July Answer", "Metric / Evidence", "Actual", "Notes"],
  ["What money do I need?", "$2,000 by Jul 31", "Committed revenue", "", ""],
  ["Who can realistically pay?", "Founder-led services, small SaaS, agencies, operators, warm tech contacts", "Qualified conversations", "", ""],
  ["What pain can I solve?", "Manual follow-up, onboarding, payments, reporting, dashboards, AI demos not production-ready", "Repeated pain patterns", "", ""],
  ["What proof can I show?", "SwimBuddz OS, StrokeLab, backend/API/product docs, automation workflow", "Proof link or screenshot sent", "", ""],
  ["What offer this week?", "Paid audit first, sprint if pain is urgent", "Offers/proposals sent", "", ""],
  ["How many conversations today?", "5-10 targeted buyer conversations on weekdays; 15-20 on Saturday", "Daily Metrics C", "", ""],
  ["What did market say back?", "Track objections, budget, urgency, decision owner, repeated pain", "Daily Metrics I:J", "", ""],
  ["What gets deprioritized?", "Community/subscription and broad StrokeLab build unless it creates proof or paid signal", "Time protected for sales", "", ""],
];
styleHeader(dashboard.getRange("D4:H4"));
dashboard.getRange("D5:H12").format.wrapText = true;
dashboard.getRange("D4:H12").format.borders = { preset: "all", style: "thin", color: colors.border };

dashboard.getRange("J4:N10").values = [
  ["Channel", "Role", "Target by Jul 31", "Actual", "Decision Rule"],
  ["Tech Gigs", "Main cash lane", "120+ targeted conversations, 5 calls, 2 proposals, 1 paid audit/sprint", "", "Double down if calls/proposals appear"],
  ["Corporate Wellness", "Secondary revenue", "15 corporate touches, 5 follow-ups, 1-2 intro calls", "", "Keep if warm paths reply"],
  ["Academy Cohorts", "Secondary cash/proof", "50 personal conversations, assessment/call block, payment/referral asks", "", "Push only high-intent leads"],
  ["StrokeLab", "Proof/signal", "20 targeted invites, 5 coach asks, paid-credit feedback", "", "Limit unless paid signal appears"],
  ["Weekly Review", "Control loop", "Every Friday/Sunday", "", "Fix the bottleneck, not the spreadsheet"],
  ["Primary Rule", "Execution", "Buyer conversations beat planning", "", "Track market signal daily"],
];
styleHeader(dashboard.getRange("J4:N4"));
dashboard.getRange("J5:N10").format.wrapText = true;
dashboard.getRange("J4:N10").format.borders = { preset: "all", style: "thin", color: colors.border };
setWidths(dashboard, { A: 28, B: 24, C: 3, D: 28, E: 54, F: 28, G: 14, H: 28, I: 3, J: 22, K: 22, L: 48, M: 14, N: 34 });

const metrics = workbook.worksheets.add("Daily Metrics");
metrics.showGridLines = false;
addTitle(metrics, "Daily Sales Metrics", "Fill this at the end of each day. The dashboard uses this sheet to track the $2k target and whether real buyer conversations are happening.", "J");
const metricHeaders = [["Date", "Day", "Conversations Started", "Replies", "Calls Booked", "Offers Made", "Proposals Sent", "Revenue Committed USD", "Market Signal / Objections", "Next Adjustment"]];
metrics.getRange("A4:J4").values = metricHeaders;
metrics.getRangeByIndexes(4, 0, metricRows.length, metricHeaders[0].length).values = metricRows;
styleHeader(metrics.getRange("A4:J4"));
metrics.getRange(`A5:A${maxMetricsRow}`).setNumberFormat("yyyy-mm-dd");
metrics.getRange(`C5:H${maxMetricsRow}`).setNumberFormat("#,##0");
metrics.getRange(`H5:H${maxMetricsRow}`).setNumberFormat("\"$\"#,##0");
metrics.getRange(`I5:J${maxMetricsRow}`).format.wrapText = true;
metrics.freezePanes.freezeRows(4);
metrics.getRange(`A4:J${maxMetricsRow}`).format.borders = { preset: "all", style: "thin", color: colors.border };
setWidths(metrics, { A: 12, B: 7, C: 19, D: 11, E: 13, F: 13, G: 14, H: 20, I: 54, J: 44 });
metrics.tables.add(`A4:J${maxMetricsRow}`, true, "DailyMetricsTable").style = "TableStyleMedium6";

const plan = workbook.worksheets.add("Daily Plan");
plan.showGridLines = false;
addTitle(plan, "Day-to-Day Execution Plan: Jul 8-31, 2026", "Update Status daily. The plan is now weighted toward buyer conversations, paid audit/sprint offers, and daily market feedback.", "P");
const planHeaders = [["Date", "Day", "Start Time", "End Time", "Channel", "Priority", "Task", "Action Steps", "Expected Output", "Success Metric", "Prospect / Asset", "Status", "Create Reminder", "Reminder Lead Mins", "Calendar Event ID", "Notes"]];
plan.getRange("A4:P4").values = planHeaders;
plan.getRangeByIndexes(4, 0, dailyRows.length, planHeaders[0].length).values = dailyRows;
styleHeader(plan.getRange("A4:P4"));
plan.getRange(`A5:A${maxPlanRow}`).setNumberFormat("yyyy-mm-dd");
plan.getRange(`H5:J${maxPlanRow}`).format.wrapText = true;
plan.getRange(`P5:P${maxPlanRow}`).format.wrapText = true;
plan.freezePanes.freezeRows(4);
setWidths(plan, { A: 12, B: 7, C: 10, D: 10, E: 19, F: 8, G: 31, H: 58, I: 30, J: 25, K: 22, L: 14, M: 15, N: 13, O: 22, P: 28 });
plan.getRange(`A4:P${maxPlanRow}`).format.borders = { preset: "all", style: "thin", color: colors.border };
plan.getRange(`L5:L${maxPlanRow}`).dataValidation = { rule: { type: "list", values: statuses } };
plan.getRange(`E5:E${maxPlanRow}`).dataValidation = { rule: { type: "list", values: channels } };
plan.getRange(`F5:F${maxPlanRow}`).dataValidation = { rule: { type: "list", values: priorities } };
plan.getRange(`M5:M${maxPlanRow}`).dataValidation = { rule: { type: "list", values: yesNo } };
for (let i = 0; i < dailyRows.length; i++) {
  const excelRow = i + 5;
  const channel = dailyRows[i][4];
  plan.getRange(`E${excelRow}`).format.fill = channelFill(channel);
  plan.getRange(`E${excelRow}`).format.font = { color: channelFont(channel), bold: true };
  if (dailyRows[i][5] === "P0") {
    plan.getRange(`F${excelRow}`).format.fill = "#FEF3C7";
    plan.getRange(`F${excelRow}`).format.font = { color: "#92400E", bold: true };
  }
}
plan.tables.add(`A4:P${maxPlanRow}`, true, "DailyPlanTable").style = "TableStyleMedium2";

const pipeline = workbook.worksheets.add("Pipeline Tracker");
pipeline.showGridLines = false;
addTitle(pipeline, "Revenue Pipeline Tracker", "Use this as the single source of truth for prospects, calls, offers, proposals, payments, and follow-ups. Fill USD Eq manually for non-USD opportunities if you want them counted toward the $2k goal.", "R");
pipeline.getRangeByIndexes(3, 0, pipelineRows.length, pipelineRows[0].length).values = pipelineRows;
styleHeader(pipeline.getRange("A4:R4"));
pipeline.getRange(`K5:L${maxPipelineRow}`).setNumberFormat("yyyy-mm-dd");
pipeline.getRange(`M5:M${maxPipelineRow}`).setNumberFormat("#,##0");
pipeline.getRange(`O5:O${maxPipelineRow}`).setNumberFormat("\"$\"#,##0");
pipeline.getRange(`P5:P${maxPipelineRow}`).setNumberFormat("0%");
pipeline.getRange(`Q5:Q${maxPipelineRow}`).formulasR1C1 = Array.from({ length: maxPipelineRow - 4 }, () => ["=IFERROR(RC[-2]*RC[-1],0)"]);
pipeline.getRange(`Q5:Q${maxPipelineRow}`).setNumberFormat("\"$\"#,##0");
pipeline.getRange(`F5:I${maxPipelineRow}`).format.wrapText = true;
pipeline.getRange(`R5:R${maxPipelineRow}`).format.wrapText = true;
pipeline.getRange(`C5:C${maxPipelineRow}`).dataValidation = { rule: { type: "list", values: channels.filter(c => c !== "Admin/Review") } };
pipeline.getRange(`J5:J${maxPipelineRow}`).dataValidation = { rule: { type: "list", values: pipelineStatuses } };
pipeline.getRange(`N5:N${maxPipelineRow}`).dataValidation = { rule: { type: "list", values: currencies } };
pipeline.freezePanes.freezeRows(4);
setWidths(pipeline, { A: 27, B: 20, C: 20, D: 26, E: 22, F: 42, G: 28, H: 28, I: 28, J: 16, K: 12, L: 12, M: 15, N: 12, O: 15, P: 12, Q: 15, R: 34 });
pipeline.getRange(`A4:R${maxPipelineRow}`).format.borders = { preset: "all", style: "thin", color: colors.border };
pipeline.tables.add(`A4:R${maxPipelineRow}`, true, "PipelineTable").style = "TableStyleMedium4";

const offers = workbook.worksheets.add("Offers & Templates");
offers.showGridLines = false;
addTitle(offers, "Offers, Scripts, and Message Templates", "Copy, personalize, send, then log the lead in Pipeline Tracker. This sheet is now specific around buyer, pain, proof, and paid first step.", "C");
offers.getRangeByIndexes(3, 0, offerRows.length, offerRows[0].length).values = offerRows;
styleHeader(offers.getRange("A4:C4"));
offers.getRange(`A4:C${offerRows.length + 3}`).format.borders = { preset: "all", style: "thin", color: colors.border };
offers.getRange(`C5:C${offerRows.length + 3}`).format.wrapText = true;
offers.freezePanes.freezeRows(4);
setWidths(offers, { A: 24, B: 34, C: 100 });
offers.tables.add(`A4:C${offerRows.length + 3}`, true, "OfferTemplatesTable").style = "TableStyleMedium9";

const config = workbook.worksheets.add("Reminder Config");
config.showGridLines = false;
addTitle(config, "Google Sheets Reminder Config", "After importing the workbook into Google Sheets, paste the code from Apps Script Code into Extensions > Apps Script.", "D");
config.getRange("A4:D14").values = [
  ["Setting", "Value", "Required?", "Notes"],
  ["Calendar ID", "", "No", "Leave blank to use your default Google Calendar. Or paste a specific calendar ID."],
  ["Daily Guide Email", "", "No", "Leave blank to use the active Google account email."],
  ["Daily Guide Hour", 7, "Yes", "The trigger sends the daily guide around this hour."],
  ["Calendar Batch Create Limit", 10, "Yes", "Creates only this many new events per run to avoid Google Calendar write throttling."],
  ["Calendar Write Sleep Ms", 300, "Yes", "Pause between writes. Increase if Google Calendar rate-limits you."],
  ["Plan Sheet Name", "Daily Plan", "Yes", "Do not rename the sheet unless you also update the script constant."],
  ["Status values treated as complete", "Done, Skipped", "Yes", "Completed/skipped tasks do not get new events or guide entries."],
  ["Setup Step 1", "Import this xlsx into Google Sheets", "Yes", "File > Import > Upload, or upload to Drive and open as Google Sheet."],
  ["Setup Step 2", "Open Extensions > Apps Script", "Yes", "Paste the code from Apps Script Code."],
  ["Setup Step 3", "Run onOpen once, then syncPlanReminders", "Yes", "Authorize Calendar/Mail permissions when prompted."],
];
styleHeader(config.getRange("A4:D4"));
config.getRange("A4:D14").format.borders = { preset: "all", style: "thin", color: colors.border };
config.getRange("B5:B14").format.wrapText = true;
config.getRange("D5:D14").format.wrapText = true;
setWidths(config, { A: 32, B: 48, C: 12, D: 72 });

const scriptSheet = workbook.worksheets.add("Apps Script Code");
scriptSheet.showGridLines = false;
addTitle(scriptSheet, "Google Apps Script Code", "Copy the code lines below into Google Sheets Apps Script. This version is idempotent and creates calendar events in small batches.", "C");
const codeLines = appScriptCode.split("\n");
scriptSheet.getRange("A4:C4").values = [["Line", "Code", "Purpose"]];
styleHeader(scriptSheet.getRange("A4:C4"));
scriptSheet.getRangeByIndexes(4, 0, codeLines.length, 3).values = codeLines.map((line, i) => [i + 1, line, i === 0 ? "Paste all code into Apps Script" : ""]);
scriptSheet.getRange(`A4:C${codeLines.length + 4}`).format.borders = { preset: "all", style: "thin", color: colors.border };
scriptSheet.getRange(`B5:B${codeLines.length + 4}`).format.font = { name: "Courier New", size: 9 };
scriptSheet.getRange(`B5:B${codeLines.length + 4}`).format.wrapText = false;
scriptSheet.freezePanes.freezeRows(4);
setWidths(scriptSheet, { A: 8, B: 112, C: 28 });

const sources = workbook.worksheets.add("Source Notes");
sources.showGridLines = false;
addTitle(sources, "Source Notes and Assumptions", "Local docs used to shape the revenue plan. Paths are plain text for auditability.", "C");
sources.getRangeByIndexes(3, 0, sourceRows.length, sourceRows[0].length).values = sourceRows;
styleHeader(sources.getRange("A4:C4"));
sources.getRange(`A4:C${sourceRows.length + 3}`).format.borders = { preset: "all", style: "thin", color: colors.border };
sources.getRange(`B5:C${sourceRows.length + 3}`).format.wrapText = true;
setWidths(sources, { A: 34, B: 82, C: 54 });

const lookups = workbook.worksheets.add("Lookups");
lookups.showGridLines = false;
lookups.getRange("A1:A5").values = channels.map(v => [v]);
lookups.getRange("B1:B5").values = statuses.map(v => [v]);
lookups.getRange("C1:C3").values = priorities.map(v => [v]);
lookups.getRange("D1:D2").values = yesNo.map(v => [v]);
lookups.getRange("E1:E9").values = pipelineStatuses.map(v => [v]);
lookups.getRange("F1:F3").values = currencies.map(v => [v]);
lookups.getRange("A1:F1").format.font = { bold: true };
setWidths(lookups, { A: 22, B: 16, C: 10, D: 10, E: 18, F: 14 });

for (const ws of [dashboard, metrics, plan, pipeline, offers, config, scriptSheet, sources, lookups]) {
  ws.getUsedRange()?.format.autofitRows();
}

await fs.mkdir(outputDir, { recursive: true });

const check = await workbook.inspect({
  kind: "table",
  sheetId: "Dashboard",
  range: "A4:N17",
  include: "values,formulas",
  tableMaxRows: 20,
  tableMaxCols: 14,
  maxChars: 7000,
});
console.log(check.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan",
  maxChars: 4000,
});
console.log(errors.ndjson);

const previewSheets = [
  ["Dashboard", "A1:N18"],
  ["Daily Metrics", "A1:J18"],
  ["Daily Plan", "A1:P24"],
  ["Pipeline Tracker", "A1:R18"],
  ["Offers & Templates", "A1:C24"],
  ["Reminder Config", "A1:D14"],
  ["Apps Script Code", "A1:C42"],
  ["Source Notes", "A1:C12"],
  ["Lookups", "A1:F10"],
];

for (const [sheetName, range] of previewSheets) {
  const preview = await workbook.render({ sheetName, range, scale: 1, format: "png" });
  const bytes = new Uint8Array(await preview.arrayBuffer());
  await fs.writeFile(`${outputDir}/preview_${sheetName.replaceAll(" ", "_")}.png`, bytes);
}

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(`saved ${outputPath}`);
