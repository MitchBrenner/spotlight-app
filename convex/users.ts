import { Id } from "./_generated/dataModel";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { ConvexError, v } from "convex/values";

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

export const getUserByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    return user;
  },
});

export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new ConvexError("User must be signed in");

  const currentUser = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity!.subject))
    .first();

  if (!currentUser) throw new Error("User not found");

  return currentUser;
}

export const updateProfile = mutation({
  args: {
    fullname: v.string(),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    // update the user
    await ctx.db.patch(currentUser._id, {
      fullname: args.fullname,
      bio: args.bio,
    });
  },
});

export const getUserProfile = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    return user;
  },
});

export const isFollowing = query({
  args: {
    followingId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    // check if the user is following the other user
    const follow = await ctx.db
      .query("follows")
      .withIndex("by_both", (q) =>
        q.eq("followerId", currentUser._id).eq("followingId", args.followingId)
      )
      .first();

    return !!follow;
  },
});

export const toggleFollow = mutation({
  args: {
    followingId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // get the current user
    const currentUser = await getAuthenticatedUser(ctx);

    // check if the user is following the other user
    const following = await ctx.db
      .query("follows")
      .withIndex("by_both", (q) =>
        q.eq("followerId", currentUser._id).eq("followingId", args.followingId)
      )
      .first();

    if (following) {
      // unfollow the user
      await ctx.db.delete(following._id);

      // decrement the number of followers for the user
      // decrement the number of following for the current user
      await updateFollowCounts(ctx, currentUser._id, args.followingId, false);
    } else {
      // follow the user

      await ctx.db.insert("follows", {
        followerId: currentUser._id,
        followingId: args.followingId,
      });

      // increment the number of followers for the user
      // increment the number of following for the current user
      await updateFollowCounts(ctx, currentUser._id, args.followingId, true);

      // create notification
      await ctx.db.insert("notifications", {
        receiverId: args.followingId,
        senderId: currentUser._id,
        type: "follow",
      });
    }
  },
});

async function updateFollowCounts(
  ctx: MutationCtx,
  followerId: Id<"users">,
  followingId: Id<"users">,
  isFollowing: boolean
) {
  const follower = await ctx.db.get(followerId);
  const following = await ctx.db.get(followingId);

  if (!follower || !following) throw new Error("User not found");

  await ctx.db.patch(follower._id, {
    following: isFollowing ? follower.following + 1 : follower.following - 1,
  });

  await ctx.db.patch(following._id, {
    followers: isFollowing ? following.followers + 1 : following.followers - 1,
  });
}
