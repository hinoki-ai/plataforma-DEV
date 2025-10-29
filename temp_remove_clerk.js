import { ConvexHttpClient } from "convex/browser";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function removeClerkIds() {
  const users = await client.query("users:getUsers", {});
  const usersWithClerk = users.filter((u) => u.clerkId);

  console.log(`Found ${usersWithClerk.length} users with Clerk IDs to remove`);

  for (const user of usersWithClerk) {
    try {
      await client.mutation("users:updateUser", {
        id: user._id,
        clerkId: undefined,
      });
      console.log(`✅ Removed Clerk ID from ${user.email}`);
    } catch (error) {
      console.log(
        `❌ Failed to remove Clerk ID from ${user.email}:`,
        error.message,
      );
    }
  }
}

removeClerkIds().then(() => console.log("Done"));
