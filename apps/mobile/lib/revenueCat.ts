import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export async function initRevenueCat(userId?: string) {
  const apiKey =
    Platform.OS === 'ios'
      ? Constants.expoConfig?.extra?.REVENUECAT_API_KEY_IOS
      : Constants.expoConfig?.extra?.REVENUECAT_API_KEY_ANDROID;

  if (!apiKey || apiKey.startsWith('REPLACE')) return;

  Purchases.setLogLevel(LOG_LEVEL.ERROR);
  await Purchases.configure({ apiKey });

  if (userId) {
    await Purchases.logIn(userId);
  }
}

export async function purchasePlus(): Promise<boolean> {
  try {
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages[0];
    if (!pkg) return false;
    await Purchases.purchasePackage(pkg);
    return true;
  } catch (err: any) {
    if (!err.userCancelled) throw err;
    return false;
  }
}

export async function checkPlusEntitlement(): Promise<boolean> {
  try {
    const info = await Purchases.getCustomerInfo();
    return info.entitlements.active['plus'] !== undefined;
  } catch {
    return false;
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const info = await Purchases.restorePurchases();
    return info.entitlements.active['plus'] !== undefined;
  } catch {
    return false;
  }
}
