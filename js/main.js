/* ========================================
   CALCHUB
   Shared Calculator Navigation
   ======================================== */

const calculatorTabs = document.querySelectorAll(".calculator-tab");

const calculatorPanels = document.querySelectorAll(".calculator-panel");

/* ========================================
   CALCULATOR NAVIGATION
   ======================================== */

function switchCalculator(calculatorName) {
  calculatorTabs.forEach((tab) => {
    const isActive = tab.dataset.calculator === calculatorName;

    tab.classList.toggle("active", isActive);
  });

  calculatorPanels.forEach((panel) => {
    const isActive = panel.dataset.panel === calculatorName;

    panel.hidden = !isActive;

    panel.classList.toggle("active", isActive);
  });
}

calculatorTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    switchCalculator(tab.dataset.calculator);
  });
});
