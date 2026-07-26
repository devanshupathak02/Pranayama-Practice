import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Phase } from '../../models/Phase';

interface Props {
  currentPhase: Phase | null;
  currentPhaseIndex: number;
  totalPhases: number;
}

export const PhaseIndicator: React.FC<Props> = ({
  currentPhase,
  currentPhaseIndex,
  totalPhases,
}) => {
  if (!currentPhase) {
    return null;
  }

  const isPranayama = currentPhase.type === 'pranayama';

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.badge,
          isPranayama ? styles.badgePranayama : styles.badgeNormal,
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            isPranayama ? styles.badgeTextPranayama : styles.badgeTextNormal,
          ]}
        >
          PHASE {currentPhaseIndex + 1} OF {totalPhases}
        </Text>
      </View>

      <Text style={styles.phaseLabel}>{currentPhase.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 24,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 12,
  },
  badgeNormal: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  badgePranayama: {
    backgroundColor: 'rgba(14, 165, 233, 0.25)',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  badgeTextNormal: {
    color: '#94A3B8',
  },
  badgeTextPranayama: {
    color: '#38BDF8',
  },
  phaseLabel: {
    fontSize: 24,
    fontWeight: '600',
    color: '#F8FAFC',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
