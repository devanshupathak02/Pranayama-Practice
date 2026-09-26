import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LandingScreenNavigationProp } from '../../navigation/types';
import { theme } from '../../constants/theme';
import { AddToHomeScreenBanner } from '../../components/AddToHomeScreenBanner';

interface Props {
  navigation: LandingScreenNavigationProp;
}

export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) {
    return 'Good morning';
  } else if (hour >= 12 && hour < 17) {
    return 'Good afternoon';
  } else if (hour >= 17 && hour < 21) {
    return 'Good evening';
  } else {
    return 'Good night';
  }
}

export const LandingScreen: React.FC<Props> = ({ navigation }) => {
  const greeting = useMemo(() => getGreeting(), []);

  const handleNavigate = (tab: 'pranayama' | 'yoga-nidra') => {
    navigation.navigate('Home', { initialTab: tab });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.mainGroup}>
          {/* Brand Header */}
          <View style={styles.brandHeaderContainer}>
            <Text style={styles.brandHeaderTitle}>STILL MOUNTAIN</Text>
            <Text style={styles.brandHeaderSubtitle}>Wellness Retreat</Text>
          </View>

          {/* Time-Aware Greeting & Subtitle */}
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>{greeting}</Text>
            <Text style={styles.headerSubtitle}>Choose a practice to begin your session</Text>
          </View>

          <AddToHomeScreenBanner />

          {/* Category Cards */}
          <View style={styles.categoryCardList}>
            {/* Category Card 1: Pranayama */}
            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => handleNavigate('pranayama')}
              activeOpacity={0.8}
              accessibilityLabel="Pranayama: 3 guided breathing routines, Audio led"
              accessibilityRole="button"
            >
              <View style={styles.cardContentRow}>
                <View style={styles.cardTextContainer}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitle}>Pranayama</Text>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>Breathing</Text>
                    </View>
                  </View>
                  <Text style={styles.cardDescription}>
                    3 guided breathing routines • Audio led
                  </Text>
                </View>
                <View style={styles.arrowCircle}>
                  <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                </View>
              </View>
            </TouchableOpacity>

            {/* Category Card 2: Yoga Nidra */}
            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => handleNavigate('yoga-nidra')}
              activeOpacity={0.8}
              accessibilityLabel="Yoga Nidra: 4 relaxation tracks, Guided meditation"
              accessibilityRole="button"
            >
              <View style={styles.cardContentRow}>
                <View style={styles.cardTextContainer}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitle}>Yoga Nidra</Text>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>Meditation</Text>
                    </View>
                  </View>
                  <Text style={styles.cardDescription}>
                    4 relaxation tracks • Guided meditation
                  </Text>
                </View>
                <View style={styles.arrowCircle}>
                  <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Still Mountain Branding Footer */}
        <View style={styles.creditContainer}>
          <Text style={styles.creditText}>Powered by</Text>
          <Image
            source={require('../../../assets/images/still-mountain-lockup.png')}
            style={styles.creditImage}
            resizeMode="contain"
          />
        </View>
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
    paddingTop: 32,
    paddingHorizontal: 20,
    paddingBottom: 28,
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  mainGroup: {
    width: '100%',
  },
  brandHeaderContainer: {
    marginBottom: 16,
  },
  brandHeaderTitle: {
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      web: "'Cinzel', 'Georgia', 'Times New Roman', serif",
    }),
    fontSize: 26,
    fontWeight: '700',
    color: theme.textPrimary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  brandHeaderSubtitle: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif',
      web: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }),
    fontSize: 15,
    fontWeight: '500',
    color: theme.textSecondary,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  greetingContainer: {
    marginTop: 12,
    marginBottom: 20,
  },
  greetingText: {
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      web: "'Cinzel', 'Georgia', 'Times New Roman', serif",
    }),
    fontSize: 22,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
  },
  categoryCardList: {
    gap: 16,
    marginTop: 4,
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: theme.surfaceTinted,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.borderAccent,
    shadowColor: 'rgba(9, 40, 50, 1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  cardContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.accentOnTint,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 92, 35, 0.14)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 92, 35, 0.35)',
  },
  categoryBadgeText: {
    color: theme.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cardDescription: {
    fontSize: 14,
    color: theme.accentOnTint,
    opacity: 0.88,
    lineHeight: 20,
  },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  creditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    marginBottom: 8,
    opacity: 0.8,
  },
  creditText: {
    fontSize: 12,
    color: theme.textSecondary,
    marginRight: 6,
  },
  creditImage: {
    width: 60,
    height: 45,
  },
});
