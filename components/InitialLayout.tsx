import { useAuth } from "@clerk/clerk-expo";
import { Slot, Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { Alert, Button, Text, TouchableOpacity, View } from "react-native";
import * as SecureStore from "expo-secure-store";
import { DevSettings } from "react-native";
import * as Updates from "expo-updates";
import { tokenCache } from "@clerk/clerk-expo/dist/token-cache";

export default function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  if (!segments) {
    return null;
  }

  useEffect(() => {
    if (!isLoaded || !segments) return;

    const inAuthScreen = segments[0] === "(auth)";

    if (!isSignedIn && !inAuthScreen) router.replace("/(auth)/login");
    else if (isSignedIn && inAuthScreen) router.replace("/(tabs)");
  }, [isLoaded, isSignedIn, segments]);

  // if (!isLoaded)
  //   return (
  //     <View
  //       style={{
  //         flex: 1,
  //         backgroundColor: "#000",
  //         justifyContent: "center",
  //         alignItems: "center",
  //       }}
  //     >
  //       <TouchableOpacity
  //         onPress={async () => {
  //           console.log("Auth Loaded:", isLoaded);
  //           console.log("Signed In:", isSignedIn);

  //           const tokenBefore = await SecureStore.getItemAsync(
  //             "__clerk_token_cache"
  //           );
  //           console.log("Token before delete:", tokenBefore);

  //           await SecureStore.deleteItemAsync("__clerk_token_cache");

  //           const tokenAfter = await SecureStore.getItemAsync(
  //             "__clerk_token_cache"
  //           );
  //           console.log("Token after delete:", tokenAfter);

  //           // Optional: Force reload app after clearing token
  //           // if (__DEV__) {
  //           //   DevSettings.reload();
  //           // } else {
  //           //   await Updates.reloadAsync();
  //           // }
  //           Alert.alert("fuck you");
  //           router.replace("/");
  //           setTimeout(async () => {
  //             await Updates.reloadAsync();
  //           }, 500);
  //         }}
  //       >
  //         <Text style={{ color: "#1E90FF" }}>Purge Clerk Token</Text>
  //       </TouchableOpacity>
  //     </View>
  // );

  return <Slot />;
}
