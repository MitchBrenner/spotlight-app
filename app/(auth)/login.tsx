import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/auth.styles";
import { useSSO } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Ionicons } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import * as Updates from "expo-updates";
import { useClerk } from "@clerk/clerk-expo";

export default function login() {
  const [signingIn, setSigningIn] = useState(false);

  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const { signOut } = useClerk();

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    console.log("Google sign in pressed");
    try {
      // Start the authentication process by calling `startSSOFlow()`
      console.log("Starting SSO flow");
      const { createdSessionId, setActive, signIn, signUp } =
        await startSSOFlow({
          strategy: "oauth_google",
          // For web, defaults to current path
          // For native, you must pass a scheme, like AuthSession.makeRedirectUri({ scheme, path })
          // For more info, see https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionmakeredirecturioptions
          redirectUrl: AuthSession.makeRedirectUri(),
        });

      // if (
      //   authSessionResult?.type === "cancel" ||
      //   authSessionResult?.type === "dismiss"
      // ) {
      //   console.log("User cancelled SSO");
      //   return;
      // }

      console.log("SSO flow completed");
      console.log("Created session ID:", createdSessionId);
      console.log("Set active session:", setActive);

      // If sign in was successful, set the active session
      if (createdSessionId) {
        setActive!({ session: createdSessionId });
        router.replace("/(tabs)");
      } else {
        console.log("No session created");

        // If there is no `createdSessionId`,
        // there are missing requirements, such as MFA
        // Use the `signIn` or `signUp` returned from `startSSOFlow`
        // to handle next steps
      }
    } catch (err: any) {
      const errorCode = err?.errors?.[0]?.code;
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* BRAND Section */}
      <View style={styles.brandSection}>
        <View style={styles.logoContainer}>
          <SymbolView
            name="leaf.fill"
            size={32}
            tintColor={COLORS.primary}
            animationSpec={{
              effect: {
                type: "bounce",
              },
              speed: 0.5,
            }}
          />
        </View>
        <Text style={styles.appName}>spotlight</Text>
        <Text style={styles.tagline}>don't miss anything</Text>
      </View>
      {/* ILLUSTRATION Section */}
      <View style={styles.illustrationContainer}>
        <Image
          source={require("@/assets/images/auth-bg.png")}
          style={styles.illustration}
          resizeMode="cover"
        />
      </View>
      {/* LOGIN Section */}
      <View style={styles.loginSection}>
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
          activeOpacity={0.9}
          disabled={signingIn}
        >
          <View style={styles.googleIconContainer}>
            <Ionicons name="logo-google" size={20} color={COLORS.surface} />
          </View>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>
        <Text style={styles.termsText}>
          By continuing, you agree to our terms and Privacy Policy
        </Text>
      </View>
    </View>
  );
}
