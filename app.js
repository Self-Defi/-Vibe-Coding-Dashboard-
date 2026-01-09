/* app.js — Vibe Coded Studio Dashboard (UI-only)
   Uses templates.js (VC_TEMPLATES) + JSZip (CDN) for real ZIP download.
*/

(() => {
  const $ = (id) => document.getElementById(id);

  const thought = $("thought");
  const systemType = $("systemType");
  const generateBtn = $("generateBtn");
  const resetBtn = $("resetBtn");
  const statusText = $("statusText");
  const lastLoaded = $("lastLoaded");

  const svgBox = $("svgBox");
  const promptBox = $("promptBox");
  const repoBox = $("repoBox");
  const downloadBox = $("downloadBox");

  const downloadSvgBtn = $("downloadSvgBtn");
  const copyPromptBtn = $("copyPromptBtn");
  const copyFilesBtn = $("copyFilesBtn");
  const downloadZipBtn = $("downloadZipBtn");

  const tabs = Array.from(document.querySelectorAll(".tab"));
  const tabSystem = $("tab-system");
  const tabRepo = $("tab-repo");
  const tabDownload = $("tab-download");

  $("yr").textContent = new Date().getFullYear();

  const KEY = "vcs_dashboard_last_request_v2";

  function setGenerateEnabled() {
    const hasThought = thought.value.trim().length > 0;
    generateBtn.disabled = !hasThought;
    statusText.textContent = hasThought ? 'Ready. Click "Generate first build".' : "Write the Thought first.";
  }

  function showTab(which) {
    tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === which));
    tabSystem.style.display = which === "system" ? "block" : "none";
    tabRepo.style.display = which === "repo" ? "block" : "none";
    tabDownload.style.display = which === "download" ? "block" : "none";
  }

  tabs.forEach((t) => t.addEventListener("click", () => showTab(t.dataset.tab)));
  thought.addEventListener("input", setGenerateEnabled);

  function saveLastRequest() {
    localStorage.setItem(KEY, JSON.stringify({
      thought: thought.value,
      systemType: systemType.value,
      at: new Date().toISOString()
    }));
  }

  function loadLastRequest() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.thought) thought.value = data.thought;
      if (data.systemType) systemType.value = data.systemType;
      lastLoaded.textContent = "Loaded last request";
    } catch (e) {}
  }

  async function copyText(txt) {
    try {
      await navigator.clipboard.writeText(txt);
      statusText.textContent = "Copied.";
      setTimeout(setGenerateEnabled, 900);
    } catch (e) {
      statusText.textContent = "Copy blocked by browser.";
      setTimeout(setGenerateEnabled, 1200);
    }
  }

  function downloadFile(filename, content, mime = "text/plain;charset=utf-8") {
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

  function build() {
    const t = thought.value.trim();
    const sys = systemType.value;

    const prompt = window.VC_TEMPLATES.canonicalPrompt(sys, t);
    const svg = window.VC_TEMPLATES.systemSvg(sys, t);
    const fileMap = window.VC_TEMPLATES.buildFileMap(sys, t);

    return { t, sys, prompt, svg, fileMap };
  }

  function renderRepoBundle(fileMap) {
    // Show actual file contents (not just file names)
    const paths = Object.keys(fileMap).sort();
    let out = "";
    for (const p of paths) {
      out += `// ===============================\n// ${p}\n// ===============================\n`;
      out += `${fileMap[p]}\n\n`;
    }
    return out.trim();
  }

  function setGeneratedUI(payload) {
    svgBox.innerHTML = payload.svg;
    promptBox.textContent = payload.prompt;

    repoBox.textContent = renderRepoBundle(payload.fileMap);
    downloadBox.textContent = "ZIP bundle ready: README + docs + diagram + scaffold index.html";

    downloadSvgBtn.disabled = false;
    copyPromptBtn.disabled = false;
    copyFilesBtn.disabled = false;
    downloadZipBtn.disabled = false;

    statusText.textContent = "Generated. Preview + ZIP export ready.";
  }

  async function downloadZip(fileMap) {
    if (!window.JSZip) {
      statusText.textContent = "JSZip failed to load. Refresh page and try again.";
      return;
    }

    const zip = new JSZip();
    for (const [path, content] of Object.entries(fileMap)) {
      zip.file(path, content);
    }

    statusText.textContent = "Building ZIP…";
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "vcs-first-build.zip";
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
    statusText.textContent = "ZIP downloaded.";
    setTimeout(setGenerateEnabled, 1000);
  }

  // Actions
  generateBtn.addEventListener("click", () => {
    const payload = build();
    setGeneratedUI(payload);
    saveLastRequest();
  });

  resetBtn.addEventListener("click", () => {
    thought.value = "";
    systemType.selectedIndex = 0;

    svgBox.textContent = "Generate a build to preview the system visualization.";
    promptBox.textContent = "Generate a build to produce the locked prompt.";
    repoBox.textContent = "Generate a build to generate the repo scaffold.";
    downloadBox.textContent = "Generate a build to enable downloads.";

    downloadSvgBtn.disabled = true;
    copyPromptBtn.disabled = true;
    copyFilesBtn.disabled = true;
    downloadZipBtn.disabled = true;

    localStorage.removeItem(KEY);
    setGenerateEnabled();
  });

  downloadSvgBtn.addEventListener("click", () => {
    const svgEl = svgBox.querySelector("svg");
    if (!svgEl) return;
    downloadFile("system.svg", svgEl.outerHTML, "image/svg+xml;charset=utf-8");
  });

  copyPromptBtn.addEventListener("click", () => copyText(promptBox.textContent));
  copyFilesBtn.addEventListener("click", () => copyText(repoBox.textContent));
  downloadZipBtn.addEventListener("click", () => downloadZip(build().fileMap));

  // Boot
  loadLastRequest();
  setGenerateEnabled();
  showTab("system");
})();
