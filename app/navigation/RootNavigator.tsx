import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen/HomeScreen';
import { RoutineDetailScreen } from '../screens/RoutineDetailScreen/RoutineDetailScreen';
import { ActiveSessionScreen } from '../screens/ActiveSessionScreen/ActiveSessionScreen';
import { HistoryScreen } from '../screens/HistoryScreen/HistoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0F172A',
          },
          headerTintColor: '#F8FAFC',
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: '#0F172A',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Pranayama' }}
        />
        <Stack.Screen
          name="RoutineDetail"
          component={RoutineDetailScreen}
          options={{ title: 'Routine Details' }}
        />
        <Stack.Screen
          name="ActiveSession"
          component={ActiveSessionScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{ title: 'Session History' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
