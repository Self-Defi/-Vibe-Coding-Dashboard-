/* templates.js — Vibe Coded Studio (UI-only)
   Purpose: deterministic first-build artifacts (docs + static scaffold + diagram)
   Boundaries: no backend, no security claims, no guarantees
*/

(function () {
  function escapeHtml(s) {
    return String(s || "").replace(/[<>&"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));
  }

  function canonicalPrompt(systemType, thought) {
    const sys = String(systemType || "").trim();
    const t = String(thought || "").trim();

    // IMPORTANT: This prompt is intentionally detailed to produce consistent architecture visuals.
    // Variable injection only: systemType + thought. No extra “creative” branches.
    return `A high-fidelity system architecture visualization of a ${sys} designed to solve:
"${t}"

The image shows clearly defined components arranged in a structured flow, including:
- Input layer
- Processing / logic layer
- Automation or decision layer
- Output layer
- Optional data storage or infrastructure layer

Visual style:
Dark technical interface with a subtle grid background.
Modern infrastructure dashboard aesthetic.
Muted neon accents (blue, cyan, green, or amber).
High contrast, low saturation.
Clean, professional, engineered, deterministic.

Composition rules:
Left-to-right flow with clear directional logic.
Boxed components with minimal labels (1–3 words max).
Consistent spacing, consistent box sizing, consistent arrow styling.
No abstract art. No illustrations. No people.
No branding, logos, marketing language, or UI mockups.

This is a system visualization, not concept art.
The image must look suitable for:
- A technical architecture review
- A GitHub README
- Infrastructure or DAO documentation.`;
  }

  function systemSvg(systemType, thought) {
    const sys = escapeHtml(systemType);
    const t = escapeHtml(thought);
    const short = t.length > 90 ? t.slice(0, 90) + "…" : t;

    // 4-lane diagram style (Inputs / Processing / Automation / Outputs) + Databases bar
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="788" viewBox="0 0 1400 788">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#070b14"/>
      <stop offset="1" stop-color="#0b1220"/>
    </linearGradient>
    <pattern id="grid" width="56" height="56" patternUnits="userSpaceOnUse">
      <path d="M 56 0 L 0 0 0 56" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    </pattern>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="rgba(0,0,0,0.55)"/>
    </filter>
  </defs>

  <rect width="1400" height="788" fill="url(#bg)"/>
  <rect width="1400" height="788" fill="url(#grid)" opacity="0.75"/>

  <text x="700" y="86" text-anchor="middle" font-family="system-ui" font-size="34"
        fill="rgba(255,255,255,0.88)" font-weight="800">${sys}</text>
  <text x="700" y="118" text-anchor="middle" font-family="system-ui" font-size="16"
        fill="rgba(255,255,255,0.62)">${short}</text>

  ${colHeader(95, 160, "INPUTS")}
  ${colHeader(415, 160, "PROCESSING & LOGIC")}
  ${colHeader(735, 160, "AUTOMATION")}
  ${colHeader(1055, 160, "OUTPUTS")}

  ${nodeBox(95, 230, "Web / Pages")}
  ${nodeBox(95, 318, "Social")}
  ${nodeBox(95, 406, "Email")}
  ${nodeBox(95, 494, "Sources")}

  ${nodeBox(415, 250, "Collection")}
  ${nodeBox(415, 338, "Enrichment")}
  ${nodeBox(415, 426, "Scoring")}
  ${nodeBox(415, 514, "Dedup / Filter")}

  ${nodeBox(735, 272, "Assignment")}
  ${nodeBox(735, 380, "Workflow")}

  ${nodeBox(1055, 250, "CRM")}
  ${nodeBox(1055, 338, "Notifications")}
  ${nodeBox(1055, 426, "Reporting")}

  ${arrow(335, 274, 415, 274)}
  ${arrow(335, 362, 415, 362)}
  ${arrow(335, 450, 415, 450)}
  ${arrow(335, 538, 415, 538)}

  ${arrow(655, 274, 735, 274)}
  ${arrow(655, 362, 735, 362)}
  ${arrow(655, 450, 735, 450)}

  ${arrow(975, 274, 1055, 274)}
  ${arrow(975, 362, 1055, 362)}
  ${arrow(975, 450, 1055, 450)}

  <g filter="url(#soft)">
    <rect x="95" y="620" width="1235" height="90" rx="18"
          fill="rgba(0,0,0,0.26)" stroke="rgba(255,255,255,0.14)"/>
    <text x="712" y="675" text-anchor="middle" font-family="system-ui" font-size="22"
          fill="rgba(255,255,255,0.86)" font-weight="800">Databases</text>
  </g>
</svg>`;

    function colHeader(x, y, label) {
      return `<g filter="url(#soft)">
        <rect x="${x}" y="${y}" width="280" height="46" rx="12"
              fill="rgba(0,0,0,0.26)" stroke="rgba(255,255,255,0.14)"/>
        <text x="${x + 140}" y="${y + 30}" text-anchor="middle"
              font-family="system-ui" font-size="16" fill="rgba(255,255,255,0.82)" font-weight="800">${label}</text>
      </g>`;
    }

    function nodeBox(x, y, label) {
      return `<g filter="url(#soft)">
        <rect x="${x}" y="${y}" width="280" height="68" rx="14"
              fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.14)"/>
        <text x="${x + 140}" y="${y + 42}" text-anchor="middle"
              font-family="system-ui" font-size="16" fill="rgba(255,255,255,0.80)" font-weight="700">${escapeHtml(label)}</text>
      </g>`;
    }

    function arrow(x1, y1, x2, y2) {
      return `<g>
        <line x1="${x1}" y1="${y1}" x2="${x2 - 14}" y2="${y2}"
              stroke="rgba(217,70,141,0.65)" stroke-width="3" stroke-linecap="round"/>
        <polygon points="${x2 - 14},${y2 - 7} ${x2 - 14},${y2 + 7} ${x2},${y2}"
                 fill="rgba(217,70,141,0.75)"/>
      </g>`;
    }
  }

  function readme(systemType, thought, promptText) {
    return `# Vibe Coded Studio — First Build (UI-only scaffold)

## Thought
${String(thought || "").trim()}

## System type
${String(systemType || "").trim()}

## What this is
A bounded starter scaffold (docs + static repo + visualization). It is a starting point only.

## Boundaries
- No backend
- No persistence
- No security guarantees
- No production claims
- No compliance guarantees

## Canonical image prompt (SoT)
${promptText}
`;
  }

  function boundariesMd() {
    return `# Boundaries (UI-only)

This output is a *starter scaffold* only:
- No backend services are provided
- No data storage is provided
- No authentication is provided
- No security claims or guarantees
- No production readiness implied
`;
  }

  function overviewMd(systemType, thought) {
    return `# Overview

**System type:** ${String(systemType || "").trim()}

**Goal / pain point:** ${String(thought || "").trim()}

## Components
- Inputs
- Processing & Logic
- Automation
- Outputs
- Databases (optional)

## Notes
This is a conceptual, UI-only scaffold designed to be readable and editable.
`;
  }

  function scaffoldIndexHtml(systemType, thought) {
    // This is the “starter repo” index.html inside the ZIP (NOT the dashboard)
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Starter Scaffold — ${escapeHtml(systemType)}</title>
  <meta name="description" content="Static scaffold generated from a single Thought."/>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;margin:0;padding:28px;background:#070b14;color:rgba(255,255,255,.92)}
    .card{max-width:980px;margin:0 auto;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);border-radius:18px;padding:18px}
    h1{margin:0 0 10px;font-size:28px}
    p{color:rgba(255,255,255,.72);line-height:1.6}
    .mono{white-space:pre-wrap;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;color:rgba(255,255,255,.78)}
    a{color:rgba(255,255,255,.88)}
  </style>
</head>
<body>
  <div class="card">
    <h1>${escapeHtml(systemType)}</h1>
    <p><strong>Thought:</strong> ${escapeHtml(thought)}</p>
    <p>This is a static starter scaffold (docs + diagram). No backend. No guarantees.</p>
    <p>See <a href="./docs/overview.md">docs/overview.md</a> and <a href="./diagrams/system.svg">diagrams/system.svg</a>.</p>
    <div class="mono">
Repo contents:
- README.md
- docs/overview.md
- docs/boundaries.md
- diagrams/system.svg
    </div>
  </div>
</body>
</html>`;
  }

  function buildFileMap(systemType, thought) {
    const promptText = canonicalPrompt(systemType, thought);
    const svg = systemSvg(systemType, thought);

    return {
      "README.md": readme(systemType, thought, promptText),
      "index.html": scaffoldIndexHtml(systemType, thought),
      "docs/overview.md": overviewMd(systemType, thought),
      "docs/boundaries.md": boundariesMd(),
      "diagrams/system.svg": svg
      // NOTE: assets placeholders can be added later, but we don't fake image files.
    };
  }

  // Export
  window.VC_TEMPLATES = {
    canonicalPrompt,
    systemSvg,
    buildFileMap
  };
})();
