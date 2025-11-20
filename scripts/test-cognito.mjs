#!/usr/bin/env node

/**
 * Test script for Cognito AI Assistant
 *
 * Tests the expanded question types and RAG functionality.
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const CONVEX_URL =
  process.env.CONVEX_URL || "https://different-jackal-611.convex.cloud";

if (!CONVEX_URL) {
  console.error("❌ CONVEX_URL environment variable is required");
  process.exit(1);
}

const convex = new ConvexHttpClient(CONVEX_URL);

/**
 * Test questions for the AI assistant
 */
const testQuestions = [
  "What is the libro de clases?",
  "How do I create a new activity?",
  "Tell me about parent communication",
  "Can I see student grades?",
  "How do I schedule a meeting with parents?",
  "What features are available for teachers?",
  "Explain the protocolos de convivencia",
  "How do I add observations to student records?",
  "What is PME?",
  "Help me understand the calendar system",
];

async function testCognito() {
  console.log(
    "🧪 Testing Cognito AI Assistant with expanded question types...\n",
  );

  for (const question of testQuestions) {
    try {
      console.log(`❓ Question: "${question}"`);

      // Test the cognitoChat function (which uses RAG and expanded question types)
      const startTime = Date.now();
      const result = await convex.action(api.functions.ask.cognitoChat, {
        message: question,
        context: {
          role: "teacher",
          section: "general",
        },
      });
      const duration = Date.now() - startTime;

      const answerText = result.success
        ? result.response
        : result.error || "No response";
      console.log(
        `🤖 Answer: ${answerText.substring(0, 200)}${answerText.length > 200 ? "..." : ""}`,
      );
      console.log(`⏱️  Response time: ${duration}ms\n`);

      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Error testing question "${question}":`, error.message);
    }
  }

  console.log("✅ Testing complete!");
}

// Run the test
testCognito().catch(console.error);
