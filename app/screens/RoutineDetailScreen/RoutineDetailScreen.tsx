import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import {
  RoutineDetailScreenNavigationProp,
  RoutineDetailScreenRouteProp,
} from '../../navigation/types';
import { getRoutineById } from '../../data/routines';
import { useSessionStore } from '../../store/sessionStore';
import { Phase } from '../../models/Phase';
import { theme } from '../../constants/theme';

interface Props {
  navigation: RoutineDetailScreenNavigationProp;
  route: RoutineDetailScreenRouteProp;
}

export const RoutineDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { routineId } = route.params;
  const routine = getRoutineById(routineId);
  const { startSession } = useSessionStore();

  const handleStartSession = () => {
    if (routine) {
      startSession(routine.id);
      navigation.navigate('ActiveSession');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (!routine) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Routine not found.</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalMinutes = Math.floor(routine.totalDurationSeconds / 60);
  const remainingSeconds = routine.totalDurationSeconds % 60;

  const renderPhaseItem = ({ item, index }: { item: Phase; index: number }) => (
    <View style={styles.phaseCard}>
      <Text style={styles.phaseNumber}>#{index + 1}</Text>
      <View style={styles.phaseDetails}>
        <Text style={styles.phaseLabel}>{item.label}</Text>
        <Text style={styles.phaseMeta}>
          Type: {item.type} | Duration: {item.durationSeconds}s
          {item.audio ? ` | Audio: ${item.audio.category}` : ''}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{routine.name}</Text>
      <Text style={styles.subtitle}>{routine.description}</Text>
      <Text style={styles.duration}>
        Total Duration: {totalMinutes} min {remainingSeconds} sec ({routine.phases.length} phases)
      </Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleStartSession}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>Begin Session</Text>
      </TouchableOpacity>

      <Text style={styles.sectionHeader}>Phase Sequence</Text>

      <FlatList
        data={routine.phases}
        keyExtractor={(item) => item.id}
        renderItem={renderPhaseItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 8,
  },
  duration: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.accent,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: theme.accent,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  phaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: 'rgba(120, 90, 40, 1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 2,
  },
  phaseNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.accent,
    width: 36,
  },
  phaseDetails: {
    flex: 1,
  },
  phaseLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 2,
  },
  phaseMeta: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: theme.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    color: theme.danger,
    fontSize: 18,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: theme.surface,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  backButtonText: {
    color: theme.textPrimary,
    fontSize: 16,
  },
});
