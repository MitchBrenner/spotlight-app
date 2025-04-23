import React from "react";
import { Tabs } from "expo-router";
import { SymbolView, SymbolViewProps, SFSymbol } from "expo-symbols";
import { COLORS } from "@/constants/theme";

export default function TabLayout() {
  console.log("TabLayout");
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.grey,
        tabBarStyle: {
          backgroundColor: "black",
          borderTopWidth: 0,
          position: "absolute",
          elevation: 0,
          height: 40,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ size, color }) => (
            <SymbolView name="house.fill" size={32} tintColor={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: "Bookmarks",
          tabBarIcon: ({ size, color }) => (
            <SymbolView name="bookmark.fill" tintColor={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          tabBarIcon: ({ size, color }) => (
            <SymbolView name="plus.app.fill" size={28} tintColor={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ size, color }) => (
            <SymbolView name="heart.fill" tintColor={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ size, color }) => (
            <SymbolView
              name="person.circle.fill"
              size={size}
              tintColor={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
