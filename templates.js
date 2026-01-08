/* templates.js
   Vibe Coded — Proof Engine Templates (v1.0-proof)

   buildFirst(problem, type) => files map:
   - README.md
   - architecture.md
   - assumptions.md
   - DISCLAIMER.md
   - assets/system-image.svg     (template varies by type)
   - assets/image-prompt.txt
   - static/index.html
   - static/styles.css
*/

(function () {
  const VERSION = "v1.0-proof";
  const BRAND = "Vibe Coded Studio";
  const TAGLINE = "Write the pain point. Get a first build.";
  const POWERED_BY = "Self-Defi";

  // -------------------------
  // Small utilities
  // -------------------------
  function esc(s = "") {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function normalizeProblem(raw) {
    const t = String(raw || "").trim();
    return t.length ? t : "I need a system that solves a clear operational problem.";
  }

  function normalizeType(raw) {
    const t = String(raw || "").trim();
    return t.length ? t : "AI automation system";
  }

  function safeRepoName(problem) {
    return normalizeProblem(problem)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "vibe-coded-build";
  }

  // -------------------------
  // Static scaffold CSS deliverable
  // -------------------------
  const STATIC_SCAFFOLD_CSS = `:root{
  --bg0:#070b14;
  --bg1:#0b1220;
  --card:rgba(255,255,255,.06);
  --border:rgba(255,255,255,.10);
  --text:rgba(255,255,255,.92);
  --muted:rgba(255,255,255,.68);
  --shadow:0 18px 60px rgba(0,0,0,.45);
  --radius:18px;
}
*{box-sizing:border-box}
html,body{height:100%}
body{
  margin:0;
  font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
  color:var(--text);
  background:
    radial-gradient(900px 480px at 12% 8%, rgba(217,70,141,.18), transparent 60%),
    radial-gradient(900px 520px at 82% 26%, rgba(80,140,255,.14), transparent 55%),
    linear-gradient(180deg, var(--bg0), var(--bg1));
}
.wrap{max-width:1020px;margin:0 auto;padding:26px 18px 46px}
.top{
  display:flex;align-items:center;justify-content:space-between;gap:12px;
  padding:10px 0 18px;border-bottom:1px solid var(--border);
}
.brand{font-weight:850;letter-spacing:.2px;font-size:18px}
.sub{margin-top:4px;color:var(--muted);font-size:13px}
.h1{margin:22px 0 8px;font-size:44px;line-height:1.06}
.p{margin:0 0 18px;color:var(--muted);font-size:16px}
.card{
  border:1px solid var(--border);
  background:rgba(255,255,255,.05);
  border-radius:var(--radius);
  box-shadow:var(--shadow);
  padding:16px;
}
.label{font-size:13px;color:var(--muted);margin:0 0 8px}
textarea{
  width:100%;
  min-height:120px;
  resize:vertical;
  border-radius:14px;
  border:1px solid var(--border);
  background:rgba(0,0,0,.15);
  color:var(--text);
  padding:14px;
  font-size:15px;
  outline:none;
}
.meta{font-size:12px;color:var(--muted);margin-top:8px;text-align:right}
.footer{
  margin-top:26px;
  padding-top:14px;
  border-top:1px solid var(--border);
  display:flex;
  justify-content:space-between;
  gap:12px;
  color:var(--muted);
  font-size:12px;
}`;

  function makeStaticIndexHTML({ problem, type, generatedAtISO }) {
    const safeProblem = esc(problem);
    const safeType = esc(type);
    const safeGen = esc(generatedAtISO);

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeType}</title>
  <link rel="stylesheet" href="./styles.css" />
  <style>${STATIC_SCAFFOLD_CSS}</style>
</head>
<body>
  <div class="wrap">
    <div class="top">
      <div>
        <div class="brand">${BRAND}</div>
        <div class="sub">${TAGLINE}</div>
      </div>
      <div class="sub">${VERSION}</div>
    </div>

    <div class="h1">Tell us what you want built.</div>
    <p class="p">It turns a written idea into something you can see, share, and build on.</p>

    <div class="card">
      <div class="label"><strong>System type:</strong> ${safeType}</div>
      <div class="label"><strong>Your request:</strong></div>
      <textarea readonly>${safeProblem}</textarea>
      <div class="meta">Generated: ${safeGen}</div>
    </div>

    <div class="footer">
      <div>${BRAND}<br/><span class="sub">Proof-first. No marketing claims.</span></div>
      <div>Powered by ${POWERED_BY}</div>
    </div>
  </div>
</body>
</html>`;
  }

  // -------------------------
  // Docs
  // -------------------------
  function makeReadmeMD(problem, type) {
    const repoName = safeRepoName(problem);
    return `# ${repoName}

**${BRAND} — Proof Engine**  
System type: **${type}**

![Status](https://img.shields.io/badge/status-${VERSION.replaceAll("-", "--")}-success)

## What this is
This repository contains a generated “first build” bundle — a deterministic starting point that turns a written problem statement into tangible artifacts:

- A deterministic system visualization (SVG)
- A documented architecture boundary
- A static scaffold suitable for iteration
- Explicit assumptions + limitations (Source of Truth rules)

## License
Released under the **Vibe Coded Source-Available License (${VERSION})**.  
Commercial use, resale, or SaaS deployment requires permission.

## Third-party
This project may include third-party open-source components.  
See \`THIRD_PARTY_NOTICES.md\` for details.

## Run
Open \`static/index.html\` directly, or serve with:
- \`python -m http.server 8080\`

## Ownership
You control the outputs.
`;
  }

  function makeArchitectureMD(type) {
    return `# Architecture Boundary (Starting Point)

**System type:** ${type}  
**Version:** ${VERSION}

## Inside boundary
- Request intake (problem statement)
- Deterministic artifact generation
- Documentation outputs (assumptions, architecture, disclaimer)
- System visualization (SVG)

## Outside boundary (explicit only)
- Hosting environment
- External data sources
- Third-party services / integrations
- Security, compliance, and legal validation

## Flow (generic)
Input → Processing → Automation → Output  
Optional: Source of Truth (SoT) storage + logs

## Non-goals
- Production claims
- Security guarantees
- Compliance guarantees
`;
  }

  function makeAssumptionsMD(problem, type) {
    return `# Assumptions Disclosure (Explicit)

**Version:** ${VERSION}  
**System type:** ${type}

Rule:
- Anything not stated verbatim is unknown.

Request (verbatim):
- ${problem}

Assumptions:
- The system can be expressed as a small number of stages (pipeline) to produce a deterministic diagram
- Default delivery is static, inspectable files (no backend implied)

Unknowns (must be stated explicitly to exist):
- Data source(s)
- Access model / permissions
- Compliance requirements (if any)
- SLA expectations
- Security requirements
`;
  }

  function makeDisclaimerMD() {
    return `# Meaning and Limitations (Critical)

**Version:** ${VERSION}

These generated files are a starting point.

They do NOT mean:
- Production readiness
- Security validation
- Compliance validation
- Guaranteed outcomes

Promotion is explicit and evidence-based:
Static artifact → Prototype → Systemized application → Production system.
`;
  }

  // -------------------------
  // Canonical image prompt (SoT)
  // -------------------------
  function makeImagePromptTXT(problem, type) {
    return `A high-fidelity system architecture visualization of a ${type} designed to solve "${problem}".
The image shows clearly defined components including input, processing logic, automation, and outputs.
Dark technical interface style, grid-based layout, modern infrastructure aesthetic, no people, no branding, no marketing visuals.
Clean, professional, engineered, and realistic — suitable for a technical architecture document.`;
  }

  // -------------------------
  // SVG Engine (better, per template)
  // -------------------------
  function svgBase({ title, subtitle, body, footer }) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="675" viewBox="0 0 1200 675" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="System architecture visualization">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#070b14"/>
      <stop offset="100%" stop-color="#0b1220"/>
    </linearGradient>

    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    </pattern>

    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="rgba(0,0,0,0.60)"/>
    </filter>

    <linearGradient id="card" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.06)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0.03)"/>
    </linearGradient>

    <style>
      .t{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial}
      .title{fill:rgba(255,255,255,0.94);font-size:44px;font-weight:850}
      .sub{fill:rgba(255,255,255,0.62);font-size:16px}
      .h{fill:rgba(255,255,255,0.92);font-size:16px;font-weight:800}
      .p{fill:rgba(255,255,255,0.68);font-size:14px}
      .foot{fill:rgba(255,255,255,0.52);font-size:13px}
    </style>
  </defs>

  <rect width="1200" height="675" fill="url(#bg)"/>
  <rect width="1200" height="675" fill="url(#grid)" opacity="0.55"/>

  <text x="64" y="88" class="t title">${esc(title)}</text>
  <text x="64" y="122" class="t sub">${esc(subtitle)}</text>

  <g filter="url(#softShadow)">
    ${body}
  </g>

  <text x="64" y="640" class="t foot">${esc(footer)}</text>
</svg>`;
  }

  function card(x, y, w, h, header, lines, accent) {
    const r = 18;
    const padX = 20;
    const headerY = y + 42;
    const firstLineY = y + 72;

    const linesSvg = (lines || []).map((t, i) => (
      `<text x="${x + padX}" y="${firstLineY + i*20}" class="t p">${esc(t)}</text>`
    )).join("");

    return `
    <g>
      <rect x="${x}" y="${y}" rx="${r}" ry="${r}" width="${w}" height="${h}" fill="url(#card)" stroke="rgba(255,255,255,0.10)"/>
      <rect x="${x}" y="${y}" rx="${r}" ry="${r}" width="${w}" height="7" fill="${accent}" opacity="0.95"/>
      <text x="${x + padX}" y="${headerY}" class="t h">${esc(header)}</text>
      ${linesSvg}
    </g>`;
  }

  function arrow(x1, y1, x2, y2, color = "rgba(217,70,141,0.88)") {
    // little arrowhead
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.max(1, Math.hypot(dx, dy));
    const ux = dx / len;
    const uy = dy / len;

    const ax = x2 - ux * 10;
    const ay = y2 - uy * 10;

    const leftX = ax + (-uy) * 6;
    const leftY = ay + (ux) * 6;
    const rightX = ax + (uy) * 6;
    const rightY = ay + (-ux) * 6;

    return `
    <g>
      <path d="M ${x1} ${y1} L ${x2} ${y2}" stroke="${color}" stroke-width="3" fill="none"/>
      <path d="M ${x2} ${y2} L ${leftX} ${leftY} L ${rightX} ${rightY} Z" fill="${color}"/>
    </g>`;
  }

  // ---- Templates ----

  function svgLeadGen(problem) {
    const title = "Lead Generation Pipeline";
    const subtitle = `Problem: ${problem}`;

    const y = 220;
    const boxH = 120;

    const b1 = card(90,  y, 260, boxH, "Lead Sources", ["Website / forms", "Lists / CSV", "Inbound signals"], "#5cc8ff");
    const b2 = card(375, y, 280, boxH, "Enrichment + Scoring", ["Validate fields", "Score intent", "Deduplicate"], "#57f287");
    const b3 = card(685, y, 280, boxH, "Outreach Automation", ["Email / DM", "Follow-ups", "Routing rules"], "#ffd166");
    const b4 = card(995, y, 200, boxH, "Handoff", ["Calendar link", "CRM update", "Owner notified"], "#c084fc");

    const sot = card(375, 400, 820, 125, "Source of Truth (SoT)", [
      "Leads table",
      "Activity log",
      "Status (new → contacted → booked → closed)"
    ], "#5cc8ff");

    const body = `
      ${b1}${b2}${b3}${b4}${sot}
      ${arrow(350, 280, 375, 280)}
      ${arrow(655, 280, 685, 280)}
      ${arrow(965, 280, 995, 280)}

      ${arrow(515, 340, 515, 400)}
      ${arrow(825, 340, 825, 400)}
      ${arrow(1095, 340, 1095, 400)}
    `;

    return svgBase({
      title,
      subtitle,
      body,
      footer: "Basic pipeline diagram — proof-first. No branding. No marketing claims."
    });
  }

  function svgAIAutomation(problem) {
    const title = "AI Automation System";
    const subtitle = `Problem: ${problem}`;

    const b1 = card(90, 220, 260, 125, "Inputs", ["User request", "Events / webhooks", "Imports (explicit)"], "#5cc8ff");
    const b2 = card(375, 220, 300, 125, "AI Processing", ["Classify / extract", "Rules + validation", "Decision routing"], "#57f287");
    const b3 = card(705, 220, 300, 125, "Automation", ["Triggers", "Actions", "Retries / alerts"], "#ffd166");
    const b4 = card(1035, 220, 140, 125, "Outputs", ["Files", "Updates", "Notifications"], "#c084fc");

    const sot = card(375, 400, 800, 125, "Source of Truth (SoT)", ["Audit log", "Config + versions", "State snapshots"], "#5cc8ff");

    const body = `
      ${b1}${b2}${b3}${b4}${sot}
      ${arrow(350, 282, 375, 282)}
      ${arrow(675, 282, 705, 282)}
      ${arrow(1005, 282, 1035, 282)}

      ${arrow(525, 345, 525, 400)}
      ${arrow(855, 345, 855, 400)}
      ${arrow(1105, 345, 1105, 400)}
    `;

    return svgBase({
      title,
      subtitle,
      body,
      footer: "Deterministic first-pass diagram — suitable for architecture docs."
    });
  }

  function svgWorkflowAutomation(problem) {
    const title = "Workflow Automation";
    const subtitle = `Problem: ${problem}`;

    const b1 = card(90, 220, 270, 125, "Intake", ["Form / email / ticket", "Required fields", "Validation"], "#5cc8ff");
    const b2 = card(390, 220, 300, 125, "Workflow Logic", ["States + rules", "Approvals (optional)", "Timers / SLAs"], "#57f287");
    const b3 = card(720, 220, 300, 125, "Automation Actions", ["Assign / notify", "Create tasks", "Escalate"], "#ffd166");
    const b4 = card(1050, 220, 125, 125, "Outputs", ["Reports", "Logs", "Artifacts"], "#c084fc");

    const sot = card(390, 400, 785, 125, "Source of Truth (SoT)", ["State history", "Who changed what", "Versioned rules"], "#5cc8ff");

    const body = `
      ${b1}${b2}${b3}${b4}${sot}
      ${arrow(360, 282, 390, 282)}
      ${arrow(690, 282, 720, 282)}
      ${arrow(1020, 282, 1050, 282)}

      ${arrow(540, 345, 540, 400)}
      ${arrow(870, 345, 870, 400)}
      ${arrow(1115, 345, 1115, 400)}
    `;

    return svgBase({
      title,
      subtitle,
      body,
      footer: "Workflow view — proof-first. Nothing implied beyond what is written."
    });
  }

  function svgDataIntakeProcessing(problem) {
    const title = "Data Intake + Processing";
    const subtitle = `Problem: ${problem}`;

    const b1 = card(90, 220, 270, 125, "Sources", ["CSV / sheets", "APIs (explicit)", "Events"], "#5cc8ff");
    const b2 = card(390, 220, 300, 125, "Ingestion", ["Normalize", "Validate", "Deduplicate"], "#57f287");
    const b3 = card(720, 220, 300, 125, "Processing", ["Transform", "Enrich (explicit)", "Compute outputs"], "#ffd166");
    const b4 = card(1050, 220, 125, 125, "Deliver", ["Exports", "Dashboards", "Reports"], "#c084fc");

    const sot = card(390, 400, 785, 125, "Source of Truth (SoT)", ["Tables / schemas", "Lineage notes", "Versioned mappings"], "#5cc8ff");

    const body = `
      ${b1}${b2}${b3}${b4}${sot}
      ${arrow(360, 282, 390, 282)}
      ${arrow(690, 282, 720, 282)}
      ${arrow(1020, 282, 1050, 282)}

      ${arrow(540, 345, 540, 400)}
      ${arrow(870, 345, 870, 400)}
      ${arrow(1115, 345, 1115, 400)}
    `;

    return svgBase({
      title,
      subtitle,
      body,
      footer: "Deterministic pipeline diagram — no implied legality, deliverability, or compliance."
    });
  }

  function svgDAOGovernance(problem) {
    const title = "DAO Governance System";
    const subtitle = `Problem: ${problem}`;

    const b1 = card(90, 220, 260, 125, "Proposal Intake", ["Scope statement", "Constraints", "Owner + timeline"], "#5cc8ff");
    const b2 = card(375, 220, 280, 125, "Deliberation", ["Discussion", "Revisions", "Risk notes"], "#57f287");
    const b3 = card(685, 220, 280, 125, "Voting", ["Eligibility rules", "Quorum / threshold", "Time window"], "#ffd166");
    const b4 = card(995, 220, 200, 125, "Execution", ["Multisig action", "Timelock", "On-chain record"], "#c084fc");

    const sot = card(375, 400, 820, 125, "Source of Truth (SoT)", ["Proposal registry", "Vote receipts", "Execution log"], "#5cc8ff");

    const body = `
      ${b1}${b2}${b3}${b4}${sot}
      ${arrow(350, 282, 375, 282)}
      ${arrow(655, 282, 685, 282)}
      ${arrow(965, 282, 995, 282)}

      ${arrow(515, 345, 515, 400)}
      ${arrow(825, 345, 825, 400)}
      ${arrow(1095, 345, 1095, 400)}
    `;

    return svgBase({
      title,
      subtitle,
      body,
      footer: "Governance flow — proof-first. No implied security guarantees."
    });
  }

  function svgCustodyWorkflow(problem) {
    const title = "Non-Custodial Custody Workflow";
    const subtitle = `Problem: ${problem}`;

    const b1 = card(90, 220, 270, 125, "Key Control", ["Hardware wallet", "Seed storage policy", "Signer roles"], "#5cc8ff");
    const b2 = card(390, 220, 300, 125, "Policy + Approvals", ["Spending rules", "Multisig threshold", "Change control"], "#57f287");
    const b3 = card(720, 220, 300, 125, "Transaction Flow", ["Build → sign", "Broadcast", "Confirmations"], "#ffd166");
    const b4 = card(1050, 220, 125, 125, "Monitoring", ["Alerts", "Balances", "Audit checks"], "#c084fc");

    const sot = card(390, 400, 785, 125, "Source of Truth (SoT)", ["Addresses list", "Signer roster", "Policy versions"], "#5cc8ff");

    const body = `
      ${b1}${b2}${b3}${b4}${sot}
      ${arrow(360, 282, 390, 282)}
      ${arrow(690, 282, 720, 282)}
      ${arrow(1020, 282, 1050, 282)}

      ${arrow(540, 345, 540, 400)}
      ${arrow(870, 345, 870, 400)}
      ${arrow(1115, 345, 1115, 400)}
    `;

    return svgBase({
      title,
      subtitle,
      body,
      footer: "Custody workflow — non-custodial by design. No marketing claims."
    });
  }

  function buildSystemSvg(type, problem) {
    const t = normalizeType(type).toLowerCase();

    if (t.includes("lead generation")) return svgLeadGen(problem);
    if (t.includes("ai automation")) return svgAIAutomation(problem);
    if (t.includes("workflow automation")) return svgWorkflowAutomation(problem);
    if (t.includes("data intake")) return svgDataIntakeProcessing(problem);
    if (t.includes("dao")) return svgDAOGovernance(problem);
    if (t.includes("non-custodial")) return svgCustodyWorkflow(problem);

    // fallback
    return svgAIAutomation(problem);
  }

  // -------------------------
  // Public API
  // -------------------------
  function buildFirst(problemRaw, typeRaw) {
    const problem = normalizeProblem(problemRaw);
    const type = normalizeType(typeRaw);
    const generatedAtISO = nowISO();

    const svg = buildSystemSvg(type, problem);
    const prompt = makeImagePromptTXT(problem, type);

    return {
      "README.md": makeReadmeMD(problem, type),
      "architecture.md": makeArchitectureMD(type),
      "assumptions.md": makeAssumptionsMD(problem, type),
      "DISCLAIMER.md": makeDisclaimerMD(),
      "assets/system-image.svg": svg,
      "assets/image-prompt.txt": prompt,
      "static/index.html": makeStaticIndexHTML({ problem, type, generatedAtISO }),
      "static/styles.css": STATIC_SCAFFOLD_CSS
    };
  }

  window.__TEMPLATES_READY__ = true;
  window.VIBE_FIRST_BUILD = { buildFirst };
  window.BUILD_TEMPLATE = window.VIBE_FIRST_BUILD;

  console.log(`templates.js loaded: ${BRAND} ${VERSION} (Proof Engine templates ready).`);
})();
