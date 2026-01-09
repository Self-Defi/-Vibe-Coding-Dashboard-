/* app.js
   Wires the dashboard UI to the templates generator.
*/

(function () {
  const $ = (id) => document.getElementById(id);

  const thought = $("thought");
  const systemType = $("systemType");
  const generateBtn = $("generateBtn");
  const resetBtn = $("resetBtn");
  const statusText = $("statusText");
  const lastLoaded = $("lastLoaded");

  const promptBox = $("promptBox");
  const svgBox = $("svgBox");

  const copyPromptBtn = $("copyPromptBtn");
  const copyNegBtn = $("copyNegBtn");
  const downloadSvgBtn = $("downloadSvgBtn");

  const treeBox = $("treeBox");
  const fileSelect = $("fileSelect");
  const fileBox = $("fileBox");
  const copyTreeBtn = $("copyTreeBtn");
  const copyFileBtn = $("copyFileBtn");

  const downloadZipBtn = $("downloadZipBtn");
  const downloadBox = $("downloadBox");

  const tabs = Array.from(document.querySelectorAll(".tab"));
  const tabSystem = $("tab-system");
  const tabRepo = $("tab-repo");
  const tabDownload = $("tab-download");

  $("yr").textContent = new Date().getFullYear();

  const KEY = "vcs_dashboard_last_request_v2";
  let lastPayload = null;

  function setGenerateEnabled(){
    const hasThought = thought.value.trim().length > 0;
    generateBtn.disabled = !hasThought;
    statusText.textContent = hasThought
      ? 'Ready. Click "Generate first build".'
      : "Write the Thought first.";
  }

  function showTab(which){
    tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === which));
    tabSystem.style.display = which === "system" ? "block" : "none";
    tabRepo.style.display = which === "repo" ? "block" : "none";
    tabDownload.style.display = which === "download" ? "block" : "none";
  }
  tabs.forEach(t => t.addEventListener("click", () => showTab(t.dataset.tab)));

  thought.addEventListener("input", setGenerateEnabled);

  function saveLastRequest(){
    const data = {
      thought: thought.value,
      systemType: systemType.value,
      at: new Date().toISOString()
    };
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function loadLastRequest(){
    try{
      const raw = localStorage.getItem(KEY);
      if(!raw){
        lastLoaded.textContent = "No previous request";
        return;
      }
      const data = JSON.parse(raw);
      if(data.thought) thought.value = data.thought;
      if(data.systemType) systemType.value = data.systemType;

      lastLoaded.textContent = data.at ? `Loaded last request · ${new Date(data.at).toLocaleString()}` : "Loaded last request";
      setGenerateEnabled();
    }catch(e){
      lastLoaded.textContent = "No previous request";
    }
  }

  function setGeneratedUI(payload){
    lastPayload = payload;

    // System tab
    promptBox.textContent = payload.files["prompt.txt"];
    svgBox.innerHTML = payload.files["diagrams/system.svg"];

    copyPromptBtn.disabled = false;
    copyNegBtn.disabled = false;
    downloadSvgBtn.disabled = false;

    // Repo tab
    treeBox.textContent = payload.tree;

    fileSelect.disabled = false;
    fileSelect.innerHTML = "";
    const keys = Object.keys(payload.files);
    keys.forEach(k => {
      const opt = document.createElement("option");
      opt.value = k;
      opt.textContent = k;
      fileSelect.appendChild(opt);
    });
    fileSelect.value = "README.md";
    fileBox.textContent = payload.files[fileSelect.value];

    copyTreeBtn.disabled = false;
    copyFileBtn.disabled = false;

    // Download tab
    downloadZipBtn.disabled = false;
    downloadBox.textContent = "ZIP will include: README.md, index.html, styles.css, prompt.txt, negative.txt, diagrams/system.svg";

    statusText.textContent = "Generated. Deliverables are live.";
  }

  fileSelect.addEventListener("change", () => {
    if(!lastPayload) return;
    fileBox.textContent = lastPayload.files[fileSelect.value] || "—";
  });

  generateBtn.addEventListener("click", () => {
    const t = thought.value.trim();
    const sys = systemType.value;

    const payload = window.VC_TEMPLATES.buildUserRepoFiles({ thought: t, systemType: sys });

    setGeneratedUI(payload);
    saveLastRequest();
  });

  resetBtn.addEventListener("click", () => {
    thought.value = "";
    systemType.selectedIndex = 0;

    promptBox.textContent = "Generate a build to produce the locked prompt.";
    svgBox.textContent = "Generate a build to preview the system visualization.";

    treeBox.textContent = "Generate a build to preview the repository scaffold.";
    fileSelect.disabled = true;
    fileSelect.innerHTML = "";
    fileBox.textContent = "—";

    downloadBox.textContent = "Generate a build to enable downloads.";

    copyPromptBtn.disabled = true;
    copyNegBtn.disabled = true;
    downloadSvgBtn.disabled = true;

    copyTreeBtn.disabled = true;
    copyFileBtn.disabled = true;

    downloadZipBtn.disabled = true;

    localStorage.removeItem(KEY);
    lastPayload = null;
    lastLoaded.textContent = "No previous request";
    setGenerateEnabled();
  });

  async function copyText(txt){
    try{
      await navigator.clipboard.writeText(txt);
      statusText.textContent = "Copied.";
      setTimeout(() => setGenerateEnabled(), 900);
    }catch(e){
      statusText.textContent = "Copy blocked by browser.";
      setTimeout(() => setGenerateEnabled(), 1200);
    }
  }

  copyPromptBtn.addEventListener("click", () => {
    if(!lastPayload) return;
    copyText(lastPayload.files["prompt.txt"]);
  });

  copyNegBtn.addEventListener("click", () => {
    if(!lastPayload) return;
    copyText(lastPayload.files["negative.txt"]);
  });

  copyTreeBtn.addEventListener("click", () => {
    if(!lastPayload) return;
    copyText(lastPayload.tree);
  });

  copyFileBtn.addEventListener("click", () => {
    if(!lastPayload) return;
    const k = fileSelect.value;
    copyText(lastPayload.files[k] || "");
  });

  downloadSvgBtn.addEventListener("click", () => {
    if(!lastPayload) return;
    const svgText = lastPayload.files["diagrams/system.svg"];
    const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "system.svg";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  downloadZipBtn.addEventListener("click", async () => {
    if(!lastPayload) return;

    if(typeof window.JSZip === "undefined"){
      statusText.textContent = "JSZip not loaded yet. Refresh and try again.";
      return;
    }

    const zip = new JSZip();

    // Put everything into the zip
    Object.entries(lastPayload.files).forEach(([path, content]) => {
      zip.file(path, content);
    });

    // Generate zip
    const blob = await zip.generateAsync({ type: "blob" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "first-build-repo.zip";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    statusText.textContent = "ZIP downloaded.";
    setTimeout(() => setGenerateEnabled(), 900);
  });

  // init
  loadLastRequest();
  setGenerateEnabled();
})();
