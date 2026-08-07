import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { SettingsScreenNavigationProp } from '../../navigation/types';
import { useSessionStore } from '../../store/sessionStore';
import { theme } from '../../constants/theme';

interface Props {
  navigation: SettingsScreenNavigationProp;
}

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { muteTechniqueNames, isSettingsLoaded, initSettings, toggleMuteTechniqueNames } =
    useSessionStore();

  useEffect(() => {
    if (!isSettingsLoaded) {
      initSettings();
    }
  }, [isSettingsLoaded, initSettings]);

  const handleToggleMute = (value: boolean) => {
    toggleMuteTechniqueNames(value);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.settingRow}>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>Mute Technique Names</Text>
          <Text style={styles.settingDescription}>
            Silences spoken pranayama technique names. Witness bells and completion chime always play.
          </Text>
        </View>
        <Switch
          value={muteTechniqueNames}
          onValueChange={handleToggleMute}
          trackColor={{ false: theme.border, true: theme.accent }}
          thumbColor="#FFFFFF"
        />
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBack}
        activeOpacity={0.8}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 32,
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
    marginBottom: 40,
    shadowColor: 'rgba(120, 90, 40, 1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
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
  backButton: {
    backgroundColor: theme.surface,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  backButtonText: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
});
