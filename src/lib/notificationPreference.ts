interface PreferenceStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function notificationPreferenceKey(userId: string): string {
  return `sanjae-notifications:${userId}`;
}

export function readNotificationPreference(
  storage: PreferenceStorage,
  userId: string,
): boolean {
  return storage.getItem(notificationPreferenceKey(userId)) === "true";
}

export function writeNotificationPreference(
  storage: PreferenceStorage,
  userId: string,
  enabled: boolean,
): void {
  storage.setItem(notificationPreferenceKey(userId), String(enabled));
}
