import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  categoryDefaults,
  conversionUnits,
  convertUnit,
  formatConversionResult,
} from "./converter.js";

const initialCourses = [
  { id: 1, name: "Mathematics", credits: 3, score: 85 },
  { id: 2, name: "JavaScript", credits: 4, score: 91 },
  { id: 3, name: "Computer Science", credits: 3, score: 78 },
  { id: 4, name: "UI/UX Design", credits: 2, score: 88 },
];

const keypadRows = [
  [
    { label: "C", action: "clear", style: "function" },
    { label: "CE", action: "backspace", style: "function" },
    { label: "(", value: "(", style: "function" },
    { label: ")", value: ")", style: "function" },
    { label: "÷", value: "/", style: "operator" },
  ],
  [
    { label: "sin", function: "sin", style: "function" },
    { label: "cos", function: "cos", style: "function" },
    { label: "tan", function: "tan", style: "function" },
    { label: "log", function: "log", style: "function" },
    { label: "×", value: "*", style: "operator" },
  ],
  [
    { label: "√", function: "sqrt", style: "function" },
    { label: "x²", function: "square", style: "function" },
    { label: "x!", function: "factorial", style: "function" },
    { label: "xʸ", value: "^", style: "operator" },
    { label: "−", value: "-", style: "operator" },
  ],
  [
    { label: "7", value: "7", style: "number" },
    { label: "8", value: "8", style: "number" },
    { label: "9", value: "9", style: "number" },
    { label: "π", value: "π", style: "function" },
    { label: "+", value: "+", style: "operator" },
  ],
  [
    { label: "4", value: "4", style: "number" },
    { label: "5", value: "5", style: "number" },
    { label: "6", value: "6", style: "number" },
    { label: "e", value: "e", style: "function" },
    { label: "=", action: "calculate", style: "equals" },
  ],
  [
    { label: "1", value: "1", style: "number" },
    { label: "2", value: "2", style: "number" },
    { label: "3", value: "3", style: "number" },
    { label: ".", value: ".", style: "number" },
    { label: "0", value: "0", style: "number zero" },
  ],
];

const calculatorTabs = [
  { id: "scientific", icon: "∑", title: "Scientific", description: "Advanced calculations" },
  { id: "converter", icon: "⇄", title: "Unit Converter", description: "Convert common units" },
  { id: "grade", icon: "%", title: "Grade Calculator", description: "Calculate grades and GPA" },
];

function formatResult(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Error";
  return Number(value.toPrecision(12)).toString();
}

function factorial(number) {
  if (number < 0 || !Number.isInteger(number)) {
    throw new Error("Factorial requires a non-negative integer.");
  }
  if (number > 170) throw new Error("Number is too large.");

  let result = 1;
  for (let i = 2; i <= number; i += 1) result *= i;
  return result;
}

function evaluateExpression(input) {
  const sanitized = input
    .replaceAll("π", `(${Math.PI})`)
    .replaceAll("e", `(${Math.E})`)
    .replaceAll("^", "**");

  if (!/^[0-9+\-*/().\s]+$/.test(sanitized)) {
    throw new Error("Invalid expression.");
  }

  const result = Function(`"use strict"; return (${sanitized})`)();
  if (typeof result !== "number" || !Number.isFinite(result)) {
    throw new Error("Invalid calculation.");
  }
  return result;
}

function applyScientificFunction(name, value) {
  switch (name) {
    case "sin":
      return Math.sin((value * Math.PI) / 180);
    case "cos":
      return Math.cos((value * Math.PI) / 180);
    case "tan":
      return Math.tan((value * Math.PI) / 180);
    case "log":
      if (value <= 0) throw new Error("Log requires a positive number.");
      return Math.log10(value);
    case "sqrt":
      if (value < 0) {
        throw new Error("Cannot calculate square root of a negative number.");
      }
      return Math.sqrt(value);
    case "square":
      return value ** 2;
    case "factorial":
      return factorial(value);
    default:
      return value;
  }
}

