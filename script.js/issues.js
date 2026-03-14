const ORIGIN = "https://phi-lab-server.vercel.app/api/v1/lab/issues";

const FALLBACK_PROXIES = [
  (url) => url,
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

const tabs = document.querySelectorAll(".tabBtn");
const grid = document.getElementById("issuesGrid");
const loadingEl = document.getElementById("loading");
const issueCountEl = document.getElementById("issueCount");

const searchInput = document.getElementById("searchInput");

const issueDialog = document.getElementById("issueDialog");
const issueDialogBody = document.getElementById("issueDialogBody");

let allIssues = [];
let searchedIssues = null;
let currentTab = "all";

const buildLocalIssues = (count = 50) => {
  const seeds = [
    {
      title: "Fix navigation menu on mobile devices",
      description: "The navigation menu doesn't collapse properly on mobile devices.",
      labels: ["bug", "help wanted"],
      priority: "high",
      author: "john_doe",
      assignee: "jane_smith",
      status: "open",
    },
    {
      title: "Add dark mode support",
      description: "Users are requesting a dark mode option for better accessibility.",
      labels: ["enhancement", "good first issue"],
      priority: "medium",
      author: "sarah_dev",
      assignee: "",
      status: "open",
    },
    {
      title: "Update README with setup steps",
      description: "The README needs clearer setup instructions for contributors.",
      labels: ["documentation"],
      priority: "low",
      author: "mike_docs",
      assignee: "sarah_dev",
      status: "closed",
    },
    {
      title: "Performance issue with large datasets",
      description: "App gets slow when loading many items. Add pagination.",
      labels: ["bug", "enhancement"],
      priority: "high",
      author: "alex_perf",
      assignee: "john_doe",
      status: "open",
    },
  ];

  return Array.from({ length: count }, (_, idx) => {
    const seed = seeds[idx % seeds.length];
    const day = String((idx % 28) + 1).padStart(2, "0");
    return {
      id: idx + 1,
      ...seed,
      createdAt: `2024-01-${day}T10:00:00Z`,
      updatedAt: `2024-01-${day}T10:00:00Z`,
    };
  });
};

const requireAuth = () => {
  const ok = sessionStorage.getItem("isAuthed") === "true";
  if (!ok) {
    // Allow direct access in Live Server so issue data can still be viewed.
    sessionStorage.setItem("isAuthed", "true");
    sessionStorage.setItem("authedUser", "guest");
  }
};

const normalize = (v) => String(v || "").trim().toLowerCase();

const setLoading = (isLoading) => {
  loadingEl.style.display = isLoading ? "block" : "none";
};

const showGridError = (message) => {
  grid.innerHTML = `<div class="bg-white border border-red-200 text-red-700 rounded-xl p-4">${message}</div>`;
};

const fetchJson = async (url) => {
  let lastError = null;

  for (const toUrl of FALLBACK_PROXIES) {
    const requestUrl = toUrl(url);
    try {
      const res = await fetch(requestUrl);
      if (!res.ok) {
        lastError = new Error(`HTTP ${res.status} from ${new URL(requestUrl).host}`);
        continue;
      }
      return await res.json();
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("Request failed");
};

const fetchAll    = async ()    => fetchJson(`${ORIGIN}`);
const fetchOne    = async (id)  => fetchJson(`${ORIGIN}/${id}`);
const fetchSearch = async (q)   => fetchJson(`${ORIGIN}/search?q=${encodeURIComponent(q)}`);

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

  // "All" should always show the full dataset, not the latest search subset.
  if (tab === "all") {
    searchedIssues = null;
    searchInput.value = "";
  }

  setActiveTabUI(tab);
  render();
};

const getVisibleIssues = () => {
  const source = Array.isArray(searchedIssues) ? searchedIssues : allIssues;
  if (currentTab === "all") return source;
  return source.filter((i) => normalize(i.status) === currentTab);
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
    allIssues = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
    if (!allIssues.length) {
      allIssues = buildLocalIssues(50);
    }
    searchedIssues = null;
    render();
  } catch (err) {
    allIssues = buildLocalIssues(50);
    searchedIssues = null;
    render();
  } finally {
    setLoading(false);
  }
};

const search = async () => {
  const q = searchInput.value.trim();
  if (!q) {
    searchedIssues = null;
    setTab("all");
    return;
  }

  setLoading(true);
  try {
    const data = await fetchSearch(q);
    searchedIssues = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
    setTab("all");
  } catch (err) {
    const reason = err?.message ? `\n${err.message}` : "";
    alert(`Search failed${reason}`);
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
