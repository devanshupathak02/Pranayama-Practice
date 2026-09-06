import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { Ionicons } from '@expo/vector-icons';
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
  useKeepAwake();

  const {
    activeRoutine,
    status,
    currentPhaseIndex,
    currentPhase,
    currentPhaseSecondsRemaining,
    totalSecondsRemaining,
    totalElapsedSeconds,
    pauseSession,
    resumeSession,
    resetSession,
    skipPhase,
    previousPhase,
  } = useSessionStore();

  const handleTogglePlayPause = () => {
    try {
      if (status === 'RUNNING') {
        pauseSession();
      } else if (status === 'PAUSED') {
        resumeSession();
      }
    } catch (error) {
      console.error('[ActiveSessionScreen] Error toggling play/pause:', error);
    }
  };

  const handleExitSession = () => {
    try {
      resetSession();
    } catch (error) {
      console.error('[ActiveSessionScreen] Error exiting session:', error);
    }
    navigation.navigate('Home');
  };

  const handleSkipPhase = () => {
    try {
      skipPhase();
    } catch (error) {
      console.error('[ActiveSessionScreen] Error skipping phase:', error);
    }
  };

  const handlePreviousPhase = () => {
    try {
      if (currentPhaseIndex > 0) {
        previousPhase();
      }
    } catch (error) {
      console.error('[ActiveSessionScreen] Error returning to previous phase:', error);
    }
  };

  const hasImage = !!currentPhase?.image;
  const imageSource = typeof currentPhase?.image === 'string'
    ? { uri: currentPhase.image }
    : currentPhase?.image;
  const totalPhases = activeRoutine?.phases.length || 18;
  const totalRoutineDuration = activeRoutine?.totalDurationSeconds || 2070;
  const isCompleted = status === 'COMPLETED';
  const isFirstPhase = currentPhaseIndex === 0;

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

  // D13/D9: Full-screen image whenever phase.image is present/truthy
  const renderContent = () => (
    <View
      style={[
        styles.contentOverlay,
        { backgroundColor: hasImage ? 'rgba(9, 13, 22, 0.85)' : 'transparent' }
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

      <View style={styles.circleContainer}>
        {!hasImage && <BreathingCircle isPaused={status === 'PAUSED'} />}
      </View>

      <Text
        style={[
          styles.timerDisplay,
          { color: hasImage ? '#FFFFFF' : theme.textPrimary }
        ]}
      >
        {formatMMSS(currentPhaseSecondsRemaining)}
      </Text>

      <View style={styles.sessionTimesRow}>
        <View style={styles.sessionTimeBadge}>
          <Text style={[styles.sessionTimeLabel, { color: hasImage ? 'rgba(255,255,255,0.6)' : theme.textSecondary }]}>
            Time Remaining
          </Text>
          <Text style={[styles.sessionTimeValue, { color: hasImage ? '#FFFFFF' : theme.accent }]}>
            {formatMMSS(totalSecondsRemaining)}
          </Text>
        </View>
      </View>

      <View style={styles.controlsRow}>
        {/* Previous Button */}
        <TouchableOpacity
          style={[
            styles.controlButtonSecondary,
            {
              backgroundColor: hasImage ? 'rgba(255,255,255,0.1)' : theme.surface,
              borderColor: hasImage ? 'rgba(255,255,255,0.2)' : theme.border,
              opacity: isFirstPhase ? 0.35 : 1,
            }
          ]}
          onPress={handlePreviousPhase}
          disabled={isFirstPhase}
          activeOpacity={0.7}
        >
          <Ionicons
            name="play-skip-back"
            size={14}
            color={hasImage ? '#FFFFFF' : theme.textSecondary}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.controlTextSecondary,
              { color: hasImage ? '#FFFFFF' : theme.textSecondary }
            ]}
          >
            Prev
          </Text>
        </TouchableOpacity>

        {/* Play/Pause Button */}
        <TouchableOpacity
          style={styles.controlButtonPrimary}
          onPress={handleTogglePlayPause}
          activeOpacity={0.8}
        >
          <Ionicons
            name={status === 'RUNNING' ? 'pause' : 'play'}
            size={16}
            color="#FFFFFF"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.controlTextPrimary}>
            {status === 'RUNNING' ? 'Pause' : 'Resume'}
          </Text>
        </TouchableOpacity>

        {/* Skip Button */}
        <TouchableOpacity
          style={[
            styles.controlButtonSecondary,
            {
              backgroundColor: hasImage ? 'rgba(255,255,255,0.1)' : theme.surface,
              borderColor: hasImage ? 'rgba(255,255,255,0.2)' : theme.border,
            }
          ]}
          onPress={handleSkipPhase}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.controlTextSecondary,
              { color: hasImage ? '#FFFFFF' : theme.textSecondary, marginRight: 4 }
            ]}
          >
            Skip
          </Text>
          <Ionicons
            name="play-skip-forward"
            size={14}
            color={hasImage ? '#FFFFFF' : theme.textSecondary}
          />
        </TouchableOpacity>

        {/* End Button */}
        <TouchableOpacity
          style={[
            styles.controlButtonDanger,
            {
              backgroundColor: hasImage ? 'rgba(179, 62, 43, 0.2)' : theme.surface,
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

  if (currentPhase?.image) {
    return (
      <ImageBackground
        source={imageSource}
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
    paddingHorizontal: 16,
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
    width: 220,
    height: 220,
    marginVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerDisplay: {
    fontSize: 72,
    fontWeight: '200',
    letterSpacing: 4,
    marginVertical: 8,
  },
  sessionTimesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    marginTop: 4,
  },
  sessionTimeBadge: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  sessionTimeLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  sessionTimeValue: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 8,
    gap: 8,
  },
  controlButtonPrimary: {
    backgroundColor: theme.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 26,
  },
  controlTextPrimary: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  controlButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1,
  },
  controlTextSecondary: {
    fontSize: 13,
    fontWeight: '500',
  },
  controlButtonDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1,
  },
  controlTextDanger: {
    fontSize: 13,
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
