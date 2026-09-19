import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreenNavigationProp } from '../../navigation/types';
import { useSessionStore } from '../../store/sessionStore';
import { useRoutineStore } from '../../store/routineStore';
import { Routine } from '../../models/Routine';
import { isCustomRoutine } from '../../data/routines';
import { theme } from '../../constants/theme';
import { SegmentedControl, TabCategory } from '../../components/SegmentedControl';
import { AddToHomeScreenBanner } from '../../components/AddToHomeScreenBanner';

interface Props {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { initSettings, isSettingsLoaded } = useSessionStore();
  const { routines, loadRoutines, deleteRoutine } = useRoutineStore();
  const [selectedTab, setSelectedTab] = useState<TabCategory>('pranayama');

  useEffect(() => {
    if (!isSettingsLoaded) {
      initSettings();
    }
    loadRoutines();
  }, [isSettingsLoaded, initSettings, loadRoutines]);

  const handleSelectRoutine = (routineId: string) => {
    navigation.navigate('RoutineDetail', { routineId });
  };

  const handleOpenHistory = () => {
    navigation.navigate('History');
  };

  const handleCreateRoutine = () => {
    navigation.navigate('RoutineBuilder', {});
  };

  const handleDeleteCustomRoutine = (routine: Routine) => {
    const executeDelete = async () => {
      try {
        await deleteRoutine(routine.id);
      } catch (error) {
        console.error('Error deleting routine:', error);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined'
        ? window.confirm(`Are you sure you want to delete "${routine.name}"? This action cannot be undone.`)
        : true;
      if (confirmed) {
        executeDelete();
      }
      return;
    }

    Alert.alert(
      'Delete Routine',
      `Are you sure you want to delete "${routine.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: executeDelete,
        },
      ]
    );
  };

  const displayedRoutines = routines.filter((routine) => {
    if (selectedTab === 'pranayama') {
      return routine.category === 'pranayama' || !routine.category;
    }
    return routine.category === 'yoga-nidra';
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.brandHeaderContainer}>
          <Text style={styles.brandHeaderTitle}>STILL MOUNTAIN</Text>
          <Text style={styles.brandHeaderSubtitle}>Wellness Retreat</Text>
        </View>
        <Text style={styles.headerSubtitle}>Select a breathing routine to practice</Text>
        <AddToHomeScreenBanner />

        <SegmentedControl
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
        />

        {/* D10: Render routine cards dynamically from routines array */}
        <View style={styles.routineList}>
          {displayedRoutines.map((routine: Routine) => {
            const mins = Math.floor(routine.totalDurationSeconds / 60);
            const secs = routine.totalDurationSeconds % 60;
            const isCustom = isCustomRoutine(routine);

            return (
              <TouchableOpacity
                key={routine.id}
                style={styles.routineCard}
                onPress={() => handleSelectRoutine(routine.id)}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.routineNameRow}>
                    <Text style={styles.routineName}>{routine.name}</Text>
                    {isCustom && (
                      <View style={styles.customBadge}>
                        <Text style={styles.customBadgeText}>Custom</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.cardHeaderRight}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{mins}m {secs > 0 ? `${secs}s` : ''}</Text>
                    </View>
                    {isCustom && (
                      <TouchableOpacity
                        style={styles.cardDeleteButton}
                        onPress={(e) => {
                          e.stopPropagation?.();
                          handleDeleteCustomRoutine(routine);
                        }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityLabel={`Delete ${routine.name}`}
                        accessibilityRole="button"
                      >
                        <Ionicons name="trash-outline" size={16} color={theme.danger} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                {!!routine.description && (
                  <Text style={styles.routineDescription}>{routine.description}</Text>
                )}
                <Text style={styles.phaseCountText}>
                  {routine.phases.length} {routine.phases.length === 1 ? 'Phase' : 'Phases'} • Audio Guided
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.creditContainer}>
          <Text style={styles.creditText}>Powered by</Text>
          <Image
            source={require('../../../assets/images/still-mountain-lockup.png')}
            style={styles.creditImage}
            resizeMode="contain"
          />
        </View>
      </ScrollView>

      <View style={styles.footerRow}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={handleOpenHistory}
          activeOpacity={0.7}
          accessibilityLabel="Session History"
          accessibilityRole="button"
        >
          <Ionicons name="time-outline" size={20} color={theme.textSecondary} />
          <Text style={styles.navButtonText}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={handleCreateRoutine}
          activeOpacity={0.7}
          accessibilityLabel="Create Custom Routine"
          accessibilityRole="button"
        >
          <Ionicons name="add" size={24} color={theme.textSecondary} />
          <Text style={styles.navButtonText}>Create Routine</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  brandHeaderContainer: {
    marginBottom: 6,
  },
  brandHeaderTitle: {
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      web: "'Cinzel', 'Georgia', 'Times New Roman', serif",
    }),
    fontSize: 26,
    fontWeight: '700',
    color: theme.textPrimary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  brandHeaderSubtitle: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif',
      web: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }),
    fontSize: 15,
    fontWeight: '500',
    color: theme.textSecondary,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: theme.textMuted,
    marginBottom: 24,
  },
  routineList: {
    gap: 16,
  },
  routineCard: {
    backgroundColor: theme.surfaceTinted,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.borderAccent,
    shadowColor: 'rgba(120, 90, 40, 1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  routineNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    flexWrap: 'wrap',
  },
  routineName: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.accentOnTint,
  },
  customBadge: {
    backgroundColor: theme.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  customBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardDeleteButton: {
    padding: 6,
    backgroundColor: 'rgba(81, 26, 5, 0.08)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: 'rgba(216, 169, 59, 0.2)', // borderAccent with 20% opacity
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.borderAccent,
  },
  badgeText: {
    color: theme.accentOnTint,
    fontSize: 12,
    fontWeight: '600',
  },
  routineDescription: {
    fontSize: 14,
    color: theme.accentOnTint,
    lineHeight: 20,
    marginBottom: 16,
    opacity: 0.9,
  },
  phaseCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.accentOnTint,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: theme.background,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  navButtonText: {
    color: theme.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  creditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 8,
    opacity: 0.7,
  },
  creditText: {
    fontSize: 12,
    color: theme.textSecondary,
    marginRight: 6,
  },
  creditImage: {
    width: 60,
    height: 45,
  },
});
