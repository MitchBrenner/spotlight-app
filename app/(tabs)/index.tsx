import Loader from "@/components/Loader";
import Post from "@/components/Post";
import Story from "@/components/Story";
import { STORIES } from "@/constants/mock-data";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { Redirect } from "expo-router";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../../styles/feed.styles";
import { useState } from "react";

export default function Index() {
  const { isLoaded, isSignedIn, signOut, userId } = useAuth();
  const posts = useQuery(api.posts.getFeedPosts);

  const [refreshing, setRefreshing] = useState(false);

  const currentUser = useQuery(
    api.users.getUserByClerkId,
    userId ? { clerkId: userId } : "skip"
  );

  if (!isLoaded) return <Loader />;
  if (!isSignedIn) return <Redirect href="/(auth)/login" />;

  if (posts === undefined) return <Loader />;
  if (posts.length === 0) return <NoPostsFound />;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      // tanstack qeury
    }, 2000);
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* Header section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>spotlight</Text>
        <TouchableOpacity
          onPress={() => {
            signOut();
          }}
        >
          <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        renderItem={({ item }) => <Post post={item} />}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        ListHeaderComponent={<StoriesSection />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      />
    </View>
  );
}

// Stories section
const StoriesSection = () => {
  const { userId } = useAuth();
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    userId ? { clerkId: userId } : "skip"
  );

  const yourStory = {
    id: "0",
    username: "You",
    avatar: currentUser?.image || "",
    hasStory: false,
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.storiesContainer}
    >
      <Story story={yourStory} />
      {/* Map through the stories */}

      {STORIES.map((story) => (
        <Story key={story!.id} story={story as Story} />
      ))}
    </ScrollView>
  );
};

const NoPostsFound = () => (
  <View
    style={{
      flex: 1,
      backgroundColor: COLORS.background,
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Text style={{ color: COLORS.primary, fontSize: 20 }}>No posts yet</Text>
  </View>
);
