import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { HistoryScreenNavigationProp } from '../../navigation/types';
import { useHistoryStore } from '../../store/historyStore';
import { SessionRecord } from '../../models/SessionHistory';

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
    backgroundColor: '#0F172A',
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
    fontWeight: '700',
    color: '#F8FAFC',
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 20,
  },
  recordCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
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
    color: '#F8FAFC',
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#38BDF8',
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
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
    color: '#F8FAFC',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: '#334155',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  backButtonText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '500',
  },
});
