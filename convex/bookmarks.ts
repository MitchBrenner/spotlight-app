import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { getAuthenticatedUser } from "./users";

export const toggleBookmark = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    // get the current user
    const currentUser = await getAuthenticatedUser(ctx);

    // check if the post is already bookmarked
    const bookmarked = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_and_post", (q) =>
        q.eq("userId", currentUser._id).eq("postId", args.postId)
      )
      .first();

    if (bookmarked) {
      await ctx.db.delete(bookmarked._id);
      return false;
    }

    // if not, create a bookmark
    await ctx.db.insert("bookmarks", {
      userId: currentUser._id,
      postId: args.postId,
    });

    return true;
  },
});

export const getBookmarks = query({
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", currentUser._id))
      .order("desc")
      .collect();

    const bookmarkedPosts = await Promise.all(
      bookmarks.map(async (bookmark) => {
        const post = await ctx.db.get(bookmark.postId);
        return post;
      })
    );
    return bookmarkedPosts;
  },
});
