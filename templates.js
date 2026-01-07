/* templates.js
   Vibe Coding — First-Build Templates (2-step engine)
   UI: 2 actions only
     1) Explain problem
     2) Build (generate deliverables bundle)

   NOTE:
   - No industry dropdown / selection is exposed here.
   - Any industry logic can exist “behind the curtain”, but the UI should not depend on it.
   - Deliverables MUST include a CSS file alongside static/index.html.

   Output bundle shape (minimum):
   - README.md
   - architecture.md
   - assumptions.md
   - DISCLAIMER.md
   - assets/system-image.svg
   - assets/image-prompt.txt
   - static/index.html
   - static/styles.css   ✅ (added)
*/

// ----------------------------------------------------
// Small utilities
// ----------------------------------------------------
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

// ----------------------------------------------------
// Static scaffold CSS (deliverable)
// - Matches the look/feel of the current “Repo Files” preview
// - This is intentionally lightweight + editable
// ----------------------------------------------------
const STATIC_SCAFFOLD_CSS = `:root{
  --bg0:#070b14;
  --bg1:#0b1220;
  --card:rgba(255,255,255,.06);
  --card2:rgba(255,255,255,.08);
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
    radial-gradient(900px 480px at 12% 8%, rgba(147,51,234,.22), transparent 60%),
    radial-gradient(900px 520px at 82% 26%, rgba(6,182,212,.14), transparent 55%),
    linear-gradient(180deg, var(--bg0), var(--bg1));
}

.wrap{max-width:1020px;margin:0 auto;padding:26px 18px 46px}
.top{
  display:flex;align-items:center;justify-content:space-between;gap:12px;
  padding:10px 0 18px;border-bottom:1px solid var(--border);
}
.brand{font-weight:800;letter-spacing:.2px;font-size:18px}
.sub{margin-top:4px;color:var(--muted);font-size:13px}

.btnRow{display:flex;gap:10px;flex-wrap:wrap}
.btn{
  border:1px solid var(--border);
  background:rgba(255,255,255,.06);
  color:var(--text);
  padding:10px 12px;border-radius:999px;
  font-size:13px;cursor:pointer;
  backdrop-filter: blur(10px);
}

.h1{margin:22px 0 8px;font-size:44px;line-height:1.06}
.p{margin:0 0 18px;color:var(--muted);font-size:16px}

.card{
  border:1px solid var(--border);
  background:rgba(255,255,255,.05);
  border-radius:var(--radius);
  box-shadow:var(--shadow);
  padding:16px;
  backdrop-filter: blur(12px);
}

.row{display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap}
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

.sectionTitle{margin:22px 0 10px;font-size:16px}
.file{
  border:1px solid var(--border);
  background:rgba(255,255,255,.04);
  border-radius:16px;
  padding:14px;
  margin:10px 0;
}
.fileHead{display:flex;justify-content:space-between;gap:12px;align-items:center}
.fileName{font-weight:700}
.pill{
  border:1px solid var(--border);
  padding:8px 10px;
  border-radius:999px;
  background:rgba(255,255,255,.04);
  font-size:12px;
}

.pre{
  margin:10px 0 0;
  padding:12px;
  border-radius:14px;
  border:1px solid var(--border);
  background:rgba(0,0,0,.18);
  overflow:auto;
  max-height:240px;
  font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;
  font-size:12px;
  line-height:1.4;
}

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

// ----------------------------------------------------
// Static scaffold HTML (deliverable)
// - Links to static/styles.css ✅
// - Includes inline <style> fallback so it still renders if someone deletes the CSS
// ----------------------------------------------------
function makeStaticIndexHTML({ problem, generatedAtISO }) {
  const safeProblem = esc(problem);
  const safeGen = esc(generatedAtISO);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeProblem}</title>

  <!-- Optional: external CSS deliverable (recommended) -->
  <link rel="stylesheet" href="./styles.css" />

  <!-- Fallback: minimal inline CSS (keeps it usable even if CSS file removed) -->
  <style>
    ${STATIC_SCAFFOLD_CSS}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="top">
      <div>
        <div class="brand">Vibe Coding</div>
        <div class="sub">Write the pain point. Get a first build.</div>
      </div>
      <div class="btnRow">
        <button class="btn" type="button">Copy share link</button>
        <button class="btn" type="button">What do I get?</button>
      </div>
    </div>

    <div class="h1">Tell us what you want built.</div>
    <p class="p">It turns a written idea into something you can see, share, and build on.</p>

    <div class="card">
      <div class="row">
        <div style="min-width:260px">
          <div class="label"><strong>Your request</strong><br/>Explain the pain point you want solved.</div>
        </div>
        <div class="meta">Generated: ${safeGen}</div>
      </div>
      <textarea readonly>${safeProblem}</textarea>
    </div>

    <div class="sectionTitle"><strong>Boundaries</strong>: This generates a starting point (docs + static scaffold + visualization). It does <em>not</em> imply production readiness, security validation, compliance, or guarantees.</div>

    <div class="footer">
      <div>Vibe Coding<br/><span class="sub">Simple front-stage. Rigid standards behind the curtain.</span></div>
      <div>Powered by Self-Defi</div>
    </div>
  </div>
</body>
</html>`;
}

// ----------------------------------------------------
// Docs (deliverables)
// ----------------------------------------------------
function makeAssumptionsMD(problem) {
  const p = normalizeProblem(problem);
  return `# Assumptions Disclosure (Explicit)

Rule:
- Anything not stated verbatim is unknown.

Assumption: The request can be represented as 4 layers (input, logic, automation, output)
Reason: Required for deterministic visualization and scaffold

Assumption: Default delivery is a static scaffold
Reason: Tangible output without implying backend services

Assumption: Data sources are unknown unless explicitly provided
Reason: Prevents hallucinated integrations

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
  return `# Repo Bundle (First Build)

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

// ----------------------------------------------------
// System image + prompt (deliverables)
// Keep these as placeholders unless your generator overwrites them later.
// ----------------------------------------------------
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
    <text x="54" y="118" font-size="14" fill="rgba(255,255,255,.68)">Replace with a generated system diagram when ready.</text>
  </g>

  <g transform="translate(70,165)" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="2">
    <rect width="260" height="120" rx="16"/>
    <rect x="330" width="340" height="120" rx="16"/>
    <rect x="710" width="420" height="120" rx="16"/>
    <path d="M260 60 H330"/>
    <path d="M670 60 H710"/>
  </g>

  <g transform="translate(70,165)" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="13" fill="rgba(255,255,255,.85)">
    <text x="22" y="42">Input</text>
    <text x="352" y="42">Logic</text>
    <text x="732" y="42">Automation → Output</text>
  </g>
</svg>`;

// ----------------------------------------------------
// Public API: buildFirst(problem) => files map
// This is what app.js should call on “Build”
// ----------------------------------------------------
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

    // ✅ NEW deliverable (requested)
    "static/styles.css": STATIC_SCAFFOLD_CSS
  };
}

// ----------------------------------------------------
// Backwards-compatible globals (safe)
// ----------------------------------------------------
window.__TEMPLATES_READY__ = true;

// New: single entrypoint for the 2-action flow
window.VIBE_FIRST_BUILD = { buildFirst };

// Optional: old code may check these
window.BUILD_TEMPLATE = window.VIBE_FIRST_BUILD;

console.log("templates.js loaded: 2-action engine ready (buildFirst + deliverables including static/styles.css).");
