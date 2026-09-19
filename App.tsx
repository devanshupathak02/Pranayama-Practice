import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './app/navigation/RootNavigator';
import { NotificationService } from './app/notifications/NotificationService';
import { AnimatedSplashScreen } from './app/components/AnimatedSplashScreen/AnimatedSplashScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Initialize notification handler and Android channel on app start (D15).
    // Does NOT request permission here — that happens at session start.
    NotificationService.init();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <RootNavigator />
      {showSplash && (
        <AnimatedSplashScreen onFinish={() => setShowSplash(false)} />
      )}
    </SafeAreaProvider>
  );
}
