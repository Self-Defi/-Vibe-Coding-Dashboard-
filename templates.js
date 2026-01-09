/* templates.js
   Generates:
   - Canonical image prompt (SoT) consistent with original architecture images
   - Negative prompt (anti-drift)
   - System SVG preview
   - Real repo artifacts (README.md, index.html, styles.css) for the user's generated build
*/

(function () {
  function escXml(s) {
    return String(s).replace(/[<>&"]/g, c => ({ "<":"&lt;", ">":"&gt;", "&":"&amp;", '"':"&quot;" }[c]));
  }

  // ===== Canonical Prompt (matches your original pics: grid HUD, 4 lanes, icons, minimal labels, deterministic)
  function buildCanonicalPrompt({ thought, systemType }) {
    const t = thought.trim();
    const sys = systemType.trim();

    const prompt = `A high-fidelity system architecture visualization of a "${sys}" designed to solve:
"${t}"

STYLE (locked):
- Dark technical HUD interface on a subtle square grid background (like an ops / infrastructure diagram)
- Clean metallic panels with soft inner shadows, faint neon edge glow
- High contrast, low saturation, engineered and deterministic (NOT artistic)
- Minimal color accents only: cool blue/cyan + optional small amber indicators
- Crisp typography, sharp lines, professional documentation-grade

LAYOUT (locked):
- 16:9 landscape
- Title centered at top (short, technical)
- Four vertical lanes (left-to-right), each with a header bar:
  1) INPUTS
  2) PROCESSING & LOGIC
  3) AUTOMATION
  4) OUTPUTS
- Boxes stacked within lanes, connected with clear arrows (left-to-right flow)
- Optional bottom band: "Databases" or "On-Chain / Storage" with 3–4 small database icons

CONTENT RULES (locked):
- Each box label is 1–3 words max (e.g., "Lead Enrichment", "Workflow Automation")
- Use simple monochrome line icons inside some boxes (email, web, shield, database, charts)
- No people, no characters, no scenery, no abstract art
- No branding, no logos, no marketing copy, no UI mockups/screenshots
- This is an architecture diagram suitable for a GitHub README / technical documentation

RENDERING:
- Photorealistic lighting is NOT required; it should look like a premium digital infographic / architecture plate.
- Keep it consistent and repeatable across different thoughts.`;

    const negative = `Avoid:
- White backgrounds, colorful cartoons, hand-drawn sketches
- 3D scenes, people, mascots, faces
- Marketing posters, product UI mockups, website screenshots
- Abstract concept art, messy layouts, cluttered text paragraphs
- Overly saturated neon rainbow palettes
- Long labels, dense sentences in boxes`;

    return { prompt, negative };
  }

  // ===== Simple deterministic SVG preview (not the final “image”; this is for the dashboard preview only)
  function buildSystemSvg({ thought, systemType }) {
    const t = thought.trim();
    const sys = systemType.trim();
    const title = sys.length > 38 ? sys.slice(0, 38) + "…" : sys;
    const short = t.length > 64 ? t.slice(0, 64) + "…" : t;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#070b14"/>
      <stop offset="1" stop-color="#0b1220"/>
    </linearGradient>
    <pattern id="grid" width="56" height="56" patternUnits="userSpaceOnUse">
      <path d="M56 0H0V56" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="1200" height="675" fill="url(#bg)"/>
  <rect width="1200" height="675" fill="url(#grid)" opacity="0.35"/>

  <text x="600" y="70" text-anchor="middle" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-size="34" fill="rgba(255,255,255,0.82)" font-weight="800">${escXml(title)}</text>
  <text x="600" y="105" text-anchor="middle" font-family="system-ui" font-size="16" fill="rgba(255,255,255,0.62)">${escXml(short)}</text>

  ${lane(70, 150, "INPUTS")}
  ${lane(340, 150, "PROCESSING & LOGIC")}
  ${lane(640, 150, "AUTOMATION")}
  ${lane(910, 150, "OUTPUTS")}

  ${box(95, 235, "Web / Forms")}
  ${box(95, 315, "Email")}
  ${box(95, 395, "External Sources")}

  ${box(365, 235, "Collection")}
  ${box(365, 315, "Enrichment")}
  ${box(365, 395, "Scoring")}
  ${box(365, 475, "Deduplication")}

  ${box(665, 255, "Routing")}
  ${box(665, 335, "Workflows")}
  ${box(665, 415, "Notifications")}

  ${box(935, 255, "CRM Sync")}
  ${box(935, 335, "Alerts")}
  ${box(935, 415, "Analytics")}

  <!-- arrows -->
  ${arrow(260, 275, 340, 275)}
  ${arrow(260, 355, 340, 355)}
  ${arrow(260, 435, 340, 435)}
  ${arrow(600, 315, 640, 315)}
  ${arrow(600, 395, 640, 395)}
  ${arrow(860, 315, 910, 315)}
  ${arrow(860, 395, 910, 395)}

  <!-- bottom band -->
  <rect x="70" y="575" width="1060" height="60" rx="14" fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.16)"/>
  <text x="600" y="612" text-anchor="middle" font-family="system-ui" font-size="18" fill="rgba(255,255,255,0.75)" font-weight="800">Databases / Storage</text>
</svg>`;

    function lane(x, y, label) {
      return `<rect x="${x}" y="${y}" width="250" height="36" rx="10" fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.16)"/>
      <text x="${x + 125}" y="${y + 25}" text-anchor="middle" font-family="system-ui" font-size="14" fill="rgba(255,255,255,0.75)" font-weight="800">${label}</text>`;
    }
    function box(x, y, label) {
      return `<rect x="${x}" y="${y}" width="200" height="54" rx="12" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.16)"/>
      <text x="${x + 100}" y="${y + 34}" text-anchor="middle" font-family="system-ui" font-size="14" fill="rgba(255,255,255,0.78)" font-weight="700">${label}</text>`;
    }
    function arrow(x1, y1, x2, y2) {
      return `<path d="M${x1} ${y1} L${x2 - 10} ${y2}" stroke="rgba(217,70,141,0.70)" stroke-width="3" stroke-linecap="round"/>
      <path d="M${x2 - 10} ${y2 - 6} L${x2} ${y2} L${x2 - 10} ${y2 + 6}" fill="none" stroke="rgba(217,70,141,0.70)" stroke-width="3" stroke-linecap="round"/>`;
    }
  }

  // ===== User Repo Artifacts (what the user actually “gets”)
  function buildUserRepoFiles({ thought, systemType }) {
    const { prompt, negative } = buildCanonicalPrompt({ thought, systemType });

    const userReadme = `# First Build — ${systemType}

This repo was generated from a single written Thought.

## Thought
> ${thought}

## What you get
- A static landing page (index.html + styles.css)
- A locked image prompt (SoT) to generate consistent system images
- A simple SVG preview diagram (diagrams/system.svg)

## Boundaries (non-negotiable)
- No production readiness implied
- No security claims
- No compliance claims
- No guarantees

## Canonical Image Prompt (SoT)
Copy into your image generator:

${prompt}

### Negative prompt (anti-drift)
${negative}
`;

    const userIndex = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>First Build — ${systemType}</title>
  <meta name="description" content="Generated from a single thought into a first-build scaffold." />
  <link rel="stylesheet" href="./styles.css" />
</head>
<body>
  <main class="wrap">
    <header class="hero">
      <h1>First Build — ${systemType}</h1>
      <p class="muted">Generated from a single Thought into an inspectable starting point.</p>
    </header>

    <section class="card">
      <h2>The Thought</h2>
      <p>${escapeHtml(thought)}</p>
    </section>

    <section class="card">
      <h2>Canonical Image Prompt (SoT)</h2>
      <pre>${escapeHtml(prompt)}</pre>
      <h3>Negative Prompt</h3>
      <pre>${escapeHtml(negative)}</pre>
    </section>

    <footer class="foot">
      <span>Ownership First · Powered by Self-Defi</span>
    </footer>
  </main>
</body>
</html>`;

    const userCss = `:root{
  --bg:#070b14;
  --bg2:#0b1220;
  --text:rgba(255,255,255,.92);
  --muted:rgba(255,255,255,.70);
  --card:rgba(255,255,255,.06);
  --border:rgba(255,255,255,.12);
}
*{box-sizing:border-box}
body{
  margin:0;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
  color:var(--text);
  background: radial-gradient(900px 700px at 10% 10%, rgba(80,140,255,.14), transparent 55%),
              radial-gradient(1200px 900px at 50% -10%, rgba(217,70,141,.18), transparent 60%),
              linear-gradient(180deg, var(--bg), var(--bg2));
}
.wrap{max-width:980px; margin:0 auto; padding:28px 18px 60px;}
.hero{padding:10px 0 16px; border-bottom:1px solid rgba(255,255,255,.10); margin-bottom:18px;}
.muted{color:var(--muted)}
.card{
  border:1px solid var(--border);
  background:rgba(0,0,0,.16);
  border-radius:18px;
  padding:16px;
  margin-top:14px;
}
pre{
  background:rgba(0,0,0,.25);
  border:1px solid rgba(255,255,255,.10);
  border-radius:14px;
  padding:12px;
  overflow:auto;
  white-space:pre-wrap;
  line-height:1.5;
}
.foot{
  margin-top:18px;
  padding-top:14px;
  border-top:1px solid rgba(255,255,255,.10);
  color:var(--muted);
}`;

    return {
      tree: [
        "/ (repo root)",
        "  README.md",
        "  index.html",
        "  styles.css",
        "  prompt.txt",
        "  negative.txt",
        "  /diagrams",
        "    system.svg"
      ].join("\n"),
      files: {
        "README.md": userReadme,
        "index.html": userIndex,
        "styles.css": userCss,
        "prompt.txt": prompt,
        "negative.txt": negative,
        "diagrams/system.svg": buildSystemSvg({ thought, systemType })
      }
    };

    function escapeHtml(s){
      return String(s).replace(/[&<>"']/g, (c) => ({
        "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
      }[c]));
    }
  }

  // expose globally
  window.VC_TEMPLATES = {
    buildCanonicalPrompt,
    buildSystemSvg,
    buildUserRepoFiles
  };
})();
