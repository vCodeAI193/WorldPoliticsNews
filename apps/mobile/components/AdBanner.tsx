import { View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';
import { useAuthStore } from '@/store/authStore';

const ANDROID_AD_UNIT = 'ca-app-pub-REPLACE_WITH_REAL_ID/REPLACE_ANDROID';
const IOS_AD_UNIT = 'ca-app-pub-REPLACE_WITH_REAL_ID/REPLACE_IOS';

export function AdBanner() {
  const { user } = useAuthStore();

  // Plus-Abonnenten sehen keine Werbung
  if (user?.subscriptionTier === 'plus') return null;

  const adUnitId = __DEV__
    ? TestIds.BANNER
    : Platform.OS === 'android'
    ? ANDROID_AD_UNIT
    : IOS_AD_UNIT;

  return (
    <View style={{ alignItems: 'center', marginVertical: 6 }}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      />
    </View>
  );
}
