#!/usr/bin/env node

/**
 * Website Content Ingestion Script for Cognito AI Assistant
 *
 * This script crawls the Plataforma Astral website and ingests content
 * into the Convex pages table for RAG (Retrieval-Augmented Generation).
 *
 * Usage: node scripts/ingest-website-content.mjs
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const CONVEX_URL = process.env.CONVEX_URL;
const CONTENT_DIR = path.join(__dirname, "../src/app/(main)");
const CHUNK_SIZE = 1000; // Characters per chunk
const OVERLAP = 200; // Characters of overlap between chunks

if (!CONVEX_URL) {
  console.error("❌ CONVEX_URL environment variable is required");
  process.exit(1);
}

const convex = new ConvexHttpClient(CONVEX_URL);

/**
 * Extract text content from a page file
 */
function extractContentFromFile(filePath, route) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");

    // Remove imports, JSX tags, and code
    let text = content
      .replace(/import.*from.*;/g, "")
      .replace(/export.*;/g, "")
      .replace(/<[^>]*>/g, "") // Remove JSX/HTML tags
      .replace(/{[^}]*}/g, "") // Remove JSX expressions
      .replace(/\/\/.*$/gm, "") // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();

    // Extract meaningful text content
    // Look for Spanish text patterns and user-facing content
    const spanishContent = content.match(
      /["']([^"']*[a-záéíóúñü]{10,}[^"']*)["']/gi,
    );
    if (spanishContent) {
      text += " " + spanishContent.join(" ");
    }

    return text;
  } catch (error) {
    console.warn(`⚠️  Could not read ${filePath}:`, error.message);
    return "";
  }
}

/**
 * Chunk text into smaller pieces with overlap
 */
function chunkText(text, chunkSize = CHUNK_SIZE, overlap = OVERLAP) {
  if (!text || text.length <= chunkSize) {
    return [text];
  }

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = start + chunkSize;

    // Try to break at sentence boundaries
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf(".", end);
      const lastQuestion = text.lastIndexOf("?", end);
      const lastExclamation = text.lastIndexOf("!", end);

      const lastSentenceEnd = Math.max(
        lastPeriod,
        lastQuestion,
        lastExclamation,
      );
      if (lastSentenceEnd > start + chunkSize * 0.7) {
        end = lastSentenceEnd + 1;
      }
    }

    chunks.push(text.slice(start, end));
    start = end - overlap;

    if (start >= text.length) break;
  }

  return chunks.filter((chunk) => chunk.trim().length > 50); // Filter out very small chunks
}

/**
 * Crawl directory recursively and collect page files
 */
function crawlDirectory(dir, baseRoute = "") {
  const pages = [];

  try {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip certain directories
        if (
          [
            "api",
            "components",
            "ui",
            "utils",
            "__tests__",
            "node_modules",
          ].includes(item)
        ) {
          continue;
        }

        const route = baseRoute + "/" + item;
        pages.push(...crawlDirectory(fullPath, route));
      } else if (item === "page.tsx" || item === "page.ts") {
        const route = baseRoute || "/";
        const title = extractTitleFromRoute(route);
        const content = extractContentFromFile(fullPath, route);

        if (content.trim()) {
          pages.push({
            url: route,
            title,
            content,
            filePath: fullPath,
          });
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️  Could not crawl ${dir}:`, error.message);
  }

  return pages;
}

/**
 * Extract human-readable title from route
 */
function extractTitleFromRoute(route) {
  const segments = route.split("/").filter((s) => s);
  const lastSegment = segments[segments.length - 1];

  // Convert kebab-case and camelCase to Title Case
  return lastSegment
    .replace(/-/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Main ingestion function
 */
async function ingestContent() {
  console.log("🚀 Starting website content ingestion for Cognito AI...");

  try {
    // Crawl the website structure
    console.log("📂 Crawling website structure...");
    const pages = crawlDirectory(CONTENT_DIR);
    console.log(`📄 Found ${pages.length} pages to process`);

    let totalChunks = 0;

    // Process each page
    for (const page of pages) {
      console.log(`📝 Processing: ${page.url}`);

      // Skip master/admin content
      if (page.url.includes("/master") || page.url.includes("/admin")) {
        console.log(`⏭️  Skipping admin/master content: ${page.url}`);
        continue;
      }

      // Chunk the content
      const chunks = chunkText(page.content);

      if (chunks.length === 0) {
        console.log(`⏭️  No meaningful content found in ${page.url}`);
        continue;
      }

      console.log(`📦 Created ${chunks.length} chunks for ${page.url}`);

      // Ingest chunks
      for (let i = 0; i < chunks.length; i++) {
        try {
          await convex.action(api.functions.loadPages.ingest, {
            url: page.url,
            title: page.title,
            text: chunks[i],
            chunkIdx: i,
          });

          totalChunks++;
        } catch (error) {
          console.error(
            `❌ Failed to ingest chunk ${i} of ${page.url}:`,
            error.message,
          );
        }
      }
    }

    console.log(
      `✅ Ingestion complete! Added ${totalChunks} content chunks to the knowledge base.`,
    );
    console.log(
      "🤖 Cognito can now answer questions about the platform using this content.",
    );
  } catch (error) {
    console.error("❌ Ingestion failed:", error);
    process.exit(1);
  }
}

// Run the ingestion
ingestContent();
