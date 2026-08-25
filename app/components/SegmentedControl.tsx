import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';

export type TabCategory = 'pranayama' | 'yoga-nidra';

interface SegmentedControlProps {
  selectedTab: TabCategory;
  onTabChange: (tab: TabCategory) => void;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  selectedTab,
  onTabChange,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.tab,
          selectedTab === 'pranayama' && styles.activeTab,
        ]}
        onPress={() => onTabChange('pranayama')}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.tabText,
            selectedTab === 'pranayama' ? styles.activeTabText : styles.inactiveTabText,
          ]}
        >
          Pranayama
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tab,
          selectedTab === 'yoga-nidra' && styles.activeTab,
        ]}
        onPress={() => onTabChange('yoga-nidra')}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.tabText,
            selectedTab === 'yoga-nidra' ? styles.activeTabText : styles.inactiveTabText,
          ]}
        >
          Yoga Nidra
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.border,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: theme.surfaceTinted,
    borderWidth: 1,
    borderColor: theme.borderAccent,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: theme.accentOnTint,
    fontWeight: '600',
  },
  inactiveTabText: {
    color: theme.textSecondary,
  },
});
