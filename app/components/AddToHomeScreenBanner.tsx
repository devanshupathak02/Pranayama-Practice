import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { storage } from '../storage/db';

const DISMISS_KEY = 'hide_a2hs_banner';

export const AddToHomeScreenBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    const checkStandalone = async () => {
      try {
        const isDismissed = await storage.getItem(DISMISS_KEY);
        if (isDismissed === 'true') {
          return;
        }

        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        const isStandalone = (window.navigator as any).standalone || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);

        // Show banner only on iOS Safari when NOT installed/standalone
        if (isIOS && !isStandalone) {
          setIsVisible(true);
        }
      } catch (err) {
        console.warn('Error checking standalone status:', err);
      }
    };

    checkStandalone();
  }, []);

  const handleDismiss = async () => {
    setIsVisible(false);
    try {
      await storage.setItem(DISMISS_KEY, 'true');
    } catch (err) {
      console.warn('Error saving banner dismiss state:', err);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.bannerContainer}>
      <View style={styles.contentRow}>
        <View style={styles.iconCircle}>
          <Ionicons name="share-outline" size={18} color={theme.accent} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.bannerTitle}>Enable Background Reminders</Text>
          <Text style={styles.bannerText}>
            Tap <Ionicons name="share-outline" size={12} color={theme.accentOnTint} /> then <Text style={styles.boldText}>"Add to Home Screen"</Text> so session alerts can reach you when your phone is locked.
          </Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={handleDismiss} activeOpacity={0.7}>
          <Ionicons name="close" size={18} color={theme.accentOnTint} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: theme.surfaceTinted,
    borderWidth: 1,
    borderColor: theme.borderAccent,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    marginHorizontal: 4,
    shadowColor: 'rgba(9, 40, 50, 1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: theme.borderAccent,
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  bannerTitle: {
    fontFamily: Platform.select({ web: 'Cinzel, Georgia, serif', default: 'serif' }),
    fontSize: 13,
    fontWeight: '700',
    color: theme.accentOnTint,
    marginBottom: 2,
  },
  bannerText: {
    fontFamily: Platform.select({ web: 'Montserrat, system-ui, sans-serif', default: 'sans-serif' }),
    fontSize: 12,
    lineHeight: 16,
    color: theme.accentOnTint,
    opacity: 0.9,
  },
  boldText: {
    fontWeight: '700',
    color: theme.accentOnTint,
  },
  closeButton: {
    padding: 6,
    marginLeft: 4,
  },
});
