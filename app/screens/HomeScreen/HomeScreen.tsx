import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { HomeScreenNavigationProp } from '../../navigation/types';
import { useSessionStore } from '../../store/sessionStore';
import { useRoutineStore } from '../../store/routineStore';
import { Routine } from '../../models/Routine';
import { theme } from '../../constants/theme';

interface Props {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { initSettings, isSettingsLoaded } = useSessionStore();
  const { routines, loadRoutines } = useRoutineStore();

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

  const handleOpenSettings = () => {
    navigation.navigate('Settings');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Pranayama Timer</Text>
        <Text style={styles.headerSubtitle}>Select a breathing routine to practice</Text>

        {/* D10: Render routine cards dynamically from ROUTINES array */}
        <View style={styles.routineList}>
          {routines.map((routine: Routine) => {
            const mins = Math.floor(routine.totalDurationSeconds / 60);
            const secs = routine.totalDurationSeconds % 60;

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
                    {routine.source === 'custom' && (
                      <View style={styles.customBadge}>
                        <Text style={styles.customBadgeText}>Custom</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{mins}m {secs > 0 ? `${secs}s` : ''}</Text>
                  </View>
                </View>
                {!!routine.description && (
                  <Text style={styles.routineDescription}>{routine.description}</Text>
                )}
                <Text style={styles.phaseCountText}>
                  {routine.phases.length} Phases • Audio Guided
                </Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={styles.createCard}
            onPress={() => navigation.navigate('RoutineBuilder', {})}
            activeOpacity={0.8}
          >
            <Text style={styles.createCardText}>+ Create Custom Routine</Text>
          </TouchableOpacity>
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
        <TouchableOpacity style={styles.textButton} onPress={handleOpenHistory}>
          <Text style={styles.textButtonText}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.textButton} onPress={handleOpenSettings}>
          <Text style={styles.textButtonText}>Settings</Text>
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
  headerTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
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
  createCard: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.borderAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  createCardText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.accent,
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
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: theme.background,
  },
  textButton: {
    padding: 12,
  },
  textButtonText: {
    color: theme.textSecondary,
    fontSize: 14,
    fontWeight: '500',
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
