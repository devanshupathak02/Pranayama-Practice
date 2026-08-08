import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { RoutineBuilderScreenNavigationProp, RoutineBuilderScreenRouteProp } from '../../navigation/types';
import { useRoutineStore } from '../../store/routineStore';
import { Routine } from '../../models/Routine';
import { Phase } from '../../models/Phase';
import { theme } from '../../constants/theme';
import { pickImage, pickAudio } from '../../utils/media';

interface Props {
  navigation: RoutineBuilderScreenNavigationProp;
  route: RoutineBuilderScreenRouteProp;
}

const createNewPhase = (): Phase => ({
  id: `phase_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
  type: 'custom',
  label: 'New Phase',
  durationSeconds: 30,
});

export const RoutineBuilderScreen: React.FC<Props> = ({ navigation, route }) => {
  const { routineId } = route.params || {};
  const { routines, saveRoutine } = useRoutineStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phases, setPhases] = useState<Phase[]>([]);

  useEffect(() => {
    if (routineId) {
      const existing = routines.find((r) => r.id === routineId);
      if (existing) {
        setName(existing.name);
        setDescription(existing.description || '');
        // Deep copy phases to avoid mutating store state directly
        setPhases(JSON.parse(JSON.stringify(existing.phases)));
      }
    } else {
      // Default to 1 blank phase for a new routine
      setPhases([createNewPhase()]);
    }
  }, [routineId, routines]);

  const handleAddPhase = () => {
    setPhases((prev) => [...prev, createNewPhase()]);
  };

  const handleDeletePhase = (index: number) => {
    if (phases.length === 1) {
      Alert.alert('Cannot Remove', 'Your routine must have at least one phase.');
      return;
    }
    setPhases((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setPhases((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      return updated;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === phases.length - 1) return;
    setPhases((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      return updated;
    });
  };

  const handlePhaseLabelChange = (index: number, text: string) => {
    setPhases((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], label: text };
      return updated;
    });
  };

  const handlePhaseDurationChange = (index: number, text: string) => {
    // Keep only numbers
    const numericText = text.replace(/[^0-9]/g, '');
    const duration = numericText === '' ? 0 : parseInt(numericText, 10);
    setPhases((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], durationSeconds: duration };
      return updated;
    });
  };

  const handlePickImageForPhase = async (index: number) => {
    const localUri = await pickImage();
    if (localUri) {
      setPhases((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], image: localUri };
        return updated;
      });
    }
  };

  const handleRemoveImageFromPhase = (index: number) => {
    setPhases((prev) => {
      const updated = [...prev];
      delete updated[index].image;
      return updated;
    });
  };

  const handlePickAudioForPhase = async (index: number) => {
    const localUri = await pickAudio();
    if (localUri) {
      setPhases((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          audio: {
            file: localUri,
            category: 'custom',
            playOnce: true,
          },
        };
        return updated;
      });
    }
  };

  const handleRemoveAudioFromPhase = (index: number) => {
    setPhases((prev) => {
      const updated = [...prev];
      delete updated[index].audio;
      return updated;
    });
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Validation Error', 'Please enter a routine name.');
      return;
    }

    if (phases.length === 0) {
      Alert.alert('Validation Error', 'The routine must have at least one phase.');
      return;
    }

    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      if (!phase.label.trim()) {
        Alert.alert('Validation Error', `Phase #${i + 1} must have a name.`);
        return;
      }
      if (phase.durationSeconds <= 0) {
        Alert.alert('Validation Error', `Phase #${i + 1} must have a duration greater than 0.`);
        return;
      }
    }

    const totalDuration = phases.reduce((sum, p) => sum + p.durationSeconds, 0);

    const routineToSave: Routine = {
      id: routineId || `custom_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: trimmedName,
      description: description.trim(),
      totalDurationSeconds: totalDuration,
      phases: phases.map((p) => ({
        ...p,
        label: p.label.trim(),
      })),
      source: 'custom',
    };

    await saveRoutine(routineToSave);

    Alert.alert('Success', 'Routine saved successfully!', [
      {
        text: 'OK',
        onPress: () => {
          navigation.goBack();
        },
      },
    ]);
  };

  const handleCancel = () => {
    Alert.alert('Discard Changes', 'Are you sure you want to discard your changes?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Routine Details Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionHeader}>Routine Details</Text>
          
          <Text style={styles.label}>Routine Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Morning Calm"
            placeholderTextColor={theme.textMuted}
            maxLength={50}
          />

          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the focus or benefits of this routine..."
            placeholderTextColor={theme.textMuted}
            multiline
            numberOfLines={3}
            maxLength={200}
          />
        </View>

        {/* Phase List Section */}
        <View style={styles.phasesSection}>
          <View style={styles.phasesSectionHeaderRow}>
            <Text style={styles.sectionHeader}>Phases ({phases.length})</Text>
            <TouchableOpacity style={styles.addPhaseButtonHeader} onPress={handleAddPhase}>
              <Text style={styles.addPhaseButtonHeaderText}>+ Add Phase</Text>
            </TouchableOpacity>
          </View>

          {phases.map((phase, index) => {
            const isFirst = index === 0;
            const isLast = index === phases.length - 1;
            const imageSource = typeof phase.image === 'string' ? { uri: phase.image } : phase.image;

            return (
              <View key={phase.id} style={styles.phaseCard}>
                {/* Phase Card Header (Numbering + Move Up/Down/Delete) */}
                <View style={styles.phaseCardHeader}>
                  <Text style={styles.phaseCardTitle}>Phase #{index + 1}</Text>
                  
                  <View style={styles.phaseCardControls}>
                    <TouchableOpacity
                      style={[styles.controlIconButton, isFirst && styles.disabledButton]}
                      onPress={() => handleMoveUp(index)}
                      disabled={isFirst}
                    >
                      <Text style={styles.controlIconText}>▲</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.controlIconButton, isLast && styles.disabledButton]}
                      onPress={() => handleMoveDown(index)}
                      disabled={isLast}
                    >
                      <Text style={styles.controlIconText}>▼</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deletePhaseButton}
                      onPress={() => handleDeletePhase(index)}
                    >
                      <Text style={styles.deletePhaseButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Inline Name & Duration Fields */}
                <View style={styles.phaseInputRow}>
                  <View style={styles.phaseInputContainerLabel}>
                    <Text style={styles.fieldLabel}>Phase Name *</Text>
                    <TextInput
                      style={styles.phaseInput}
                      value={phase.label}
                      onChangeText={(text) => handlePhaseLabelChange(index, text)}
                      placeholder="e.g. Inhale"
                      placeholderTextColor={theme.textMuted}
                    />
                  </View>

                  <View style={styles.phaseInputContainerDuration}>
                    <Text style={styles.fieldLabel}>Duration (sec) *</Text>
                    <TextInput
                      style={styles.phaseInput}
                      value={phase.durationSeconds === 0 ? '' : phase.durationSeconds.toString()}
                      onChangeText={(text) => handlePhaseDurationChange(index, text)}
                      placeholder="30"
                      placeholderTextColor={theme.textMuted}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Media Selectors Section */}
                <View style={styles.mediaRow}>
                  {/* Image Picker */}
                  <View style={styles.mediaColumn}>
                    <Text style={styles.fieldLabel}>Background Image</Text>
                    
                    {phase.image ? (
                      <View style={styles.mediaPreviewContainer}>
                        <Image source={imageSource} style={styles.mediaThumbnail} />
                        <TouchableOpacity
                          style={styles.removeMediaButton}
                          onPress={() => handleRemoveImageFromPhase(index)}
                        >
                          <Text style={styles.removeMediaButtonText}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.mediaPickerButton}
                        onPress={() => handlePickImageForPhase(index)}
                      >
                        <Text style={styles.mediaPickerButtonText}>🖼️ Pick Photo</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Audio Picker */}
                  <View style={styles.mediaColumn}>
                    <Text style={styles.fieldLabel}>Audio Prompt</Text>

                    {phase.audio ? (
                      <View style={styles.mediaPreviewContainer}>
                        <View style={styles.audioFileRow}>
                          <Text style={styles.audioFileText}>🎵 Selected</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.removeMediaButton}
                          onPress={() => handleRemoveAudioFromPhase(index)}
                        >
                          <Text style={styles.removeMediaButtonText}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.mediaPickerButton}
                        onPress={() => handlePickAudioForPhase(index)}
                      >
                        <Text style={styles.mediaPickerButtonText}>🎵 Pick Audio</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })}

          <TouchableOpacity style={styles.addPhaseButtonBottom} onPress={handleAddPhase}>
            <Text style={styles.addPhaseButtonBottomText}>+ Add New Phase</Text>
          </TouchableOpacity>
        </View>

        {/* Action Row */}
        <View style={styles.saveActionsRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Routine</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: theme.background,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  formSection: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    color: theme.textPrimary,
    fontSize: 15,
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  phasesSection: {
    marginBottom: 30,
  },
  phasesSectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  addPhaseButtonHeader: {
    backgroundColor: 'rgba(186, 117, 23, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addPhaseButtonHeaderText: {
    color: theme.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  phaseCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    marginBottom: 16,
    shadowColor: 'rgba(120, 90, 40, 1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  phaseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: theme.background,
    paddingBottom: 10,
    marginBottom: 14,
  },
  phaseCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.accent,
  },
  phaseCardControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlIconButton: {
    width: 32,
    height: 32,
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlIconText: {
    fontSize: 11,
    color: theme.textSecondary,
  },
  disabledButton: {
    opacity: 0.4,
  },
  deletePhaseButton: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(81, 26, 5, 0.08)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deletePhaseButtonText: {
    fontSize: 14,
  },
  phaseInputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  phaseInputContainerLabel: {
    flex: 2,
  },
  phaseInputContainerDuration: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 6,
  },
  phaseInput: {
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    color: theme.textPrimary,
    fontSize: 14,
  },
  mediaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  mediaColumn: {
    flex: 1,
  },
  mediaPickerButton: {
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaPickerButtonText: {
    color: theme.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  mediaPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 6,
    gap: 10,
  },
  mediaThumbnail: {
    width: 38,
    height: 38,
    borderRadius: 6,
  },
  removeMediaButton: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
  },
  removeMediaButtonText: {
    color: theme.danger,
    fontSize: 11,
    fontWeight: '600',
  },
  audioFileRow: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 6,
  },
  audioFileText: {
    color: theme.success,
    fontSize: 12,
    fontWeight: '600',
  },
  addPhaseButtonBottom: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.borderAccent,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhaseButtonBottomText: {
    color: theme.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  saveActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: theme.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: theme.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
