/* app.js
   Vibe Coded — Dashboard (v1.0-proof)
   - Uses templates.js (window.VIBE_CODED_TEMPLATES.build)
   - Ensures SVG changes by type + pain point (no “same image” issue)
   - Adds type to share link params
*/

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
    return (str || "vibe-coded-proof")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "vibe-coded-proof";
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
      '"': "&quot;",
    }[c]));
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

    // Ensure templates.js is loaded
    if (!window.VIBE_CODED_TEMPLATES || typeof window.VIBE_CODED_TEMPLATES.build !== "function") {
      status.textContent = "templates.js not loaded. Ensure index.html loads templates.js before app.js.";
      return;
    }

    localStorage.setItem("vc_last_pain", pain);
    localStorage.setItem("vc_last_type", type);

    // Build via template engine (per option)
    const built = window.VIBE_CODED_TEMPLATES.build({ type, pain });

    current.pain = built.pain;
    current.type = built.type;
    current.prompt = built.prompt;
    current.svg = built.svg;
    current.files = built.files;

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

  // Share link (include pain + type)
  copyLinkBtn.addEventListener("click", async () => {
    const pain = (painInput.value || "").trim();
    const type = (systemType.value || "").trim();
    const url = new URL(window.location.href);

    if (pain) url.searchParams.set("pain", pain);
    else url.searchParams.delete("pain");

    if (type) url.searchParams.set("type", type);
    else url.searchParams.delete("type");

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
  const typeParam = qs("type");

  const lastPain = localStorage.getItem("vc_last_pain");
  const lastType = localStorage.getItem("vc_last_type");

  if (typeParam) {
    systemType.value = typeParam;
    paramStatus.textContent = "Loaded from share link";
  } else if (lastType) {
    systemType.value = lastType;
  }

  if (painParam) {
    painInput.value = painParam;
    paramStatus.textContent = "Loaded from share link";
  } else if (lastPain) {
    painInput.value = lastPain;
    if (!paramStatus.textContent) paramStatus.textContent = "Loaded last request";
  } else {
    if (!paramStatus.textContent) paramStatus.textContent = "";
  }

  if ((painInput.value || "").trim()) {
    status.textContent = "Ready. Click “Generate first build”.";
  }

  setTab("preview");
})();
