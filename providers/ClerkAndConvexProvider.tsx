"use client";
/**
 * ClerkAndConvexProvider.tsx
 *
 * This provider sets up authentication and database connectivity for the app.
 * - Wraps children components with ClerkProvider for authentication (Clerk).
 * - Wraps children components with ConvexProviderWithClerk for database access (Convex).
 * - Requires environment variables: EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY and EXPO_PUBLIC_CONVEX_URL.
 * - Throws errors if required environment variables are missing.
 *
 * Used throughout the app to ensure authentication and database clients are initialized properly.
 */

import React from "react";
import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { tokenCache } from "@/cache";

const ClerkAndConvexProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error(
      "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env file. Please add it."
    );
  }

  const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error(
      "Missing EXPO_PUBLIC_CONVEX_URL in .env file. Please add it."
    );
  }

  const convex = new ConvexReactClient(convexUrl, {
    unsavedChangesWarning: false,
  });

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
};

export default ClerkAndConvexProvider;
