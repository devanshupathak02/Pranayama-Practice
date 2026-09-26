import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { SettingsScreenNavigationProp } from '../../navigation/types';
import { useSessionStore } from '../../store/sessionStore';
import { theme } from '../../constants/theme';
import { WITNESS_SOUND_OPTIONS, SoundOption } from '../../constants/sounds';
import { audioService } from '../../audio/AudioService';

interface Props {
  navigation: SettingsScreenNavigationProp;
}

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const {
    muteTechniqueNames,
    witnessSoundId,
    isSettingsLoaded,
    initSettings,
    toggleMuteTechniqueNames,
    setWitnessSound,
  } = useSessionStore();

  const [previewingId, setPreviewingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isSettingsLoaded) {
      initSettings();
    }

    return () => {
      // Clean up audio preview when leaving screen
      audioService.stopPreview();
    };
  }, [isSettingsLoaded, initSettings]);

  const handleToggleMute = (value: boolean) => {
    toggleMuteTechniqueNames(value);
  };

  const handleSelectSound = async (option: SoundOption) => {
    setWitnessSound(option.id);
    handlePreviewSound(option);
  };

  const handlePreviewSound = (option: SoundOption) => {
    try {
      if (previewingId === option.id) {
        audioService.stopPreview();
        setPreviewingId(null);
      } else {
        setPreviewingId(option.id);
        audioService.previewSound(option.asset);
      }
    } catch (error) {
      console.error('[SettingsScreen] Error previewing sound:', error);
    }
  };

  const handleBack = () => {
    audioService.stopPreview();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Settings</Text>

        <Text style={styles.sectionHeader}>Audio Controls</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Mute Technique Names</Text>
            <Text style={styles.settingDescription}>
              Silences spoken pranayama technique names. Witness transition sound and completion chime always play.
            </Text>
          </View>
          <Switch
            value={muteTechniqueNames}
            onValueChange={handleToggleMute}
            trackColor={{ false: theme.border, true: theme.accent }}
            thumbColor="#FFFFFF"
          />
        </View>

        <Text style={styles.sectionHeader}>Witness Transition Bell</Text>
        <Text style={styles.sectionSubtext}>
          Select the sound played specifically during transitions to Normal Breath / Witness phases. (Does not affect completion bell).
        </Text>

        <View style={styles.soundOptionsList}>
          {WITNESS_SOUND_OPTIONS.map((option) => {
            const isSelected = witnessSoundId === option.id;
            const isPreviewing = previewingId === option.id;

            return (
              <View
                key={option.id}
                style={[
                  styles.soundCard,
                  isSelected && styles.soundCardSelected,
                ]}
              >
                <TouchableOpacity
                  style={styles.soundCardContent}
                  onPress={() => handleSelectSound(option)}
                  activeOpacity={0.8}
                >
                  <View style={styles.radioIndicator}>
                    {isSelected && <View style={styles.radioIndicatorInner} />}
                  </View>
                  <View style={styles.soundTextContainer}>
                    <Text style={styles.soundTitle}>{option.label}</Text>
                    <Text style={styles.soundDescription}>{option.description}</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.previewButton,
                    isPreviewing && styles.previewButtonActive,
                  ]}
                  onPress={() => handlePreviewSound(option)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.previewButtonText,
                      isPreviewing && styles.previewButtonTextActive,
                    ]}
                  >
                    {isPreviewing ? '⏹ Stop' : '▶ Preview'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 6,
    marginTop: 12,
  },
  sectionSubtext: {
    fontSize: 13,
    color: theme.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 24,
    shadowColor: 'rgba(9, 40, 50, 1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: theme.textSecondary,
    lineHeight: 16,
  },
  soundOptionsList: {
    gap: 12,
    marginBottom: 32,
  },
  soundCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  soundCardSelected: {
    backgroundColor: theme.surfaceTinted,
    borderColor: theme.borderAccent,
  },
  soundCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  radioIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.borderAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: theme.surface,
  },
  radioIndicatorInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.accent,
  },
  soundTextContainer: {
    flex: 1,
  },
  soundTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 2,
  },
  soundDescription: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  previewButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  previewButtonActive: {
    backgroundColor: theme.accent,
    borderColor: theme.accent,
  },
  previewButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  previewButtonTextActive: {
    color: '#FFFFFF',
  },
  backButton: {
    backgroundColor: theme.surface,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    marginTop: 8,
  },
  backButtonText: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
});
