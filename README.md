# 💰 Smart Budget Planner

A simple **web-based budgeting tool** built with HTML, CSS, and JavaScript. It helps users plan their monthly salary, track expenses, and receive intelligent suggestions if expenses exceed income.  

---

## 🚀 Features
- Enter monthly salary with **comma-formatted numbers** (₦1,000, ₦50,000, ₦1,000,000).  
- Add multiple fixed expenses and miscellaneous expenses dynamically.  
- Automatic formatting of numbers without affecting calculations.  
- Expense breakdown shown clearly (Fixed Expenses, Savings, Emergency Fund, Miscellaneous).  
- Alerts when expenses exceed salary, with **auto-adjusted budget suggestions**.  
- "OK" button to reset the planner and scroll back to the salary input.  
- User-friendly design with spacing and styled input fields.  

---

## 🛠️ Tech Stack
- **HTML5** – structure  
- **CSS3** – styling & layout  
- **JavaScript (ES6)** – interactivity, calculations, dynamic rendering  

---

## 📂 Setup
1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/smart-budget-planner.git
   ```
2. Open the project folder and launch `index.html` in a browser.  
3. Start planning your budget 💡.  

---

## ⚡ Challenges & Solutions
### 1. **Numbers formatting with commas**
- **Challenge**: I wanted digits to display as `1,000` or `123,000,000` but still be usable for calculations.  
- **Solution**: Used `.toLocaleString()` for display while keeping raw values for math.  

### 2. **Dynamic expense inputs**
- **Challenge**: New inputs added by "Add Another Expense" button weren’t styled like the default ones.  
- **Solution**: Applied the same CSS class dynamically when creating elements via JavaScript.  

### 3. **Salary input bug**
- **Challenge**: Digits in the salary input disappeared after typing three numbers.  
- **Solution**: Fixed input handling by separating display formatting and raw value parsing.  

### 4. **Resetting on OK button**
- **Challenge**: After pressing "OK", extra expense inputs stayed open.  
- **Solution**: On reset, cleared values and removed dynamically added fields so form returns to default.  

### 5. **Expense exceeding salary**
- **Challenge**: If expenses were greater than salary, the results were confusing and didn’t suggest improvements.  
- **Solution**: Added an algorithm to:  
  - Scale down fixed expenses  
  - Allocate 10% to savings  
  - Allocate 5% to emergency fund  
  - Distribute the remaining into miscellaneous pool  

---

## 🔮 Future Improvements
- [ ] Save user budgets in **localStorage** so they don’t lose data on refresh.  
- [ ] Add **charts/graphs** (e.g., Pie chart for expense distribution).  
- [ ] Allow **categories for expenses** (Food, Rent, Transport, etc.).  
- [ ] Add **export to PDF** option for reports.  
- [ ] Support for **multiple currencies** (₦, $, €, £).  
- [ ] Mobile responsive UI with smoother transitions.  

---

## 📜 License
This project is open-source and free to use.  
