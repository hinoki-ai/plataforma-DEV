/**
 * RUT (Rol Único Tributario) utilities for Chilean tax identification numbers
 *
 * The RUT verification digit uses the módulo 11 algorithm:
 * 1. Multiply each digit from right to left by the sequence 2,3,4,5,6,7 (repeating)
 * 2. Sum all products
 * 3. Divide the sum by 11 and get the remainder
 * 4. Subtract the remainder from 11
 * 5. If result is 10, digit is 'K'; if 11, digit is 0; otherwise it's the number
 */

/**
 * Normalizes a RUT string by removing dots and hyphens
 * @param rut - The RUT string to normalize
 * @returns The normalized RUT (e.g., "12345678-5" -> "123456785")
 */
export function normalizeRUT(rut: string): string {
  return rut.replace(/\./g, "").replace(/-/g, "").trim();
}

/**
 * Formats a RUT with dots and hyphen (e.g., 12345678-5 -> 12.345.678-5)
 * @param rut - The RUT string to format
 * @returns The formatted RUT string
 */
export function formatRUT(rut: string): string {
  const normalized = normalizeRUT(rut);
  if (normalized.length < 2) return rut;

  // Separate the verification digit from the number
  const number = normalized.slice(0, -1);
  const verifier = normalized.slice(-1);

  // Add dots every 3 digits from right to left
  let formatted = "";
  for (let i = number.length - 1, count = 0; i >= 0; i--, count++) {
    if (count > 0 && count % 3 === 0) {
      formatted = "." + formatted;
    }
    formatted = number[i] + formatted;
  }

  return `${formatted}-${verifier}`;
}

/**
 * Calculates the verification digit for a RUT number using módulo 11 algorithm
 * @param rutNumber - The RUT number without the verification digit (e.g., "12345678")
 * @returns The calculated verification digit ('0'-'9' or 'K')
 */
export function calculateRUTVerifier(rutNumber: string): string {
  // Remove any dots or hyphens and get only the numeric part
  const cleanNumber = rutNumber.replace(/\./g, "").replace(/-/g, "").trim();

  // Reverse the number to process from right to left
  const reversed = cleanNumber.split("").reverse();

  // Sequence for multiplication: 2, 3, 4, 5, 6, 7 (repeating)
  const sequence = [2, 3, 4, 5, 6, 7];

  // Multiply each digit by the corresponding sequence value and sum
  let sum = 0;
  for (let i = 0; i < reversed.length; i++) {
    const digit = parseInt(reversed[i], 10);
    const multiplier = sequence[i % sequence.length];
    sum += digit * multiplier;
  }

  // Calculate remainder when dividing by 11
  const remainder = sum % 11;

  // Calculate verification digit: 11 - remainder
  const verifier = 11 - remainder;

  // Handle special cases
  if (verifier === 10) return "K";
  if (verifier === 11) return "0";
  return verifier.toString();
}

/**
 * Validates a complete RUT (number + verification digit)
 * @param rut - The complete RUT string (e.g., "12.345.678-5" or "12345678-5")
 * @returns Object with validation result and error message if invalid
 */
export function validateRUT(rut: string): {
  valid: boolean;
  error?: string;
  normalized?: string;
  formatted?: string;
} {
  // Check if RUT is provided
  if (!rut || typeof rut !== "string" || !rut.trim()) {
    return {
      valid: false,
      error: "El RUT es requerido",
    };
  }

  // Normalize the RUT
  const normalized = normalizeRUT(rut);

  // Check minimum length (at least 2 characters: 1 digit + 1 verifier)
  if (normalized.length < 2) {
    return {
      valid: false,
      error: "El RUT debe tener al menos 2 caracteres",
    };
  }

  // Separate number and verification digit
  const number = normalized.slice(0, -1);
  const verifier = normalized.slice(-1).toUpperCase();

  // Validate that the number part contains only digits
  if (!/^\d+$/.test(number)) {
    return {
      valid: false,
      error: "El número del RUT debe contener solo dígitos",
    };
  }

  // Validate verification digit (must be 0-9 or K)
  if (!/^[0-9K]$/.test(verifier)) {
    return {
      valid: false,
      error: "El dígito verificador debe ser un número del 0-9 o la letra K",
    };
  }

  // Calculate expected verification digit
  const expectedVerifier = calculateRUTVerifier(number);

  // Compare with provided verification digit
  if (verifier !== expectedVerifier) {
    return {
      valid: false,
      error: `El dígito verificador es incorrecto. Debería ser ${expectedVerifier}`,
    };
  }

  // RUT is valid
  return {
    valid: true,
    normalized,
    formatted: formatRUT(normalized),
  };
}

/**
 * Extracts the number part from a RUT (without verification digit)
 * @param rut - The complete RUT string
 * @returns The number part without verification digit
 */
export function extractRUTNumber(rut: string): string {
  const normalized = normalizeRUT(rut);
  return normalized.slice(0, -1);
}

/**
 * Extracts the verification digit from a RUT
 * @param rut - The complete RUT string
 * @returns The verification digit
 */
export function extractRUTVerifier(rut: string): string {
  const normalized = normalizeRUT(rut);
  return normalized.slice(-1).toUpperCase();
}
