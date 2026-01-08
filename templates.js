/* templates.js
   Vibe Coded — Proof Engine Templates (v1.0-proof)
   - Provides per-option diagram templates
   - Generates deterministic SVGs that actually change by system type + pain point
   - Exposes: window.VIBE_CODED_TEMPLATES.build({ type, pain })
*/

(() => {
  // -----------------------------
  // Utilities
  // -----------------------------
  function escXml(s = "") {
    return String(s).replace(/[<>&'"]/g, (c) => ({
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "'": "&apos;",
      '"': "&quot;",
    }[c]));
  }

  function escHtml(s = "") {
    return String(s).replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[m]));
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function safeName(str) {
    return (str || "vibe-coded-proof")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "vibe-coded-proof";
  }

  function normalizePain(raw) {
    const t = String(raw || "").trim();
    return t.length ? t : "I need a simple system that solves a clear operational problem.";
  }

  // -----------------------------
  // Canonical image prompt (SoT)
  // -----------------------------
  function canonicalPrompt(type, pain) {
    return `A high-fidelity system architecture visualization of a ${type} designed to solve "${pain}".
The image shows clearly defined components including input, processing logic, automation, and outputs.
Dark technical interface style, grid-based layout, modern infrastructure aesthetic, no people, no branding, no marketing visuals.
Clean, professional, engineered, and realistic — suitable for a technical architecture document.`;
  }

  // -----------------------------
  // SVG builder primitives
  // -----------------------------
  function svgShell({ title, subtitle, bodySvg, footer }) {
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
      <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="rgba(0,0,0,0.55)"/>
    </filter>
  </defs>

  <rect width="1200" height="675" fill="url(#bg)"/>
  <rect width="1200" height="675" fill="url(#grid)" opacity="0.55"/>

  <text x="64" y="78" fill="rgba(255,255,255,0.92)" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-size="34" font-weight="900">
    ${escXml(title)}
  </text>
  <text x="64" y="112" fill="rgba(255,255,255,0.62)" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-size="16">
    ${escXml(subtitle)}
  </text>

  <g filter="url(#softShadow)">
    ${bodySvg}
  </g>

  <text x="64" y="626" fill="rgba(255,255,255,0.55)" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-size="13">
    ${escXml(footer)}
  </text>
</svg>`;
  }

  function box({ x, y, w, h, title, lines, accent = "#5cc8ff" }) {
    const r = 18;
    const padX = 18;
    const lineY1 = y + 66;
    const linesSvg = (lines || []).map((t, i) => (
      `<text x="${x + padX}" y="${lineY1 + i * 20}" fill="rgba(255,255,255,0.70)" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-size="14">${escXml(t)}</text>`
    )).join("");

    return `
    <g>
      <rect x="${x}" y="${y}" rx="${r}" ry="${r}" width="${w}" height="${h}" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)"/>
      <rect x="${x}" y="${y}" rx="${r}" ry="${r}" width="${w}" height="6" fill="${accent}" opacity="0.95"/>
      <text x="${x + padX}" y="${y + 38}" fill="rgba(255,255,255,0.92)" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-size="16" font-weight="900">${escXml(title)}</text>
      ${linesSvg}
    </g>`;
  }

  function arrow({ x1, y1, x2, y2, color = "rgba(217,70,141,0.85)" }) {
    // Small arrow head
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const ux = dx / len;
    const uy = dy / len;

    // Arrow head points
    const hx = x2 - ux * 12;
    const hy = y2 - uy * 12;
    const leftX = hx + (-uy) * 6;
    const leftY = hy + (ux) * 6;
    const rightX = hx + (uy) * 6;
    const rightY = hy + (-ux) * 6;

    return `
    <g>
      <path d="M ${x1} ${y1} L ${x2} ${y2}" stroke="${color}" stroke-width="3" fill="none"/>
      <path d="M ${x2} ${y2} L ${leftX} ${leftY} L ${rightX} ${rightY} Z" fill="${color}"/>
    </g>`;
  }

  // -----------------------------
  // Per-template diagram builders
  // (basic, easy to follow — like you requested)
  // -----------------------------
  function diagramLeadGen(pain) {
    // 4-column: Sources → Qualification → Outreach → Handoff
    const body =
      box({ x: 70,  y: 190, w: 260, h: 120, title: "Lead Sources", accent: "#5cc8ff", lines: ["Website / forms", "Lists / CSV", "Inbound signals"] }) +
      box({ x: 350, y: 190, w: 260, h: 120, title: "Enrichment + Scoring", accent: "#57f287", lines: ["Validate fields", "Score intent", "Deduplicate"] }) +
      box({ x: 630, y: 190, w: 260, h: 120, title: "Outreach Automation", accent: "#ffd166", lines: ["Email / DM", "Follow-ups", "Routing rules"] }) +
      box({ x: 910, y: 190, w: 220, h: 120, title: "Handoff", accent: "#c084fc", lines: ["Calendar link", "CRM update", "Owner notified"] }) +
      box({ x: 350, y: 360, w: 780, h: 120, title: "Source of Truth (SoT)", accent: "#5cc8ff", lines: ["Leads table", "Activity log", "Status (new → contacted → booked → closed)"] }) +
      arrow({ x1: 330, y1: 250, x2: 350, y2: 250 }) +
      arrow({ x1: 610, y1: 250, x2: 630, y2: 250 }) +
      arrow({ x1: 890, y1: 250, x2: 910, y2: 250 }) +
      arrow({ x1: 480, y1: 310, x2: 480, y2: 360 }) +
      arrow({ x1: 760, y1: 310, x2: 760, y2: 360 }) +
      arrow({ x1: 1020, y1: 310, x2: 1020, y2: 360 });

    return svgShell({
      title: "Lead Generation Pipeline",
      subtitle: `Problem: ${pain}`,
      bodySvg: body,
      footer: "Basic pipeline diagram — proof-first. No branding. No marketing claims."
    });
  }

  function diagramAIAutomation(pain) {
    // Basic AI automation: Intake → AI processing → Actions → Results (+ SoT)
    const body =
      box({ x: 80,  y: 200, w: 260, h: 120, title: "Input", accent: "#5cc8ff", lines: ["Form / email", "Webhook", "File drop"] }) +
      box({ x: 360, y: 200, w: 280, h: 120, title: "AI Processing", accent: "#57f287", lines: ["Extract fields", "Classify intent", "Generate response"] }) +
      box({ x: 660, y: 200, w: 280, h: 120, title: "Automation", accent: "#ffd166", lines: ["Route", "Create tasks", "Send messages"] }) +
      box({ x: 960, y: 200, w: 180, h: 120, title: "Outputs", accent: "#c084fc", lines: ["Updates", "Reports", "Notifications"] }) +
      box({ x: 360, y: 370, w: 780, h: 120, title: "Source of Truth (SoT)", accent: "#5cc8ff", lines: ["Records", "Audit log", "Statuses + timestamps"] }) +
      arrow({ x1: 340, y1: 260, x2: 360, y2: 260 }) +
      arrow({ x1: 640, y1: 260, x2: 660, y2: 260 }) +
      arrow({ x1: 940, y1: 260, x2: 960, y2: 260 }) +
      arrow({ x1: 520, y1: 320, x2: 520, y2: 370 }) +
      arrow({ x1: 800, y1: 320, x2: 800, y2: 370 }) +
      arrow({ x1: 1050, y1: 320, x2: 1050, y2: 370 });

    return svgShell({
      title: "AI Automation Flow",
      subtitle: `Problem: ${pain}`,
      bodySvg: body,
      footer: "Basic AI automation diagram — proof-first. No branding. No marketing claims."
    });
  }

  function diagramWorkflowAutomation(pain) {
    // Workflow: Intake → Queue → Human/Auto step → Completion (+ SoT)
    const body =
      box({ x: 90,  y: 200, w: 260, h: 120, title: "Intake", accent: "#5cc8ff", lines: ["Request captured", "Minimum fields", "Validation"] }) +
      box({ x: 370, y: 200, w: 260, h: 120, title: "Queue", accent: "#57f287", lines: ["Prioritize", "Assign owner", "SLA timer"] }) +
      box({ x: 650, y: 200, w: 260, h: 120, title: "Steps", accent: "#ffd166", lines: ["Auto actions", "Human approvals", "Escalations"] }) +
      box({ x: 930, y: 200, w: 220, h: 120, title: "Done", accent: "#c084fc", lines: ["Delivered", "Logged", "Notified"] }) +
      box({ x: 370, y: 370, w: 780, h: 120, title: "Source of Truth (SoT)", accent: "#5cc8ff", lines: ["State machine", "Owner + timestamps", "History / notes"] }) +
      arrow({ x1: 350, y1: 260, x2: 370, y2: 260 }) +
      arrow({ x1: 630, y1: 260, x2: 650, y2: 260 }) +
      arrow({ x1: 910, y1: 260, x2: 930, y2: 260 }) +
      arrow({ x1: 520, y1: 320, x2: 520, y2: 370 }) +
      arrow({ x1: 800, y1: 320, x2: 800, y2: 370 }) +
      arrow({ x1: 1040, y1: 320, x2: 1040, y2: 370 });

    return svgShell({
      title: "Workflow Automation",
      subtitle: `Problem: ${pain}`,
      bodySvg: body,
      footer: "Basic workflow diagram — proof-first. No branding. No marketing claims."
    });
  }

  function diagramDataIntakeProcessing(pain) {
    // Data: Collect → Clean → Transform → Deliver (+ SoT)
    const body =
      box({ x: 80,  y: 200, w: 260, h: 120, title: "Collect", accent: "#5cc8ff", lines: ["Upload / API", "Schema check", "Reject invalid"] }) +
      box({ x: 360, y: 200, w: 260, h: 120, title: "Clean", accent: "#57f287", lines: ["Normalize", "Deduplicate", "Fill gaps"] }) +
      box({ x: 640, y: 200, w: 260, h: 120, title: "Transform", accent: "#ffd166", lines: ["Derive fields", "Aggregate", "Rules"] }) +
      box({ x: 920, y: 200, w: 220, h: 120, title: "Deliver", accent: "#c084fc", lines: ["Export", "Dashboard", "Alerts"] }) +
      box({ x: 360, y: 370, w: 780, h: 120, title: "Source of Truth (SoT)", accent: "#5cc8ff", lines: ["Raw + processed tables", "Lineage", "Run logs"] }) +
      arrow({ x1: 340, y1: 260, x2: 360, y2: 260 }) +
      arrow({ x1: 620, y1: 260, x2: 640, y2: 260 }) +
      arrow({ x1: 900, y1: 260, x2: 920, y2: 260 }) +
      arrow({ x1: 500, y1: 320, x2: 500, y2: 370 }) +
      arrow({ x1: 780, y1: 320, x2: 780, y2: 370 }) +
      arrow({ x1: 1030, y1: 320, x2: 1030, y2: 370 });

    return svgShell({
      title: "Data Intake + Processing",
      subtitle: `Problem: ${pain}`,
      bodySvg: body,
      footer: "Basic data flow diagram — proof-first. No branding. No marketing claims."
    });
  }

  function diagramDAOGovernance(pain) {
    // DAO: Proposal → Review → Vote/Sign → Execute (+ SoT)
    const body =
      box({ x: 80,  y: 200, w: 260, h: 120, title: "Proposal", accent: "#5cc8ff", lines: ["Draft action", "Attach evidence", "Define scope"] }) +
      box({ x: 360, y: 200, w: 260, h: 120, title: "Review", accent: "#57f287", lines: ["Rules check", "Risk notes", "Signer brief"] }) +
      box({ x: 640, y: 200, w: 260, h: 120, title: "Approve", accent: "#ffd166", lines: ["Vote or sign", "Threshold met", "Time lock (optional)"] }) +
      box({ x: 920, y: 200, w: 220, h: 120, title: "Execute", accent: "#c084fc", lines: ["Transaction", "Receipt", "Publish result"] }) +
      box({ x: 360, y: 370, w: 780, h: 120, title: "Source of Truth (SoT)", accent: "#5cc8ff", lines: ["Proposals", "Signer actions", "On-chain refs + logs"] }) +
      arrow({ x1: 340, y1: 260, x2: 360, y2: 260 }) +
      arrow({ x1: 620, y1: 260, x2: 640, y2: 260 }) +
      arrow({ x1: 900, y1: 260, x2: 920, y2: 260 }) +
      arrow({ x1: 500, y1: 320, x2: 500, y2: 370 }) +
      arrow({ x1: 780, y1: 320, x2: 780, y2: 370 }) +
      arrow({ x1: 1030, y1: 320, x2: 1030, y2: 370 });

    return svgShell({
      title: "DAO Governance Flow",
      subtitle: `Problem: ${pain}`,
      bodySvg: body,
      footer: "Basic DAO flow diagram — proof-first. No branding. No marketing claims."
    });
  }

  function diagramNonCustodialCustody(pain) {
    // Custody: Keys → Wallet → Transactions → Verification (+ SoT)
    const body =
      box({ x: 80,  y: 200, w: 260, h: 120, title: "Key Setup", accent: "#5cc8ff", lines: ["Cold storage", "Backup plan", "Signer roles"] }) +
      box({ x: 360, y: 200, w: 260, h: 120, title: "Wallet Control", accent: "#57f287", lines: ["Policy / multisig", "Addresses", "Spending rules"] }) +
      box({ x: 640, y: 200, w: 260, h: 120, title: "Transactions", accent: "#ffd166", lines: ["Create", "Sign", "Broadcast"] }) +
      box({ x: 920, y: 200, w: 220, h: 120, title: "Verification", accent: "#c084fc", lines: ["Confirmations", "Audit trail", "Reporting"] }) +
      box({ x: 360, y: 370, w: 780, h: 120, title: "Source of Truth (SoT)", accent: "#5cc8ff", lines: ["Policy docs", "Address book", "Tx log + notes"] }) +
      arrow({ x1: 340, y1: 260, x2: 360, y2: 260 }) +
      arrow({ x1: 620, y1: 260, x2: 640, y2: 260 }) +
      arrow({ x1: 900, y1: 260, x2: 920, y2: 260 }) +
      arrow({ x1: 500, y1: 320, x2: 500, y2: 370 }) +
      arrow({ x1: 780, y1: 320, x2: 780, y2: 370 }) +
      arrow({ x1: 1030, y1: 320, x2: 1030, y2: 370 });

    return svgShell({
      title: "Non-Custodial Custody Workflow",
      subtitle: `Problem: ${pain}`,
      bodySvg: body,
      footer: "Basic custody workflow — proof-first. No branding. No marketing claims."
    });
  }

  // Map your dropdown labels -> diagram builders
  const DIAGRAMS = {
    "Lead generation pipeline": diagramLeadGen,
    "AI automation system": diagramAIAutomation,
    "Workflow automation": diagramWorkflowAutomation,
    "Data intake + processing system": diagramDataIntakeProcessing,
    "DAO governance system": diagramDAOGovernance,
    "Non-custodial custody workflow": diagramNonCustodialCustody,
  };

  // -----------------------------
  // Repo file generator
  // -----------------------------
  function buildRepoFiles({ type, pain, prompt, svg }) {
    const repoName = safeName(pain);

    const README = `# ${repoName}
