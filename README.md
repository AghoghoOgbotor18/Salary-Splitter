# Salary Splitter

A **smart, web-based budgeting tool** built with vanilla HTML, CSS, and JavaScript. It helps Nigerian salary earners plan their monthly income by prioritizing fixed expenses, setting aside savings and an emergency fund, and distributing the rest across miscellaneous spending — all in one clean flow.

---

## Features

- Enter monthly salary with **live comma-formatting** (e.g. ₦200,000).
- Add multiple **fixed expenses** with total amount and duration — monthly share is calculated automatically.
- Set **savings and emergency fund percentages** inline (no more browser prompts) with a live hint showing how much is left for miscellaneous.
- Add **miscellaneous expenses by name** — the remaining balance is shared equally between them.
- **Remove button** on every dynamically added row so users can correct mistakes easily.
- **Visual split bar** — a color-coded horizontal bar showing exactly how your salary is distributed at a glance.
- **Inline validation** — clear, specific error messages appear next to the relevant field instead of alert popups.
- **Download Summary** — generates a beautifully styled, printable HTML file of the full breakdown, saved to the user's device.
- **localStorage session saving** — the form state is saved automatically as the user types. On return, a resume banner appears letting them pick up where they left off or start fresh.
- **Go Back button** — takes the user back to their filled-in form from the results screen without losing any data.
- **Start Over button** — saves the current session to localStorage, resets the form, and shows a resume prompt for next time.
- **Contextual budget tips** — smart suggestions based on the user's actual numbers (over budget, no savings set, high savings rate, etc.).
- Fully **mobile responsive** layout.

---

## 🛠️ Tech Stack

- **HTML5** — structure and semantics
- **CSS3** — layout, theming, responsive design, animations
- **JavaScript (ES6+)** — calculations, DOM manipulation, localStorage, file generation

---

## 🌐 Live Demo

[Salary Splitter →](https://aghoghoogbotor18.github.io/Salary-Splitter/)

---

## 📂 Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/salary-splitter.git
   ```
2. Open the project folder and launch `index.html` in any browser.
3. Start planning your budget

---

## Challenges & Solutions

### 1. Number formatting with commas
**Challenge:** I wanted numbers to display as `₦200,000` while still being usable in calculations.
**Solution:** Used `.toLocaleString()` for display formatting and `.replace(/,/g, "")` with `parseFloat()` to strip commas before any math is done.

### 2. Dynamic expense inputs
**Challenge:** Inputs added dynamically via the "Add" button weren't picking up the auto-format behavior.
**Solution:** Applied the `format-number` class to all dynamically created inputs and used a delegated `document.addEventListener("input", ...)` listener so it works on any input — present or future — without re-attaching events.

### 3. Replacing browser prompts with inline inputs
**Challenge:** The original design used `prompt()` dialogs for savings and emergency fund percentages, which looked outdated and broke on some mobile browsers.
**Solution:** Moved both percentage fields into the form as proper labeled inputs with inline validation and a live percentage hint that updates as the user types.

### 4. Validating without alert popups
**Challenge:** Using `alert()` for errors was jarring and didn't tell the user which field was wrong.
**Solution:** Built a `showFieldError(id, msg)` helper that targets the specific error `<span>` next to each input and makes it visible. A top-level error banner handles form-wide issues like incomplete rows.

### 5. Go Back without losing data
**Challenge:** Going back to edit the form after seeing results meant the user would have to re-enter everything.
**Solution:** The form is never cleared when Go Back is clicked — only the visible card switches. The form inputs retain their values, so the user can tweak one thing and re-submit.

### 6. localStorage session with resume prompt
**Challenge:** Saving to localStorage on every keypress is easy, but deciding when to restore and how to give the user control was tricky.
**Solution:** On page load, the app checks for a saved session. If one exists, it silently restores the form and shows a dismissible resume banner with the last-saved date. The user can either continue or discard. Start Over saves the session before resetting so the data is never accidentally lost.

### 7. Downloadable styled HTML summary
**Challenge:** A plain `.txt` download is forgettable. Users needed something they could open, read, share, or print.
**Solution:** Built an HTML template string in JavaScript that generates a fully self-contained, styled HTML file with color-coded tiles, a split bar, and expense tables. It downloads as `salary-split-YYYY-MM-DD.html` using the Blob API.

### 8. Duplicate IDs in the original HTML
**Challenge:** `id="result-display"` and `id="savings-summary"` were reused on multiple elements, which breaks JavaScript selectors and is invalid HTML.
**Solution:** Replaced all duplicate IDs with unique IDs or classes and updated all JavaScript references accordingly.

---

## Completed Improvements

- [x] Save user session in **localStorage** — no data lost on refresh
- [x] Visual **split bar** for expense distribution
- [x] **Download summary** as a styled, printable HTML file
- [x] Inline validation replacing all `alert()` and `prompt()` calls
- [x] Remove button on all dynamically added rows
- [x] Go Back button to edit without re-entering data
- [x] Contextual budget tips based on user's actual numbers

---

## Future Improvements

- [ ] Pie or donut chart for visual expense distribution
- [ ] Support for **multiple currencies** (₦, $, €, £)
- [ ] **Expense categories** (Food, Rent, Transport, etc.)
- [ ] Budget history — view and compare past months
- [ ] Dark/light mode toggle

---

## License

This project is open-source and free to use.