import { mutation } from "./_generated/server";
import { v } from "convex/values";

// createUser is a mutation that creates a user in the database
export const createUser = mutation({
  args: {
    username: v.string(),
    fullname: v.string(),
    email: v.string(),
    bio: v.optional(v.string()),
    image: v.string(), // since signing in with Google, we get the image from the user
    clerkId: v.string(), // clerkId is the id of the user in Clerk
  },
  handler: async (ctx, args) => {
    // check if the user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
    if (existingUser) return;

    await ctx.db.insert("users", {
      username: args.username,
      fullname: args.fullname,
      email: args.email,
      bio: args.bio,
      image: args.image,
      clerkId: args.clerkId,
      followers: 0,
      following: 0,
      posts: 0,
    });
  },
});
