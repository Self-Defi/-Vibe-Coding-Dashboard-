/* templates.js
   Vibe Coded — First-Build Templates (proof engine)
   Output bundle shape (minimum):
   - README.md
   - architecture.md
   - assumptions.md
   - DISCLAIMER.md
   - assets/system-image.svg
   - assets/image-prompt.txt
   - static/index.html
   - static/styles.css
*/

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
    radial-gradient(900px 480px at 12% 8%, rgba(192,132,252,.18), transparent 60%),
    radial-gradient(900px 520px at 82% 26%, rgba(92,200,255,.14), transparent 55%),
    linear-gradient(180deg, var(--bg0), var(--bg1));
}

.wrap{max-width:1020px;margin:0 auto;padding:26px 18px 46px}
.top{
  display:flex;align-items:center;justify-content:space-between;gap:12px;
  padding:10px 0 18px;border-bottom:1px solid var(--border);
}
.brand{font-weight:800;letter-spacing:.2px;font-size:18px}
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
}
`;

function makeStaticIndexHTML({ problem, generatedAtISO }) {
  const safeProblem = esc(problem);
  const safeGen = esc(generatedAtISO);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeProblem}</title>

  <link rel="stylesheet" href="./styles.css" />

  <style>
${STATIC_SCAFFOLD_CSS}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="top">
      <div>
        <div class="brand">Vibe Coded</div>
        <div class="sub">Write the pain point. Get a first build.</div>
      </div>
    </div>

    <div class="h1">Tell us what you want built.</div>
    <p class="p">It turns a written idea into something you can see, share, and build on.</p>

    <div class="card">
      <div class="meta">Generated: ${safeGen}</div>
      <div class="label"><strong>Your request</strong><br/>Explain the pain point you want solved.</div>
      <textarea readonly>${safeProblem}</textarea>
    </div>

    <div class="footer">
      <div>Vibe Coded Studio<br/><span class="sub">Simple front-stage. Rigid standards behind the curtain.</span></div>
      <div>Powered by Self-Defi</div>
    </div>
  </div>
</body>
</html>`;
}

function makeAssumptionsMD(problem) {
  const p = normalizeProblem(problem);
  return `# Assumptions Disclosure (Explicit)

Rule:
- Anything not stated verbatim is unknown.

Assumption: The request is represented with a type-shaped diagram template
Reason: Prevents the “same diagram every time” failure mode.

Assumption: Default delivery is a static scaffold
Reason: Tangible proof without implying backend services.

Request (verbatim):
- ${p}

Unknowns:
- Data source(s)
- Access model / permissions
- Compliance requirements (if any)
- SLA expectations
`;
}

function makeArchitectureMD() {
  return `# Architecture (Starting Point)

## Hosting environment
- Static files (GitHub Pages / any static host)

## Data sources (explicit only)
- None assumed
- Add only when provided

## External services (explicit only)
- None assumed
- Integrations must be declared and versioned

## Flow
Input -> Logic -> Automation -> Output  
Optional: State/Storage (explicit only)

## Non-goals
- Production claims
- Security guarantees
- Compliance guarantees
`;
}

function makeDisclaimerMD() {
  return `# Meaning and Limitations (Critical)

These generated files are a starting point.

They do NOT mean:
- Complete system
- Production readiness
- Security validation
- Compliance validation

Maturity promotion is explicit and evidence-based:
Static artifact -> Prototype -> Systemized application -> Production system.
`;
}

function makeReadmeMD() {
  return `# Repo Bundle (Proof Engine)

**Status:** v1.0-proof

![Status](https://img.shields.io/badge/status-v1.0--proof-success)

## Files
- assumptions.md
- DISCLAIMER.md
- assets/system-image.svg
- assets/image-prompt.txt
- static/index.html
- static/styles.css

## Run
Open \`static/index.html\` directly, or serve with:
- \`python -m http.server 8080\`

## Ownership
You control the outputs.
`;
}

function makeImagePromptTXT(problem) {
  const p = normalizeProblem(problem);
  return `A high-fidelity system architecture visualization designed to solve:

"${p}"

The image shows clearly defined components including input, processing logic, automation, and outputs.
Dark technical interface style, grid-based layout, modern infrastructure aesthetic, no people,
no branding, no marketing visuals.
Clean, professional, engineered, and realistic — suitable for a technical architecture document.
`;
}

// Placeholder SVG (app.js overwrites with the “better” diagram)
const PLACEHOLDER_SYSTEM_IMAGE_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="675" viewBox="0 0 1200 675" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="System architecture visualization (placeholder)">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#070b14"/>
      <stop offset="100%" stop-color="#0b1220"/>
    </linearGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="1200" height="675" fill="url(#bg)"/>
  <rect width="1200" height="675" fill="url(#grid)"/>

  <g font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial" fill="rgba(255,255,255,.90)">
    <text x="54" y="86" font-size="28" font-weight="700">System Overview (Placeholder)</text>
    <text x="54" y="118" font-size="14" fill="rgba(255,255,255,.68)">Replaced by the generator’s type-shaped diagram.</text>
  </g>
</svg>`;

function buildFirst(problemRaw) {
  const problem = normalizeProblem(problemRaw);
  const generatedAtISO = nowISO();

  return {
    "README.md": makeReadmeMD(),
    "architecture.md": makeArchitectureMD(),
    "assumptions.md": makeAssumptionsMD(problem),
    "DISCLAIMER.md": makeDisclaimerMD(),
    "assets/image-prompt.txt": makeImagePromptTXT(problem),
    "assets/system-image.svg": PLACEHOLDER_SYSTEM_IMAGE_SVG,
    "static/index.html": makeStaticIndexHTML({ problem, generatedAtISO }),
    "static/styles.css": STATIC_SCAFFOLD_CSS
  };
}

window.__TEMPLATES_READY__ = true;
window.VIBE_FIRST_BUILD = { buildFirst };
window.BUILD_TEMPLATE = window.VIBE_FIRST_BUILD;

console.log("templates.js loaded: proof engine templates ready (includes static/styles.css).");
