import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Pressable,
  Modal,
} from "react-native";
import React, { useState } from "react";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Doc, Id } from "@/convex/_generated/dataModel";
import Loader from "@/components/Loader";
import { styles } from "@/styles/profile.styles";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { Image } from "expo-image";
import { useAuth } from "@clerk/clerk-expo";

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const { isLoaded: clerkLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  const profile = useQuery(api.users.getUserProfile, {
    userId: id as Id<"users">,
  });
  const [selectedPost, setSelectedPost] = useState<Doc<"posts"> | null>(null);
  const posts = useQuery(api.posts.getPostByUser, {
    userId: id as Id<"users">,
  });
  const isFollowing = useQuery(api.users.isFollowing, {
    followingId: id as Id<"users">,
  });
  const toggleFollow = useMutation(api.users.toggleFollow);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  if (profile === undefined || posts === undefined || isFollowing === undefined)
    return <Loader />;

  if (!isSignedIn) {
    router.replace("/");
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.username}>{profile.username}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileInfo}>
          {/* AVATAR STATS */}
          <View style={styles.avatarAndStats}>
            <View style={styles.avatarContainer}>
              <Image
                source={profile.image}
                style={styles.avatar}
                contentFit="cover"
                transition={200}
              />
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile.posts}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile.followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile.following}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
          </View>
          <Text style={styles.name}>{profile.fullname}</Text>
          {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

          {/* ACTION BUTTONS */}

          <Pressable
            style={[styles.followButton, isFollowing && styles.followingButton]}
            onPress={() => toggleFollow({ followingId: id as Id<"users"> })}
          >
            <Text
              style={[
                styles.followingButtonText,
                isFollowing && styles.followingButtonText,
              ]}
            >
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </Pressable>
        </View>

        {/* POSTS */}
        {posts.length === 0 && <NoPostsFound />}

        <FlatList
          data={posts}
          numColumns={3}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => setSelectedPost(item)}
            >
              <Image
                source={item.imageUrl}
                style={styles.gridImage}
                contentFit="cover"
                transition={200}
              />
            </TouchableOpacity>
          )}
        />
      </ScrollView>
      {/* SELECTED IMAGE MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={!!selectedPost}
        onRequestClose={() => setSelectedPost(null)}
      >
        <View style={styles.modalBackdrop}>
          {selectedPost && (
            <View style={styles.postDetailContainer}>
              <View style={styles.postDetailHeader}>
                <TouchableOpacity onPress={() => setSelectedPost(null)}>
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>

              <Image
                source={selectedPost.imageUrl}
                style={styles.postDetailImage}
                cachePolicy={"memory-disk"}
              />
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  alignItems: "baseline",
                  paddingTop: 8,
                }}
              >
                <Text
                  style={{ color: "white", fontSize: 16, fontWeight: "600" }}
                >
                  {profile.username}
                </Text>
                <Text style={{ color: "white", fontWeight: "400" }}>
                  {" "}
                  {selectedPost.caption}
                </Text>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

function NoPostsFound() {
  return (
    <View
      style={{
        height: "100%",
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Ionicons name="images-outline" size={48} color={COLORS.primary} />
      <Text
        style={{
          color: COLORS.grey,
          fontSize: 20,
          fontWeight: "600",
          marginTop: 8,
        }}
      >
        No posts yet
      </Text>
    </View>
  );
}
