/* Interview Prep Q&A — vanilla JS, no build step.
 * Loads questions.json, renders cards, handles search + category filter + theme.
 */

const DATA_URL = "questions.json";

const state = {
  questions: [],
  category: "All",
  search: "",
};

const els = {
  search: document.getElementById("search"),
  chips: document.getElementById("chips"),
  list: document.getElementById("list"),
  empty: document.getElementById("empty"),
  stats: document.getElementById("stats"),
  expandAll: document.getElementById("expand-all"),
  collapseAll: document.getElementById("collapse-all"),
  themeToggle: document.getElementById("theme-toggle"),
};

/* ---------- Theme ---------- */
function initTheme() {
  const stored = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = stored || (prefersDark ? "dark" : "light");
  setTheme(theme);
  els.themeToggle.addEventListener("click", () => {
    const next =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "light"
        : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
  });
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  els.themeToggle.querySelector(".theme-icon").textContent =
    theme === "dark" ? "☀️" : "🌙";
}

/* ---------- Markdown ---------- */
function renderMarkdown(md) {
  if (window.marked) {
    marked.setOptions({ gfm: true, breaks: false });
    return marked.parse(md || "");
  }
  // Fallback if the CDN is unreachable: show plain text safely.
  const div = document.createElement("div");
  div.textContent = md || "";
  return div.innerHTML;
}

function highlight(scope) {
  if (!window.hljs) return;
  scope.querySelectorAll("pre code").forEach((block) => {
    hljs.highlightElement(block);
  });
}

/* ---------- Data ---------- */
async function loadQuestions() {
  const res = await fetch(DATA_URL, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Failed to load ${DATA_URL} (${res.status})`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("questions.json must be an array");
  return data;
}

/* ---------- Filtering ---------- */
function getCategories() {
  const counts = new Map();
  for (const q of state.questions) {
    const cat = q.category || "Uncategorized";
    counts.set(cat, (counts.get(cat) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

function getFiltered() {
  const term = state.search.trim().toLowerCase();
  return state.questions.filter((q) => {
    const cat = q.category || "Uncategorized";
    if (state.category !== "All" && cat !== state.category) return false;
    if (!term) return true;
    const haystack = `${q.question} ${q.answer} ${cat}`.toLowerCase();
    return haystack.includes(term);
  });
}

/* ---------- Rendering ---------- */
function renderChips() {
  const cats = getCategories();
  const total = state.questions.length;
  const chip = (label, value, count) => {
    const active = state.category === value ? " active" : "";
    return `<button class="chip${active}" type="button" data-cat="${escapeAttr(
      value
    )}">${escapeHtml(label)} <span class="badge">${count}</span></button>`;
  };

  let html = chip("All", "All", total);
  for (const [cat, count] of cats) html += chip(cat, cat, count);
  els.chips.innerHTML = html;

  els.chips.querySelectorAll(".chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.category = btn.dataset.cat;
      renderChips();
      renderList();
    });
  });
}

function renderList() {
  const filtered = getFiltered();
  const autoOpen = state.search.trim().length > 0;

  els.stats.textContent = `Showing ${filtered.length} of ${state.questions.length} question${
    state.questions.length === 1 ? "" : "s"
  }`;

  if (filtered.length === 0) {
    els.list.innerHTML = "";
    els.empty.hidden = false;
    els.empty.textContent = state.questions.length
      ? "No questions match your search."
      : "No questions yet — add some to questions.json.";
    return;
  }
  els.empty.hidden = true;

  els.list.innerHTML = filtered
    .map((q) => {
      const cat = q.category || "Uncategorized";
      return `
        <details class="qa"${autoOpen ? " open" : ""}>
          <summary>
            <span class="q-text">${escapeHtml(q.question)}</span>
            <span class="q-cat">${escapeHtml(cat)}</span>
          </summary>
          <div class="answer">${renderMarkdown(q.answer)}</div>
        </details>`;
    })
    .join("");

  highlight(els.list);
}

/* ---------- Helpers ---------- */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function escapeAttr(str) {
  return escapeHtml(str).replace(/"/g, "&quot;");
}

function setAllOpen(open) {
  els.list.querySelectorAll("details.qa").forEach((d) => (d.open = open));
}

/* ---------- Init ---------- */
async function init() {
  initTheme();

  els.search.addEventListener("input", (e) => {
    state.search = e.target.value;
    renderList();
  });
  els.expandAll.addEventListener("click", () => setAllOpen(true));
  els.collapseAll.addEventListener("click", () => setAllOpen(false));

  try {
    state.questions = await loadQuestions();
  } catch (err) {
    els.empty.hidden = false;
    els.empty.textContent = `Could not load questions: ${err.message}`;
    console.error(err);
    return;
  }

  renderChips();
  renderList();
}

document.addEventListener("DOMContentLoaded", init);
