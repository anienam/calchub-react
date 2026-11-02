export const conversionUnits = {
  length: {
    meter: { label: "Meters", factor: 1 },
    kilometer: { label: "Kilometers", factor: 1000 },
    centimeter: { label: "Centimeters", factor: 0.01 },
    millimeter: { label: "Millimeters", factor: 0.001 },
    mile: { label: "Miles", factor: 1609.344 },
    yard: { label: "Yards", factor: 0.9144 },
    foot: { label: "Feet", factor: 0.3048 },
    inch: { label: "Inches", factor: 0.0254 },
  },
  weight: {
    kilogram: { label: "Kilograms", factor: 1 },
    gram: { label: "Grams", factor: 0.001 },
    milligram: { label: "Milligrams", factor: 0.000001 },
    pound: { label: "Pounds", factor: 0.45359237 },
    ounce: { label: "Ounces", factor: 0.028349523125 },
    stone: { label: "Stones", factor: 6.35029318 },
  },
  volume: {
    liter: { label: "Liters", factor: 1 },
    milliliter: { label: "Milliliters", factor: 0.001 },
    cubicMeter: { label: "Cubic Meters", factor: 1000 },
    gallon: { label: "US Gallons", factor: 3.785411784 },
    quart: { label: "US Quarts", factor: 0.946352946 },
    pint: { label: "US Pints", factor: 0.473176473 },
    cup: { label: "US Cups", factor: 0.2365882365 },
  },
  temperature: {
    celsius: { label: "Celsius" },
    fahrenheit: { label: "Fahrenheit" },
    kelvin: { label: "Kelvin" },
  },
};

export const categoryDefaults = {
  length: ["meter", "kilometer"],
  weight: ["kilogram", "pound"],
  temperature: ["celsius", "fahrenheit"],
  volume: ["liter", "gallon"],
};

export function formatConversionResult(value) {
  if (value === 0) return "0";
  return Number(value.toPrecision(10)).toString();
}

export function convertUnit(value, category, fromUnit, toUnit) {
  if (category !== "temperature") {
    const units = conversionUnits[category];
    return (value * units[fromUnit].factor) / units[toUnit].factor;
  }

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

  switch (toUnit) {
    case "celsius":
      return celsius;
    case "fahrenheit":
      return (celsius * 9) / 5 + 32;
    case "kelvin":
      return celsius + 273.15;
    default:
      throw new Error("Invalid temperature unit.");
  }
}
