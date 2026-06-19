const LS_KEY = "salarySplitter_session";

const salaryCard     = document.getElementById("salary-card");
const resultCard     = document.getElementById("result");
const salaryInput    = document.getElementById("salary");
const savingsPctEl   = document.getElementById("savings-pct");
const emergencyPctEl = document.getElementById("emergency-pct");
const pctHint        = document.getElementById("pct-hint");
const formError      = document.getElementById("form-error");
const expContainer   = document.getElementById("expenses-container");
const miscContainer  = document.getElementById("misc-container");
const resumeBanner   = document.getElementById("resume-banner");
const resumeDate     = document.getElementById("resume-date");

// Result tiles
const tilFixed       = document.getElementById("tile-fixed");
const tilSavings     = document.getElementById("tile-savings");
const tilEmergency   = document.getElementById("tile-emergency");
const tilMisc        = document.getElementById("tile-misc");
const listFixed      = document.getElementById("list-fixed");
const listMisc       = document.getElementById("list-misc");
const subSavings     = document.getElementById("sub-savings");
const subEmergency   = document.getElementById("sub-emergency");
const splitBar       = document.getElementById("split-bar");
const splitLegend    = document.getElementById("split-legend");
const resultMeta     = document.getElementById("result-meta");
const overBudget     = document.getElementById("over-budget");
const tipBlock       = document.getElementById("tip-block");

// Keep last calculated data so Go Back can re-render without recalculating
let lastResultData = null;

/* helpers */

/* Format a number as ₦ currency string */
function fmt(n) {
  return "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* Strip commas then parse float */
function parseAmount(str) {
  return parseFloat((str || "").replace(/,/g, "")) || 0;
}

/* Add thousand-separator commas while typing */
function applyCommaFormat(input) {
  const raw = input.value.replace(/,/g, "");
  if (raw !== "" && !isNaN(raw)) {
    input.value = Number(raw).toLocaleString("en-NG");
  }
}

/* Show an inline field error */
function showFieldError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.classList.add("visible"); }
}

/* Clear all field errors */
function clearErrors() {
  document.querySelectorAll(".field-error").forEach(el => {
    el.textContent = "";
    el.classList.remove("visible");
  });
  formError.classList.add("hidden");
  formError.textContent = "";
}

/* Show top-level form error banner */
function showFormError(msg) {
  formError.textContent = msg;
  formError.classList.remove("hidden");
}

/* Local Storage */

/** Collect current form state into a plain object */
function collectFormState() {
  const fixedRows = [];
  expContainer.querySelectorAll(".expenses-inputs").forEach(row => {
    fixedRows.push({
      name:     row.querySelector(".expense-name").value.trim(),
      amount:   row.querySelector(".expense-amount").value,
      duration: row.querySelector(".expense-duration").value,
    });
  });

  const miscNames = [];
  miscContainer.querySelectorAll(".misc-expense").forEach(i => {
    const v = i.value.trim();
    if (v) miscNames.push(v);
  });

  return {
    salary:      salaryInput.value,
    savingsPct:  savingsPctEl.value,
    emergencyPct: emergencyPctEl.value,
    fixedRows,
    miscNames,
    savedAt:     new Date().toISOString(),
  };
}

/* Save current session to localStorage */
function saveSession() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(collectFormState()));
  } catch (e) {
    console.warn("Could not save to localStorage:", e);
  }
}

/* Load session from localStorage, returns null if none */
function loadSession() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/* Clear saved session */
function clearSession() {
  try { localStorage.removeItem(LS_KEY); } catch (e) { /* silent */ }
}

