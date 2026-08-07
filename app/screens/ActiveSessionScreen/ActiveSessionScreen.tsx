import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { ActiveSessionScreenNavigationProp } from '../../navigation/types';
import { useSessionStore } from '../../store/sessionStore';
import { PhaseIndicator } from '../../components/PhaseIndicator/PhaseIndicator';
import { BreathingCircle } from '../../components/BreathingCircle/BreathingCircle';
import { theme } from '../../constants/theme';

interface Props {
  navigation: ActiveSessionScreenNavigationProp;
}

const formatMMSS = (totalSeconds: number): string => {
  const mins = Math.floor(Math.max(0, totalSeconds) / 60);
  const secs = Math.floor(Math.max(0, totalSeconds) % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const ActiveSessionScreen: React.FC<Props> = ({ navigation }) => {
  const {
    activeRoutine,
    status,
    currentPhaseIndex,
    currentPhase,
    currentPhaseSecondsRemaining,
    totalElapsedSeconds,
    pauseSession,
    resumeSession,
    resetSession,
    skipPhase,
  } = useSessionStore();

  const handleTogglePlayPause = () => {
    if (status === 'RUNNING') {
      pauseSession();
    } else if (status === 'PAUSED') {
      resumeSession();
    }
  };

  const handleExitSession = () => {
    resetSession();
    navigation.navigate('Home');
  };

  const isPranayama = currentPhase?.type === 'pranayama';
  const totalPhases = activeRoutine?.phases.length || 18;
  const totalRoutineDuration = activeRoutine?.totalDurationSeconds || 2070;
  const isCompleted = status === 'COMPLETED';

  // Calculate routine progress percentage
  const progressRatio = Math.min(
    1,
    Math.max(0, totalElapsedSeconds / totalRoutineDuration)
  );

  // Render session completed view
  if (isCompleted) {
    return (
      <View style={styles.container}>
        <Text style={styles.completedEmoji}>🧘✨</Text>
        <Text style={styles.completedTitle}>Session Completed</Text>
        <Text style={styles.completedSubtitle}>
          Total Practice Time: {formatMMSS(totalElapsedSeconds)}
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleExitSession}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // D9: Full-screen image ONLY during pranayama phases
  const renderContent = () => (
    <View
      style={[
        styles.contentOverlay,
        { backgroundColor: isPranayama && currentPhase?.image ? 'rgba(9, 13, 22, 0.85)' : 'transparent' }
      ]}
    >
      {/* Top Routine Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: `${progressRatio * 100}%` }]} />
      </View>

      <PhaseIndicator
        currentPhase={currentPhase}
        currentPhaseIndex={currentPhaseIndex}
        totalPhases={totalPhases}
      />

      {!isPranayama && (
        <View style={styles.circleContainer}>
          <BreathingCircle isPaused={status === 'PAUSED'} />
        </View>
      )}

      <Text
        style={[
          styles.timerDisplay,
          { color: isPranayama && currentPhase?.image ? '#FFFFFF' : theme.textPrimary }
        ]}
      >
        {formatMMSS(currentPhaseSecondsRemaining)}
      </Text>

      <Text
        style={[
          styles.totalElapsed,
          { color: isPranayama && currentPhase?.image ? 'rgba(255,255,255,0.6)' : theme.textSecondary }
        ]}
      >
        Session Time: {formatMMSS(totalElapsedSeconds)}
      </Text>

      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={[
            styles.controlButtonSecondary,
            {
              backgroundColor: isPranayama && currentPhase?.image ? 'rgba(255,255,255,0.1)' : theme.surface,
              borderColor: isPranayama && currentPhase?.image ? 'rgba(255,255,255,0.2)' : theme.border,
            }
          ]}
          onPress={skipPhase}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.controlTextSecondary,
              { color: isPranayama && currentPhase?.image ? '#FFFFFF' : theme.textSecondary }
            ]}
          >
            Skip
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButtonPrimary}
          onPress={handleTogglePlayPause}
          activeOpacity={0.8}
        >
          <Text style={styles.controlTextPrimary}>
            {status === 'RUNNING' ? 'Pause' : 'Resume'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.controlButtonDanger,
            {
              backgroundColor: isPranayama && currentPhase?.image ? 'rgba(179, 62, 43, 0.2)' : theme.surface,
              borderColor: theme.danger,
            }
          ]}
          onPress={handleExitSession}
          activeOpacity={0.7}
        >
          <Text style={[styles.controlTextDanger, { color: theme.danger }]}>End</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isPranayama && currentPhase?.image) {
    return (
      <ImageBackground
        source={currentPhase.image}
        style={styles.container}
        resizeMode="cover"
      >
        {renderContent()}
      </ImageBackground>
    );
  }

  return <View style={styles.container}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  contentOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  progressBarContainer: {
    position: 'absolute',
    top: 50,
    left: 24,
    right: 24,
    height: 4,
    backgroundColor: theme.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.accent,
    borderRadius: 2,
  },
  circleContainer: {
    marginVertical: 20,
  },
  timerDisplay: {
    fontSize: 72,
    fontWeight: '200',
    letterSpacing: 4,
    marginVertical: 12,
  },
  totalElapsed: {
    fontSize: 14,
    marginBottom: 40,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 12,
  },
  controlButtonPrimary: {
    backgroundColor: theme.accent,
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 30,
    minWidth: 120,
    alignItems: 'center',
  },
  controlTextPrimary: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  controlButtonSecondary: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
  },
  controlTextSecondary: {
    fontSize: 14,
    fontWeight: '500',
  },
  controlButtonDanger: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
  },
  controlTextDanger: {
    fontSize: 14,
    fontWeight: '500',
  },
  completedEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 8,
  },
  completedSubtitle: {
    fontSize: 16,
    color: theme.accent,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: theme.accent,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
