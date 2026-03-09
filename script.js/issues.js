const ORIGIN = "https://phi-lab-server.vercel.app/api/v1/lab/issues";
const PROXY  = "https://corsproxy.io/?url=";

const proxyUrl = (url) => PROXY + encodeURIComponent(url);

const tabs = document.querySelectorAll(".tabBtn");
const grid = document.getElementById("issuesGrid");
const loadingEl = document.getElementById("loading");
const issueCountEl = document.getElementById("issueCount");

const searchInput = document.getElementById("searchInput");

const issueDialog = document.getElementById("issueDialog");
const issueDialogBody = document.getElementById("issueDialogBody");

let allIssues = [];
let currentTab = "all";

const requireAuth = () => {
  const ok = localStorage.getItem("isAuthed") === "true";
  if (!ok) window.location.href = "./index.html";
};

const normalize = (v) => String(v || "").trim().toLowerCase();

const setLoading = (isLoading) => {
  loadingEl.style.display = isLoading ? "block" : "none";
};

const fetchJson = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Request failed");
  return res.json();
};

const fetchAll    = async ()    => fetchJson(proxyUrl(`${ORIGIN}`));
const fetchOne    = async (id)  => fetchJson(proxyUrl(`${ORIGIN}/${id}`));
const fetchSearch = async (q)   => fetchJson(proxyUrl(`${ORIGIN}/search?q=${encodeURIComponent(q)}`));

const setActiveTabUI = (tab) => {
  tabs.forEach((btn) => {
    const active = btn.dataset.tab === tab;
    btn.className = active
      ? "tabBtn px-5 py-2 rounded-xl border border-slate-200 text-sm font-semibold bg-indigo-600 text-white"
      : "tabBtn px-5 py-2 rounded-xl border border-slate-200 text-sm font-semibold bg-white";
  });
};

const setTab = (tab) => {
  currentTab = tab;
  setActiveTabUI(tab);
  render();
};

const getVisibleIssues = () => {
  if (currentTab === "all") return allIssues;
  return allIssues.filter((i) => normalize(i.status) === currentTab);
};

const formatDate = (d) => {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString();
};

const borderTop = (issue) => (normalize(issue.status) === "open" ? "#16a34a" : "#7c3aed");

const priorityClass = (p) => {
  switch (normalize(p)) {
    case "high":   return "bg-red-100 text-red-600";
    case "medium": return "bg-yellow-100 text-yellow-600";
    case "low":    return "bg-blue-100 text-blue-500";
    default:       return "bg-slate-100 text-slate-500";
  }
};

const labelClass = (l) => {
  switch (normalize(l)) {
    case "bug":              return "bg-red-100 text-red-500 border-red-200";
    case "help wanted":      return "bg-orange-100 text-orange-500 border-orange-200";
    case "enhancement":      return "bg-green-100 text-green-600 border-green-200";
    case "good first issue": return "bg-blue-100 text-blue-500 border-blue-200";
    default:                 return "bg-slate-100 text-slate-500 border-slate-200";
  }
};

const renderLabels = (labels) => {
  if (!Array.isArray(labels) || labels.length === 0) return "";
  return labels.map((l) =>
    `<span class="text-xs font-semibold px-2 py-0.5 rounded-md border ${labelClass(l)}">${l.toUpperCase()}</span>`
  ).join("");
};

