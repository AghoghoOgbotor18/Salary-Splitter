document.getElementById("salary-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const salary = parseFloat(document.getElementById("salary").value.replace(/,/g, "")) || 0;
    
    // === MAIN EXPENSES ===
    const expenseInputs = document.querySelectorAll("#expenses-container .expenses-inputs");
    let mainExpenses = []; //Array to save all main expenses
    let totalMainMonthly = 0;

    expenseInputs.forEach(exp => {
        const name = exp.querySelector(".expense-name").value;
        const amount = parseFloat(exp.querySelector(".expense-amount").value.replace(/,/g, "")) || 0;
        const duration = parseFloat(exp.querySelector(".expense-duration").value);

        if(name && amount && duration) {
            const monthlyShare = amount / duration;
            //Add to empty array
            mainExpenses.push({ name, amount, duration, monthlyShare });
            totalMainMonthly += monthlyShare;
        }
    });

    // Salary left after main expenses
    let remaining = salary - totalMainMonthly;

    if(remaining < 0) {
        alert("⚠️ Your salary is not enough to cover main expenses!");
        return;
    }
    // === ASK USER FOR SAVINGS PERCENTAGE ===
    let savingsPercent = parseFloat(prompt("Enter the percentage (%) of savings you want from the remainder after main expenses:", "20"));
    if(isNaN(savingsPercent) || savingsPercent < 0 || savingsPercent > 100) {
        alert("⚠️ Please enter a valid savings percentage between 0 and 100.");
        return;
    }
    //== ASK USER FOR EMERGENCY FUNDS PERCENTAGE ===
    let emergencyFund = parseFloat(prompt("Enter the percentage (%) of emergency fund you want from the remainder after main expenses and savings:", "10"));
    if(isNaN(emergencyFund) || emergencyFund < 0 || emergencyFund > 100) {
        alert("⚠️ Please enter a valid savings percentage between 0 and 100.");
        return;
    }

    // === SPLIT REMAINING ===
    const savings = (remaining * savingsPercent) / 100;
    const emergencyCash = ((remaining - savings) * emergencyFund) / 100;
    const miscPool = remaining - savings - emergencyCash;

    // Collect misc expenses (user enters only names)
    const miscInputs = document.querySelectorAll(".misc-expense");
    let miscExpenses = [];
    miscInputs.forEach(input => {
        if(input.value.trim() !== "") {
            miscExpenses.push(input.value.trim());
        }
    });

    // Divide miscPool equally among misc expenses
    let miscAllocations = [];
    if(miscExpenses.length > 0) {
        const share = miscPool / miscExpenses.length;
        miscAllocations = miscExpenses.map(name => ({
            name,
            amount: share
        }));
    }
    
    // === TOTAL EXPENSES (main + savings + misc) ===
    const totalExpenses = totalMainMonthly + savings + emergencyCash +  miscAllocations.reduce((sum, m) => sum + m.amount, 0);

    // === OUTPUT SECTION ===
    const breakdown = document.getElementById("breakdown");

    // === CHECK IF EXPENSES > SALARY ===
    if(totalExpenses > salary) {
        alert("⚠️ Your total expenses are higher than your salary. Here's a suggested better plan.");

        // Scale expenses down to fit inside salary
        let scaleFactor = salary * 0.80 / totalMainMonthly; // 80% of salary goes to main expenses
        let adjustedExpenses = mainExpenses.map(exp => ({
            name: exp.name,
            monthlyShare: exp.monthlyShare * scaleFactor
        }));

        let newSavings = salary * 0.10; // 10% savings
        let newEmergency = salary * 0.05; // 5% emergency fund
        let newMiscPool = salary - (adjustedExpenses.reduce((a,b)=>a+b.monthlyShare,0) + newSavings + newEmergency);
        
        // === OUTPUT ===
        breakdown.innerHTML = `
            <h3>💡 Suggested Budget Plan</h3>
            <h4>Fixed Expenses (Adjusted)</h4>
            <ul>
                ${adjustedExpenses.map(exp => `<li>${exp.name}: ₦${exp.monthlyShare.toFixed(2)} / month</li>`).join("")}
            </ul>
            <h4>Savings (10%)</h4>
            <p>₦${newSavings.toFixed(2)}</p>
            <h4>Emergency Fund (5%)</h4>
            <p>₦${newEmergency.toFixed(2)}</p>
            <h4>Miscellaneous Pool</h4>
            <p>₦${newMiscPool.toFixed(2)}</p>
            <h4>Total Adjusted Expenses</h4>
            <p>The total expenses<b>₦${salary.toFixed(2)}</b> (balanced with your salary)</p>
        `;
    } else {
        // === NORMAL OUTPUT ===
        breakdown.innerHTML = `
            <h3>Fixed Expenses (Priority)</h3>
            <ul>
                ${mainExpenses.map(exp => 
                    `<li>${exp.name}: ₦${exp.monthlyShare.toFixed(2)} / month</li>`
                ).join("")}
            </ul>
            <h3>Savings (${savingsPercent}% of remainder)</h3>
            <p>₦${savings.toFixed(2)}</p>
            <h3>Emergency Fund (${emergencyFund}% of remainder after savings)</h3>
            <p>₦${emergencyCash.toFixed(2)}</p>
            <h3>Miscellaneous Expenses</h3>
            ${
                miscAllocations.length > 0 
                ? `<ul>${miscAllocations.map(m => `<li>${m.name}: ₦${m.amount.toFixed(2)}</li>`).join("")}</ul>`
                : "<p>No miscellaneous expenses entered.</p>"
            }
            <h3>Total Expenses</h3>
            <p>The total of your expenses is <b>₦${totalExpenses.toFixed(2)}</b> with a salary of <b>₦${salary.toFixed(2)} monthly</b>.</p>
        `;
    }

        // remove result from hidden to display it
    document.getElementById("result").classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
});

