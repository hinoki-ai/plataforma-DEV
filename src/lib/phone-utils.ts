/**
 * Utility functions for formatting and validating Chilean phone numbers
 * Format: +569 XXXX XXXX (country code + mobile prefix, 4 digits, 4 digits = 8 digits total)
 */

/**
 * Formats a phone number to the standard Chilean mobile format: +569 XXXX XXXX
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

  // Limit to 8 digits (standard Chilean mobile number length after +569)
  if (digits.length > 8) {
    digits = digits.slice(0, 8);
  }

  // Format as +569 XXXX XXXX
  if (digits.length === 0) {
    return "";
  }

  // Build the formatted string
  let formatted = "+569";

  if (digits.length > 0) {
    const firstPart = digits.slice(0, 4);
    const secondPart = digits.slice(4, 8);

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
 * @returns true if the phone number is complete (has exactly 8 digits after +569)
 */
export function isCompletePhoneNumber(phone: string): boolean {
  if (!phone) return false;

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");

  // Check if it has the Chilean mobile format: 569 + 8 digits = 11 digits total
  // Or just 8 digits (without country code)
  if (digits.startsWith("569")) {
    return digits.length === 11; // 569 + 8 digits = 11 total
  } else if (
    digits.startsWith("56") &&
    digits.length > 2 &&
    digits[2] === "9"
  ) {
    return digits.length === 11; // 569 + 8 digits = 11 total
  } else if (digits.startsWith("9")) {
    return digits.length === 9; // 9 + 8 digits = 9 total
  } else {
    // Just digits, should be exactly 8 digits for Chilean mobile
    return digits.length === 8;
  }
}

/**
 * Normalizes a phone number by removing formatting and keeping only digits with +569 prefix
 * @param phone - The phone number to normalize
 * @returns Normalized phone number in format +569XXXXXXXX (8 digits, no spaces)
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return "";

  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, "");

  let digits = cleaned.startsWith("+") ? cleaned.slice(1) : cleaned;

  // Ensure it starts with 569
  if (digits.startsWith("569")) {
    digits = digits.slice(3);
  } else if (
    digits.startsWith("56") &&
    digits.length > 2 &&
    digits[2] === "9"
  ) {
    digits = digits.slice(3);
  } else if (digits.startsWith("9")) {
    digits = digits.slice(1);
  } else if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  // Remove any remaining non-digit characters
  digits = digits.replace(/\D/g, "");

  // Limit to exactly 8 digits for Chilean mobile
  if (digits.length > 8) {
    digits = digits.slice(0, 8);
  }

  // Return in format +569XXXXXXXX (only if exactly 8 digits)
  return digits.length === 8 ? `+569${digits}` : "";
}

/**
 * Handles phone number input changes, formatting as the user types
 * Prevents entering more than 8 digits after +569
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

  // Extract digits to check length
  const digitsOnly = value.replace(/\D/g, "");

  // Check if it starts with 569
  let actualDigits = digitsOnly;
  if (digitsOnly.startsWith("569")) {
    actualDigits = digitsOnly.slice(3);
  } else if (
    digitsOnly.startsWith("56") &&
    digitsOnly.length > 2 &&
    digitsOnly[2] === "9"
  ) {
    actualDigits = digitsOnly.slice(3);
  } else if (digitsOnly.startsWith("9")) {
    actualDigits = digitsOnly.slice(1);
  }

  // Prevent entering more than 8 digits after the prefix
  // If user is typing (not pasting) and exceeds 8 digits, prevent it
  if (actualDigits.length > 8) {
    // Check if this looks like typing (small increase) vs pasting (large increase)
    const prevDigitsOnly = previousValue.replace(/\D/g, "");
    let prevActualDigits = prevDigitsOnly;
    if (prevDigitsOnly.startsWith("569")) {
      prevActualDigits = prevDigitsOnly.slice(3);
    } else if (
      prevDigitsOnly.startsWith("56") &&
      prevDigitsOnly.length > 2 &&
      prevDigitsOnly[2] === "9"
    ) {
      prevActualDigits = prevDigitsOnly.slice(3);
    } else if (prevDigitsOnly.startsWith("9")) {
      prevActualDigits = prevDigitsOnly.slice(1);
    }

    // If it's a small increase (typing), prevent it. If large (pasting), allow formatting to limit it
    if (actualDigits.length - prevActualDigits.length <= 1) {
      // User is typing, prevent the 9th digit
      return previousValue;
    }
    // User is pasting, let formatChileanPhone handle the limiting
  }

  return formatChileanPhone(value);
}
