import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { httpRouter } from "convex/server";
import { Webhook } from "svix";

const http = httpRouter();

// This is the webhook endpoint that Clerk will call when a user is created
// 1 - we need to make sure that the webhook is coming from Clerk
// 2 - if so, we will listen for the user.created event
// 3 - we will save the user in our database

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error(
        "Missing EXPO_PUBLIC_CLERK_WEBHOOK_SECRET. Please add it to your CONVEX environment variables."
      );
    }

    // check headers
    const svix_id = request.headers.get("svix-id");
    const svix_signature = request.headers.get("svix-signature");
    const svix_timestamp = request.headers.get("svix-timestamp");

    if (!svix_id || !svix_signature || !svix_timestamp) {
      return new Response("Error occurred -- no svix headers", { status: 400 });
    }

    const payload = await request.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(webhookSecret);
    let event: any;

    // verify the webhook
    try {
      event = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as any;
    } catch (error) {
      console.error("Error verifying webhook", error);
      return new Response("Error occurred -- invalid signature", {
        status: 400,
      });
    }

    // save the user to the database

    const eventType = event.type;

    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name, image_url } =
        event.data;

      const email = email_addresses[0].email_address;
      const username = email.split("@")[0];
      const fullname = `${first_name || ""} ${last_name || ""}`;

      try {
        await ctx.runMutation(api.users.createUser, {
          username,
          fullname,
          email,
          image: image_url,
          clerkId: id,
        });
      } catch (error) {
        console.error("Error creating user", error);
        return new Response("Error occurred -- creating user", {
          status: 500,
        });
      }
    }
    return new Response("Webhook processed successfully", { status: 200 });
  }),
});

export default http;