function ScientificCalculator() {
  const [expression, setExpression] = useState("");
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState("");

  const appendValue = (value) => {
    setExpression((current) => current + value);
    setLastResult(null);
    setError("");
  };

  const clear = () => {
    setExpression("");
    setLastResult(null);
    setError("");
  };

  const backspace = () => {
    setExpression((current) => current.slice(0, -1));
    setLastResult(null);
    setError("");
  };

  const calculate = () => {
    if (!expression) return;
    try {
      setLastResult(evaluateExpression(expression));
      setError("");
    } catch (calculationError) {
      setError(calculationError.message);
      setLastResult(null);
    }
  };

  const runFunction = (name) => {
    if (!expression) return;
    try {
      const result = applyScientificFunction(name, evaluateExpression(expression));
      setExpression(String(result));
      setLastResult(result);
      setError("");
    } catch (calculationError) {
      setError(calculationError.message);
      setLastResult(null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const activeElement = document.activeElement;
      if (
        activeElement &&
        ["INPUT", "TEXTAREA", "SELECT"].includes(activeElement.tagName)
      ) {
        return;
      }

      if (/^[0-9.]$/.test(event.key) || ["+", "-", "*", "/", "(", ")"].includes(event.key)) {
        appendValue(event.key);
      } else if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        calculate();
      } else if (event.key === "Backspace") {
        backspace();
      } else if (event.key === "Escape") {
        clear();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  });

  const handleButton = (key) => {
    if (key.action === "clear") clear();
    else if (key.action === "backspace") backspace();
    else if (key.action === "calculate") calculate();
    else if (key.function) runFunction(key.function);
    else if (key.value) appendValue(key.value);
  };

  return (
    <section className="calculator-panel active" id="scientific-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Scientific Calculator</p>
          <h2>Advanced calculations</h2>
        </div>
        <span className="mode-badge">DEG</span>
      </div>
      <div className="scientific-layout">
        <div className="calculator-display">
          <div className="expression-display" aria-label="Current expression">
            {error || expression || "0"}
          </div>
          <div className="result-display" aria-live="polite" aria-label="Calculation result">
            {error ? "Error" : lastResult !== null ? formatResult(lastResult) : "0"}
          </div>
        </div>
        <div className="scientific-keypad">
          {keypadRows.flat().map((key, index) => (
            <button
              key={`${key.label}-${index}`}
              type="button"
              className={`calc-key ${key.style}`}
              onClick={() => handleButton(key)}
            >
              {key.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function UnitConverter() {
  const [category, setCategory] = useState("length");
  const [fromValue, setFromValue] = useState("1");
  const [fromUnit, setFromUnit] = useState(categoryDefaults.length[0]);
  const [toUnit, setToUnit] = useState(categoryDefaults.length[1]);
  const [error, setError] = useState("");

  const units = conversionUnits[category];
  const conversion = useMemo(() => {
    if (fromValue === "") return { result: "", message: "Enter a value to convert." };
    const value = Number(fromValue);
    if (!Number.isFinite(value)) {
      return { result: "", message: "Please enter a valid number." };
    }
    try {
      const result = convertUnit(value, category, fromUnit, toUnit);
      if (!Number.isFinite(result)) throw new Error("Unable to perform conversion.");
      return {
        result: formatConversionResult(result),
        message: `${formatConversionResult(value)} ${units[fromUnit].label} = ${formatConversionResult(result)} ${units[toUnit].label}`,
      };
    } catch (conversionError) {
      return { result: "", message: "Conversion unavailable.", error: conversionError.message };
    }
  }, [category, fromValue, fromUnit, toUnit, units]);
  const conversionError = conversion.error || error;

  const changeCategory = (nextCategory) => {
    setCategory(nextCategory);
    setFromUnit(categoryDefaults[nextCategory][0]);
    setToUnit(categoryDefaults[nextCategory][1]);
    setError("");
  };

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  return (
    <section className="calculator-panel" id="converter-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Unit Converter</p>
          <h2>Convert between common units</h2>
        </div>
      </div>
      <div className="converter-wrapper">
        <div className="converter-category">
          <span className="field-label">Conversion Type</span>
          <div className="category-buttons">
            {[
              ["length", "📏 Length"],
              ["weight", "⚖️ Weight"],
              ["temperature", "🌡️ Temperature"],
              ["volume", "🧪 Volume"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`category-btn${category === key ? " active" : ""}`}
                onClick={() => changeCategory(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="conversion-grid">
          <div className="conversion-field">
            <label htmlFor="from-value">From</label>
            <input
              type="number"
              id="from-value"
              value={fromValue}
              step="any"
              autoComplete="off"
              onChange={(event) => setFromValue(event.target.value)}
            />
            <label htmlFor="from-unit" className="sr-only">From unit</label>
            <select
              id="from-unit"
              value={fromUnit}
              onChange={(event) => setFromUnit(event.target.value)}
            >
              {Object.entries(units).map(([key, unit]) => (
                <option key={key} value={key}>{unit.label}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="swap-button"
            onClick={swapUnits}
            aria-label="Swap units"
            title="Swap units"
          >
            ⇄
          </button>
          <div className="conversion-field">
            <label htmlFor="to-value">To</label>
            <input type="number" id="to-value" value={conversion.result} readOnly />
            <label htmlFor="to-unit" className="sr-only">To unit</label>
            <select
              id="to-unit"
              value={toUnit}
              onChange={(event) => setToUnit(event.target.value)}
            >
              {Object.entries(units).map(([key, unit]) => (
                <option key={key} value={key}>{unit.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="conversion-result">
          <span>Result</span>
          <strong>{conversion.message}</strong>
        </div>
        <p className="converter-error" role="alert" aria-live="polite">
          {conversionError}
        </p>
      </div>
    </section>
  );
}

function getGrade(score) {
  if (score >= 70) return { grade: "A", points: 4 };
  if (score >= 60) return { grade: "B", points: 3 };
  if (score >= 50) return { grade: "C", points: 2 };
  if (score >= 45) return { grade: "D", points: 1 };
  if (score >= 40) return { grade: "E", points: 0 };
  return { grade: "F", points: 0 };
}

function getPerformance(average) {
  if (average >= 70) return "Excellent";
  if (average >= 60) return "Very Good";
  if (average >= 50) return "Good";
  if (average >= 45) return "Pass";
  if (average >= 40) return "Needs Improvement";
  return "Fail";
}

function calculateGrades(courses) {
  let totalCredits = 0;
  let weightedScore = 0;
  let totalGradePoints = 0;

  for (const course of courses) {
    const credits = Number(course.credits);
    const score = Number(course.score);
    if (!Number.isFinite(credits) || credits <= 0) {
      return { error: "Each course must have valid credit units." };
    }
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      return { error: "Scores must be between 0 and 100." };
    }
    totalCredits += credits;
    weightedScore += score * credits;
    totalGradePoints += getGrade(score).points * credits;
  }

  if (!courses.length) {
    return { totalCredits: 0, weightedAverage: 0, gpa: 0, performance: "—" };
  }

  const weightedAverage = weightedScore / totalCredits;
  return {
    totalCredits,
    weightedAverage,
    gpa: totalGradePoints / totalCredits,
    performance: getPerformance(weightedAverage),
  };
}

function GradeCalculator() {
  const [courses, setCourses] = useState(() => initialCourses.map((course) => ({ ...course })));
  const [error, setError] = useState("");
  const [focusCourseId, setFocusCourseId] = useState(null);
  const nextId = useRef(5);
  const gradeResult = useMemo(() => calculateGrades(courses), [courses]);
  const visibleError = error || gradeResult.error || "";

  useEffect(() => {
    if (focusCourseId === null) return;
    document.querySelector(`[data-course-id="${focusCourseId}"] .course-name`)?.focus();
    setFocusCourseId(null);
  }, [courses, focusCourseId]);

  const updateCourse = (id, field, value) => {
    setCourses((current) =>
      current.map((course) => (course.id === id ? { ...course, [field]: value } : course)),
    );
    setError("");
  };

  const addCourse = () => {
    const id = nextId.current;
    nextId.current += 1;
    setCourses((current) => [...current, { id, name: "", credits: 3, score: 0 }]);
    setFocusCourseId(id);
    setError("");
  };

  const removeCourse = (id) => {
    if (courses.length <= 1) {
      setError("You need at least one course.");
      return;
    }
    setCourses((current) => current.filter((course) => course.id !== id));
    setError("");
  };

  const reset = () => {
    setCourses(initialCourses.map((course) => ({ ...course })));
    nextId.current = 5;
    setError("");
  };

  const results = gradeResult.error
    ? { totalCredits: 0, weightedAverage: 0, gpa: 0, performance: "—" }
    : gradeResult;

  return (
    <section className="calculator-panel" id="grade-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Grade Calculator</p>
          <h2>Calculate grades and GPA</h2>
        </div>
      </div>
      <div className="grade-wrapper">
        <div className="grade-table-header">
          <span>Course</span>
          <span>Credits</span>
          <span>Score (%)</span>
          <span>Action</span>
        </div>
        <div className="course-list">
          {courses.map((course) => (
            <div className="course-row" data-course-id={course.id} key={course.id}>
              <input
                type="text"
                className="course-name"
                value={course.name}
                placeholder="Course name"
                maxLength={80}
                aria-label="Course name"
                onChange={(event) => updateCourse(course.id, "name", event.target.value)}
              />
              <input
                type="number"
                className="course-credits"
                value={course.credits}
                min="1"
                max="30"
                step="1"
                aria-label="Credit units"
                onChange={(event) => updateCourse(course.id, "credits", Number(event.target.value))}
              />
              <input
                type="number"
                className="course-score"
                value={course.score}
                min="0"
                max="100"
                step="0.1"
                aria-label="Score"
                onChange={(event) => updateCourse(course.id, "score", Number(event.target.value))}
              />
              <button
                type="button"
                className="remove-course"
                aria-label={`Remove ${course.name || "course"}`}
                title="Remove course"
                onClick={() => removeCourse(course.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="grade-actions">
          <button type="button" className="grade-add-button" onClick={addCourse}>
            + Add Course
          </button>
          <button type="button" className="grade-reset-button" onClick={reset}>
            Reset
          </button>
        </div>
        <p className="grade-error" role="alert" aria-live="polite">{visibleError}</p>
        <div className="grade-results">
          <div className="grade-result-card">
            <span>Total Credits</span>
            <strong>{results.totalCredits.toFixed(0)}</strong>
          </div>
          <div className="grade-result-card">
            <span>Weighted Average</span>
            <strong>{results.weightedAverage.toFixed(2)}%</strong>
          </div>
          <div className="grade-result-card">
            <span>GPA</span>
            <strong>{results.gpa.toFixed(2)}</strong>
          </div>
          <div className="grade-result-card performance">
            <span>Performance</span>
            <strong>{results.performance}</strong>
          </div>
        </div>
        <div className="grade-scale">
          <h3>GPA Scale</h3>
          <div className="scale-grid">
            <span>A: 70–100</span>
            <span>B: 60–69</span>
            <span>C: 50–59</span>
            <span>D: 45–49</span>
            <span>E: 40–44</span>
            <span>F: 0–39</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function App() {
  const [activeCalculator, setActiveCalculator] = useState("scientific");

  return (
    <>
      <header className="app-header">
        <div className="container header-inner">
          <a href="../../index.html" className="brand">CalcHub</a>
          <a href="../../index.html" className="back-link">← Portfolio</a>
        </div>
      </header>
      <main>
        <section className="hero">
          <div className="container">
            <p className="eyebrow">Frontend Engineering Capstone</p>
            <h1>Smart calculations,<span>made simple.</span></h1>
            <p className="hero-description">
              A collection of practical calculation tools built with React.
            </p>
          </div>
        </section>
        <section className="calculator-section">
          <div className="container">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Choose a calculator</p>
                <h2>Calculation Tools</h2>
              </div>
            </div>
            <div className="calculator-tabs">
              {calculatorTabs.map((tab) => (
                <button
                  type="button"
                  className={`calculator-tab${activeCalculator === tab.id ? " active" : ""}`}
                  key={tab.id}
                  onClick={() => setActiveCalculator(tab.id)}
                  aria-pressed={activeCalculator === tab.id}
                >
                  <span className="tab-icon" aria-hidden="true">{tab.icon}</span>
                  <span>
                    <strong>{tab.title}</strong>
                    <small>{tab.description}</small>
                  </span>
                </button>
              ))}
            </div>
            <div className="calculator-panels">
              {activeCalculator === "scientific" && <ScientificCalculator />}
              {activeCalculator === "converter" && <UnitConverter />}
              {activeCalculator === "grade" && <GradeCalculator />}
            </div>
          </div>
        </section>
        <section className="history-section">
          <div className="container">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Recent activity</p>
                <h2>Calculation History</h2>
              </div>
              <button type="button" className="clear-history">Clear History</button>
            </div>
            <div className="history-list">
              <div className="history-empty">No calculations yet.</div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default App;
