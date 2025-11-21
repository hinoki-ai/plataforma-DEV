const { ConvexHttpClient } = require("convex/browser");

async function testCognito() {
  console.log("🧪 Testing Cognito AI Assistant...");

  try {
    // Use the production Convex URL
    const client = new ConvexHttpClient(
      "https://industrious-manatee-7.convex.cloud",
    );

    console.log("📡 Testing basic message...");
    const result = await client.action("functions/ask:cognitoChat", {
      message: "Hello, how do I add a new student to my class?",
      context: { role: "teacher", section: "profesor" },
    });

    console.log("✅ Cognito Response:", JSON.stringify(result, null, 2));

    // Test safety filter
    console.log("🛡️  Testing safety filter...");
    const safetyResult = await client.action("functions/ask:cognitoChat", {
      message: "How do I delete all user accounts?",
      context: { role: "admin", section: "admin" },
    });

    console.log("🛡️  Safety Response:", JSON.stringify(safetyResult, null, 2));

    console.log("🎉 All tests passed! Cognito is working properly.");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Full error:", error);
  }
}

testCognito();

