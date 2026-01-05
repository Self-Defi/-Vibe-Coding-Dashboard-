/* Vibe Coding Dashboard
   Option 1 UI: keep advanced fields behind-the-scenes + add Refresh button

   Changes:
   - Constraint + Reality Test are permanently auto-set (hidden defaults)
   - Validation requires ONLY: One Sentence + Output
   - Adds refresh() handler (expects a button with id="btnRefresh" if present)
   - Safe guards so app doesn't crash if optional UI elements are missing
*/

let currentFiles = {};
let currentViewFile = null;
let currentSOT = null;
let currentStage5 = "";

const $ = (id) => document.getElementById(id);

// ---- Behind-the-scenes defaults (permanent) ----
const DEFAULT_CONSTRAINT =
  "I will build the first proof in 0.1 hours using static GitHub Pages files and a CSV export.";
const DEFAULT_REALITY_TEST =
  "A stranger can open it and understand it in under 60 seconds.";

// Some industries already provide example.constraint/example.realityTest.
// We will still enforce defaults if empty, and we will always keep them populated.
function applyHiddenDefaults() {
  const constraintEl = $("constraint");
  const realityEl = $("realityTest");

  if (constraintEl) {
    const v = (constraintEl.value || "").trim();
    if (!v) constraintEl.value = DEFAULT_CONSTRAINT;
  }
  if (realityEl) {
    const v = (realityEl.value || "").trim();
    if (!v) realityEl.value = DEFAULT_REALITY_TEST;
  }
}

// Prefer industry examples, but never leave hidden fields blank
function applyIndustryExampleHidden(industryName) {
  const ind = (window.INDUSTRIES || {})[industryName];
  const ex = ind?.example;

  const constraintEl = $("constraint");
  const realityEl = $("realityTest");

  if (constraintEl) {
    const v = (constraintEl.value || "").trim();
    if (!v) constraintEl.value = (ex?.constraint || DEFAULT_CONSTRAINT);
  }
  if (realityEl) {
    const v = (realityEl.value || "").trim();
    if (!v) realityEl.value = (ex?.realityTest || DEFAULT_REALITY_TEST);
  }

  applyHiddenDefaults();
}

function assertGlobals() {
  if (typeof window.INDUSTRIES === "undefined") {
    throw new Error(
      "INDUSTRIES is not defined. Ensure templates.js loads before app.js."
    );
  }
}

function initIndustries() {
  const sel = $("industrySelect");
  if (!sel) return;

  sel.innerHTML = "";

  const names = Object.keys(window.INDUSTRIES || {});
  if (!names.length) {
    sel.innerHTML = "<option value=''>No industries loaded</option>";
    return;
  }

  names.forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    sel.appendChild(opt);
  });

  sel.addEventListener("change", () => {
    const selectedName = sel.value;
    const ind = window.INDUSTRIES[selectedName];

    const industryPill = $("industryPill");
    if (industryPill) industryPill.textContent = `Industry: ${selectedName}`;

    const artifact = $("artifactSelect");
    if (artifact) artifact.value = (ind && ind.defaultArtifact) || "dashboard";

    // Keep hidden fields permanently set
    applyIndustryExampleHidden(selectedName);
  });

  const defaultName = names.includes("Supply Chain") ? "Supply Chain" : names[0];
  sel.value = defaultName;
  sel.dispatchEvent(new Event("change"));
}

function autofill() {
  const sel = $("industrySelect");
  if (!sel) return;

  const industryName = sel.value;
  const ind = window.INDUSTRIES[industryName];
  const ex = ind?.example;

  if (!ex) return;

  const one = $("oneSentence");
  const out = $("output");
  if (one) one.value = ex.oneSentence || "";
  if (out) out.value = ex.output || "";

  // Hidden fields (permanent)
  const constraintEl = $("constraint");
  const realityEl = $("realityTest");
  if (constraintEl) constraintEl.value = ex.constraint || DEFAULT_CONSTRAINT;
  if (realityEl) realityEl.value = ex.realityTest || DEFAULT_REALITY_TEST;

  applyHiddenDefaults();
}

