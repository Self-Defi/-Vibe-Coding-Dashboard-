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
    return (str || "vibe-coding-build")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "vibe-coding-build";
  }

  async function copyText(text) {
    await navigator.clipboard.writeText(text);
  }

  function escapeXml(s) {
    return (s || "").replace(/[<>&'"]/g, (c) => ({
      "<":"&lt;",
      ">":"&gt;",
      "&":"&amp;",
      "'":"&apos;"
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

  // Deterministic system "image" (SVG)
  function buildSystemSvg(type, pain) {
    const title = `${type}`;
    const subtitle = `Problem: ${pain}`;

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

  <text x="64" y="78" fill="rgba(255,255,255,0.92)" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-size="34" font-weight="800">
    ${escapeXml(title)}
  </text>
  <text x="64" y="112" fill="rgba(255,255,255,0.62)" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-size="16">
    ${escapeXml(subtitle)}
  </text>

  <g filter="url(#softShadow)">
    ${box(90, 190, 220, 110, "Input Layer", ["User request", "Forms / Events", "Imports"], "#5cc8ff")}
    ${box(360, 190, 240, 110, "Logic Layer", ["Rules", "Parsing", "Validation"], "#57f287")}
    ${box(650, 190, 250, 110, "Automation Engine", ["Triggers", "Actions", "Routing"], "#ffd166")}
    ${box(945, 190, 200, 110, "Outputs", ["Artifacts", "Files", "Delivery"], "#c084fc")}
    ${box(360, 360, 535, 120, "State / Storage (optional)", ["Local state", "Config", "Versioning"], "#5cc8ff")}
  </g>

  ${arrow(310, 245, 360, 245)}
  ${arrow(600, 245, 650, 245)}
  ${arrow(900, 245, 945, 245)}
  ${arrow(600, 300, 600, 360)}
  ${arrow(895, 420, 945, 245)}

  <text x="64" y="626" fill="rgba(255,255,255,0.55)" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-size="13">
    Deterministic visualization — suitable for architecture docs. No branding. No marketing claims.
  </text>
</svg>`;
  }

  function box(x, y, w, h, title, lines, accent) {
    const r = 18;
    const padX = 18;
    const lineY1 = y + 66;

    const linesSvg = lines.map((t, i) => (
      `<text x="${x + padX}" y="${lineY1 + i*20}" fill="rgba(255,255,255,0.68)" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-size="14">${escapeXml(t)}</text>`
    )).join("");

    return `
    <g>
      <rect x="${x}" y="${y}" rx="${r}" ry="${r}" width="${w}" height="${h}" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)"/>
      <rect x="${x}" y="${y}" rx="${r}" ry="${r}" width="${w}" height="6" fill="${accent}" opacity="0.95"/>
      <text x="${x + padX}" y="${y + 38}" fill="rgba(255,255,255,0.92)" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-size="16" font-weight="800">${escapeXml(title)}</text>
      ${linesSvg}
    </g>`;
  }

  function arrow(x1, y1, x2, y2) {
    return `
    <g>
      <path d="M ${x1} ${y1} L ${x2} ${y2}" stroke="rgba(217,70,141,0.85)" stroke-width="3" fill="none"/>
      <path d="M ${x2} ${y2} l -10 -6 l 2 12 z" fill="rgba(217,70,141,0.85)"/>
    </g>`;
  }

  // Repo files (explicit, bounded)
  function buildRepoFiles(type, pain, prompt, svg) {
    const repoName = safeName(pain);

    const README = `# ${repoName}

This repository was generated from one problem statement:

“${pain}”

## What this does
- Converts a written request into a structured first build
- Produces: system visualization + repo docs + static scaffold

## What this does NOT mean (most important)
- Not production-ready
- Not security-audited
- Not compliance-validated
- No backend implied unless explicitly added

## Included files
- README.md
- architecture.md
- assumptions.md
- DISCLAIMER.md
- assets/system-image.svg
- assets/image-prompt.txt
- static/index.html

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

Assumption: The request can be represented as 4 layers (input, logic, automation, output)
Reason: Required for deterministic visualization and scaffold

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

    const STATIC_INDEX = `<!doctype html>
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
</html>`;

    return {
      "README.md": README,
      "architecture.md": ARCH,
      "assumptions.md": ASSUMPTIONS,
      "DISCLAIMER.md": DISCLAIMER,
      "assets/image-prompt.txt": prompt,
      "assets/system-image.svg": svg,
      "static/index.html": STATIC_INDEX
    };
  }

  // Render
  function renderSvg(svg) {
    svgPreview.innerHTML = svg ? svg : `<div class="placeholder">Generate a build to preview the system visualization.</div>`;
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

    try { plausible("vc_generate"); } catch(e) {}

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
    try { plausible("vc_zip_download"); } catch(e) {}
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
