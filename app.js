/* app.js — Vibe Coding Dashboard (Stage 1–5)
   - Stage 3: generate copy/paste static repo files (no approval gate)
   - Stage 4+5: auto-generate SOT PDFs + snapshot (based on industry templates)

   Fixes in this version:
   1) "No Options" issue:
      - DO NOT check window.INDUSTRIES (const INDUSTRIES isn't guaranteed on window)
      - check global lexical INDUSTRIES instead (typeof INDUSTRIES)
      - robust boot (wait for DOM + retry if templates not ready yet)
   2) Stage 4/5 not populating:
      - renderSOTPreview had wrong var refs / missing guards (fixed)
   3) PDF buttons:
      - autoTable guard with user-facing error if plugin missing
*/

let currentFiles = {};
let currentViewFile = null;
let currentSOT = null;
let currentStage5 = "";

const $ = (id) => document.getElementById(id);

function requireIndustries() {
  // IMPORTANT: don't use window.INDUSTRIES here.
  // templates.js defines `const INDUSTRIES = {...}` which is accessible as `INDUSTRIES`,
  // but not guaranteed to be a property on `window`.
  if (typeof INDUSTRIES === "undefined" || !INDUSTRIES || !Object.keys(INDUSTRIES).length) {
    throw new Error(
      "Industry templates not loaded. Make sure templates.js loads BEFORE app.js (and both are in repo root)."
    );
  }
}

function initIndustries() {
  const sel = $("industrySelect");
  if (!sel) throw new Error("Missing #industrySelect in index.html");

  sel.innerHTML = "";

  const names = Object.keys(INDUSTRIES);
  if (!names.length) {
    sel.innerHTML = "<option value=''>No industries loaded</option>";
    return;
  }

  for (const name of names) {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    sel.appendChild(opt);
  }

  sel.addEventListener("change", () => {
    const selectedName = sel.value;
    const ind = INDUSTRIES[selectedName];
    if ($("industryPill")) $("industryPill").textContent = `Industry: ${selectedName}`;
    if ($("artifactSelect")) $("artifactSelect").value = (ind && ind.defaultArtifact) || "dashboard";
  });

  // Prefer Supply Chain if present, else first key
  const defaultName = names.includes("Supply Chain") ? "Supply Chain" : names[0];
  sel.value = defaultName;
  sel.dispatchEvent(new Event("change"));
}

function autofill() {
  const industryName = $("industrySelect")?.value;
  const ind = industryName ? INDUSTRIES[industryName] : null;
  const ex = ind?.example;
  if (!ex) return;

  $("oneSentence").value = ex.oneSentence || "";
  $("constraint").value = ex.constraint || "";
  $("output").value = ex.output || "";
  $("realityTest").value = ex.realityTest || "";
}

function validateExternalization() {
  const fields = [
    $("oneSentence")?.value?.trim() || "",
    $("constraint")?.value?.trim() || "",
    $("output")?.value?.trim() || "",
    $("realityTest")?.value?.trim() || ""
  ];
  return fields.every((v) => v.length >= 10);
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
  if ($("viewerCode")) $("viewerCode").textContent = currentFiles[path] ?? "";
  $("fileViewer")?.classList.remove("hidden");
}

function closeViewer() {
  $("fileViewer")?.classList.add("hidden");
  currentViewFile = null;
}

