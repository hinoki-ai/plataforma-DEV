import { ConvexHttpClient } from "convex/browser";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function fixUsers() {
  // Get all users
  const users = await client.query("users:getUsers", {});

  console.log(`Found ${users.length} users`);

  for (const user of users) {
    if (user.clerkId) {
      console.log(`Removing Clerk ID from ${user.email} (${user.role})`);

      // We can't directly patch, but we can use the existing updateUser mutation
      // by setting clerkId to undefined through the API
      try {
        // This won't work because updateUser doesn't accept clerkId, but let's try
        await client.mutation("users:updateUser", {
          id: user._id,
          // clerkId: undefined doesn't work, so we need another approach
        });
      } catch (error) {
        console.log(`❌ Can't remove Clerk ID via API: ${error.message}`);
      }
    }
  }
}

fixUsers().catch(console.error);
