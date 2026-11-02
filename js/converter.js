/* ========================================
   UNIT CONVERTER
   ======================================== */

/* ========================================
   DOM ELEMENTS
   ======================================== */

const categoryButtons = document.querySelectorAll(".category-btn");

const fromValueInput = document.getElementById("from-value");

const toValueInput = document.getElementById("to-value");

const fromUnitSelect = document.getElementById("from-unit");

const toUnitSelect = document.getElementById("to-unit");

const swapUnitsButton = document.getElementById("swap-units");

const conversionResult = document.getElementById("conversion-result");

const converterError = document.getElementById("converter-error");

/* ========================================
   CONVERSION DATA
   ======================================== */

const conversionUnits = {
  length: {
    meter: {
      label: "Meters",
      factor: 1,
    },

    kilometer: {
      label: "Kilometers",
      factor: 1000,
    },

    centimeter: {
      label: "Centimeters",
      factor: 0.01,
    },

    millimeter: {
      label: "Millimeters",
      factor: 0.001,
    },

    mile: {
      label: "Miles",
      factor: 1609.344,
    },

    yard: {
      label: "Yards",
      factor: 0.9144,
    },

    foot: {
      label: "Feet",
      factor: 0.3048,
    },

    inch: {
      label: "Inches",
      factor: 0.0254,
    },
  },

  weight: {
    kilogram: {
      label: "Kilograms",
      factor: 1,
    },

    gram: {
      label: "Grams",
      factor: 0.001,
    },

    milligram: {
      label: "Milligrams",
      factor: 0.000001,
    },

    pound: {
      label: "Pounds",
      factor: 0.45359237,
    },

    ounce: {
      label: "Ounces",
      factor: 0.028349523125,
    },

    stone: {
      label: "Stones",
      factor: 6.35029318,
    },
  },

  volume: {
    liter: {
      label: "Liters",
      factor: 1,
    },

    milliliter: {
      label: "Milliliters",
      factor: 0.001,
    },

    cubicMeter: {
      label: "Cubic Meters",
      factor: 1000,
    },

    gallon: {
      label: "US Gallons",
      factor: 3.785411784,
    },

    quart: {
      label: "US Quarts",
      factor: 0.946352946,
    },

    pint: {
      label: "US Pints",
      factor: 0.473176473,
    },

    cup: {
      label: "US Cups",
      factor: 0.2365882365,
    },
  },

  temperature: {
    celsius: {
      label: "Celsius",
    },

    fahrenheit: {
      label: "Fahrenheit",
    },

    kelvin: {
      label: "Kelvin",
    },
  },
};

/* ========================================
   STATE
   ======================================== */

let currentCategory = "length";

/* ========================================
   INITIALIZE
   ======================================== */

function initializeConverter() {
  populateUnitSelects();

  setDefaultUnits();

  convertUnits();
}

initializeConverter();

/* ========================================
   POPULATE UNIT SELECTS
   ======================================== */

function populateUnitSelects() {
  const units = conversionUnits[currentCategory];

  fromUnitSelect.innerHTML = "";

  toUnitSelect.innerHTML = "";

  Object.entries(units).forEach(([unitKey, unit]) => {
    const fromOption = document.createElement("option");

    fromOption.value = unitKey;

    fromOption.textContent = unit.label;

    const toOption = document.createElement("option");

    toOption.value = unitKey;

    toOption.textContent = unit.label;

    fromUnitSelect.appendChild(fromOption);

    toUnitSelect.appendChild(toOption);
  });
}

/* ========================================
   DEFAULT UNITS
   ======================================== */

function setDefaultUnits() {
  const defaults = {
    length: ["meter", "kilometer"],

    weight: ["kilogram", "pound"],

    temperature: ["celsius", "fahrenheit"],

    volume: ["liter", "gallon"],
  };

  const selected = defaults[currentCategory];

  fromUnitSelect.value = selected[0];

  toUnitSelect.value = selected[1];
}

