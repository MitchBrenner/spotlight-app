import { View, Text, Touchable, TouchableOpacity } from "react-native";
import React from "react";
import { styles } from "@/styles/feed.styles";
import { Link } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";

// todo: add actual type

const Post = ({ post }: { post: any }) => {
  return (
    <View style={styles.post}>
      {/* Post header */}
      <View style={styles.postHeader}>
        <Link href={`/(tabs)/notifications`}>
          <TouchableOpacity style={styles.postHeaderLeft}>
            <Image
              source={post.author.image}
              style={styles.postAvatar}
              contentFit="cover"
              transition={200}
              cachePolicy={"memory-disk"}
            />
            <Text style={styles.postUsername}>{post.author.username}</Text>
          </TouchableOpacity>
        </Link>

        {/* show a delete button if owner */}
        {/* <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={24} color="white" />
        </TouchableOpacity> */}

        <TouchableOpacity>
          <Ionicons name="trash-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      {/* Image */}
      <Image
        source={post.imageUrl}
        style={styles.postImage}
        contentFit="cover"
        transition={200}
        cachePolicy={"memory-disk"}
      />

      {/* Post actions */}
      <View style={styles.postActions}>
        <View style={styles.postActionsLeft}>
          <TouchableOpacity>
            <Ionicons name="heart-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="chatbubble-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <Ionicons name="bookmark-outline" size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* Post info */}
      <View style={styles.postInfo}>
        <Text style={styles.likesText}>{post.likes} likes</Text>
        {post.caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.captionUsername}>{post.author.username}</Text>
            <Text style={styles.captionText}>{post.caption}</Text>
          </View>
        )}
        <TouchableOpacity>
          <Text style={styles.commentsText}>
            View all {post.comments} comments
          </Text>
        </TouchableOpacity>
        <Text style={styles.timeAgo}>2 hours ago</Text>
      </View>
    </View>
  );
};

export default Post;
