import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import {
  RoutineDetailScreenNavigationProp,
  RoutineDetailScreenRouteProp,
} from '../../navigation/types';
import { getRoutineById } from '../../data/routines';
import { useSessionStore } from '../../store/sessionStore';
import { Phase } from '../../models/Phase';

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
    backgroundColor: '#0F172A',
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
  },
  duration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#38BDF8',
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#0EA5E9',
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
    color: '#E2E8F0',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  phaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  phaseNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#38BDF8',
    width: 36,
  },
  phaseDetails: {
    flex: 1,
  },
  phaseLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  phaseMeta: {
    fontSize: 12,
    color: '#94A3B8',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 18,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#334155',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#F8FAFC',
    fontSize: 16,
  },
});