![Status](https://img.shields.io/badge/status-v1.0--proof-success)

This repository is the result of a documented system to bring instant infrastructure to a random thought or specific solution to a problem.

**Tagline:** Proof Engine

This repository is released under the **Vibe Coded Source-Available License (v1.0-proof)**.
Commercial use, resale, or SaaS deployment requires permission.

This project includes third-party open-source components.
See THIRD_PARTY_NOTICES.md for details.
`;

    const ARCH = `# System Boundary

Inside:
- Request intake
- Structured first build generation
- Deterministic artifacts (docs + scaffold + visualization)

Outside:
- Hosting environment
- External data sources (unless explicitly provided)
- External services (unless explicitly integrated)

# Flow
Input -> Processing -> Automation -> Output
Plus: Source of Truth (SoT)

# Non-goals
- Production claims
- Security guarantees
- Compliance guarantees
`;

    const ASSUMPTIONS = `# Assumptions Disclosure (Explicit)

Rule:
- Anything not stated verbatim is unknown.

Request (verbatim):
- ${pain}

Assumption: The request can be represented as a basic flow diagram
Reason: Proof-first visualization with minimal complexity

Unknowns:
- Scale targets
- Security requirements
- Compliance requirements
- Data quality/availability
`;

    const DISCLAIMER = `# Meaning and Limitations (Critical)

These generated files are a starting point.

They do NOT mean:
- Complete system
- Production readiness
- Security validation
- Compliance validation

Maturity promotion is explicit and evidence-based:
Proof artifact -> Prototype -> Systemized application -> Production system.
`;

    // static scaffold (simple, links to svg)
    const STATIC_INDEX = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escHtml(repoName)}</title>
  <link rel="stylesheet" href="./styles.css" />
</head>
<body>
  <main class="wrap">
    <header class="top">
      <div>
        <div class="brand">Vibe Coded</div>
        <div class="sub">Proof Engine — first build artifacts</div>
      </div>
      <div class="pill">v1.0-proof</div>
    </header>

    <h1>${escHtml(type)}</h1>
    <p class="muted"><strong>Problem:</strong> ${escHtml(pain)}</p>

    <section class="card">
      <h2>System Diagram (SVG)</h2>
      <div class="img">
        <img src="../assets/system-image.svg" alt="System architecture visualization" />
      </div>
      <p class="muted">Deterministic diagram meant to be easy to follow.</p>
    </section>

    <section class="card">
      <h2>Boundaries</h2>
      <ul class="muted">
        <li>Starting point only — not production readiness</li>
        <li>No security validation implied</li>
        <li>No compliance guarantees implied</li>
        <li>Anything not stated is unknown</li>
      </ul>
    </section>

    <footer class="foot">
      <span class="muted">Powered by Self-Defi</span>
    </footer>
  </main>
</body>
</html>`;

    const STATIC_CSS = `:root{
  --bg0:#070b14; --bg1:#0b1220;
  --text:rgba(255,255,255,.92);
  --muted:rgba(255,255,255,.68);
  --border:rgba(255,255,255,.12);
  --card:rgba(255,255,255,.04);
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
    radial-gradient(900px 520px at 14% 10%, rgba(217,70,141,.18), transparent 60%),
    radial-gradient(900px 520px at 86% 20%, rgba(80,140,255,.14), transparent 55%),
    linear-gradient(180deg, var(--bg0), var(--bg1));
}
.wrap{max-width:980px;margin:0 auto;padding:26px 18px 50px}
.top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;border-bottom:1px solid var(--border);padding-bottom:14px;margin-bottom:14px}
.brand{font-weight:900;letter-spacing:.2px}
.sub{color:var(--muted);font-size:13px;margin-top:4px}
.pill{border:1px solid var(--border);border-radius:999px;padding:8px 10px;background:rgba(255,255,255,.03);font-size:12px;color:var(--muted)}
h1{margin:16px 0 8px;font-size:34px;line-height:1.12}
.muted{color:var(--muted);line-height:1.55}
.card{border:1px solid var(--border);background:var(--card);border-radius:var(--radius);box-shadow:var(--shadow);padding:16px;margin-top:12px}
.img{border:1px dashed rgba(255,255,255,.18);border-radius:16px;background:rgba(0,0,0,.18);padding:12px}
.img img{width:100%;height:auto;display:block}
.foot{margin-top:18px;padding-top:14px;border-top:1px solid var(--border)}
`;

    return {
      "README.md": README,
      "architecture.md": ARCH,
      "assumptions.md": ASSUMPTIONS,
      "DISCLAIMER.md": DISCLAIMER,
      "assets/image-prompt.txt": prompt,
      "assets/system-image.svg": svg,
      "static/index.html": STATIC_INDEX,
      "static/styles.css": STATIC_CSS,
    };
  }

  // -----------------------------
  // Public API
  // -----------------------------
  function build({ type, pain }) {
    const t = String(type || "").trim() || "AI automation system";
    const p = normalizePain(pain);

    const prompt = canonicalPrompt(t, p);

    // choose diagram by type; fallback to AI automation
    const diagramFn = DIAGRAMS[t] || diagramAIAutomation;
    const svg = diagramFn(p);

    const files = buildRepoFiles({ type: t, pain: p, prompt, svg });

    return {
      type: t,
      pain: p,
      prompt,
      svg,
      files,
      generatedAtISO: nowISO(),
    };
  }

  window.__TEMPLATES_READY__ = true;
  window.VIBE_CODED_TEMPLATES = { build };

  console.log("templates.js loaded: VIBE_CODED_TEMPLATES.build ready (v1.0-proof).");
})();
