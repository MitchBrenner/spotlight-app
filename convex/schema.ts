import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    // _id: v.id(), by default convex creates an id for us
    // _creationTime: v.date(), by default convex creates a createdAt for us
    username: v.string(),
    fullname: v.string(),
    email: v.string(),
    bio: v.optional(v.string()),
    image: v.string(), // since signing in with Google, we get the image from the user
    followers: v.number(),
    following: v.number(),
    posts: v.number(),
    clerkId: v.string(), // clerkId is the id of the user in Clerk
  }).index("by_clerk_id", ["clerkId"]),

  posts: defineTable({
    userId: v.id("users"), // userId is the id of the user in Convex
    imageUrl: v.string(),
    storageId: v.id("_storage"),
    caption: v.optional(v.string()),
    likes: v.number(),
    comments: v.number(),
  }).index("by_user", ["userId"]),

  likes: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
  })
    .index("by_post", ["postId"])
    .index("by_user_and_post", ["userId", "postId"]),

  comments: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
    content: v.string(),
  }).index("by_post", ["postId"]),

  follows: defineTable({
    // mitch follows will
    followerId: v.id("users"), // mitch id
    followingId: v.id("users"), // will id
  })
    .index("by_follower", ["followerId"]) // this will show all the users that mitch follows if mitch is the followerId
    .index("by_following", ["followingId"]) // this will show all the users that follow mitch if mitch is the followingId
    .index("by_both", ["followerId", "followingId"]), // this will show if mitch follows will and will follows mitch

  notifications: defineTable({
    receiverId: v.id("users"),
    senderId: v.id("users"),
    type: v.union(v.literal("like"), v.literal("comment"), v.literal("follow")),
    postId: v.optional(v.id("posts")),
    commentId: v.optional(v.id("comments")),
  }).index("by_receiver", ["receiverId"]), // this will show all the notifications for a user

  bookmarks: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
  })
    .index("by_user", ["userId"]) // this will show all the bookmarks for a user
    .index("by_post", ["postId"]) // this will show all the bookmarks for a post
    .index("by_user_and_post", ["userId", "postId"]), // this will show if a user has bookmarked a post
});
