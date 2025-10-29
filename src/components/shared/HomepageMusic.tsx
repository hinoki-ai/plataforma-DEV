"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAudioConsent } from "@/hooks/use-audio-consent";

export function HomepageMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { preferences, isLoaded } = useAudioConsent();
  const [allowAutoplay, setAllowAutoplay] = useState(true);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isFadingRef = useRef(false);
  const baseVolumeRef = useRef(0.25);

  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isTouchPrimary =
      window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAllowAutoplay(!(prefersReducedMotion || isTouchPrimary));
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = false;
    audio.volume = baseVolumeRef.current;
    audio.muted = true;

    const handleTimeUpdate = () => {
      if (!audio.duration || isNaN(audio.duration)) return;

      const fadeStartTime = audio.duration - 3;

      if (
        audio.currentTime >= fadeStartTime &&
        audio.currentTime < audio.duration
      ) {
        isFadingRef.current = true;
        const fadeProgress = (audio.currentTime - fadeStartTime) / 3;
        const newVolume = baseVolumeRef.current * (1 - fadeProgress);
        audio.volume = Math.max(0, newVolume);
      } else if (audio.currentTime < fadeStartTime) {
        if (isFadingRef.current) {
          isFadingRef.current = false;
          audio.volume = baseVolumeRef.current;
        }
      }
    };

    const handleEnded = () => {
      isFadingRef.current = false;
      audio.currentTime = 0;
      audio.volume = baseVolumeRef.current;
      if (
        preferences.musicEnabled &&
        preferences.hasConsented &&
        !preferences.isMuted
      ) {
        audio.play().catch(() => {});
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, [preferences.musicEnabled, preferences.hasConsented, preferences.isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isLoaded) return;

    if (!allowAutoplay) {
      audio.muted = true;
      audio.pause();
      return;
    }

    const startPlayback = async () => {
      try {
        audio.muted = false;
        if (!isFadingRef.current) {
          audio.volume = baseVolumeRef.current;
        }
        audio.removeAttribute("muted");

        if (audio.paused) {
          await audio.play();
        }
      } catch (error) {
        // Silently handle audio playback errors
      }
    };

    const pausePlayback = () => {
      audio.muted = true;
      audio.volume = 0;
      audio.pause();
    };

    if (
      preferences.musicEnabled &&
      preferences.hasConsented &&
      !preferences.isMuted
    ) {
      void startPlayback();
    } else {
      pausePlayback();
    }
  }, [
    isLoaded,
    preferences.hasConsented,
    preferences.musicEnabled,
    preferences.isMuted,
    allowAutoplay,
  ]);

  useEffect(() => {
    const handleCookieAccept = () => {
      const audio = audioRef.current;
      if (!audio || !allowAutoplay) return;

      audio.muted = false;
      if (!isFadingRef.current) {
        audio.volume = baseVolumeRef.current;
      }
      audio.removeAttribute("muted");

      if (audio.paused) {
        audio.play().catch(() => {});
      }
    };

    window.addEventListener("homepage-music-play", handleCookieAccept);
    return () => {
      window.removeEventListener("homepage-music-play", handleCookieAccept);
    };
  }, [allowAutoplay]);

  return (
    <audio
      ref={audioRef}
      id="homepage-audio"
      src="/landing.mp3"
      preload="auto"
      muted
      className="hidden"
    />
  );
}
