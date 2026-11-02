/* ========================================
   SCIENTIFIC CALCULATOR
   ======================================== */

const expressionDisplay = document.getElementById("expression-display");

const resultDisplay = document.getElementById("result-display");

const scientificKeypad = document.getElementById("scientific-keypad");

/* ========================================
   STATE
   ======================================== */

let expression = "";

let lastResult = null;

/* ========================================
   DISPLAY
   ======================================== */

function updateDisplay() {
  expressionDisplay.textContent = expression || "0";

  resultDisplay.textContent =
    lastResult !== null ? formatResult(lastResult) : "0";
}

function formatResult(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "Error";
  }

  return Number(value.toPrecision(12)).toString();
}

/* ========================================
   INPUT
   ======================================== */

function appendValue(value) {
  expression += value;

  lastResult = null;

  updateDisplay();
}

/* ========================================
   CLEAR
   ======================================== */

function clearCalculator() {
  expression = "";

  lastResult = null;

  updateDisplay();
}

/* ========================================
   BACKSPACE
   ======================================== */

function backspace() {
  expression = expression.slice(0, -1);

  lastResult = null;

  updateDisplay();
}

/* ========================================
   FACTORIAL
   ======================================== */

function factorial(number) {
  if (number < 0 || !Number.isInteger(number)) {
    throw new Error("Factorial requires a non-negative integer.");
  }

  if (number > 170) {
    throw new Error("Number is too large.");
  }

  let result = 1;

  for (let i = 2; i <= number; i++) {
    result *= i;
  }

  return result;
}

/* ========================================
   DEGREE-BASED TRIGONOMETRY
   ======================================== */

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function sine(value) {
  return Math.sin(toRadians(value));
}

function cosine(value) {
  return Math.cos(toRadians(value));
}

function tangent(value) {
  return Math.tan(toRadians(value));
}

/* ========================================
   SCIENTIFIC FUNCTIONS
   ======================================== */

function applyScientificFunction(functionName) {
  if (!expression) {
    return;
  }

  try {
    const value = evaluateExpression(expression);

    let result;

    switch (functionName) {
      case "sin":
        result = sine(value);
        break;

      case "cos":
        result = cosine(value);
        break;

      case "tan":
        result = tangent(value);
        break;

      case "log":
        if (value <= 0) {
          throw new Error("Log requires a positive number.");
        }

        result = Math.log10(value);
        break;

      case "sqrt":
        if (value < 0) {
          throw new Error("Cannot calculate square root of a negative number.");
        }

        result = Math.sqrt(value);
        break;

      case "square":
        result = value ** 2;
        break;

      case "factorial":
        result = factorial(value);
        break;

      default:
        return;
    }

    expression = String(result);

    lastResult = result;

    updateDisplay();
  } catch (error) {
    showError(error.message);
  }
}

/* ========================================
   EXPRESSION EVALUATION
   ======================================== */

function evaluateExpression(input) {
  let sanitized = input
    .replaceAll("π", `(${Math.PI})`)
    .replaceAll("e", `(${Math.E})`)
    .replaceAll("^", "**");

  /*
   * Only allow characters that belong
   * to our calculator expression.
   */

  if (!/^[0-9+\-*/().\s]+$/.test(sanitized)) {
    throw new Error("Invalid expression.");
  }

  /*
   * The Function constructor is used
   * only after the expression has been
   * restricted to calculator characters.
   */

  const result = Function(`"use strict"; return (${sanitized})`)();

  if (typeof result !== "number" || !Number.isFinite(result)) {
    throw new Error("Invalid calculation.");
  }

  return result;
}

/* ========================================
   CALCULATE
   ======================================== */

function calculate() {
  if (!expression) {
    return;
  }

  try {
    const result = evaluateExpression(expression);

    lastResult = result;

    updateDisplay();
  } catch (error) {
    showError(error.message);
  }
}

/* ========================================
   ERROR HANDLING
   ======================================== */

function showError(message) {
  expressionDisplay.textContent = message;

  resultDisplay.textContent = "Error";

  lastResult = null;
}

/* ========================================
   BUTTON EVENTS
   ======================================== */

scientificKeypad.addEventListener("click", (event) => {
  const button = event.target.closest(".calc-key");

  if (!button) {
    return;
  }

  const value = button.dataset.value;

  const action = button.dataset.action;

  const scientificFunction = button.dataset.function;

  if (action === "clear") {
    clearCalculator();
    return;
  }

  if (action === "backspace") {
    backspace();
    return;
  }

  if (action === "calculate") {
    calculate();
    return;
  }

  if (scientificFunction) {
    applyScientificFunction(scientificFunction);

    return;
  }

  if (value) {
    appendValue(value);
  }
});

/* ========================================
   KEYBOARD SUPPORT
   ======================================== */

document.addEventListener("keydown", (event) => {
  /*
   * Don't intercept keyboard input
   * when the user is typing into another
   * form control.
   */

  const activeElement = document.activeElement;

  if (
    activeElement &&
    (activeElement.tagName === "INPUT" ||
      activeElement.tagName === "TEXTAREA" ||
      activeElement.tagName === "SELECT")
  ) {
    return;
  }

  const key = event.key;

  if (/^[0-9.]$/.test(key) || ["+", "-", "*", "/", "(", ")"].includes(key)) {
    appendValue(key);

    return;
  }

  if (key === "Enter" || key === "=") {
    event.preventDefault();

    calculate();

    return;
  }

  if (key === "Backspace") {
    backspace();

    return;
  }

  if (key === "Escape") {
    clearCalculator();

    return;
  }
});

/* ========================================
   INITIAL DISPLAY
   ======================================== */

updateDisplay();
