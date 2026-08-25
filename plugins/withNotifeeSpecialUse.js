const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Expo Config Plugin to inject android:foregroundServiceType="specialUse" and
 * PROPERTY_SPECIAL_USE_FGS_SUBTYPE property tag into Notifee's ForegroundService
 * entry in AndroidManifest.xml (required for Android 14 / API 34 compliance).
 */
module.exports = function withNotifeeSpecialUse(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const application = androidManifest.manifest.application?.[0];

    if (application) {
      if (!application.service) {
        application.service = [];
      }

      let notifeeService = application.service.find(
        (s) => s.$ && s.$['android:name'] === 'app.notifee.core.ForegroundService'
      );

      if (!notifeeService) {
        notifeeService = {
          $: {
            'android:name': 'app.notifee.core.ForegroundService',
          },
        };
        application.service.push(notifeeService);
      }

      // 1. Set foregroundServiceType to specialUse for Android 14+
      notifeeService.$['android:foregroundServiceType'] = 'specialUse';

      // 2. Inject required PROPERTY_SPECIAL_USE_FGS_SUBTYPE description tag
      if (!notifeeService.property) {
        notifeeService.property = [];
      }

      const hasSubtypeProp = notifeeService.property.some(
        (p) => p.$ && p.$['android:name'] === 'android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE'
      );

      if (!hasSubtypeProp) {
        notifeeService.property.push({
          $: {
            'android:name': 'android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE',
            'android:value': 'Pranayama timing and meditation session tracking',
          },
        });
      }
    }

    return config;
  });
};
