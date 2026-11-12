interface ProfileName {
  name?: string | null;
  name_en?: string | null;
}

export function profileNameForLanguage(
  profile: ProfileName | null,
  language: string | undefined,
  fallback: string,
): string {
  const baseLanguage = language?.split("-")[0] ?? "ko";
  const koreanName = profile?.name?.trim();
  const englishName = profile?.name_en?.trim();
  return baseLanguage === "ko"
    ? koreanName || englishName || fallback
    : englishName || koreanName || fallback;
}