/** Restore form from a saved session object */
function restoreForm(session) {
  // Salary
  salaryInput.value = session.salary || "";

  // Savings & emergency
  savingsPctEl.value   = session.savingsPct   || "";
  emergencyPctEl.value = session.emergencyPct || "";
  updatePctHint();

  // Fixed expense rows
  expContainer.innerHTML = ""; // clear first
  const rows = (session.fixedRows && session.fixedRows.length)
    ? session.fixedRows
    : [{ name: "", amount: "", duration: "" }];

  rows.forEach((r, i) => {
    const row = document.createElement("div");
    row.classList.add("expenses-inputs", "grid-3");
    row.innerHTML = `
      <input type="text"   class="expense-name"   placeholder="Name (e.g. Rent)" value="${escapeHtml(r.name)}">
      <input type="text"   class="expense-amount format-number" placeholder="Total amount" value="${escapeHtml(r.amount)}">
      <input type="number" class="expense-duration" placeholder="Months" min="1" step="1" value="${escapeHtml(r.duration)}">
      <button type="button" class="btn danger-ghost remove-row ${i === 0 ? "hidden-remove" : ""}" title="Remove row">✕ Remove</button>
    `;
    expContainer.appendChild(row);
  });

  // Misc names
  miscContainer.querySelectorAll(".misc-row").forEach(r => r.remove());
  (session.miscNames || []).forEach(name => addMiscRow(name));
}

/* Tiny guard for values going into innerHTML */
function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* ON PAGE LOAD — show resume banner only, form stays empty */
  const session = loadSession();
  if (!session) return;

  // Show the resume banner with formatted date - form stays untouched/empty
  const d = new Date(session.savedAt);
  const formatted = d.toLocaleDateString("en-NG", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
  resumeDate.textContent = formatted;
  resumeBanner.classList.remove("hidden");
})();

// "Resume session" button restores the form THEN hides the banner
document.getElementById("resumeBtn").addEventListener("click", function() {
  const session = loadSession();
  if (session) restoreForm(session);
  resumeBanner.classList.add("hidden");
});

// "Start fresh" button discards the saved session, form stays empty
document.getElementById("discardBtn").addEventListener("click", function() {
  clearSession();
  resumeBanner.classList.add("hidden");
});

/* Live hints / formatting */

function updatePctHint() {
  const s = parseFloat(savingsPctEl.value) || 0;
  const e = parseFloat(emergencyPctEl.value) || 0;
  const total = s + e;
  if (total > 100) {
    pctHint.textContent = `⚠ Savings + Emergency = ${total}% — this exceeds 100%. Please lower one.`;
    pctHint.style.color = "var(--danger)";
  } else if (total > 0) {
    pctHint.textContent = `${total}% set aside · ${100 - total}% left for miscellaneous`;
    pctHint.style.color = "var(--accent)";
  } else {
    pctHint.textContent = "";
  }
}

savingsPctEl.addEventListener("input", updatePctHint);
emergencyPctEl.addEventListener("input", updatePctHint);

// Auto-save form to localStorage on every input change
document.getElementById("salary-form").addEventListener("input", saveSession);

// Format number inputs live
document.addEventListener("input", function(e) {
  if (e.target.classList.contains("format-number")) {
    applyCommaFormat(e.target);
  }
});

/* Add / remove rows */

document.getElementById("add-expense").addEventListener("click", function() {
  const row = document.createElement("div");
  row.classList.add("expenses-inputs", "grid-3");
  row.innerHTML = `
    <input type="text"   class="expense-name"   placeholder="Name (e.g. School fees)">
    <input type="text"   class="expense-amount format-number" placeholder="Total amount">
    <input type="number" class="expense-duration" placeholder="Months" min="1" step="1">
    <button type="button" class="btn danger-ghost remove-row" title="Remove row">✕ Remove</button>
  `;
  expContainer.appendChild(row);
});

// Remove fixed row (delegated)
expContainer.addEventListener("click", function(e) {
  if (e.target.classList.contains("remove-row")) {
    e.target.closest(".expenses-inputs").remove();
    saveSession();
  }
});

/* Add a misc row (optionally pre-filled with a name) */
function addMiscRow(name = "") {
  const wrap = document.createElement("div");
  wrap.classList.add("misc-row");

  const input = document.createElement("input");
  input.type = "text";
  input.classList.add("misc-expense");
  input.placeholder = "e.g. Groceries, Transport, Data";
  input.value = name;

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.classList.add("btn", "danger-ghost", "remove-misc");
  removeBtn.textContent = "✕";
  removeBtn.title = "Remove";
  removeBtn.addEventListener("click", () => { wrap.remove(); saveSession(); });

  wrap.appendChild(input);
  wrap.appendChild(removeBtn);
  miscContainer.insertBefore(wrap, miscContainer.querySelector(".info-row"));
}

document.getElementById("sub-expenses").addEventListener("click", function(e) {
  e.preventDefault();
  addMiscRow();
});

