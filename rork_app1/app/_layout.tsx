import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CountdownProvider } from "@/contexts/CountdownContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "返回" }}>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="add-event" 
        options={{ 
          title: "添加倒数日",
          presentation: "modal",
          headerStyle: {
            backgroundColor: '#F8F9FA',
          },
        }} 
      />
      <Stack.Screen 
        name="edit-event" 
        options={{ 
          title: "编辑倒数日",
          presentation: "modal",
          headerStyle: {
            backgroundColor: '#F8F9FA',
          },
        }} 
      />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <CountdownProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </CountdownProvider>
    </QueryClientProvider>
  );
}
