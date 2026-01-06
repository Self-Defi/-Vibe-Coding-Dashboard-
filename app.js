/* app.js — Vibe Coding Dashboard (Option 1 UI)
   Adds:
   - Save Proof → local JSON download
   - Load Proof → restore from JSON file
   - Clear → wipe UI + storage
   - Auto-resume from localStorage (pure client-side)
*/

(() => {
  // -----------------------------
  // Session config
  // -----------------------------
  const SESSION_VERSION = 1;
  const SESSION_KEY = "vc_proof_session_v1";

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
    el.value = value ?? "";
  };

  const safeDisable = (el, disabled = true) => {
    if (!el) return;
    el.disabled = !!disabled;
  };

  const safeHide = (el) => {
    if (!el) return;
    el.style.display = "none";
  };

  const setStatus = (msg) => {
    const el = $("proofStatus");
    if (!el) return;
    el.textContent = msg || "";
  };

  // -----------------------------
  // “Behind-the-scenes” defaults
  // -----------------------------
  const LOCKED_DEFAULTS = {
    constraint:
      "I will build the first proof in 0.1 hours using static GitHub Pages files and a CSV export.",
    realityTest:
      "A stranger can open it and understand the proof in under 60 seconds."
  };

  function applyLockedAdvanced() {
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

    const advDrawer = $maybe(["advancedDrawer", "docsDrawer"]);
    if (advDrawer && advDrawer.tagName.toLowerCase() === "details") {
      advDrawer.open = false;
    }

    const advWrap = $maybe(["advancedWrap", "advancedSection"]);
    if (advWrap) safeHide(advWrap);
  }

  // -----------------------------
  // Validation
  // -----------------------------
  function validateExternalization() {
    const one = ($("oneSentence")?.value || "").trim();
    const out = ($("output")?.value || "").trim();
    return one.length >= 10 && out.length >= 10;
  }

  // -----------------------------
  // Pills
  // -----------------------------
  function setPills({ phase, industry, proof, docs }) {
    if (phase) text("phasePill", `Phase: ${phase}`);
    if (industry) text("industryPill", `Industry: ${industry}`);
    if (proof) text("proofPill", proof);
    if (docs) text("sotPill", docs);
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

    for (const name of names) {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      sel.appendChild(opt);
    }

    const defaultName = names.includes("Supply Chain") ? "Supply Chain" : names[0];
    sel.value = defaultName;

    sel.addEventListener("change", () => {
      const indName = sel.value;
      const ind = industriesObj[indName];
      text("industryPill", `Industry: ${indName}`);

      const artifactSel = $("artifactSelect");
      if (artifactSel) {
        artifactSel.value = (ind && ind.defaultArtifact) || artifactSel.value || "dashboard";
      }

      // autosave selection changes
      scheduleAutoSave();
    });

    sel.dispatchEvent(new Event("change"));
  }

  function waitForIndustriesThenInit(done) {
    const maxTries = 60;
    const intervalMs = 50;
    let tries = 0;

    const tick = () => {
      tries++;
      const industriesObj = window.INDUSTRIES;

      if (industriesObj && Object.keys(industriesObj).length) {
        populateIndustrySelect(industriesObj);
        done?.();
        return;
      }

      if (tries >= maxTries) {
        console.error("INDUSTRIES not found. Check templates.js load order.");
        populateIndustrySelect({});
        text("industryPill", "Industry: —");
        done?.();
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

    if (ex) {
      setValue("oneSentence", ex.oneSentence || "");
      setValue("output", ex.output || "");
    } else {
      setValue(
        "oneSentence",
        "I want to build a visibility dashboard so a busy operator can see what’s stuck instantly."
      );
      setValue(
        "output",
        "The proof is done when it generates a working dashboard page + downloadable repo files."
      );
    }

    applyLockedAdvanced();
    scheduleAutoSave();
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

  function downloadTextFile(filename, content, mime = "text/plain;charset=utf-8") {
    const blob = new Blob([content], { type: mime });
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
  // Stage 4 preview
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
  // PDF generation (unchanged)
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
    (def.doneCriteria || []).forEach((c, i) =>
      doc.text(`• ${c}`, 18, 288 + i * 14, { maxWidth: 575 })
    );

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
    (cons.nonGoals || []).forEach((ng, i) =>
      doc.text(`• ${ng}`, 18, y + 18 + i * 14, { maxWidth: 575 })
    );

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
      alert(
        "Industry templates not loaded. Refresh the page. If it persists, check that templates.js loads before app.js."
      );
      return;
    }

    applyLockedAdvanced();

    if (!validateExternalization()) {
      alert("Fill in One sentence and Output first (keep it simple).");
      return;
    }

    // Stage 3
    currentFiles = typeof industry.proofRepo === "function" ? industry.proofRepo() : {};
    renderFiles(currentFiles);
    safeDisable($("btnDownloadAll"), Object.keys(currentFiles).length === 0);

    // Stage 4
    currentSOT = typeof industry.sotDefaults === "function" ? industry.sotDefaults() : null;
    if (!currentSOT) {
      alert("Docs generation failed: sotDefaults() returned nothing.");
      return;
    }
    renderSOTPreview(currentSOT);

    // Stage 5 snapshot
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

    setStatus("Session updated (auto-saved).");
    scheduleAutoSave(true);
  }

  // -----------------------------
  // Session: serialize / restore
  // -----------------------------
  function getSessionData() {
    return {
      version: SESSION_VERSION,
      savedAt: new Date().toISOString(),
      form: {
        industry: $("industrySelect")?.value || "",
        artifactType: $("artifactSelect")?.value || "dashboard",
        oneSentence: $("oneSentence")?.value || "",
        output: $("output")?.value || ""
      },
      generated: {
        currentFiles,
        currentSOT,
        currentStage5
      },
      pills: {
        phase: $("phasePill")?.textContent || "",
        industry: $("industryPill")?.textContent || "",
        proof: $("proofPill")?.textContent || "",
        docs: $("sotPill")?.textContent || ""
      }
    };
  }

  function applySessionData(session) {
    if (!session || typeof session !== "object") return;

    // Form first
    if (session.form) {
      if ($("industrySelect") && session.form.industry) {
        $("industrySelect").value = session.form.industry;
        $("industrySelect").dispatchEvent(new Event("change"));
      }
      if ($("artifactSelect") && session.form.artifactType) {
        $("artifactSelect").value = session.form.artifactType;
      }
      setValue("oneSentence", session.form.oneSentence || "");
      setValue("output", session.form.output || "");
    }

    applyLockedAdvanced();

    // Generated outputs
    const gen = session.generated || {};
    currentFiles = gen.currentFiles && typeof gen.currentFiles === "object" ? gen.currentFiles : {};
    currentSOT = gen.currentSOT && typeof gen.currentSOT === "object" ? gen.currentSOT : null;
    currentStage5 = typeof gen.currentStage5 === "string" ? gen.currentStage5 : "";

    renderFiles(currentFiles);

    // enable/disable output buttons based on what exists
    safeDisable($("btnDownloadAll"), !Object.keys(currentFiles || {}).length);

    const hasDocs = !!currentSOT;
    safeDisable($("btnPDF1"), !hasDocs);
    safeDisable($("btnPDF2"), !hasDocs);
    safeDisable($("btnPDF3"), !hasDocs);
    safeDisable($("btnPDF4"), !hasDocs);

    if (hasDocs) renderSOTPreview(currentSOT);

    text("stage5", currentStage5 || "");
    safeDisable($("btnDownloadStage5"), !currentStage5);

    // Pills
    const p = session.pills || {};
    if (p.phase) text("phasePill", p.phase);
    if (p.industry) text("industryPill", p.industry);
    if (p.proof) text("proofPill", p.proof);
    if (p.docs) text("sotPill", p.docs);
  }

  function saveSessionToLocalStorage() {
    try {
      const payload = JSON.stringify(getSessionData());
      localStorage.setItem(SESSION_KEY, payload);
    } catch (e) {
      // ignore (private mode / quota)
    }
  }

  function loadSessionFromLocalStorage() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return false;
      const session = JSON.parse(raw);
      applySessionData(session);
      return true;
    } catch (e) {
      return false;
    }
  }

  function clearSession() {
    // wipe storage
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {}

    // wipe state
    currentFiles = {};
    currentViewFile = null;
    currentSOT = null;
    currentStage5 = "";

    // wipe UI
    renderFiles({});
    closeViewer();
    text("sotPreview", "");
    text("stage5", "");
    safeDisable($("btnDownloadAll"), true);
    safeDisable($("btnPDF1"), true);
    safeDisable($("btnPDF2"), true);
    safeDisable($("btnPDF3"), true);
    safeDisable($("btnPDF4"), true);
    safeDisable($("btnDownloadStage5"), true);

    setPills({
      phase: "1–2",
      industry: "—",
      proof: "Proof: Not generated",
      docs: "Docs: Not generated"
    });

    setStatus("Cleared. No saved session.");
  }

  // -----------------------------
  // Save / Load JSON file
  // -----------------------------
  function saveSessionToFile() {
    const data = getSessionData();
    const pretty = JSON.stringify(data, null, 2);
    const stamp = new Date().toISOString().replaceAll(":", "-");
    downloadTextFile(`vibe-proof-session_${stamp}.json`, pretty, "application/json;charset=utf-8");
    setStatus("Saved proof session to JSON.");
    saveSessionToLocalStorage(); // keep in sync
  }

  function triggerLoadSessionFile() {
    const input = $("proofFile");
    if (!input) {
      alert("Missing <input id='proofFile' ...>. Add it under the buttons.");
      return;
    }
    input.value = ""; // allow re-loading same file
    input.click();
  }

  function handleSessionFileChosen(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const session = JSON.parse(String(reader.result || ""));
        applySessionData(session);
        saveSessionToLocalStorage();
        setStatus("Loaded proof session.");
      } catch (e) {
        alert("That file is not a valid Vibe proof session JSON.");
      }
    };
    reader.readAsText(file);
  }

  // -----------------------------
  // Auto-save (debounced)
  // -----------------------------
  let autoSaveTimer = null;

  function scheduleAutoSave(immediate = false) {
    if (immediate) {
      saveSessionToLocalStorage();
      return;
    }
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(saveSessionToLocalStorage, 450);
  }

  // -----------------------------
  // Refresh button behavior
  // -----------------------------
  function hardRefresh() {
    const url = new URL(window.location.href);
    url.searchParams.set("_", Date.now().toString());
    window.location.replace(url.toString());
  }

  // -----------------------------
  // Wire UI
  // -----------------------------
  function wireUI() {
    // Main CTA buttons
    const btnExample = $maybe(["btnAutofill", "btnExample", "btnUseExample"]);
    const btnBuild = $maybe(["btnGenerate", "btnBuild", "btnBuildProof"]);

    if (btnExample) btnExample.onclick = autofillExample;
    if (btnBuild) btnBuild.onclick = generateAll;

    // Inputs auto-save (so “resume session” is real)
    ["oneSentence", "output", "artifactSelect"].forEach((id) => {
      const el = $(id);
      if (el) el.addEventListener("input", () => scheduleAutoSave());
      if (el) el.addEventListener("change", () => scheduleAutoSave());
    });

    // Viewer buttons
    const btnCopy = $maybe(["btnCopy"]);
    const btnDownload = $maybe(["btnDownload"]);
    const btnClose = $maybe(["btnClose"]);
    const btnRefresh = $maybe(["btnRefresh", "btnViewerRefresh", "btnReFresh"]);

    if (btnCopy) btnCopy.onclick = copyViewer;
    if (btnDownload) btnDownload.onclick = downloadCurrentFile;
    if (btnClose) btnClose.onclick = closeViewer;
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

    // Session buttons
    const btnSave = $("btnSaveProof");
    const btnLoad = $("btnLoadProof");
    const btnClear = $("btnClearProof");

    if (btnSave) btnSave.onclick = saveSessionToFile;
    if (btnLoad) btnLoad.onclick = triggerLoadSessionFile;
    if (btnClear) btnClear.onclick = clearSession;

    // File input change
    const proofFile = $("proofFile");
    if (proofFile) {
      proofFile.addEventListener("change", (e) => {
        const file = e.target?.files?.[0];
        handleSessionFileChosen(file);
      });
    }
  }

  // -----------------------------
  // Boot
  // -----------------------------
  function boot() {
    applyLockedAdvanced();

    waitForIndustriesThenInit(() => {
      // After industries are populated, try resume
      const resumed = loadSessionFromLocalStorage();
      if (resumed) {
        setStatus("Resumed last proof session.");
      } else {
        setStatus("");
      }
    });

    wireUI();

    // Default state
    setPills({
      phase: "1–2",
      industry: "—",
      proof: "Proof: Not generated",
      docs: "Docs: Not generated"
    });

    // Disable outputs until build or load
    safeDisable($("btnDownloadAll"), true);
    safeDisable($("btnPDF1"), true);
    safeDisable($("btnPDF2"), true);
    safeDisable($("btnPDF3"), true);
    safeDisable($("btnPDF4"), true);
    safeDisable($("btnDownloadStage5"), true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
