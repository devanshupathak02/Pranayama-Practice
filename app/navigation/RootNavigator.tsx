import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen/HomeScreen';
import { RoutineDetailScreen } from '../screens/RoutineDetailScreen/RoutineDetailScreen';
import { ActiveSessionScreen } from '../screens/ActiveSessionScreen/ActiveSessionScreen';
import { HistoryScreen } from '../screens/HistoryScreen/HistoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen/SettingsScreen';
import { RoutineBuilderScreen } from '../screens/RoutineBuilderScreen/RoutineBuilderScreen';
import { theme } from '../constants/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

const HeaderTitle: React.FC = () => {
  return (
    <View style={styles.headerTitleContainer}>
      <Image
        source={require('../../assets/images/still-mountain-logo.png')}
        style={styles.headerLogo}
        resizeMode="contain"
      />
      <Text style={styles.headerTitleText}>Pranayama Timer</Text>
    </View>
  );
};

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTintColor: theme.textPrimary,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: theme.background,
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            headerTitle: () => <HeaderTitle />,
            headerTitleAlign: 'left',
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate('Settings')}
                style={styles.headerSettingsButton}
                activeOpacity={0.7}
                accessibilityLabel="Settings"
                accessibilityRole="button"
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="settings-outline" size={23} color={theme.textPrimary} />
              </TouchableOpacity>
            ),
          })}
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
        <Stack.Screen
          name="RoutineBuilder"
          component={RoutineBuilderScreen}
          options={({ route }) => ({
            title: route.params?.routineId ? 'Edit Routine' : 'Create Routine',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  headerSettingsButton: {
    padding: 6,
    marginRight: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