/* Form Submit */

document.getElementById("salary-form").addEventListener("submit", function(e) {
  e.preventDefault();
  clearErrors();

  // Salary
  const salary = parseAmount(salaryInput.value);
  if (!salary || salary <= 0) {
    showFieldError("salary-error", "Please enter a valid salary.");
    salaryInput.focus();
    return;
  }

  // Percentages
  const savingsPct   = parseFloat(savingsPctEl.value);
  const emergencyPct = parseFloat(emergencyPctEl.value);
  let pctValid = true;

  if (isNaN(savingsPct) || savingsPct < 0 || savingsPct > 100) {
    showFieldError("savings-error", "Enter a value between 0 and 100.");
    pctValid = false;
  }
  if (isNaN(emergencyPct) || emergencyPct < 0 || emergencyPct > 100) {
    showFieldError("emergency-error", "Enter a value between 0 and 100.");
    pctValid = false;
  }
  if (!pctValid) return;

  if (savingsPct + emergencyPct > 100) {
    showFormError(`Savings (${savingsPct}%) + Emergency (${emergencyPct}%) can't exceed 100%.`);
    return;
  }

  // Fixed expenses
  const expRows = expContainer.querySelectorAll(".expenses-inputs");
  const mainExpenses = [];
  let totalMainMonthly = 0;
  let rowErrors = false;

  expRows.forEach(row => {
    const name     = row.querySelector(".expense-name").value.trim();
    const amount   = parseAmount(row.querySelector(".expense-amount").value);
    const duration = parseFloat(row.querySelector(".expense-duration").value);

    if (!name && !amount && !duration) return; // skip empty rows silently

    if (!name || !amount || !duration || duration < 1) {
      showFormError("One or more fixed expense rows are incomplete. Please fill in all fields or remove the row.");
      rowErrors = true;
      return;
    }

    const monthlyShare = amount / duration;
    mainExpenses.push({ name, amount, duration, monthlyShare });
    totalMainMonthly += monthlyShare;
  });

  if (rowErrors) return;

  // Misc names
  const miscNames = [];
  document.querySelectorAll(".misc-expense").forEach(input => {
    const v = input.value.trim();
    if (v) miscNames.push(v);
  });

  // Calculate
  const remaining     = salary - totalMainMonthly;
  const savings       = remaining > 0 ? (remaining * savingsPct) / 100 : 0;
  const emergencyCash = remaining > 0 ? (remaining * emergencyPct) / 100 : 0;
  const miscPool      = Math.max(remaining - savings - emergencyCash, 0);
  const miscShare     = miscNames.length > 0 ? miscPool / miscNames.length : 0;

  lastResultData = {
    salary, mainExpenses, totalMainMonthly, remaining,
    savings, savingsPct, emergencyCash, emergencyPct,
    miscPool, miscNames, miscShare,
  };

  // Save current form state (before switching view)
  saveSession();

  renderResult(lastResultData);
});

/* Render result */

