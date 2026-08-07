import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { HistoryScreenNavigationProp } from '../../navigation/types';
import { useHistoryStore } from '../../store/historyStore';
import { SessionRecord } from '../../models/SessionHistory';
import { theme } from '../../constants/theme';

interface Props {
  navigation: HistoryScreenNavigationProp;
}

const formatDuration = (totalSeconds: number): string => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins} min ${secs} sec`;
};

const formatDate = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return isoString;
  }
};

export const HistoryScreen: React.FC<Props> = ({ navigation }) => {
  const { history, isLoading, loadHistory, clearHistory } = useHistoryStore();

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleBack = () => {
    navigation.goBack();
  };

  const renderHistoryItem = ({ item }: { item: SessionRecord }) => (
    <View style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <Text style={styles.routineTitle}>{item.routineName}</Text>
        <Text style={styles.durationText}>{formatDuration(item.totalDurationSeconds)}</Text>
      </View>
      <Text style={styles.dateText}>{formatDate(item.completedAt)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Session History</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={clearHistory} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🧘</Text>
          <Text style={styles.emptyTitle}>No Sessions Logged</Text>
          <Text style={styles.emptyText}>
            Completed pranayama sessions will automatically appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderHistoryItem}
          contentContainerStyle={styles.listContent}
          refreshing={isLoading}
          onRefresh={loadHistory}
        />
      )}

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
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    color: theme.danger,
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 20,
  },
  recordCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: 'rgba(120, 90, 40, 1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  routineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.accent,
  },
  dateText: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: theme.surface,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.border,
  },
  backButtonText: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
});