/* ========================================
   CHANGE CATEGORY
   ======================================== */

function changeCategory(category) {
  if (!conversionUnits[category]) {
    return;
  }

  currentCategory = category;

  categoryButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.category === category);
  });

  populateUnitSelects();

  setDefaultUnits();

  clearConverterError();

  convertUnits();
}

/* ========================================
   CONVERT
   ======================================== */

function convertUnits() {
  const rawValue = fromValueInput.value;

  if (rawValue === "") {
    toValueInput.value = "";

    conversionResult.textContent = "Enter a value to convert.";

    return;
  }

  const value = Number(rawValue);

  if (!Number.isFinite(value)) {
    showConverterError("Please enter a valid number.");

    return;
  }

  try {
    let result;

    if (currentCategory === "temperature") {
      result = convertTemperature(
        value,
        fromUnitSelect.value,
        toUnitSelect.value,
      );
    } else {
      result = convertStandardUnit(
        value,
        fromUnitSelect.value,
        toUnitSelect.value,
      );
    }

    if (!Number.isFinite(result)) {
      throw new Error("Unable to perform conversion.");
    }

    toValueInput.value = formatConversionResult(result);

    const fromUnit =
      conversionUnits[currentCategory][fromUnitSelect.value].label;

    const toUnit = conversionUnits[currentCategory][toUnitSelect.value].label;

    conversionResult.textContent = `${formatConversionResult(value)} ${fromUnit} = ${formatConversionResult(result)} ${toUnit}`;

    clearConverterError();
  } catch (error) {
    showConverterError(error.message);
  }
}

/* ========================================
   STANDARD CONVERSION
   ======================================== */

function convertStandardUnit(value, fromUnit, toUnit) {
  const units = conversionUnits[currentCategory];

  const valueInBaseUnit = value * units[fromUnit].factor;

  return valueInBaseUnit / units[toUnit].factor;
}

/* ========================================
   TEMPERATURE CONVERSION
   ======================================== */

function convertTemperature(value, fromUnit, toUnit) {
  if (fromUnit === toUnit) {
    return value;
  }

  /*
   * Convert everything to Celsius first.
   */

  let celsius;

  switch (fromUnit) {
    case "celsius":
      celsius = value;
      break;

    case "fahrenheit":
      celsius = (value - 32) * (5 / 9);
      break;

    case "kelvin":
      celsius = value - 273.15;
      break;

    default:
      throw new Error("Invalid temperature unit.");
  }

  /*
   * Convert Celsius to
   * the destination unit.
   */

  switch (toUnit) {
    case "celsius":
      return celsius;

    case "fahrenheit":
      return celsius * (9 / 5) + 32;

    case "kelvin":
      return celsius + 273.15;

    default:
      throw new Error("Invalid temperature unit.");
  }
}

/* ========================================
   FORMAT RESULT
   ======================================== */

function formatConversionResult(value) {
  if (value === 0) {
    return "0";
  }

  return Number(value.toPrecision(10)).toString();
}

/* ========================================
   SWAP UNITS
   ======================================== */

function swapUnits() {
  const oldFrom = fromUnitSelect.value;

  const oldTo = toUnitSelect.value;

  fromUnitSelect.value = oldTo;

  toUnitSelect.value = oldFrom;

  convertUnits();
}

/* ========================================
   ERROR HANDLING
   ======================================== */

function showConverterError(message) {
  converterError.textContent = message;

  toValueInput.value = "";

  conversionResult.textContent = "Conversion unavailable.";
}

function clearConverterError() {
  converterError.textContent = "";
}

/* ========================================
   EVENT LISTENERS
   ======================================== */

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    changeCategory(button.dataset.category);
  });
});

fromValueInput.addEventListener("input", convertUnits);

fromUnitSelect.addEventListener("change", convertUnits);

toUnitSelect.addEventListener("change", convertUnits);

swapUnitsButton.addEventListener("click", swapUnits);
