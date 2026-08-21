import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './app/navigation/RootNavigator';
import { NotificationService } from './app/notifications/NotificationService';

export default function App() {
  useEffect(() => {
    // Initialize notification handler and Android channel on app start (D15).
    // Does NOT request permission here — that happens at session start.
    NotificationService.init();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
