import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { HomeScreenNavigationProp } from '../../navigation/types';
import { ROUTINES } from '../../data/routines';
import { useSessionStore } from '../../store/sessionStore';
import { Routine } from '../../models/Routine';

interface Props {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { initSettings, isSettingsLoaded } = useSessionStore();

  useEffect(() => {
    if (!isSettingsLoaded) {
      initSettings();
    }
  }, [isSettingsLoaded, initSettings]);

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
        <Text style={styles.headerTitle}>Pranayama</Text>
        <Text style={styles.headerSubtitle}>Select a breathing routine to practice</Text>

        {/* D10: Render routine cards dynamically from ROUTINES array */}
        <View style={styles.routineList}>
          {ROUTINES.map((routine: Routine) => {
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
                  <Text style={styles.routineName}>{routine.name}</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{mins}m {secs > 0 ? `${secs}s` : ''}</Text>
                  </View>
                </View>
                <Text style={styles.routineDescription}>{routine.description}</Text>
                <Text style={styles.phaseCountText}>
                  {routine.phases.length} Phases • Audio Guided
                </Text>
              </TouchableOpacity>
            );
          })}
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
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 24,
  },
  routineList: {
    gap: 16,
  },
  routineCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  routineName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  badge: {
    backgroundColor: 'rgba(14, 165, 233, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  badgeText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '600',
  },
  routineDescription: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
    marginBottom: 16,
  },
  phaseCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#38BDF8',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    backgroundColor: '#0F172A',
  },
  textButton: {
    padding: 12,
  },
  textButtonText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
});
