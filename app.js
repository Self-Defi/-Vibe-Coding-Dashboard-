/* app.js — Vibe Coding Dashboard (Option 1 UI)
   Goals:
   - Keep everything “behind the scenes” as much as possible
   - Industry dropdown MUST always populate (even if script load order hiccups)
   - Advanced fields (constraint + reality test) auto-filled + locked (not user-editable)
   - Add a Refresh button (works if the button exists in HTML)

   Works with your existing templates.js INDUSTRIES registry.
*/

(() => {
  // -----------------------------
  // State
  // -----------------------------
  let currentFiles = {};
  let currentViewFile = null;
  let currentSOT = null;
  let currentStage5 = "";

  // -----------------------------
  // DOM helpers
  // -----------------------------
  const $ = (id) => document.getElementById(id);

  const $maybe = (idList) => {
    for (const id of idList) {
      const el = document.getElementById(id);
      if (el) return el;
    }
    return null;
  };

  const text = (id, value) => {
    const el = $(id);
    if (!el) return;
    el.textContent = value;
  };

  const setValue = (id, value) => {
    const el = $(id);
    if (!el) return;
    el.value = value;
  };

  const safeDisable = (el, disabled = true) => {
    if (!el) return;
    el.disabled = !!disabled;
  };

  const safeHide = (el) => {
    if (!el) return;
    el.style.display = "none";
  };

  // -----------------------------
  // “Behind-the-scenes” defaults
  // -----------------------------
  const LOCKED_DEFAULTS = {
    constraint: "I will build the first proof in 0.1 hours using static GitHub Pages files and a CSV export.",
    realityTest: "A stranger can open it and understand the proof in under 60 seconds."
  };

  function applyLockedAdvanced() {
    // Inputs
    const constraintEl = $("constraint");
    const realityEl = $("realityTest");

    if (constraintEl) {
      constraintEl.value = LOCKED_DEFAULTS.constraint;
      constraintEl.readOnly = true;
      constraintEl.setAttribute("aria-readonly", "true");
    }
    if (realityEl) {
      realityEl.value = LOCKED_DEFAULTS.realityTest;
      realityEl.readOnly = true;
      realityEl.setAttribute("aria-readonly", "true");
    }

    // If you’re using a <details id="docsDrawer"> for advanced/doc areas:
    // Keep it collapsed by default (still accessible if you want later).
    const advDrawer = $maybe(["advancedDrawer", "docsDrawer"]);
    if (advDrawer && advDrawer.tagName.toLowerCase() === "details") {
      advDrawer.open = false;
    }

    // Optionally hide the entire advanced section if your HTML wraps it.
    // If you have a wrapper like <div id="advancedWrap">...</div> this will hide it.
    const advWrap = $maybe(["advancedWrap", "advancedSection"]);
    if (advWrap) safeHide(advWrap);
  }

  // -----------------------------
  // Validation
  // -----------------------------
  function validateExternalization() {
    // Option 1 UI may only require:
    // - oneSentence (required)
    // - output (required)
    // Industry optional
    const one = ($("oneSentence")?.value || "").trim();
    const out = ($("output")?.value || "").trim();

    // Keep it simple for conversions
    return one.length >= 10 && out.length >= 10;
  }

  // -----------------------------
  // Pills (optional UI elements)
  // -----------------------------
  function setPills({ phase, industry, proof, docs }) {
    if (phase) text("phasePill", `Phase: ${phase}`);
    if (industry) text("industryPill", `Industry: ${industry}`);
    if (proof) text("proofPill", proof);
    if (docs) text("sotPill", docs); // some UIs label this as Docs
  }

  function markGood(id) {
    const el = $(id);
    if (!el) return;
    el.classList.add("good");
  }

  // -----------------------------
  // Industries init (robust)
  // -----------------------------
  function populateIndustrySelect(industriesObj) {
    const sel = $("industrySelect");
    if (!sel) return;

    sel.innerHTML = "";

    const names = Object.keys(industriesObj || {});
    if (!names.length) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "No industries loaded";
      sel.appendChild(opt);
      return;
    }

    // Insert options
    for (const name of names) {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      sel.appendChild(opt);
    }

    // Default selection
    const defaultName = names.includes("Supply Chain") ? "Supply Chain" : names[0];
    sel.value = defaultName;

    // On change: set artifact default if present
    sel.addEventListener("change", () => {
      const indName = sel.value;
      const ind = industriesObj[indName];
      text("industryPill", `Industry: ${indName}`);

      const artifactSel = $("artifactSelect");
      if (artifactSel) {
        artifactSel.value = (ind && ind.defaultArtifact) || artifactSel.value || "dashboard";
      }
    });

    // Trigger one change so pills + artifact default update
    sel.dispatchEvent(new Event("change"));
  }

  function waitForIndustriesThenInit() {
    // If templates.js loads AFTER app.js (or Safari caches weird), we retry briefly.
    const maxTries = 60;       // ~3 seconds
    const intervalMs = 50;

    let tries = 0;

    const tick = () => {
      tries++;

      const industriesObj = window.INDUSTRIES;
      if (industriesObj && Object.keys(industriesObj).length) {
        populateIndustrySelect(industriesObj);
        return;
      }

      if (tries >= maxTries) {
        // Still not loaded: fail gracefully (no hard crash)
        console.error("INDUSTRIES not found. Check that templates.js loads before/with app.js.");
        populateIndustrySelect({}); // shows "No industries loaded"
        text("industryPill", "Industry: —");
        return;
      }

      setTimeout(tick, intervalMs);
    };

    tick();
  }

  // -----------------------------
  // Example autofill
  // -----------------------------
  function autofillExample() {
    const indName = $("industrySelect")?.value;
    const ind = window.INDUSTRIES?.[indName];
    const ex = ind?.example;

    // If industry has an example, use it. Otherwise keep locked defaults.
    if (ex) {
      setValue("oneSentence", ex.oneSentence || "");
      setValue("output", ex.output || "");
    } else {
      // fallback sample
      setValue("oneSentence", "I want to build a visibility dashboard so a busy operator can see what’s stuck instantly.");
      setValue("output", "The proof is done when it generates a working dashboard page + downloadable repo files.");
    }

    // Always keep advanced locked
    applyLockedAdvanced();
  }

  // -----------------------------
  // Files UI
  // -----------------------------
  function renderFiles(files) {
    const list = $("filesList");
    if (!list) return;

    list.innerHTML = "";
    Object.keys(files || {}).forEach((path) => {
      const chip = document.createElement("div");
      chip.className = "fileChip";
      chip.textContent = path;
      chip.onclick = () => openViewer(path);
      list.appendChild(chip);
    });
  }

  function openViewer(path) {
    currentViewFile = path;
    text("viewerTitle", path);

    const codeEl = $("viewerCode");
    if (codeEl) codeEl.textContent = currentFiles[path] || "";

    $("fileViewer")?.classList.remove("hidden");
  }

  function closeViewer() {
    $("fileViewer")?.classList.add("hidden");
    currentViewFile = null;
  }

  async function copyViewer() {
    if (!currentViewFile) return;
    try {
      await navigator.clipboard.writeText(currentFiles[currentViewFile] || "");
      const btn = $("btnCopy");
      if (btn) {
        const old = btn.textContent;
        btn.textContent = "Copied";
        setTimeout(() => (btn.textContent = old || "Copy"), 900);
      }
    } catch (e) {
      alert("Copy failed on this device/browser. Use the Download button instead.");
    }
  }

  function downloadTextFile(filename, content) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function downloadCurrentFile() {
    if (!currentViewFile) return;
    const name = currentViewFile.split("/").pop();
    downloadTextFile(name, currentFiles[currentViewFile] || "");
  }

  function downloadAllFiles() {
    Object.entries(currentFiles || {}).forEach(([path, content]) => {
      const safeName = path.replaceAll("/", "__");
      downloadTextFile(safeName, content);
    });
  }

  // -----------------------------
  // Stage 5 snapshot
  // -----------------------------
  function makeStage5Snapshot(industryName, artifactType, ext) {
    const proofPaths = Object.keys(currentFiles || {});
    const now = new Date().toISOString();

    const exists = [
      "Stage 3 proof repo files generated (static GitHub default)",
      `Industry template applied: ${industryName || "—"}`,
      `Artifact type: ${artifactType || "—"}`,
      "Stage 4 Source-of-Truth PDFs generated (Definition/Data/Workflow/Constraints)"
    ];

    const nextActions = [
      "1) Create a new GitHub repo",
      "2) Copy/paste the generated files into the repo root (and data/ folder)",
      "3) Enable GitHub Pages (Deploy from main / root)",
      "4) Open the live URL on desktop + mobile",
      "5) Replace sample CSV with real export (same headers)",
      "6) If scaling: convert CSV export into scheduled automation + API"
    ];

    return [
      "VIBE CODING — STAGE 5 SNAPSHOT",
      `Timestamp: ${now}`,
      "",
      "LOCKED INPUT",
      `One sentence: ${ext.oneSentence}`,
      `Output: ${ext.output}`,
      "",
      "WHAT EXISTS NOW",
      ...exists.map((x) => `- ${x}`),
      "",
      "GENERATED PROOF FILES",
      ...proofPaths.map((p) => `- ${p}`),
      "",
      "NEXT ACTIONS",
      ...nextActions.map((x) => `- ${x}`)
    ].join("\n");
  }

  // -----------------------------
  // Stage 4 preview (safe)
  // -----------------------------
  function renderSOTPreview(sot) {
    const preview = $("sotPreview");
    if (!preview) return;

    const def = sot?.definition || {};
    const data = sot?.data || {};
    const flow = sot?.workflow || {};
    const cons = sot?.constraints || {};

    const lines = [
      "DOCS (AUTO-GENERATED)",
      "",
      "PDF 1 — Definition",
      `- Problem: ${def.problem || "—"}`,
      `- Primary user: ${def.primaryUser || "—"}`,
      `- Artifact: ${def.artifactType || "—"}`,
      `- Time-to-understand: ${def.timeToUnderstand || "—"}`,
      "",
      "PDF 2 — Data",
      `- Required fields: ${(data.requiredFields || []).length}`,
      `- Sources: ${(data.sources || []).length}`,
      "",
      "PDF 3 — Workflow",
      `- States: ${(flow.states || []).length}`,
      `- Triggers: ${(flow.triggers || []).length}`,
      "",
      "PDF 4 — Constraints",
      `- Ops constraints: ${(cons.ops || []).length}`,
      `- Non-goals: ${(cons.nonGoals || []).length}`
    ];

    preview.textContent = lines.join("\n");
  }

  // -----------------------------
  // PDF generation (kept compatible with your current setup)
  // -----------------------------
  function pdfTitle(doc, title, subtitle) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(title, 14, 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(subtitle, 14, 26);
  }

  function ensureAutoTable(doc) {
    if (typeof doc.autoTable !== "function") {
      alert("jspdf-autotable not loaded. Check your index.html script tags.");
      return false;
    }
    return true;
  }

  function generatePDF1(def) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "pt", format: "letter" });

    pdfTitle(doc, "Vibe Coding", "Docs | PDF 1 — Definition");

    doc.setFontSize(12);
    doc.text("Problem (Locked)", 14, 56);
    doc.setFontSize(10);
    doc.text(def.problem || "—", 14, 72, { maxWidth: 580 });

    doc.setFontSize(12);
    doc.text("User", 14, 112);
    doc.setFontSize(10);
    doc.text(`Primary: ${def.primaryUser || "—"}`, 14, 128);
    doc.text(`Secondary: ${def.secondaryUsers || "—"}`, 14, 144);

    doc.setFontSize(12);
    doc.text("Output", 14, 180);
    doc.setFontSize(10);
    doc.text(`Artifact Type: ${def.artifactType || "—"}`, 14, 196);
    doc.text(`Description: ${def.description || "—"}`, 14, 212, { maxWidth: 580 });
    doc.text(`Time-to-Understand: ${def.timeToUnderstand || "—"}`, 14, 238);

    doc.setFontSize(12);
    doc.text("Definition of Done", 14, 270);
    doc.setFontSize(10);
    (def.doneCriteria || []).forEach((c, i) => doc.text(`• ${c}`, 18, 288 + i * 14, { maxWidth: 575 }));

    doc.save("SOT_PDF1_Definition.pdf");
  }

  function generatePDF2(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    if (!ensureAutoTable(doc)) return;

    pdfTitle(doc, "Vibe Coding", "Docs | PDF 2 — Data");

    doc.setFontSize(12);
    doc.text("Required Fields", 14, 56);
    doc.autoTable({
      startY: 68,
      head: [["Field", "Description", "Required"]],
      body: data.requiredFields || [],
      theme: "grid",
      styles: { fontSize: 9 }
    });

    let y = doc.lastAutoTable.finalY + 18;
    doc.setFontSize(12);
    doc.text("Sources", 14, y);
    doc.autoTable({
      startY: y + 12,
      head: [["Field", "Source", "Owner", "Refresh"]],
      body: data.sources || [],
      theme: "grid",
      styles: { fontSize: 9 }
    });

    doc.save("SOT_PDF2_Data.pdf");
  }

  function generatePDF3(flow) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    if (!ensureAutoTable(doc)) return;

    pdfTitle(doc, "Vibe Coding", "Docs | PDF 3 — Workflow");

    doc.setFontSize(12);
    doc.text("States", 14, 56);
    doc.autoTable({
      startY: 68,
      head: [["State", "Description"]],
      body: flow.states || [],
      theme: "grid",
      styles: { fontSize: 9 }
    });

    let y = doc.lastAutoTable.finalY + 18;
    doc.setFontSize(12);
    doc.text("Triggers", 14, y);
    doc.autoTable({
      startY: y + 12,
      head: [["Trigger", "Condition", "Action"]],
      body: flow.triggers || [],
      theme: "grid",
      styles: { fontSize: 9 }
    });

    doc.save("SOT_PDF3_Workflow.pdf");
  }

  function generatePDF4(cons) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    if (!ensureAutoTable(doc)) return;

    pdfTitle(doc, "Vibe Coding", "Docs | PDF 4 — Constraints");

    doc.setFontSize(12);
    doc.text("Operational Constraints", 14, 56);
    doc.autoTable({
      startY: 68,
      head: [["Type", "Details"]],
      body: cons.ops || [],
      theme: "grid",
      styles: { fontSize: 9 }
    });

    let y = doc.lastAutoTable.finalY + 18;
    doc.setFontSize(12);
    doc.text("Non-Goals", 14, y);
    doc.setFontSize(10);
    (cons.nonGoals || []).forEach((ng, i) => doc.text(`• ${ng}`, 18, y + 18 + i * 14, { maxWidth: 575 }));

    doc.save("SOT_PDF4_Constraints.pdf");
  }

  // -----------------------------
  // Generate
  // -----------------------------
  function generateAll() {
    const industries = window.INDUSTRIES || {};
    const industryName = $("industrySelect")?.value || "";
    const industry = industries[industryName];

    const artifactType = $("artifactSelect")?.value || "dashboard";

    if (!industry) {
      alert("Industry templates not loaded. Refresh the page. If it persists, check that templates.js is loaded before app.js.");
      return;
    }

    // Keep advanced locked no matter what
    applyLockedAdvanced();

    if (!validateExternalization()) {
      alert("Fill in One sentence and Output first (keep it simple).");
      return;
    }

    // Stage 3
    currentFiles = typeof industry.proofRepo === "function" ? industry.proofRepo() : {};
    renderFiles(currentFiles);
    safeDisable($("btnDownloadAll"), Object.keys(currentFiles).length === 0);

    // Stage 4/5
    currentSOT = typeof industry.sotDefaults === "function" ? industry.sotDefaults() : null;
    if (!currentSOT) {
      alert("Docs generation failed: sotDefaults() returned nothing.");
      return;
    }
    renderSOTPreview(currentSOT);

    // Snapshot
    const ext = {
      oneSentence: ($("oneSentence")?.value || "").trim(),
      output: ($("output")?.value || "").trim()
    };
    currentStage5 = makeStage5Snapshot(industryName, artifactType, ext);
    text("stage5", currentStage5);
    safeDisable($("btnDownloadStage5"), false);

    // Enable doc buttons
    safeDisable($("btnPDF1"), false);
    safeDisable($("btnPDF2"), false);
    safeDisable($("btnPDF3"), false);
    safeDisable($("btnPDF4"), false);

    setPills({
      phase: "3–5",
      industry: industryName || "—",
      proof: "Proof: Generated",
      docs: "Docs: Generated"
    });

    markGood("proofPill");
    markGood("sotPill");
  }

  // -----------------------------
  // Refresh button behavior
  // -----------------------------
  function hardRefresh() {
    // Cache-busting reload (GitHub Pages + Safari can cache aggressively)
    const url = new URL(window.location.href);
    url.searchParams.set("_", Date.now().toString());
    window.location.replace(url.toString());
  }

  // -----------------------------
  // Wire UI
  // -----------------------------
  function wireUI() {
    // Main CTA buttons (your HTML seems to keep these IDs)
    const btnExample = $maybe(["btnAutofill", "btnExample", "btnUseExample"]);
    const btnBuild = $maybe(["btnGenerate", "btnBuild", "btnBuildProof"]);

    if (btnExample) btnExample.onclick = autofillExample;
    if (btnBuild) btnBuild.onclick = generateAll;

    // Viewer buttons
    const btnCopy = $maybe(["btnCopy"]);
    const btnDownload = $maybe(["btnDownload"]);
    const btnClose = $maybe(["btnClose"]);
    const btnRefresh = $maybe(["btnRefresh", "btnViewerRefresh"]); // if you add it in HTML

    if (btnCopy) btnCopy.onclick = copyViewer;
    if (btnDownload) btnDownload.onclick = downloadCurrentFile;
    if (btnClose) btnClose.onclick = closeViewer;

    // 🔥 Refresh button requested
    if (btnRefresh) btnRefresh.onclick = hardRefresh;

    // Download all
    const btnDownloadAll = $maybe(["btnDownloadAll"]);
    if (btnDownloadAll) btnDownloadAll.onclick = downloadAllFiles;

    // Docs buttons
    const btnPDF1 = $maybe(["btnPDF1"]);
    const btnPDF2 = $maybe(["btnPDF2"]);
    const btnPDF3 = $maybe(["btnPDF3"]);
    const btnPDF4 = $maybe(["btnPDF4"]);

    if (btnPDF1) btnPDF1.onclick = () => generatePDF1(currentSOT?.definition || {});
    if (btnPDF2) btnPDF2.onclick = () => generatePDF2(currentSOT?.data || {});
    if (btnPDF3) btnPDF3.onclick = () => generatePDF3(currentSOT?.workflow || {});
    if (btnPDF4) btnPDF4.onclick = () => generatePDF4(currentSOT?.constraints || {});

    // Snapshot download
    const btnStage5 = $maybe(["btnDownloadStage5"]);
    if (btnStage5) {
      btnStage5.onclick = () => downloadTextFile("Stage5_Snapshot.txt", currentStage5 || "");
    }
  }

  // -----------------------------
  // Boot
  // -----------------------------
  function boot() {
    // Lock advanced immediately
    applyLockedAdvanced();

    // Init selects (robust)
    waitForIndustriesThenInit();

    // Wire buttons
    wireUI();

    // Default state
    setPills({
      phase: "1–2",
      industry: "—",
      proof: "Proof: Not generated",
      docs: "Docs: Not generated"
    });

    // Disable outputs until build
    safeDisable($("btnDownloadAll"), true);
    safeDisable($("btnPDF1"), true);
    safeDisable($("btnPDF2"), true);
    safeDisable($("btnPDF3"), true);
    safeDisable($("btnPDF4"), true);
    safeDisable($("btnDownloadStage5"), true);
  }

  // Run after DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
