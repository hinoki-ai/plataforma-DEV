/**
 * scrape_and_chunk.js
 * Minimal Node script to scrape a list of URLs and chunk text.
 * Requires: node, npm install axios cheerio text-splitter (or implement your own)
 *
 * This is an example — adapt it to your site structure and robots rules.
 */
const axios = require("axios");
const cheerio = require("cheerio");

// Very naive text extractor
async function fetchText(url) {
  const res = await axios.get(url, { timeout: 15000 });
  const $ = cheerio.load(res.data);
  // remove nav/footer/scripts
  $("nav, footer, script, style, noscript, header").remove();
  const text = $("body").text().replace(/\s+/g, " ").trim();
  return text;
}

function chunkText(text, maxChars = 3000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += maxChars) {
    chunks.push(text.slice(i, i + maxChars));
  }
  return chunks;
}

async function main() {
  const urls = process.argv.slice(2);
  if (urls.length === 0) {
    console.error(
      "Usage: node scrape_and_chunk.js https://yourdomain.com/page1 https://yourdomain.com/page2 ...",
    );
    process.exit(1);
  }

  for (const url of urls) {
    console.log("Fetching", url);
    try {
      const text = await fetchText(url);
      const chunks = chunkText(text);
      console.log("Chunks for", url, "=>", chunks.length);
      // Output JSON to stdout for the loader script
      console.log(JSON.stringify({ url, title: "", chunks }));
    } catch (e) {
      console.error("Error fetching", url, e.message);
    }
  }
}

main();