function renderResult(d) {
  const {
    salary, mainExpenses, totalMainMonthly, remaining,
    savings, savingsPct, emergencyCash, emergencyPct,
    miscPool, miscNames, miscShare,
  } = d;

  const isOverBudget = remaining < 0;

  resultMeta.textContent = `Monthly salary: ${fmt(salary)}`;
  overBudget.classList.toggle("hidden", !isOverBudget);

  // Tiles
  tilFixed.textContent     = fmt(totalMainMonthly);
  tilSavings.textContent   = fmt(savings);
  tilEmergency.textContent = fmt(emergencyCash);
  tilMisc.textContent      = fmt(miscPool);

  subSavings.textContent   = savingsPct + "% of remainder";
  subEmergency.textContent = emergencyPct + "% of remainder";

  // Fixed list
  listFixed.innerHTML = mainExpenses.length
    ? mainExpenses.map(exp => `
        <li>
          <span>${exp.name}</span>
          <span>${fmt(exp.monthlyShare)}<span class="muted small"> /mo</span></span>
        </li>`).join("")
    : `<li class="muted small">No fixed expenses entered.</li>`;

  // Misc list
  listMisc.innerHTML = miscNames.length
    ? miscNames.map(name => `
        <li>
          <span>${name}</span>
          <span>${fmt(miscShare)}</span>
        </li>`).join("")
    : `<li class="muted small">No miscellaneous expenses entered.</li>`;

  // Split bar
  const segments = [
    { label: "Fixed",     value: totalMainMonthly, cls: "seg-fixed"     },
    { label: "Savings",   value: savings,           cls: "seg-savings"   },
    { label: "Emergency", value: emergencyCash,     cls: "seg-emergency" },
    { label: "Misc",      value: miscPool,          cls: "seg-misc"      },
  ].filter(s => s.value > 0);

  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  splitBar.innerHTML = segments.map(s => {
    const pct = (s.value / total * 100).toFixed(1);
    return `<div class="seg ${s.cls}" style="width:${pct}%" title="${s.label}: ${fmt(s.value)} (${pct}%)"></div>`;
  }).join("");

  splitLegend.innerHTML = segments.map(s => {
    const pct = (s.value / total * 100).toFixed(1);
    return `<div class="legend-item">
      <span class="leg-dot ${s.cls}"></span>
      <span>${s.label}</span>
      <span class="muted small">${pct}%</span>
    </div>`;
  }).join("");

  // Tip
  let tip = "";
  if (isOverBudget) {
    tip = "💡 Your fixed expenses exceed your income. Consider reducing recurring costs or finding additional income streams.";
  } else if (savingsPct === 0 && emergencyPct === 0) {
    tip = "💡 You haven't set aside any savings. Even 10% makes a significant difference over time.";
  } else if (savingsPct + emergencyPct >= 50) {
    tip = "💡 Great discipline! Setting aside over 50% for savings and emergencies puts you ahead of most people.";
  } else {
    tip = "💡 Good start! Try increasing your savings rate by 5% each month until you reach 20–30%.";
  }
  tipBlock.textContent = tip;

  // Show result card
  salaryCard.classList.add("hidden");
  resultCard.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* go back */

document.getElementById("goBackBtn").addEventListener("click", function() {
  resultCard.classList.add("hidden");
  salaryCard.classList.remove("hidden");
  resumeBanner.classList.add("hidden"); // hide the banner since user is already in session
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* Download summary(styled html file) */

document.getElementById("downloadBtn").addEventListener("click", function() {
  if (!lastResultData) return;

  const d = lastResultData;
  const now = new Date().toLocaleDateString("en-NG", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const fixedRows = d.mainExpenses.map(exp => `
    <tr>
      <td>${exp.name}</td>
      <td>${fmt(exp.amount)} over ${exp.duration} month(s)</td>
      <td class="amount">${fmt(exp.monthlyShare)}/mo</td>
    </tr>`).join("") || `<tr><td colspan="3" class="none">No fixed expenses</td></tr>`;

  const miscRows = d.miscNames.map(name => `
    <tr>
      <td>${name}</td>
      <td class="amount">${fmt(d.miscShare)}</td>
    </tr>`).join("") || `<tr><td colspan="2" class="none">No miscellaneous expenses</td></tr>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Salary Split Summary</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
      background: #f4f6fb;
      color: #1a2033;
      padding: 40px 20px;
      line-height: 1.55;
    }

    .page {
      max-width: 720px;
      margin: 0 auto;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,.10);
      overflow: hidden;
    }

    /* Header */
    .header {
      background: linear-gradient(135deg, #1a2a5e 0%, #2d4fa1 100%);
      color: white;
      padding: 32px 36px 28px;
    }
    .header-top {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
    }
    .logo {
      width: 36px; height: 36px;
      background: #5b8cff;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 1rem;
      box-shadow: 0 4px 12px #5b8cff55;
    }
    .app-name { font-weight: 700; font-size: 1rem; opacity: .9; }
    h1 { font-size: 1.6rem; font-weight: 800; margin-bottom: 4px; }
    .meta { opacity: .75; font-size: .85rem; }

    /* Tiles */
    .tiles {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1px;
      background: #e8edf5;
    }
    .tile {
      background: #fff;
      padding: 20px 24px;
    }
    .tile-label {
      font-size: .72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .7px;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tile-label::before {
      content: "";
      display: inline-block;
      width: 8px; height: 8px;
      border-radius: 50%;
    }
    .tile-fixed    .tile-label::before { background: #5b8cff; }
    .tile-savings  .tile-label::before { background: #38e0b9; }
    .tile-emerg    .tile-label::before { background: #f5a623; }
    .tile-misc     .tile-label::before { background: #b085f5; }
    .tile-fixed    .tile-label { color: #5b8cff; }
    .tile-savings  .tile-label { color: #38e0b9; }
    .tile-emerg    .tile-label { color: #f5a623; }
    .tile-misc     .tile-label { color: #b085f5; }
    .tile-amount { font-size: 1.4rem; font-weight: 800; color: #1a2033; }
    .tile-sub { font-size: .78rem; color: #7a889e; margin-top: 3px; }

    /* Split bar */
    .bar-wrap { padding: 20px 24px 0; background: #fff; }
    .bar-label { font-size: .78rem; color: #7a889e; margin-bottom: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; }
    .bar {
      display: flex;
      height: 12px;
      border-radius: 100px;
      overflow: hidden;
      gap: 2px;
      background: #e8edf5;
      margin-bottom: 10px;
    }
    .bar-seg { height: 100%; border-radius: 100px; }
    .bar-seg.fixed     { background: #5b8cff; }
    .bar-seg.savings   { background: #38e0b9; }
    .bar-seg.emergency { background: #f5a623; }
    .bar-seg.misc      { background: #b085f5; }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 10px 18px;
      font-size: .8rem;
      color: #7a889e;
      padding-bottom: 16px;
    }
    .leg { display: flex; align-items: center; gap: 5px; }
    .leg-dot { width: 8px; height: 8px; border-radius: 50%; }

    /* Tables */
    .section { padding: 24px 24px 0; }
    .section:last-of-type { padding-bottom: 0; }
    h2 {
      font-size: .78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .7px;
      color: #7a889e;
      margin-bottom: 10px;
    }
    table { width: 100%; border-collapse: collapse; font-size: .88rem; }
    th {
      text-align: left;
      padding: 8px 10px;
      background: #f4f6fb;
      font-size: .75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .5px;
      color: #9aa3b2;
    }
    td {
      padding: 10px 10px;
      border-bottom: 1px solid #e8edf5;
      color: #2a3550;
    }
    td.amount { font-weight: 700; text-align: right; color: #1a2033; }
    td.none { color: #9aa3b2; font-style: italic; }
    tr:last-child td { border-bottom: none; }

    /* Footer */
    .footer {
      margin-top: 24px;
      padding: 20px 24px;
      border-top: 1px solid #e8edf5;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: .78rem;
      color: #9aa3b2;
    }
    .footer strong { color: #5b8cff; }

    @media print {
      body { background: white; padding: 0; }
      .page { box-shadow: none; border-radius: 0; }
    }
    @media (max-width: 500px) {
      .tiles { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="page">

    <div class="header">
      <div class="header-top">
        <div class="logo">₦</div>
        <span class="app-name">Salary Splitter</span>
      </div>
      <h1>Your Salary Breakdown</h1>
      <p class="meta">Generated on ${now} · Monthly salary: ${fmt(d.salary)}</p>
    </div>

    <!-- Tiles -->
    <div class="tiles">
      <div class="tile tile-fixed">
        <div class="tile-label">Fixed Expenses</div>
        <div class="tile-amount">${fmt(d.totalMainMonthly)}</div>
        <div class="tile-sub">Priority deductions</div>
      </div>
      <div class="tile tile-savings">
        <div class="tile-label">Savings</div>
        <div class="tile-amount">${fmt(d.savings)}</div>
        <div class="tile-sub">${d.savingsPct}% of remainder</div>
      </div>
      <div class="tile tile-emerg">
        <div class="tile-label">Emergency Fund</div>
        <div class="tile-amount">${fmt(d.emergencyCash)}</div>
        <div class="tile-sub">${d.emergencyPct}% of remainder</div>
      </div>
      <div class="tile tile-misc">
        <div class="tile-label">Miscellaneous</div>
        <div class="tile-amount">${fmt(d.miscPool)}</div>
        <div class="tile-sub">Shared across ${d.miscNames.length || 0} expense(s)</div>
      </div>
    </div>

    <!-- Split bar -->
    <div class="bar-wrap">
      <div class="bar-label">Salary distribution</div>
      <div class="bar">
        ${d.totalMainMonthly > 0 ? `<div class="bar-seg fixed"    style="width:${(d.totalMainMonthly/d.salary*100).toFixed(1)}%"></div>` : ""}
        ${d.savings       > 0 ? `<div class="bar-seg savings"  style="width:${(d.savings/d.salary*100).toFixed(1)}%"></div>` : ""}
        ${d.emergencyCash > 0 ? `<div class="bar-seg emergency" style="width:${(d.emergencyCash/d.salary*100).toFixed(1)}%"></div>` : ""}
        ${d.miscPool      > 0 ? `<div class="bar-seg misc"      style="width:${(d.miscPool/d.salary*100).toFixed(1)}%"></div>` : ""}
      </div>
      <div class="legend">
        <div class="leg"><span class="leg-dot" style="background:#5b8cff"></span> Fixed (${(d.totalMainMonthly/d.salary*100).toFixed(1)}%)</div>
        <div class="leg"><span class="leg-dot" style="background:#38e0b9"></span> Savings (${(d.savings/d.salary*100).toFixed(1)}%)</div>
        <div class="leg"><span class="leg-dot" style="background:#f5a623"></span> Emergency (${(d.emergencyCash/d.salary*100).toFixed(1)}%)</div>
        <div class="leg"><span class="leg-dot" style="background:#b085f5"></span> Misc (${(d.miscPool/d.salary*100).toFixed(1)}%)</div>
      </div>
    </div>

    <!-- Fixed expenses table -->
    <div class="section">
      <h2>Fixed Expenses Breakdown</h2>
      <table>
        <thead>
          <tr><th>Expense</th><th>Total / Duration</th><th style="text-align:right">Monthly</th></tr>
        </thead>
        <tbody>${fixedRows}</tbody>
      </table>
    </div>

    <!-- Misc table -->
    <div class="section" style="margin-top:20px; padding-bottom: 8px;">
      <h2>Miscellaneous Allocation</h2>
      <table>
        <thead>
          <tr><th>Expense</th><th style="text-align:right">Allocated</th></tr>
        </thead>
        <tbody>${miscRows}</tbody>
      </table>
    </div>

    <div class="footer">
      <span>Built with <strong>Salary Splitter</strong> by Sylvia</span>
      <span>${fmt(d.salary)} · ${now}</span>
    </div>

  </div>
</body>
</html>`;

  // Trigger download
  const blob = new Blob([html], { type: "text/html" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `salary-split-${new Date().toISOString().slice(0,10)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Button feedback
  const btn = document.getElementById("downloadBtn");
  btn.textContent = "✓ Downloaded!";
  btn.classList.add("copied");
  setTimeout(() => {
    btn.textContent = "⬇ Download Summary";
    btn.classList.remove("copied");
  }, 2000);
});

/* start over */

document.getElementById("okBtn").addEventListener("click", function() {
  // Save current session before clearing (so it's available for next visit)
  saveSession();

  // Reset form
  document.getElementById("salary-form").reset();

  // Reset expenses to one empty row
  expContainer.innerHTML = `
    <div class="expenses-inputs grid-3">
      <input type="text"   class="expense-name"   placeholder="Name (e.g. Rent)">
      <input type="text"   class="expense-amount format-number" placeholder="Total amount">
      <input type="number" class="expense-duration" placeholder="Months" min="1" step="1">
      <button type="button" class="btn danger-ghost remove-row hidden-remove" title="Remove row">✕ Remove</button>
    </div>
  `;

  // Remove misc rows
  miscContainer.querySelectorAll(".misc-row").forEach(r => r.remove());

  // Clear state
  clearErrors();
  pctHint.textContent = "";
  overBudget.classList.add("hidden");
  tipBlock.textContent = "";
  lastResultData = null;

  // Swap cards
  resultCard.classList.add("hidden");
  salaryCard.classList.remove("hidden");

  // Show resume banner since we saved a session
  const session = loadSession();
  if (session) {
    const d = new Date(session.savedAt);
    resumeDate.textContent = d.toLocaleDateString("en-NG", {
      weekday: "short", day: "numeric", month: "short", year: "numeric",
    });
    resumeBanner.classList.remove("hidden");
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
});