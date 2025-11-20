/**
 * Reset user password in Convex database
 */
import { ConvexHttpClient } from "convex/browser";
import bcryptjs from "bcryptjs";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function resetPassword() {
  const email = "agustin@astral.cl";
  const newPassword = "59163476a";

  try {
    // Get user
    const user = await client.query(api.users.getUserByEmail, { email });

    if (!user) {
      return;
    }

    // Hash the new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // Update user password
    await client.mutation(api.users.updateUser, {
      id: user._id,
      password: hashedPassword,
    });

    // Verify the password works
    const isValid = await bcryptjs.compare(newPassword, hashedPassword);
  } catch (error: any) {}
}

resetPassword();
