import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { SettingsScreenNavigationProp } from '../../navigation/types';
import { useSessionStore } from '../../store/sessionStore';

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
          trackColor={{ false: '#334155', true: '#0EA5E9' }}
          thumbColor={muteTechniqueNames ? '#F8FAFC' : '#94A3B8'}
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
    backgroundColor: '#0F172A',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 32,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 40,
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  backButton: {
    backgroundColor: '#334155',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '500',
  },
});
