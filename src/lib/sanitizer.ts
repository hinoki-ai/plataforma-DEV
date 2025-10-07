import DOMPurify from "isomorphic-dompurify";

/**
 * Basic HTML sanitization utility
 * Removes dangerous HTML while preserving safe content
 */

export class Sanitizer {
  /**
   * Sanitize HTML content for safe rendering
   */
  static sanitizeHtml(html: string): string {
    if (!html) return "";

    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        "p",
        "br",
        "strong",
        "em",
        "u",
        "ul",
        "ol",
        "li",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "blockquote",
        "a",
      ],
      ALLOWED_ATTR: ["href", "target", "rel"],
      ALLOW_DATA_ATTR: false,
      FORBID_TAGS: [
        "script",
        "iframe",
        "object",
        "embed",
        "form",
        "input",
        "textarea",
      ],
      FORBID_ATTR: ["style", "onerror", "onclick", "onload", "onmouseover"],
    });
  }

  /**
   * Sanitize text content (plain text only)
   */
  static sanitizeText(text: string): string {
    if (!text) return "";

    // Remove HTML tags completely
    return text.replace(/<[^>]*>/g, "").trim();
  }

  /**
   * Validate and sanitize file names
   */
  static sanitizeFilename(filename: string): string {
    if (!filename) return "";

    return filename
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .replace(/_{2,}/g, "_")
      .substring(0, 255);
  }
}

export default Sanitizer;