async function copyViewer() {
  if (!currentViewFile) return;
  try {
    await navigator.clipboard.writeText(currentFiles[currentViewFile] ?? "");
    $("btnCopy").textContent = "Copied";
    setTimeout(() => ($("btnCopy").textContent = "Copy"), 900);
  } catch (e) {
    console.error(e);
    alert("Clipboard copy failed on this browser. Use manual select/copy.");
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
  downloadTextFile(name, currentFiles[currentViewFile] ?? "");
}

function downloadAllFiles() {
  // No zip to keep it static/no deps: download one by one.
  Object.entries(currentFiles).forEach(([path, content]) => {
    const safeName = path.replaceAll("/", "__");
    downloadTextFile(safeName, content ?? "");
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

/* ---------- Stage 4 preview (SAFE) ---------- */
function renderSOTPreview(sot) {
  const lines = [];
  lines.push("STAGE 4 — SOURCE OF TRUTH (AUTO-GENERATED)");
  lines.push("");

  const def = sot?.definition || {};
  const data = sot?.data || {};
  const flow = sot?.workflow || {};
  const cons = sot?.constraints || {};

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

  if ($("sotPreview")) $("sotPreview").textContent = lines.join("\n");
}

/* ---------- PDF generation ---------- */
function pdfTitle(doc, title, subtitle) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(title, 14, 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(subtitle, 14, 26);
}

function ensurePDFLibs(doc) {
  if (!window.jspdf || typeof window.jspdf?.jsPDF !== "function") {
    alert("jsPDF not loaded. Check the jsPDF script tag in index.html.");
    return false;
  }
  if (typeof doc.autoTable !== "function") {
    alert("autoTable not loaded. Check the jspdf-autotable script tag in index.html.");
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
  if (!ensurePDFLibs(doc)) return;

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
  if (!ensurePDFLibs(doc)) return;

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
  if (!ensurePDFLibs(doc)) return;

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

/* ---------- URL verify ---------- */
async function verifyUrl(url) {
  $("verifyResult").textContent = "Checking…";
  try {
    const res = await fetch(url, { method: "GET", mode: "cors", cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const looksLike = html.toLowerCase().includes("proof v1") || html.toLowerCase().includes("vibe");
    $("verifyResult").textContent = looksLike
      ? "✅ URL reachable. Page content looks like a proof page."
      : "✅ URL reachable. (Content signature not detected — still ok.)";
  } catch (e) {
    $("verifyResult").textContent =
      `❌ Could not verify: ${e.message}. (GitHub Pages sometimes blocks cross-origin reads; manual check may be needed.)`;
  }
}

/* ---------- Main generation ---------- */
function generateAll() {
  const industryName = $("industrySelect").value;
  const industry = INDUSTRIES[industryName];
  const artifactType = $("artifactSelect").value;

  if (!industry) {
    alert("Industry template not found. Check templates.js INDUSTRIES definitions.");
    return;
  }

  if (!validateExternalization()) {
    alert("Fill all four Externalization fields first (One Sentence / Constraint / Output / Reality Test).");
    return;
  }

  // Stage 3
  currentFiles = (typeof industry.proofRepo === "function") ? industry.proofRepo() : {};
  renderFiles(currentFiles);
  if ($("btnDownloadAll")) $("btnDownloadAll").disabled = Object.keys(currentFiles).length === 0;

  // Stage 4
  currentSOT = (typeof industry.sotDefaults === "function") ? industry.sotDefaults() : null;
  if (!currentSOT) {
    alert("Stage 4 failed: sotDefaults() did not return a SOT object for this industry.");
    return;
  }
  renderSOTPreview(currentSOT);

  // Stage 5
  const ext = {
    oneSentence: $("oneSentence").value.trim(),
    constraint: $("constraint").value.trim(),
    output: $("output").value.trim(),
    realityTest: $("realityTest").value.trim()
  };

  currentStage5 = makeStage5Snapshot(industryName, artifactType, ext);
  if ($("stage5")) $("stage5").textContent = currentStage5;
  if ($("btnDownloadStage5")) $("btnDownloadStage5").disabled = false;

  // Enable PDF buttons
  if ($("btnPDF1")) $("btnPDF1").disabled = false;
  if ($("btnPDF2")) $("btnPDF2").disabled = false;
  if ($("btnPDF3")) $("btnPDF3").disabled = false;
  if ($("btnPDF4")) $("btnPDF4").disabled = false;

  setPills({
    phase: "3–5",
    industry: industryName,
    proof: "Proof: Generated",
    sot: "SOT: Generated"
  });

  $("proofPill")?.classList.add("good");
  $("sotPill")?.classList.add("good");
}

function wireUI() {
  $("btnAutofill").onclick = autofill;
  $("btnGenerate").onclick = generateAll;

  $("btnClose").onclick = closeViewer;
  $("btnCopy").onclick = copyViewer;
  $("btnDownload").onclick = downloadCurrentFile;
  $("btnDownloadAll").onclick = downloadAllFiles;

  $("btnPDF1").onclick = () => generatePDF1(currentSOT?.definition || {});
  $("btnPDF2").onclick = () => generatePDF2(currentSOT?.data || {});
  $("btnPDF3").onclick = () => generatePDF3(currentSOT?.workflow || {});
  $("btnPDF4").onclick = () => generatePDF4(currentSOT?.constraints || {});

  $("btnDownloadStage5").onclick = () =>
    downloadTextFile("Stage5_Snapshot.txt", currentStage5 || "");

  $("btnVerify").onclick = () => {
    const url = $("proofUrl").value.trim();
    if (!url) return;
    verifyUrl(url);
  };
}

/* ---------- Robust boot ---------- */
function boot(triesLeft = 10) {
  try {
    requireIndustries();
    initIndustries();
    wireUI();
    autofill();
    setPills({
      phase: "1–2",
      industry: $("industrySelect").value || "—",
      proof: "Proof: Not generated",
      sot: "SOT: Not generated"
    });
  } catch (e) {
    console.error(e);
    // If templates.js is slow/cached weirdly, retry a few times
    if (triesLeft > 0) {
      setTimeout(() => boot(triesLeft - 1), 120);
      return;
    }
    alert(e.message);
  }
}

// Run after DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => boot());
} else {
  boot();
}
