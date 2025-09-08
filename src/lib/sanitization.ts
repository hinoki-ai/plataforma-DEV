import DOMPurify from 'isomorphic-dompurify';

/**
 * Input sanitization utilities for security
 */

export interface SanitizationOptions {
  allowHtml?: boolean;
  maxLength?: number;
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
}

/**
 * Sanitize text input by removing potentially dangerous characters
 */
export function sanitizeText(input: string, options: SanitizationOptions = {}): string {
  if (typeof input !== 'string') return '';

  let sanitized = input.trim();

  // Remove null bytes and other control characters
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Apply length limit
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }

  return sanitized;
}

/**
 * Sanitize HTML input using DOMPurify
 */
export function sanitizeHtml(input: string, options: SanitizationOptions = {}): string {
  if (typeof input !== 'string') return '';

  const defaultOptions = {
    ALLOWED_TAGS: options.allowedTags || ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: options.allowedAttributes ? Object.keys(options.allowedAttributes) : [],
    ALLOW_DATA_ATTR: false,
  };

  return DOMPurify.sanitize(input, defaultOptions);
}

/**
 * Sanitize input based on type
 */
export function sanitizeInput(input: string, type: 'text' | 'html' | 'email' | 'url' | 'filename', options: SanitizationOptions = {}): string {
  if (typeof input !== 'string') return '';

  switch (type) {
    case 'email':
      // Basic email sanitization - remove dangerous chars
      return sanitizeText(input.replace(/[<>'"&\\]/g, ''), options);

    case 'url':
      // Basic URL sanitization
      return sanitizeText(input.replace(/[<>'"&\\]/g, ''), options);

    case 'filename':
      // Remove path traversal and dangerous characters
      return sanitizeText(input.replace(/[<>:"|?*\x00-\x1f]/g, '').replace(/\.\./g, ''), options);

    case 'html':
      return options.allowHtml ? sanitizeHtml(input, options) : sanitizeText(input, options);

    case 'text':
    default:
      return sanitizeText(input, options);
  }
}

/**
 * Validate and sanitize form data
 */
export function sanitizeFormData(formData: FormData, schema: Record<string, { type: 'text' | 'html' | 'email' | 'url' | 'filename'; options?: SanitizationOptions }>): Record<string, string> {
  const sanitized: Record<string, string> = {};

  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string' && schema[key]) {
      const { type, options } = schema[key];
      sanitized[key] = sanitizeInput(value, type, options);
    }
  }

  return sanitized;
}

/**
 * Sanitize JSON input
 */
export function sanitizeJsonInput(input: any): any {
  if (typeof input === 'string') {
    return sanitizeText(input);
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeJsonInput);
  }

  if (typeof input === 'object' && input !== null) {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(input)) {
      // Skip sensitive fields that shouldn't be sanitized
      if (['password', 'token', 'secret'].includes(key.toLowerCase())) {
        sanitized[key] = value;
      } else {
        sanitized[key] = sanitizeJsonInput(value);
      }
    }
    return sanitized;
  }

  return input;
}

/**
 * Common sanitization schemas for different use cases
 */
export const SANITIZATION_SCHEMAS = {
  USER_PROFILE: {
    name: { type: 'text' as const, options: { maxLength: 100 } },
    email: { type: 'email' as const },
    phone: { type: 'text' as const, options: { maxLength: 20 } },
    address: { type: 'text' as const, options: { maxLength: 200 } },
  },

  MEETING: {
    title: { type: 'text' as const, options: { maxLength: 200 } },
    description: { type: 'html' as const, options: { maxLength: 1000 } },
    studentName: { type: 'text' as const, options: { maxLength: 100 } },
    guardianName: { type: 'text' as const, options: { maxLength: 100 } },
    location: { type: 'text' as const, options: { maxLength: 200 } },
  },

  PLANNING_DOCUMENT: {
    title: { type: 'text' as const, options: { maxLength: 200 } },
    content: { type: 'html' as const, options: { maxLength: 10000 } },
    subject: { type: 'text' as const, options: { maxLength: 100 } },
    grade: { type: 'text' as const, options: { maxLength: 50 } },
  },

  FILE_UPLOAD: {
    filename: { type: 'filename' as const, options: { maxLength: 255 } },
  },
} as const;