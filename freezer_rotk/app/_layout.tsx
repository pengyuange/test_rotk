import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FoodProvider } from "@/contexts/FoodContext";
import { requestNotificationPermissions } from "@/utils/notifications";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "返回" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen 
        name="add-food" 
        options={{ 
          presentation: "modal",
          title: "添加食品",
          headerStyle: { backgroundColor: '#F8F9FA' },
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    const setup = async () => {
      await requestNotificationPermissions();
      await SplashScreen.hideAsync();
    };
    setup();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <FoodProvider>
          <RootLayoutNav />
        </FoodProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
