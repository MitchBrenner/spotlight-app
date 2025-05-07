import {
  View,
  Text,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
} from "react-native";
import React, { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { query } from "@/convex/_generated/server";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { styles } from "@/styles/feed.styles";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import Loader from "./Loader";
import Comment from "./Comment";

type CommentModalProps = {
  postId: Id<"posts">;
  visible: boolean;
  onClose: () => void;
};

export default function CommentModal({
  postId,
  visible,
  onClose,
}: CommentModalProps) {
  const [newCommnent, setNewComment] = useState<string>("");

  const comments = useQuery(api.comments.getComments, {
    postId,
  });

  const addComment = useMutation(api.comments.addComment);

  const handleAddComment = async () => {
    if (!newCommnent.trim()) return;

    try {
      await addComment({
        postId,
        content: newCommnent,
      });

      setNewComment("");
    } catch (error) {
      console.log("Error adding comment:", error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Comments</Text>
          <View style={{ width: 24 }} />
        </View>

        {comments === undefined ? (
          <Loader />
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <Comment comment={item} />}
            contentContainerStyle={styles.commentsList}
          />
        )}

        <View style={styles.commentInput}>
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            placeholderTextColor={COLORS.grey}
            value={newCommnent}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity
            onPress={handleAddComment}
            // style={styles.sendButton}
            disabled={!newCommnent.trim()}
          >
            <Text
              style={[
                styles.postButton,
                !newCommnent.trim() && styles.postButtonDisabled,
              ]}
            >
              Post
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