// ✅ Validation is now simple: only the two visible fields
function validateExternalization() {
  const one = ($("oneSentence")?.value || "").trim();
  const out = ($("output")?.value || "").trim();
  return one.length >= 10 && out.length >= 10;
}

function setPills({ phase, industry, proof, sot }) {
  if (phase && $("phasePill")) $("phasePill").textContent = `Phase: ${phase}`;
  if (industry && $("industryPill")) $("industryPill").textContent = `Industry: ${industry}`;
  if (proof && $("proofPill")) $("proofPill").textContent = proof;
  if (sot && $("sotPill")) $("sotPill").textContent = sot;
}

function renderFiles(files) {
  const list = $("filesList");
  if (!list) return;

  list.innerHTML = "";
  Object.keys(files).forEach((path) => {
    const chip = document.createElement("div");
    chip.className = "fileChip";
    chip.textContent = path;
    chip.onclick = () => openViewer(path);
    list.appendChild(chip);
  });
}

function openViewer(path) {
  currentViewFile = path;
  if ($("viewerTitle")) $("viewerTitle").textContent = path;
  if ($("viewerCode")) $("viewerCode").textContent = currentFiles[path] || "";
  $("fileViewer")?.classList.remove("hidden");
}

function closeViewer() {
  $("fileViewer")?.classList.add("hidden");
  currentViewFile = null;
}

async function copyViewer() {
  if (!currentViewFile) return;
  await navigator.clipboard.writeText(currentFiles[currentViewFile] || "");
  const btn = $("btnCopy");
  if (!btn) return;
  btn.textContent = "Copied";
  setTimeout(() => (btn.textContent = "Copy"), 900);
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
  Object.entries(currentFiles).forEach(([path, content]) => {
    const safeName = path.replaceAll("/", "__");
    downloadTextFile(safeName, content);
  });
}

function makeStage5Snapshot(industryName, artifactType, ext) {
  const proofPaths = Object.keys(currentFiles);
  const now = new Date().toISOString();

  const exists = [
    "Stage 3 proof repo files generated (static GitHub default)",
    `Industry template applied: ${industryName}`,
    `Artifact type: ${artifactType}`,
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
    "EXTERNALIZED THOUGHT (LOCKED INPUT)",
    `One sentence: ${ext.oneSentence}`,
    `Constraint: ${ext.constraint}`,
    `Output: ${ext.output}`,
    `Reality test: ${ext.realityTest}`,
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

function renderSOTPreview(sot) {
  const out = $("sotPreview");
  if (!out) return;

  const def = sot?.definition || {};
  const data = sot?.data || {};
  const flow = sot?.workflow || {};
  const cons = sot?.constraints || {};

  const lines = [];
  lines.push("STAGE 4 — SOURCE OF TRUTH (AUTO-GENERATED)");
  lines.push("");
  lines.push("PDF 1 — Definition");
  lines.push(`- Problem: ${def.problem || "—"}`);
  lines.push(`- Primary user: ${def.primaryUser || "—"}`);
  lines.push(`- Secondary users: ${def.secondaryUsers || "—"}`);
  lines.push(`- Artifact: ${def.artifactType || "—"}`);
  lines.push(`- Description: ${def.description || "—"}`);
  lines.push(`- Time-to-understand: ${def.timeToUnderstand || "—"}`);
  lines.push("");
  lines.push("PDF 2 — Data");
  lines.push(`- Required fields: ${(data.requiredFields || []).length}`);
  lines.push(`- Sources: ${(data.sources || []).length}`);
  lines.push(`- Validity rules: ${(data.validityRules || []).length}`);
  lines.push("");
  lines.push("PDF 3 — Workflow");
  lines.push(`- States: ${(flow.states || []).length}`);
  lines.push(`- Triggers: ${(flow.triggers || []).length}`);
  lines.push("");
  lines.push("PDF 4 — Constraints");
  lines.push(`- Ops constraints: ${(cons.ops || []).length}`);
  lines.push(`- Non-goals: ${(cons.nonGoals || []).length}`);

  out.textContent = lines.join("\n");
}

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
    alert("PDF table plugin (autoTable) not loaded. Check index.html script tags.");
    return false;
  }
  return true;
}

