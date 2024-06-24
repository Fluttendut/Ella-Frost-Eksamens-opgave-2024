import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

export {
  ErrorBoundary
} from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)"
};


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font
  });


  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      <Stack.Screen name="modal-add-swap" options={{ presentation: "modal" }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
    </Stack>
  );
}

function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Calendar" }} />
      <Tabs.Screen name="admin" options={{ title: "Admin Screen" }} />
    </Tabs>
  );
}
