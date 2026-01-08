(() => {
  // DOM
  const painInput = document.getElementById("painInput");
  const systemType = document.getElementById("systemType");
  const generateBtn = document.getElementById("generateBtn");
  const resetBtn = document.getElementById("resetBtn");
  const status = document.getElementById("status");
  const paramStatus = document.getElementById("paramStatus");
  const buildStamp = document.getElementById("buildStamp");

  const copyLinkBtn = document.getElementById("copyLinkBtn");
  const openHelpBtn = document.getElementById("openHelpBtn");

  // Tabs
  const tabPreview = document.getElementById("tabPreview");
  const tabFiles = document.getElementById("tabFiles");
  const tabZip = document.getElementById("tabZip");
  const panelPreview = document.getElementById("panelPreview");
  const panelFiles = document.getElementById("panelFiles");
  const panelZip = document.getElementById("panelZip");

  // Outputs
  const svgPreview = document.getElementById("svgPreview");
  const promptOut = document.getElementById("promptOut");
  const fileList = document.getElementById("fileList");

  const downloadSvgBtn = document.getElementById("downloadSvgBtn");
  const copyPromptBtn = document.getElementById("copyPromptBtn");
  const copyAllBtn = document.getElementById("copyAllBtn");
  const downloadZipBtn = document.getElementById("downloadZipBtn");

  // Help modal
  const helpModal = document.getElementById("helpModal");
  const closeHelpBtn = document.getElementById("closeHelpBtn");
  const closeHelpBtn2 = document.getElementById("closeHelpBtn2");

  // State
  let current = { pain: "", type: "", prompt: "", svg: "", files: {} };

  // Utilities
  const qs = (k) => new URLSearchParams(window.location.search).get(k);

  function nowStamp() {
    const d = new Date();
    return d.toISOString().replace("T", " ").slice(0, 19) + " UTC";
  }

  function safeName(str) {
    return (str || "vibe-coded-build")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "vibe-coded-build";
  }

  async function copyText(text) {
    await navigator.clipboard.writeText(text);
  }

  function escapeXml(s) {
    return (s || "").replace(/[<>&'"]/g, (c) => ({
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "'": "&apos;",
      "\"": "&quot;",
    }[c]));
  }

  function escapeHtml(str) {
    return (str || "").replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;",
    }[m]));
  }

  // Tabs
  function setTab(active) {
    const tabs = [tabPreview, tabFiles, tabZip];
    const panels = [panelPreview, panelFiles, panelZip];

    tabs.forEach(t => t.classList.remove("active"));
    tabs.forEach(t => t.setAttribute("aria-selected", "false"));
    panels.forEach(p => p.classList.remove("show"));

    if (active === "preview") { tabPreview.classList.add("active"); tabPreview.setAttribute("aria-selected", "true"); panelPreview.classList.add("show"); }
    if (active === "files")   { tabFiles.classList.add("active"); tabFiles.setAttribute("aria-selected", "true"); panelFiles.classList.add("show"); }
    if (active === "zip")     { tabZip.classList.add("active"); tabZip.setAttribute("aria-selected", "true"); panelZip.classList.add("show"); }
  }

  // SoT-locked canonical prompt
  function buildCanonicalPrompt(type, pain) {
    return `A high-fidelity system architecture visualization of a ${type} designed to solve "${pain}".
The image shows clearly defined components including input, processing logic, automation, and outputs.
Dark technical interface style, grid-based layout, modern infrastructure aesthetic, no people, no branding, no marketing visuals.
Clean, professional, engineered, and realistic — suitable for a technical architecture document.`;
  }

  // -----------------------------
  // BETTER deterministic diagrams
  // -----------------------------
  function hash32(str) {
    // FNV-1a 32-bit
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h * 0x01000193) >>> 0;
    }
    return h >>> 0;
  }

  function pickAccent(seed) {
    const accents = [
      "rgba(217,70,141,0.85)",  // pink
      "rgba(92,200,255,0.85)",  // cyan
      "rgba(87,242,135,0.85)",  // green
      "rgba(255,209,102,0.85)", // gold
      "rgba(192,132,252,0.85)", // purple
    ];
    return accents[seed % accents.length];
  }

  function getDiagramTemplate(type) {
    const t = (type || "").toLowerCase();

    if (t.includes("lead")) {
      return {
        title: "Lead generation pipeline",
        footer: "Deterministic first-pass pipeline — no implied deliverability, legality, or compliance.",
        nodes: [
          { label: "Sources", lines: ["Lists", "Inbound", "Explicit imports"], accent: "#5cc8ff" },
          { label: "Enrichment", lines: ["Normalize", "Validate", "Deduplicate"], accent: "#57f287" },
          { label: "Outreach", lines: ["Sequencing", "Personalization", "Follow-ups"], accent: "#ffd166" },
          { label: "CRM / Reporting", lines: ["Stages", "Notes", "Dashboard"], accent: "#c084fc" },
          { label: "State / Storage", lines: ["Local state", "Templates", "Versioning"], accent: "#5cc8ff" },
        ],
        bottomFrom: 1,
        edges: [[2, 4]]
      };
    }

    if (t.includes("dao")) {
      return {
        title: "DAO governance system",
        footer: "Governance sketch — execution security depends on explicit modules, thresholds, and audits.",
        nodes: [
          { label: "Proposals", lines: ["Draft", "Discussion", "Submission"], accent: "#5cc8ff" },
          { label: "Policy / Rules", lines: ["Roles", "Thresholds", "Guards"], accent: "#57f287" },
          { label: "Voting", lines: ["Quorum", "Signals", "Timelock"], accent: "#ffd166" },
          { label: "Execution", lines: ["Safe tx", "Modules", "Logs"], accent: "#c084fc" },
          { label: "Treasury / Records", lines: ["Attestations", "Snapshots", "Audit trail"], accent: "#5cc8ff" },
        ],
        bottomFrom: 3,
        edges: [[1, 4]]
      };
    }

    if (t.includes("custody")) {
      return {
        title: "Non-custodial custody workflow",
        footer: "Workflow sketch — security requires explicit hardware + policy decisions (not implied).",
        nodes: [
          { label: "User / Intent", lines: ["Request", "Amount", "Destination"], accent: "#5cc8ff" },
          { label: "Signing", lines: ["Hardware wallet", "Multisig", "Approvals"], accent: "#57f287" },
          { label: "Policy / Verification", lines: ["Rules", "Address checks", "Delays"], accent: "#ffd166" },
          { label: "Broadcast / Monitor", lines: ["Send", "Confirmations", "Alerts"], accent: "#c084fc" },
          { label: "State / Logs", lines: ["Configs", "Records", "Versioning"], accent: "#5cc8ff" },
        ],
        bottomFrom: 2,
        edges: [[3, 4]]
      };
    }

    if (t.includes("workflow")) {
      return {
        title: "Workflow automation",
        footer: "Workflow sketch — connectors and integrations are explicit-only additions.",
        nodes: [
          { label: "Intake", lines: ["Forms", "Email", "Files"], accent: "#5cc8ff" },
          { label: "Rules", lines: ["Validation", "Routing", "States"], accent: "#57f287" },
          { label: "Actions", lines: ["Tasks", "Notifications", "Updates"], accent: "#ffd166" },
          { label: "Outputs", lines: ["Reports", "Artifacts", "Exports"], accent: "#c084fc" },
          { label: "Audit Trail", lines: ["Logs", "Snapshots", "Versioning"], accent: "#5cc8ff" },
        ],
        bottomFrom: 1,
        edges: [[2, 4]]
      };
    }

    if (t.includes("data intake")) {
      return {
        title: "Data intake + processing system",
        footer: "Processing sketch — data sources and schemas are unknown unless explicitly provided.",
        nodes: [
          { label: "Sources", lines: ["Uploads", "APIs (explicit)", "Streams (explicit)"], accent: "#5cc8ff" },
          { label: "Parsing", lines: ["Schema map", "Cleaning", "Validation"], accent: "#57f287" },
          { label: "Processing", lines: ["Transforms", "Rules", "Enrichment"], accent: "#ffd166" },
          { label: "Outputs", lines: ["Exports", "Dashboards", "Artifacts"], accent: "#c084fc" },
          { label: "Storage", lines: ["Versioned data", "Configs", "Snapshots"], accent: "#5cc8ff" },
        ],
        bottomFrom: 2,
        edges: [[2, 4]]
      };
    }

    // Default: AI automation system / generic
    return {
      title: type || "System",
      footer: "Deterministic visualization — suitable for architecture docs. No branding. No marketing claims.",
      nodes: [
        { label: "Input Layer", lines: ["User request", "Events", "Imports"], accent: "#5cc8ff" },
        { label: "Logic Layer", lines: ["Rules", "Parsing", "Validation"], accent: "#57f287" },
        { label: "Orchestration", lines: ["Triggers", "Actions", "Routing"], accent: "#ffd166" },
        { label: "Outputs", lines: ["Artifacts", "Files", "Delivery"], accent: "#c084fc" },
        { label: "State / Storage", lines: ["Local state", "Config", "Versioning"], accent: "#5cc8ff" },
      ],
      bottomFrom: 1,
      edges: [[2, 4]]
    };
  }

  function arrow(x1, y1, x2, y2, accent) {
    return `
    <g>
      <path d="M ${x1} ${y1} L ${x2} ${y2}" stroke="${accent}" stroke-width="3" fill="none" opacity="0.85"/>
      <path d="M ${x2} ${y2} l -10 -6 l 2 12 z" fill="${accent}" opacity="0.85"/>
    </g>`;
  }

  function box(x, y, w, h, title, lines, accent) {
    const r = 18;
    const padX = 18;
    const lineY1 = y + 66;

    const linesSvg = (lines || []).map((t, i) => (
      `<text x="${x + padX}" y="${lineY1 + i * 20}" fill="rgba(255,255,255,0.68)" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-size="14">${escapeXml(t)}</text>`
    )).join("");

    return `
    <g>
      <rect x="${x}" y="${y}" rx="${r}" ry="${r}" width="${w}" height="${h}" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)"/>
      <rect x="${x}" y="${y}" rx="${r}" ry="${r}" width="${w}" height="6" fill="${accent}" opacity="0.95"/>
      <text x="${x + padX}" y="${y + 38}" fill="rgba(255,255,255,0.92)" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-size="16" font-weight="800">${escapeXml(title)}</text>
      ${linesSvg}
    </g>`;
  }

  // Deterministic system "image" (SVG) — now varies by template
  function buildSystemSvg(type, pain) {
    const tpl = getDiagramTemplate(type);
    const seed = hash32(`${type}::${pain}`);
    const accent = pickAccent(seed);

    const title = tpl.title;
    const subtitle = `Problem: ${pain}`;

    const W = 1200, H = 675;
    const marginX = 70;
    const topY = 190;
    const rowGap = 44;
    const colGap = 24;
    const boxW = 250;
    const boxH = 120;

    const nodes = tpl.nodes.slice();
    const topRow = nodes.slice(0, 4);
    const bottomRow = nodes.slice(4);

    function rowX(i) { return marginX + i * (boxW + colGap); }

    const boxes = [];
    topRow.forEach((n, i) => boxes.push({ ...n, x: rowX(i), y: topY, w: boxW, h: boxH }));

    if (bottomRow.length) {
      const bottomCount = Math.min(bottomRow.length, 3);
      const spanW = 4 * boxW + 3 * colGap;
      const bottomSpanW = bottomCount * boxW + (bottomCount - 1) * colGap;
      const startX = marginX + Math.max(0, (spanW - bottomSpanW) / 2);

      bottomRow.slice(0, bottomCount).forEach((n, i) => {
        boxes.push({ ...n, x: startX + i * (boxW + colGap), y: topY + boxH + rowGap, w: boxW, h: boxH });
      });
    }

    const arrows = [];

    // linear flow across top row
    for (let i = 0; i < topRow.length - 1; i++) {
      const a = boxes[i];
      const b = boxes[i + 1];
      arrows.push({ x1: a.x + a.w, y1: a.y + 60, x2: b.x, y2: b.y + 60 });
    }

    // connect to bottom row (if present)
    if (bottomRow.length) {
      const from = boxes[tpl.bottomFrom ?? 1] || boxes[1];
      const to = boxes[topRow.length];
      if (from && to) {
        arrows.push({ x1: from.x + from.w / 2, y1: from.y + from.h, x2: to.x + to.w / 2, y2: to.y });
      }
    }

    // extra edges declared in template (indices refer to boxes array)
    (tpl.edges || []).forEach(([fromIdx, toIdx]) => {
      const a = boxes[fromIdx];
      const b = boxes[toIdx];
      if (!a || !b) return;
      arrows.push({ x1: a.x + a.w, y1: a.y + 60, x2: b.x, y2: b.y + 60 });
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="System architecture visualization">
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

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)" opacity="0.55"/>

  <text x="64" y="78" fill="rgba(255,255,255,0.92)" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-size="34" font-weight="800">
    ${escapeXml(title)}
  </text>
  <text x="64" y="112" fill="rgba(255,255,255,0.62)" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-size="16">
    ${escapeXml(subtitle)}
  </text>

  <g filter="url(#softShadow)">
    ${boxes.map(b => box(b.x, b.y, b.w, b.h, b.label, b.lines, b.accent || accent)).join("")}
  </g>

  ${arrows.map(a => arrow(a.x1, a.y1, a.x2, a.y2, accent)).join("")}

  <text x="64" y="626" fill="rgba(255,255,255,0.55)" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-size="13">
    ${escapeXml(tpl.footer)}
  </text>
</svg>`;
  }

  // Repo files (explicit, bounded) + includes static/styles.css now
  function buildRepoFiles(type, pain, prompt, svg) {
    const repoName = safeName(pain);

    // Prefer templates.js for static scaffold + css if present
    let templateFiles = null;
    try {
      if (window.VIBE_FIRST_BUILD && typeof window.VIBE_FIRST_BUILD.buildFirst === "function") {
        templateFiles = window.VIBE_FIRST_BUILD.buildFirst(pain);
      }
    } catch (e) {}

    const README = `# ${repoName}

This repository is the result of a proof-first engine that turns one written problem into tangible first-build infrastructure.

**System type:** ${type}  
**Problem statement:** “${pain}”

## What this produces
- A deterministic (but type-shaped) system visualization
- A documented architecture boundary
- A static scaffold suitable for iteration
- Explicit assumptions and limitations

## What this does NOT mean (critical)
- Not production-ready
- Not security-audited
- Not compliance-validated
- No backend implied unless explicitly added

## Status
- Proof Engine
- v1.0-proof

![Status](https://img.shields.io/badge/status-v1.0--proof-success)

## Included files
- README.md
- architecture.md
- assumptions.md
- DISCLAIMER.md
- assets/system-image.svg
- assets/image-prompt.txt
- static/index.html
- static/styles.css

## Run
Open static/index.html directly, or serve with:
- python -m http.server 8080

## Ownership
You control the outputs.`;

    const ARCH = `# System Boundary

Inside:
- Request intake
- Parsing and structuring
- Deterministic artifact generation (docs + scaffold + visualization)

Outside:
- Hosting environment
- Data sources unless explicitly provided
- External services unless explicitly integrated

# Flow
Input -> Logic -> Automation -> Output
Optional: State/Storage (explicit only)

# Non-goals
- Production claims
- Security guarantees
- Compliance guarantees`;

    const ASSUMPTIONS = `# Assumptions Disclosure (Explicit)

Rule:
- Anything not stated verbatim is unknown.

Assumption: The request can be represented as a typed template (type-shaped architecture)
Reason: Ensures the diagram is not the same shape for every request.

Assumption: Default delivery is a static scaffold
Reason: Tangible output without implying backend services

Unknowns:
- Scale targets
- Security requirements
- Compliance requirements
- Data quality/availability

If unknowns become required, state them explicitly and regenerate.`;

    const DISCLAIMER = `# Meaning and Limitations (Critical)

These generated files are a starting point.

They do NOT mean:
- Complete system
- Production readiness
- Security validation
- Compliance validation

Maturity promotion is explicit and evidence-based:
Static artifact -> Prototype -> Systemized application -> Production system.`;

    // If templates.js exists, use its scaffold outputs (but we still overwrite SVG + prompt to match this generator)
    const files = templateFiles ? { ...templateFiles } : {
      "static/index.html": `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${repoName}</title>
  <style>
    body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;background:#070b14;color:rgba(255,255,255,.92)}
    .wrap{max-width:980px;margin:0 auto;padding:28px 18px}
    .card{border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.03);border-radius:18px;padding:16px;margin-top:14px}
    .muted{color:rgba(255,255,255,.65);line-height:1.55}
    .img{border:1px dashed rgba(255,255,255,.18);border-radius:16px;padding:12px;background:rgba(0,0,0,.18)}
  </style>
</head>
<body>
  <div class="wrap">
    <h1>${repoName}</h1>
    <p class="muted"><strong>Problem:</strong> ${escapeHtml(pain)}</p>

    <div class="card">
      <h2>System image</h2>
      <div class="img">
        <img src="../assets/system-image.svg" alt="System architecture visualization" style="width:100%;height:auto"/>
      </div>
      <p class="muted">Deterministic visualization suitable for architecture docs.</p>
    </div>

    <div class="card">
      <h2>Boundaries</h2>
      <ul class="muted">
        <li>No implied production readiness</li>
        <li>No implied security or compliance</li>
        <li>Anything not stated is unknown</li>
      </ul>
      <p class="muted">See README.md, architecture.md, assumptions.md, DISCLAIMER.md</p>
    </div>
  </div>
</body>
</html>`,
      "static/styles.css": `:root{--bg0:#070b14;--bg1:#0b1220;--text:rgba(255,255,255,.92);--muted:rgba(255,255,255,.70);--border:rgba(255,255,255,.10);--shadow:0 16px 48px rgba(0,0,0,.45)}
*{box-sizing:border-box}html,body{height:100%}
body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:var(--text);
background:radial-gradient(900px 520px at 12% 8%, rgba(192,132,252,.18), transparent 60%),
radial-gradient(900px 520px at 82% 26%, rgba(92,200,255,.14), transparent 55%),
linear-gradient(180deg,var(--bg0),var(--bg1))}
.wrap{max-width:980px;margin:0 auto;padding:28px 18px}
.card{border:1px solid var(--border);background:rgba(255,255,255,.03);border-radius:18px;padding:16px;margin-top:14px;box-shadow:var(--shadow)}
.muted{color:var(--muted);line-height:1.55}
.img{border:1px dashed rgba(255,255,255,.18);border-radius:16px;padding:12px;background:rgba(0,0,0,.18)}`
    };

    // overwrite / set canonical docs + artifacts
    return {
      ...files,
      "README.md": README,
      "architecture.md": ARCH,
      "assumptions.md": ASSUMPTIONS,
      "DISCLAIMER.md": DISCLAIMER,
      "assets/image-prompt.txt": prompt,
      "assets/system-image.svg": svg
    };
  }

  // Render
  function renderSvg(svg) {
    svgPreview.innerHTML = svg
      ? svg
      : `<div class="placeholder">Generate a build to preview the system visualization.</div>`;
  }

  function renderFiles(files) {
    const names = Object.keys(files || {});
    if (!names.length) {
      fileList.innerHTML = `<div class="placeholder">Generate a build to populate repo files.</div>`;
      return;
    }

    fileList.innerHTML = names.map((name) => {
      const body = files[name];
      return `
        <div class="fileItem">
          <div class="fileTop">
            <div class="fileName">${escapeXml(name)}</div>
            <div class="fileBtns">
              <button class="btnSmall" type="button" data-copy="${encodeURIComponent(name)}">Copy</button>
              <button class="btnSmall" type="button" data-download="${encodeURIComponent(name)}">Download</button>
            </div>
          </div>
          <pre class="fileBody">${escapeXml(body)}</pre>
        </div>
      `;
    }).join("");

    fileList.querySelectorAll("[data-copy]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const key = decodeURIComponent(btn.getAttribute("data-copy"));
        await copyText(files[key]);
        toast(`Copied ${key}`);
      });
    });

    fileList.querySelectorAll("[data-download]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = decodeURIComponent(btn.getAttribute("data-download"));
        downloadText(files[key], key.split("/").pop());
      });
    });
  }

  // Download helpers
  function downloadText(text, filename) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function downloadSvg(svg, filename) {
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Toast
  let toastTimer = null;
  function toast(msg) {
    status.textContent = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { status.textContent = ""; }, 1600);
  }

  // ZIP build
  async function downloadZip(files, zipName) {
    if (!window.JSZip) {
      toast("JSZip not loaded. Check CDN.");
      return;
    }
    const zip = new window.JSZip();
    for (const [path, content] of Object.entries(files)) {
      zip.file(path, content);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${zipName}.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Generate
  function generate() {
    const pain = (painInput.value || "").trim();
    const type = (systemType.value || "").trim();

    if (!pain) {
      status.textContent = "Type one sentence first.";
      return;
    }

    localStorage.setItem("vc_last_pain", pain);
    localStorage.setItem("vc_last_type", type);

    current.pain = pain;
    current.type = type;
    current.prompt = buildCanonicalPrompt(type, pain);
    current.svg = buildSystemSvg(type, pain);
    current.files = buildRepoFiles(type, pain, current.prompt, current.svg);

    renderSvg(current.svg);
    promptOut.textContent = current.prompt;
    renderFiles(current.files);

    downloadSvgBtn.disabled = false;
    copyPromptBtn.disabled = false;
    copyAllBtn.disabled = false;
    downloadZipBtn.disabled = false;

    buildStamp.textContent = `Generated: ${nowStamp()}`;
    status.textContent = "First build generated. Review deliverables, then download the repo bundle.";

    try { plausible("vc_generate"); } catch (e) {}

    setTab("preview");
  }

  function resetAll() {
    current = { pain: "", type: "", prompt: "", svg: "", files: {} };
    painInput.value = "";
    status.textContent = "";
    buildStamp.textContent = "";
    promptOut.textContent = "Generate a build to produce the locked prompt.";
    svgPreview.innerHTML = `<div class="placeholder">Generate a build to preview the system visualization.</div>`;
    fileList.innerHTML = `<div class="placeholder">Generate a build to populate repo files.</div>`;

    downloadSvgBtn.disabled = true;
    copyPromptBtn.disabled = true;
    copyAllBtn.disabled = true;
    downloadZipBtn.disabled = true;

    setTab("preview");
  }

  // Help modal
  function openHelp() {
    helpModal.classList.add("show");
    helpModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }
  function closeHelp() {
    helpModal.classList.remove("show");
    helpModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  // Wire actions
  generateBtn.addEventListener("click", generate);
  resetBtn.addEventListener("click", resetAll);

  tabPreview.addEventListener("click", () => setTab("preview"));
  tabFiles.addEventListener("click", () => setTab("files"));
  tabZip.addEventListener("click", () => setTab("zip"));

  downloadSvgBtn.addEventListener("click", () => downloadSvg(current.svg, "system-image.svg"));

  copyPromptBtn.addEventListener("click", async () => {
    await copyText(current.prompt);
    toast("Copied image prompt");
  });

  copyAllBtn.addEventListener("click", async () => {
    const all = Object.entries(current.files)
      .map(([k, v]) => `--- ${k} ---\n${v}\n`)
      .join("\n");
    await copyText(all);
    toast("Copied all files");
  });

  downloadZipBtn.addEventListener("click", async () => {
    const name = safeName(current.pain);
    await downloadZip(current.files, name);
    try { plausible("vc_zip_download"); } catch (e) {}
  });

  // Share link
  copyLinkBtn.addEventListener("click", async () => {
    const pain = (painInput.value || "").trim();
    const url = new URL(window.location.href);
    if (pain) url.searchParams.set("pain", pain);
    else url.searchParams.delete("pain");
    await copyText(url.toString());
    toast("Copied share link");
  });

  // Help
  openHelpBtn.addEventListener("click", openHelp);
  closeHelpBtn.addEventListener("click", closeHelp);
  closeHelpBtn2.addEventListener("click", closeHelp);
  helpModal.addEventListener("click", (e) => { if (e.target === helpModal) closeHelp(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && helpModal.classList.contains("show")) closeHelp(); });

  // Init from URL param or last session
  const painParam = qs("pain");
  const lastPain = localStorage.getItem("vc_last_pain");
  const lastType = localStorage.getItem("vc_last_type");
  if (lastType) systemType.value = lastType;

  if (painParam) {
    painInput.value = painParam;
    paramStatus.textContent = "Loaded from share link";
  } else if (lastPain) {
    painInput.value = lastPain;
    paramStatus.textContent = "Loaded last request";
  } else {
    paramStatus.textContent = "";
  }

  if ((painInput.value || "").trim()) {
    status.textContent = "Ready. Click “Generate first build”.";
  }

  setTab("preview");
})();