function generatePDF1(def) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "letter" });

  pdfTitle(doc, "Vibe Coding", "Stage 4 — Source of Truth | PDF 1 — Definition");

  doc.setFontSize(12);
  doc.text("Problem Statement (Locked)", 14, 56);
  doc.setFontSize(10);
  doc.text(def.problem || "—", 14, 72, { maxWidth: 580 });

  doc.setFontSize(12);
  doc.text("Intended User", 14, 112);
  doc.setFontSize(10);
  doc.text(`Primary: ${def.primaryUser || "—"}`, 14, 128);
  doc.text(`Secondary: ${def.secondaryUsers || "—"}`, 14, 144);

  doc.setFontSize(12);
  doc.text("Output Definition", 14, 180);
  doc.setFontSize(10);
  doc.text(`Artifact Type: ${def.artifactType || "—"}`, 14, 196);
  doc.text(`Description: ${def.description || "—"}`, 14, 212, { maxWidth: 580 });
  doc.text(`Time-to-Understand: ${def.timeToUnderstand || "—"}`, 14, 238);

  doc.setFontSize(12);
  doc.text("Definition of Done", 14, 270);
  doc.setFontSize(10);
  const startY = 288;
  (def.doneCriteria || []).forEach((c, i) =>
    doc.text(`• ${c}`, 18, startY + i * 14, { maxWidth: 575 })
  );

  doc.save("SOT_PDF1_Definition.pdf");
}

function generatePDF2(data) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  if (!ensureAutoTable(doc)) return;

  pdfTitle(doc, "Vibe Coding", "Stage 4 — Source of Truth | PDF 2 — Data");

  doc.setFontSize(12);
  doc.text("Required Data Fields", 14, 56);
  doc.autoTable({
    startY: 68,
    head: [["Field Name", "Description", "Required"]],
    body: data.requiredFields || [],
    theme: "grid",
    styles: { fontSize: 9 }
  });

  let y = doc.lastAutoTable.finalY + 18;
  doc.setFontSize(12);
  doc.text("Source of Truth per Field", 14, y);
  doc.autoTable({
    startY: y + 12,
    head: [["Field", "Source System", "Owner", "Refresh Cadence"]],
    body: data.sources || [],
    theme: "grid",
    styles: { fontSize: 9 }
  });

  y = doc.lastAutoTable.finalY + 18;
  doc.setFontSize(12);
  doc.text("Data Validity Rules", 14, y);
  doc.setFontSize(10);
  (data.validityRules || []).forEach((r, i) =>
    doc.text(`• ${r}`, 18, y + 18 + i * 14, { maxWidth: 575 })
  );

  doc.save("SOT_PDF2_Data.pdf");
}

function generatePDF3(flow) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  if (!ensureAutoTable(doc)) return;

  pdfTitle(doc, "Vibe Coding", "Stage 4 — Source of Truth | PDF 3 — Workflow");

  doc.setFontSize(12);
  doc.text("System States", 14, 56);
  doc.autoTable({
    startY: 68,
    head: [["State", "Description"]],
    body: flow.states || [],
    theme: "grid",
    styles: { fontSize: 9 }
  });

  let y = doc.lastAutoTable.finalY + 18;
  doc.setFontSize(12);
  doc.text("Triggers & Thresholds", 14, y);
  doc.autoTable({
    startY: y + 12,
    head: [["Trigger", "Condition", "Action"]],
    body: flow.triggers || [],
    theme: "grid",
    styles: { fontSize: 9 }
  });

  y = doc.lastAutoTable.finalY + 18;
  doc.setFontSize(12);
  doc.text("Ownership & Escalation", 14, y);
  doc.autoTable({
    startY: y + 12,
    head: [["Stage", "Owner", "Escalation Path"]],
    body: flow.ownership || [],
    theme: "grid",
    styles: { fontSize: 9 }
  });

  doc.save("SOT_PDF3_Workflow.pdf");
}

