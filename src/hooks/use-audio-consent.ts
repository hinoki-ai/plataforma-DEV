"use client";

import { useState, useEffect } from "react";

export interface AudioConsentPreferences {
  musicEnabled: boolean;
  soundEffects: boolean;
  hasConsented: boolean;
  isMuted: boolean;
}

const AUDIO_CONSENT_KEY = "plataforma_audio_consent";
const DEFAULT_PREFERENCES: AudioConsentPreferences = {
  musicEnabled: false,
  soundEffects: true,
  hasConsented: false,
  isMuted: false,
};

export function useAudioConsent() {
  const [preferences, setPreferences] =
    useState<AudioConsentPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUDIO_CONSENT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({
          ...DEFAULT_PREFERENCES,
          ...parsed,
          hasConsented: true,
        });
      }
    } catch (error) {
      console.warn("Error loading audio preferences:", error);
    }
    setIsLoaded(true);

    const handlePreferenceChange = (
      event: CustomEvent<AudioConsentPreferences>,
    ) => {
      setPreferences(event.detail);
    };

    window.addEventListener(
      "audio-preferences-changed",
      handlePreferenceChange as EventListener,
    );
    return () => {
      window.removeEventListener(
        "audio-preferences-changed",
        handlePreferenceChange as EventListener,
      );
    };
  }, []);

  const savePreferences = (
    newPreferences: Partial<AudioConsentPreferences>,
  ) => {
    try {
      const updated = { ...preferences, ...newPreferences };
      localStorage.setItem(AUDIO_CONSENT_KEY, JSON.stringify(updated));
      setPreferences(updated);

      window.dispatchEvent(
        new CustomEvent("audio-preferences-changed", { detail: updated }),
      );
    } catch (error) {
      console.warn("Error saving audio preferences:", error);
    }
  };

  const enableMusic = () => {
    savePreferences({ musicEnabled: true, hasConsented: true });
  };

  const disableMusic = () => {
    savePreferences({ musicEnabled: false, hasConsented: true });
  };

  const toggleMusic = () => {
    savePreferences({
      musicEnabled: !preferences.musicEnabled,
      hasConsented: true,
    });
  };

  const toggleSoundEffects = () => {
    savePreferences({ soundEffects: !preferences.soundEffects });
  };

  const toggleMute = () => {
    savePreferences({ isMuted: !preferences.isMuted });
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
    try {
      localStorage.removeItem(AUDIO_CONSENT_KEY);
    } catch (error) {
      console.warn("Error resetting audio preferences:", error);
    }
  };

  return {
    preferences,
    isLoaded,
    enableMusic,
    disableMusic,
    toggleMusic,
    toggleSoundEffects,
    toggleMute,
    resetPreferences,
    savePreferences,
  };
}
