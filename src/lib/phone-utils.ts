/**
 * Utility functions for formatting and validating Chilean phone numbers
 * Format: +569 XXXX XXXXX (country code + mobile prefix, 4 digits, 5 digits)
 */

/**
 * Formats a phone number to the standard Chilean mobile format: +569 XXXX XXXXX
 * @param phone - The phone number to format
 * @returns Formatted phone number or empty string if invalid
 */
export function formatChileanPhone(phone: string): string {
  if (!phone) return "";

  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, "");

  // If it doesn't start with +, try to add it
  let digits = cleaned.startsWith("+") ? cleaned.slice(1) : cleaned;

  // Remove leading zeros and ensure it starts with 569 for Chilean mobile
  if (digits.startsWith("569")) {
    digits = digits.slice(3); // Remove 569 prefix
  } else if (digits.startsWith("56")) {
    // If it starts with 56, check if next digit is 9
    if (digits.length > 2 && digits[2] === "9") {
      digits = digits.slice(3); // Remove 569 prefix
    } else {
      digits = digits.slice(2); // Remove 56 prefix
    }
  } else if (digits.startsWith("9")) {
    // If it starts with 9, remove it
    digits = digits.slice(1);
  } else if (digits.startsWith("0")) {
    // Remove leading 0
    digits = digits.slice(1);
  }

  // Remove any remaining non-digit characters
  digits = digits.replace(/\D/g, "");

  // Limit to 9 digits (standard Chilean mobile number length)
  if (digits.length > 9) {
    digits = digits.slice(0, 9);
  }

  // Format as +569 XXXX XXXXX
  if (digits.length === 0) {
    return "";
  }

  // Build the formatted string
  let formatted = "+569";

  if (digits.length > 0) {
    const firstPart = digits.slice(0, 4);
    const secondPart = digits.slice(4, 9);

    if (secondPart.length > 0) {
      formatted = `+569 ${firstPart} ${secondPart}`;
    } else if (firstPart.length > 0) {
      formatted = `+569 ${firstPart}`;
    }
  }

  return formatted;
}

/**
 * Validates if a phone number is complete (has all required digits)
 * @param phone - The phone number to validate
 * @returns true if the phone number is complete (has 9 digits after +569)
 */
export function isCompletePhoneNumber(phone: string): boolean {
  if (!phone) return false;

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");

  // Check if it has the Chilean mobile format: 569 + 9 digits = 12 digits total
  // Or just 9 digits (without country code)
  if (digits.startsWith("569")) {
    return digits.length === 12; // 569 + 9 digits
  } else if (digits.startsWith("56") && digits.length > 2 && digits[2] === "9") {
    return digits.length === 12; // 569 + 9 digits
  } else if (digits.startsWith("9")) {
    return digits.length === 10; // 9 + 9 digits
  } else {
    // Just digits, should be 9 digits for Chilean mobile
    return digits.length === 9;
  }
}

/**
 * Normalizes a phone number by removing formatting and keeping only digits with +569 prefix
 * @param phone - The phone number to normalize
 * @returns Normalized phone number in format +569XXXXXXXXX (no spaces)
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return "";

  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, "");

  let digits = cleaned.startsWith("+") ? cleaned.slice(1) : cleaned;

  // Ensure it starts with 569
  if (digits.startsWith("569")) {
    digits = digits.slice(3);
  } else if (digits.startsWith("56") && digits.length > 2 && digits[2] === "9") {
    digits = digits.slice(3);
  } else if (digits.startsWith("9")) {
    digits = digits.slice(1);
  } else if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  // Remove any remaining non-digit characters
  digits = digits.replace(/\D/g, "");

  // Limit to 9 digits
  if (digits.length > 9) {
    digits = digits.slice(0, 9);
  }

  // Return in format +569XXXXXXXXX
  return digits.length === 9 ? `+569${digits}` : "";
}

/**
 * Handles phone number input changes, formatting as the user types
 * @param value - The current input value
 * @param previousValue - The previous value to determine if user is deleting
 * @returns Formatted phone number
 */
export function handlePhoneInputChange(
  value: string,
  previousValue: string = "",
): string {
  // If user is deleting, allow deletion
  if (value.length < previousValue.length) {
    return formatChileanPhone(value);
  }

  return formatChileanPhone(value);
}

