/**
 * Check user credentials in Convex database
 */
import { ConvexHttpClient } from "convex/browser";
import bcryptjs from "bcryptjs";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function checkUser() {
  const emailArg = process.argv[2];
  const passwordArg = process.argv[3];

  const email = emailArg || "agustin@astral.cl";
  const passwordToTest = passwordArg || "59163476a";

  try {
    // @ts-ignore
    const user = await client.query("users:getUserByEmail", { email });

    if (!user) {
      return;
    }

    if (!user.isActive) {
      return;
    }

    if (!user.password) {
      return;
    }

    // Test password
    const isValid = await bcryptjs.compare(passwordToTest, user.password);

    if (!isValid) {
    } else {
    }
  } catch (error: any) {}
}

checkUser();
