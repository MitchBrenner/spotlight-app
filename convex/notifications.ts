import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./users";

export const getNotifications = query({
  handler: async (ctx) => {
    // get current user
    const currentUser = await getAuthenticatedUser(ctx);

    // get notifications for current user
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_receiver", (q) => q.eq("receiverId", currentUser._id))
      .order("desc")
      .collect();

    // get notifications with sender and post info
    const notificationsWithInfo = await Promise.all(
      notifications.map(async (notifications) => {
        const sender = (await ctx.db.get(notifications.senderId))!;
        const post = notifications.postId
          ? await ctx.db.get(notifications.postId)
          : null;
        const comment =
          notifications.type === "comment" && notifications.commentId
            ? await ctx.db.get(notifications.commentId)
            : null;

        return {
          ...notifications,
          sender: {
            _id: sender._id,
            username: sender?.username,
            image: sender?.image,
          },
          post,
          comment: comment?.content,
        };
      })
    );

    return notificationsWithInfo;
  },
});