function formatNumberInput(input) {
    let value = input.value.replace(/,/g, ""); // remove commas
    if (!isNaN(value) && value !== "") {
        input.value = Number(value).toLocaleString(); // add commas
    }
}
// Apply formatting to all number inputs (salary + expense amounts)
document.addEventListener("input", function (e) {
    if (e.target.classList.contains("format-number")) {
        formatNumberInput(e.target);
    }
});
// === Add another MAIN expense input ===
document.getElementById("add-expense").addEventListener("click", function() {
    const container = document.getElementById("expenses-container");
    const newExp = document.createElement("div");
    newExp.classList.add("expenses-inputs", "grid-3");
    newExp.innerHTML = `
        <input type="text" class="expense-name" placeholder="Enter expense name">
        <input type="text" class="expense-amount format-number" placeholder="Amount">
        <input type="number" class="expense-duration" placeholder="Duration (months)">
    `;
    container.appendChild(newExp);
});


// === Add Miscellaneous Expense Input Field ===
document.getElementById("sub-expenses").addEventListener("click", function(e) {
    e.preventDefault();
    const container = document.getElementById("expenses-container");
    const newMisc = document.createElement("input");
    newMisc.type = "text";
    newMisc.classList.add("misc-expense");
    newMisc.placeholder = "Enter miscellaneous expense name";
    container.appendChild(newMisc);
});

const salaryCard = document.getElementById("salary-card");  
const resultCard = document.getElementById("result");  
const okBtn = document.getElementById("okBtn");
//when the user clicks on split my salary button
document.getElementById("salary-form").addEventListener("submit", function() {
    salaryCard.style.display = "none";   
    resultCard.style.display = "block";  
    okBtn.style.display = "block";
    // Scroll back to top smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });       
});
//when the user clicks on the OK button
okBtn.addEventListener("click", function() {
    resultCard.style.display = "none";   
    salaryCard.style.display = "block";
    // Reset the form to clear all values
    document.getElementById("salary-form").reset();
    // Remove dynamically added main expense + misc inputs
    const expensesContainer = document.getElementById("expenses-container");
    expensesContainer.innerHTML = `
        <div class="expenses-inputs grid-3">
            <input type="text" class="expense-name" placeholder="Enter expense name">
            <input type="text" class="expense-amount format-number" placeholder="Amount">
            <input type="number" class="expense-duration" placeholder="Duration (months)">
        </div>
    `;
    // Also clear the result content
    document.getElementById("result").innerHTML = "";
    // Scroll back to top smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
});

