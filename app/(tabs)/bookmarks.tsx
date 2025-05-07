import { View, Text, ScrollView } from "react-native";
import React from "react";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import Loader from "@/components/Loader";
import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/feed.styles";
import { Image } from "expo-image";

export default function Bookmarks() {
  const bookmarkedPosts = useQuery(api.bookmarks.getBookmarks, {});

  if (bookmarkedPosts === undefined) return <Loader />;

  if (bookmarkedPosts.length === 0) {
    return <NoBookmarksFound />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookmarks</Text>
      </View>

      {/* POSTS */}
      <ScrollView
        contentContainerStyle={{
          padding: 1,
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        {bookmarkedPosts.map((post) => {
          if (!post) return null;
          return (
            <View style={{ width: "33.333%", padding: 1 }} key={post._id}>
              <Image
                source={post.imageUrl}
                style={{
                  width: "100%",
                  aspectRatio: 1,
                }}
                contentFit="cover"
                transition={200}
                cachePolicy={"memory-disk"}
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function NoBookmarksFound() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background,
      }}
    >
      <Text
        style={{ color: COLORS.white, fontSize: 22, fontWeight: "semibold" }}
      >
        No bookmarked posts yet!
      </Text>
      <Text
        style={{
          color: COLORS.grey,
          fontSize: 16,
          fontWeight: "light",
          marginTop: 10,
        }}
      >
        Bookmark posts to view them here
      </Text>
    </View>
  );
}