const openissueDialog = (issue) => {
  const isOpen = normalize(issue.status) === "open";
  const statusClass = isOpen ? "bg-green-500" : "bg-purple-600";
  const statusLabel = isOpen ? "Opened" : "Closed";

  issueDialogBody.innerHTML = `
    <h2 class="text-2xl font-extrabold text-slate-900 mb-3">${issue.title || "Issue Details"}</h2>
    <div class="flex items-center gap-2 text-sm text-slate-500 mb-4 flex-wrap">
      <span class="${statusClass} text-white text-xs font-bold px-3 py-1 rounded-full">${statusLabel}</span>
      <span>• Opened by <span class="font-medium text-slate-700">${issue.author || "-"}</span> • ${formatDate(issue.createdAt)}</span>
    </div>
    <div class="flex flex-wrap gap-2 mb-4">
      ${renderLabels(issue.labels)}
    </div>
    <p class="text-sm text-slate-700 mb-5">${issue.description || "-"}</p>
    <div class="bg-slate-50 rounded-xl p-4 flex gap-8 mb-5">
      <div>
        <div class="text-xs text-slate-500 mb-1">Assignee:</div>
        <div class="font-bold text-slate-800 text-sm">${issue.author || "-"}</div>
      </div>
      <div>
        <div class="text-xs text-slate-500 mb-1">Priority:</div>
        <span class="text-xs font-bold px-3 py-1 rounded-full uppercase ${priorityClass(issue.priority)}">${issue.priority || "-"}</span>
      </div>
    </div>
    <div class="flex justify-end">
      <button id="issueDialogCloseBtn" class="rounded-xl bg-indigo-600 text-white px-6 py-2 text-sm font-semibold">Close</button>
    </div>
  `;

  document.getElementById("issueDialogCloseBtn").addEventListener("click", closeissueDialog);
  issueDialog.style.display = "flex";
};

const closeissueDialog = () => {
  issueDialog.style.display = "none";
};

issueDialog.addEventListener("click", (e) => {
  if (e.target === issueDialog) closeissueDialog();
});

const attachCardClicks = () => {
  document.querySelectorAll("[data-issue-id]").forEach((card) => {
    card.addEventListener("click", () => {
      const id = Number(card.dataset.issueId);
      const issue = allIssues.find((i) => i.id === id);
      if (issue) openissueDialog(issue);
    });
  });
};

const render = () => {
  const list = getVisibleIssues();
  issueCountEl.textContent = `${list.length} Issues`;

  grid.innerHTML = list.map((issue) => `
    <div data-issue-id="${issue.id}"
         class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition flex flex-col justify-between"
         style="border-top: 4px solid ${borderTop(issue)}">

      <div>
        <div class="flex items-center justify-end gap-2">
          <span class="text-xs font-bold px-3 py-1 rounded-full uppercase ${priorityClass(issue.priority)}">
            ${issue.priority || "-"}
          </span>
        </div>

        <h3 class="mt-3 font-extrabold text-slate-900 text-sm leading-snug line-clamp-2">
          ${issue.title || "-"}
        </h3>

        <p class="mt-2 text-xs text-slate-500 leading-5 line-clamp-2">
          ${issue.description || ""}
        </p>

        <div class="mt-3 flex flex-wrap gap-1">
          ${renderLabels(issue.labels)}
        </div>
      </div>

      <div class="mt-4 text-xs text-slate-400 space-y-1 border-t border-slate-100 pt-3">
        <div>#${issue.id} by <span class="font-semibold text-slate-600">${issue.author || "-"}</span></div>
        <div>${formatDate(issue.createdAt)}</div>
      </div>
    </div>
  `).join("");

  attachCardClicks();
};

const loadAllIssues = async () => {
  setLoading(true);
  try {
    const data = await fetchAll();
    allIssues = data.data ?? data;
    render();
  } catch {
    grid.innerHTML = `<div class="bg-white border border-slate-200 rounded-xl p-4">Failed to load issues.</div>`;
  } finally {
    setLoading(false);
  }
};

const search = async () => {
  const q = searchInput.value.trim();
  if (!q) {
    await loadAllIssues();
    setTab("all");
    return;
  }

  setLoading(true);
  try {
    const data = await fetchSearch(q);
    allIssues = data.data ?? data;
    setTab("all");
  } catch {
    alert("Search failed");
  } finally {
    setLoading(false);
  }
};

tabs.forEach((btn) => btn.addEventListener("click", () => setTab(btn.dataset.tab)));
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") search();
});

requireAuth();
setActiveTabUI("all");
loadAllIssues();
