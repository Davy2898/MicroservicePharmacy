// Dosage calculation service for pharmacy applications
// This service handles various dosage calculations commonly needed in pharmacy practice

/**
 * Calculate pediatric dosage based on weight
 * @param {number} weightKg - Patient weight in kilograms
 * @param {number} doseMgPerKg - Standard dose in mg per kg of body weight
 * @param {number} frequencyPerDay - Number of doses per day
 * @returns {Object} Dosage calculation results
 */
function calculatePediatricDosage(weightKg, doseMgPerKg, frequencyPerDay = 1) {
  if (weightKg <= 0) {
    throw new Error('Weight must be greater than zero');
  }

  if (doseMgPerKg <= 0) {
    throw new Error('Dose per kg must be greater than zero');
  }

  if (frequencyPerDay <= 0) {
    throw new Error('Frequency must be greater than zero');
  }

  const singleDoseMg = weightKg * doseMgPerKg;
  const dailyTotalMg = singleDoseMg * frequencyPerDay;

  return {
    weightKg,
    doseMgPerKg,
    singleDoseMg: Number(singleDoseMg.toFixed(2)),
    frequencyPerDay,
    dailyTotalMg: Number(dailyTotalMg.toFixed(2)),
    unit: 'mg'
  };
}

/**
 * Calculate infusion rate for IV medications
 * @param {number} doseMgPerHour - Desired dose in mg per hour
 * @param {number} concentrationMgPerMl - Drug concentration in mg per ml
 * @returns {number} Infusion rate in ml per hour
 */
function calculateInfusionRate(doseMgPerHour, concentrationMgPerMl) {
  if (doseMgPerHour < 0) {
    throw new Error('Dose cannot be negative');
  }

  if (concentrationMgPerMl <= 0) {
    throw new Error('Concentration must be greater than zero');
  }

  const rateMlPerHour = doseMgPerHour / concentrationMgPerMl;
  return Number(rateMlPerHour.toFixed(2));
}

/**
 * Convert between different units of measurement
 * @param {number} value - Value to convert
 * @param {string} fromUnit - Unit to convert from
 * @param {string} toUnit - Unit to convert to
 * @returns {number} Converted value
 */
function convertUnits(value, fromUnit, toUnit) {
  // Conversion factors to base unit (grams for weight, liters for volume)
  const weightConversions = {
    kg: 1000,      // kilograms to grams
    g: 1,          // grams to grams
    mg: 0.001,     // milligrams to grams
    mcg: 0.000001  // micrograms to grams
  };

  const volumeConversions = {
    L: 1,          // liters to liters
    dL: 0.1,       // deciliters to liters
    mL: 0.001,     // milliliters to liters
    µL: 0.000001   // microliters to liters
  };

  // Determine if we're dealing with weight or volume
  const isWeightConversion = Object.keys(weightConversions).includes(fromUnit) &&
                            Object.keys(weightConversions).includes(toUnit);
  const isVolumeConversion = Object.keys(volumeConversions).includes(fromUnit) &&
                            Object.keys(volumeConversions).includes(toUnit);

  if (!isWeightConversion && !isVolumeConversion) {
    throw new Error('Invalid unit conversion. Supported units: kg, g, mg, mcg, L, dL, mL, µL');
  }

  const conversions = isWeightConversion ? weightConversions : volumeConversions;

  // Convert to base unit, then to target unit
  const valueInBase = value * conversions[fromUnit];
  const result = valueInBase / conversions[toUnit];

  return Number(result.toFixed(6)); // Precision appropriate for pharmacy calculations
}

/**
 * Calculate body surface area (BSA) using Mosteller formula
 * @param {number} weightKg - Weight in kilograms
 * @param {number} heightCm - Height in centimeters
 * @returns {number} BSA in square meters
 */
function calculateBSA(weightKg, heightCm) {
  if (weightKg <= 0 || heightCm <= 0) {
    throw new Error('Weight and height must be greater than zero');
  }

  // Mosteller formula: BSA (m²) = √[(height(cm) × weight(kg)) / 3600]
  const bsa = Math.sqrt((heightCm * weightKg) / 3600);
  return Number(bsa.toFixed(2));
}

/**
 * Calculate chemotherapy dose based on BSA
 * @param {number} doseMgPerM2 - Standard dose in mg per m²
 * @param {number} bsa - Body surface area in m²
 * @returns {number} Calculated dose in mg
 */
function calculateChemoDose(doseMgPerM2, bsa) {
  if (doseMgPerM2 < 0) {
    throw new Error('Dose cannot be negative');
  }

  if (bsa <= 0) {
    throw new Error('BSA must be greater than zero');
  }

  const doseMg = doseMgPerM2 * bsa;
  return Number(doseMg.toFixed(2));
}

/**
 * Check if a dose is within standard range
 * @param {number} calculatedDose - The calculated dose
 * @param {number} minStandard - Minimum standard dose
 * @param {number} maxStandard - Maximum standard dose
 * @returns {Object} Validation result
 */
function validateDoseRange(calculatedDose, minStandard, maxStandard) {
  if (calculatedDose < minStandard) {
    return {
      valid: false,
      message: `Dose ${calculatedDose} is below minimum standard of ${minStandard}`,
      type: 'UNDERDOSE'
    };
  }

  if (calculatedDose > maxStandard) {
    return {
      valid: false,
      message: `Dose ${calculatedDose} exceeds maximum standard of ${maxStandard}`,
      type: 'OVERDOSE'
    };
  }

  return {
    valid: true,
    message: `Dose ${calculatedDose} is within standard range (${minStandard}-${maxStandard})`,
    type: 'THERAPEUTIC'
  };
}

module.exports = {
  calculatePediatricDosage,
  calculateInfusionRate,
  convertUnits,
  calculateBSA,
  calculateChemoDose,
  validateDoseRange
};