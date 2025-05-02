import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { getAuthenticatedUser } from "./users";

export const addComment = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // get the current user
    const currentUser = await getAuthenticatedUser(ctx);

    // get the post so we can update the number of comments
    const post = await ctx.db.get(args.postId);
    if (!post) throw new ConvexError("Post not found");

    // create the comment
    const commentId = await ctx.db.insert("comments", {
      postId: args.postId,
      userId: currentUser._id,
      content: args.content,
    });

    // update the number of comments in the post
    await ctx.db.patch(args.postId, {
      comments: post.comments + 1,
    });

    if (post.userId !== currentUser._id) {
      // create a notification for the post owner
      await ctx.db.insert("notifications", {
        receiverId: post.userId,
        senderId: currentUser._id,
        type: "comment",
        postId: args.postId,
        commentId: commentId,
      });
    }

    return commentId;
  },
});

export const getComments = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    const commentsWithInfo = await Promise.all(
      comments.map(async (comment) => {
        // get the user who made the comment
        const user = await ctx.db.get(comment.userId);
        return {
          ...comment,
          user: {
            fullname: user!.fullname,
            image: user!.image,
          },
        };
      })
    );

    return commentsWithInfo;
  },
});
