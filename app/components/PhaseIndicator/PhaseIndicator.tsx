import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Phase } from '../../models/Phase';
import { theme } from '../../constants/theme';

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

  const hasImage = !!currentPhase.image;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.badge,
          hasImage ? styles.badgePranayama : styles.badgeNormal,
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            hasImage ? styles.badgeTextPranayama : styles.badgeTextNormal,
          ]}
        >
          PHASE {currentPhaseIndex + 1} OF {totalPhases}
        </Text>
      </View>

      <Text
        style={[
          styles.phaseLabel,
          { color: hasImage ? '#FFFFFF' : theme.textPrimary }
        ]}
      >
        {currentPhase.label}
      </Text>
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
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  badgePranayama: {
    backgroundColor: theme.surfaceTinted,
    borderWidth: 1,
    borderColor: theme.borderAccent,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  badgeTextNormal: {
    color: theme.textSecondary,
  },
  badgeTextPranayama: {
    color: theme.accentOnTint,
  },
  phaseLabel: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
