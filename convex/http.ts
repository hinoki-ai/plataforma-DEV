import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/backend";

const http = httpRouter();

http.route({
  path: "/clerk/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request);

    if (!event) {
      return new Response("Invalid webhook signature", { status: 400 });
    }

    try {
      switch (event.type) {
        case "user.created":
        case "user.updated":
          // Ensure default institution is initialized before syncing user
          await ctx.runMutation(
            internal.users.initializeDefaultInstitution,
            {},
          );

          await ctx.runMutation(internal.users.syncFromClerk, {
            data: event.data as unknown,
          });

          break;
        case "user.deleted":
          await ctx.runMutation(internal.users.disableUserFromClerk, {
            clerkId: (event.data as any).id,
          });

          break;
        default:
          console.log(`ℹ️ Unhandled webhook event type: ${event.type}`);
      }

      return new Response(null, { status: 200 });
    } catch (error) {
      console.error("❌ Webhook processing failed:", {
        eventType: event.type,
        eventId: event.data?.id,
        error: error instanceof Error ? error.message : String(error),
      });

      // Return 500 to indicate failure - Clerk will retry
      return new Response("Internal server error", { status: 500 });
    }
  }),
});

async function validateRequest(req: Request): Promise<WebhookEvent | null> {
  const payload = await req.text();
  const secret = process.env.CLERK_WEBHOOK_SECRET;

  if (!secret) {
    return null;
  }

  try {
    const webhook = new Webhook(secret);
    return webhook.verify(payload, {
      "svix-id": req.headers.get("svix-id") ?? "",
      "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
      "svix-signature": req.headers.get("svix-signature") ?? "",
    }) as unknown as WebhookEvent;
  } catch (error) {
    return null;
  }
}

export default http;