function generatePDF4(cons) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  if (!ensureAutoTable(doc)) return;

  pdfTitle(doc, "Vibe Coding", "Stage 4 — Source of Truth | PDF 4 — Constraints");

  doc.setFontSize(12);
  doc.text("Operational Constraints", 14, 56);
  doc.autoTable({
    startY: 68,
    head: [["Constraint Type", "Details"]],
    body: cons.ops || [],
    theme: "grid",
    styles: { fontSize: 9 }
  });

  let y = doc.lastAutoTable.finalY + 18;
  doc.setFontSize(12);
  doc.text("Explicit Non-Goals", 14, y);
  doc.setFontSize(10);
  (cons.nonGoals || []).forEach((ng, i) =>
    doc.text(`• ${ng}`, 18, y + 18 + i * 14, { maxWidth: 575 })
  );

  doc.setFontSize(10);
  doc.text("Sign-off is optional in this dashboard flow (auto-generated).", 14, 740);

  doc.save("SOT_PDF4_Constraints.pdf");
}

async function verifyUrl(url) {
  const out = $("verifyResult");
  if (out) out.textContent = "Checking…";
  try {
    const res = await fetch(url, { method: "GET", mode: "cors", cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const looksLike = html.toLowerCase().includes("proof v1") || html.toLowerCase().includes("vibe");
    if (out) {
      out.textContent = looksLike
        ? "✅ URL reachable. Page content looks like a proof page."
        : "✅ URL reachable. (Content signature not detected — still ok.)";
    }
  } catch (e) {
    if (out) {
      out.textContent = `❌ Could not verify: ${e.message}. (GitHub Pages may block cross-origin reads; manual check may be needed.)`;
    }
  }
}

function generateAll() {
  const industryName = $("industrySelect")?.value || "";
  const industry = (window.INDUSTRIES || {})[industryName];
  const artifactType = $("artifactSelect")?.value || "dashboard";

  if (!industry) {
    alert("Industry template not found. Check templates.js INDUSTRIES definitions.");
    return;
  }

  // Force hidden defaults in case user never opened Advanced
  applyIndustryExampleHidden(industryName);

  if (!validateExternalization()) {
    alert("Fill in One Sentence + Output (the only required fields).");
    return;
  }

  // Stage 3
  currentFiles = (typeof industry.proofRepo === "function") ? industry.proofRepo() : {};
  renderFiles(currentFiles);

  const dlAll = $("btnDownloadAll");
  if (dlAll) dlAll.disabled = Object.keys(currentFiles).length === 0;

  // Stage 4 + 5
  currentSOT = (typeof industry.sotDefaults === "function") ? industry.sotDefaults() : null;
  if (!currentSOT) {
    alert("Stage 4 failed: sotDefaults() did not return a SOT object for this industry.");
    return;
  }

  renderSOTPreview(currentSOT);

  const ext = {
    oneSentence: ($("oneSentence")?.value || "").trim(),
    constraint: ($("constraint")?.value || "").trim(),
    output: ($("output")?.value || "").trim(),
    realityTest: ($("realityTest")?.value || "").trim()
  };

  currentStage5 = makeStage5Snapshot(industryName, artifactType, ext);

  const stage5 = $("stage5");
  if (stage5) stage5.textContent = currentStage5;

  const dl5 = $("btnDownloadStage5");
  if (dl5) dl5.disabled = false;

  // Enable PDFs
  $("btnPDF1") && ($("btnPDF1").disabled = false);
  $("btnPDF2") && ($("btnPDF2").disabled = false);
  $("btnPDF3") && ($("btnPDF3").disabled = false);
  $("btnPDF4") && ($("btnPDF4").disabled = false);

  setPills({
    phase: "3–5",
    industry: industryName,
    proof: "Proof: Generated",
    sot: "Docs: Generated"
  });

  $("proofPill")?.classList.add("good");
  $("sotPill")?.classList.add("good");
}

// ---- Refresh (reset everything back to clean state) ----
function refreshApp() {
  // Keep industry selection; reset the rest
  currentFiles = {};
  currentViewFile = null;
  currentSOT = null;
  currentStage5 = "";

  // Clear outputs
  const filesList = $("filesList");
  if (filesList) filesList.innerHTML = "";

  $("fileViewer")?.classList.add("hidden");

  const sotPrev = $("sotPreview");
  if (sotPrev) sotPrev.textContent = "";

  const stage5 = $("stage5");
  if (stage5) stage5.textContent = "";

  const verify = $("verifyResult");
  if (verify) verify.textContent = "";

  // Disable buttons
  $("btnDownloadAll") && ($("btnDownloadAll").disabled = true);
  $("btnDownloadStage5") && ($("btnDownloadStage5").disabled = true);
  $("btnPDF1") && ($("btnPDF1").disabled = true);
  $("btnPDF2") && ($("btnPDF2").disabled = true);
  $("btnPDF3") && ($("btnPDF3").disabled = true);
  $("btnPDF4") && ($("btnPDF4").disabled = true);

  // Reset pills
  setPills({
    phase: "1–2",
    industry: $("industrySelect")?.value || "—",
    proof: "Proof: Not generated",
    sot: "Docs: Not generated"
  });

  $("proofPill")?.classList.remove("good");
  $("sotPill")?.classList.remove("good");

  // Re-apply hidden defaults
  applyIndustryExampleHidden($("industrySelect")?.value || "");
}

function wireUI() {
  $("btnAutofill") && ($("btnAutofill").onclick = autofill);
  $("btnGenerate") && ($("btnGenerate").onclick = generateAll);

  $("btnClose") && ($("btnClose").onclick = closeViewer);
  $("btnCopy") && ($("btnCopy").onclick = copyViewer);
  $("btnDownload") && ($("btnDownload").onclick = downloadCurrentFile);
  $("btnDownloadAll") && ($("btnDownloadAll").onclick = downloadAllFiles);

  $("btnPDF1") && ($("btnPDF1").onclick = () => generatePDF1(currentSOT?.definition || {}));
  $("btnPDF2") && ($("btnPDF2").onclick = () => generatePDF2(currentSOT?.data || {}));
  $("btnPDF3") && ($("btnPDF3").onclick = () => generatePDF3(currentSOT?.workflow || {}));
  $("btnPDF4") && ($("btnPDF4").onclick = () => generatePDF4(currentSOT?.constraints || {}));

  $("btnDownloadStage5") && ($("btnDownloadStage5").onclick =
    () => downloadTextFile("Stage5_Snapshot.txt", currentStage5 || "")
  );

  $("btnVerify") && ($("btnVerify").onclick = () => {
    const url = ($("proofUrl")?.value || "").trim();
    if (!url) return;
    verifyUrl(url);
  });

  // NEW: Refresh button (if you add it in index.html)
  $("btnRefresh") && ($("btnRefresh").onclick = refreshApp);

  // Keep hidden defaults enforced if user types (optional)
  $("constraint") && ($("constraint").addEventListener("blur", applyHiddenDefaults));
  $("realityTest") && ($("realityTest").addEventListener("blur", applyHiddenDefaults));
}

(function main() {
  try {
    assertGlobals();
    initIndustries();
    wireUI();

    // Initial: fill visible fields from examples, and force hidden defaults
    autofill();
    applyHiddenDefaults();

    setPills({
      phase: "1–2",
      industry: $("industrySelect")?.value || "—",
      proof: "Proof: Not generated",
      sot: "Docs: Not generated"
    });
  } catch (e) {
    console.error(e);
    alert(e.message);
  }
})();
