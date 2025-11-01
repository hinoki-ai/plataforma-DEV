"use client";

import React from "react";
import styled from "styled-components";
import { useAudioConsent } from "@/hooks/use-audio-consent";

interface SoundToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const SoundToggle = ({ className, size = "md" }: SoundToggleProps) => {
  const { preferences, isLoaded, toggleMute } = useAudioConsent();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded || !preferences.hasConsented) {
    return null;
  }

  const isMuted = preferences.isMuted;

  const handleToggle = () => {
    toggleMute();
  };

  const sizeMultiplier = size === "sm" ? 0.4 : size === "lg" ? 1.2 : 1;

  return (
    <StyledWrapper className={className} $sizeMultiplier={sizeMultiplier}>
      <label className="sound-switch">
        <input
          type="checkbox"
          className="sound-switch__checkbox"
          checked={!isMuted}
          onChange={handleToggle}
          aria-label="Toggle sound"
        />
        <div className="sound-switch__container">
          {/* Sound Waves */}
          <div className="sound-switch__waves">
            <div className="sound-switch__wave sound-switch__wave--1" />
            <div className="sound-switch__wave sound-switch__wave--2" />
            <div className="sound-switch__wave sound-switch__wave--3" />
          </div>

          {/* Speaker Circle */}
          <div className="sound-switch__circle-container">
            <div className="sound-switch__speaker-container">
              <div className="sound-switch__speaker">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="sound-switch__speaker-icon"
                >
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                </svg>
              </div>
              {/* Mute Icon */}
              <div className="sound-switch__mute">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="sound-switch__mute-icon"
                >
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                  <line
                    x1="4"
                    y1="4"
                    x2="20"
                    y2="20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </label>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div<{ $sizeMultiplier: number }>`
  .sound-switch {
    --toggle-size: ${(props) => 30 * props.$sizeMultiplier}px;
    --container-width: 5.625em;
    --container-height: 2.5em;
    --container-radius: 6.25em;
    --container-sound-bg: #4a90e2;
    --container-mute-bg: #708090;
    --circle-container-diameter: 3.375em;
    --speaker-diameter: 2.125em;
    --speaker-bg: #ffffff;
    --wave-color: #ffffff;
    --transition: 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    --circle-transition: 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .sound-switch,
  .sound-switch *,
  .sound-switch *::before,
  .sound-switch *::after {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-size: var(--toggle-size);
  }

  .sound-switch__container {
    width: var(--container-width);
    height: var(--container-height);
    background-color: var(--container-sound-bg);
    border-radius: var(--container-radius);
    overflow: hidden;
    cursor: pointer;
    -webkit-box-shadow:
      0em -0.062em 0.062em rgba(0, 0, 0, 0.25),
      0em 0.062em 0.125em rgba(255, 255, 255, 0.94);
    box-shadow:
      0em -0.062em 0.062em rgba(0, 0, 0, 0.25),
      0em 0.062em 0.125em rgba(255, 255, 255, 0.94);
    -webkit-transition: var(--transition);
    -o-transition: var(--transition);
    transition: var(--transition);
    position: relative;
  }

  .sound-switch__container::before {
    content: "";
    position: absolute;
    z-index: 1;
    inset: 0;
    -webkit-box-shadow:
      0em 0.05em 0.187em rgba(0, 0, 0, 0.25) inset,
      0em 0.05em 0.187em rgba(0, 0, 0, 0.25) inset;
    box-shadow:
      0em 0.05em 0.187em rgba(0, 0, 0, 0.25) inset,
      0em 0.05em 0.187em rgba(0, 0, 0, 0.25) inset;
    border-radius: var(--container-radius);
  }

  .sound-switch__checkbox {
    display: none;
  }

  .sound-switch__circle-container {
    width: var(--circle-container-diameter);
    height: var(--circle-container-diameter);
    background-color: rgba(255, 255, 255, 0.1);
    position: absolute;
    --circle-offset: calc(
      (var(--circle-container-diameter) - var(--container-height)) / 2 * -1
    );
    left: var(--circle-offset);
    top: var(--circle-offset);
    border-radius: var(--container-radius);
    -webkit-box-shadow:
      inset 0 0 0 3.375em rgba(255, 255, 255, 0.1),
      inset 0 0 0 3.375em rgba(255, 255, 255, 0.1),
      0 0 0 0.625em rgba(255, 255, 255, 0.1),
      0 0 0 1.25em rgba(255, 255, 255, 0.1);
    box-shadow:
      inset 0 0 0 3.375em rgba(255, 255, 255, 0.1),
      inset 0 0 0 3.375em rgba(255, 255, 255, 0.1),
      0 0 0 0.625em rgba(255, 255, 255, 0.1),
      0 0 0 1.25em rgba(255, 255, 255, 0.1);
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-transition: var(--circle-transition);
    -o-transition: var(--circle-transition);
    transition: var(--circle-transition);
    pointer-events: none;
  }

  .sound-switch__speaker-container {
    pointer-events: auto;
    position: relative;
    z-index: 2;
    width: var(--speaker-diameter);
    height: var(--speaker-diameter);
    margin: auto;
    border-radius: var(--container-radius);
    background-color: var(--speaker-bg);
    -webkit-box-shadow:
      0.062em 0.062em 0.062em 0em rgba(255, 255, 255, 0.61) inset,
      0em -0.062em 0.062em 0em rgba(0, 0, 0, 0.2) inset;
    box-shadow:
      0.062em 0.062em 0.062em 0em rgba(255, 255, 255, 0.61) inset,
      0em -0.062em 0.062em 0em rgba(0, 0, 0, 0.2) inset;
    -webkit-filter: drop-shadow(0.062em 0.125em 0.125em rgba(0, 0, 0, 0.25))
      drop-shadow(0em 0.062em 0.125em rgba(0, 0, 0, 0.25));
    filter: drop-shadow(0.062em 0.125em 0.125em rgba(0, 0, 0, 0.25))
      drop-shadow(0em 0.062em 0.125em rgba(0, 0, 0, 0.25));
    overflow: visible;
    -webkit-transition: var(--transition);
    -o-transition: var(--transition);
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sound-switch__speaker {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4a90e2;
    transition: var(--transition);
  }

  .sound-switch__speaker-icon {
    width: 1.2em;
    height: 1.2em;
  }

  .sound-switch__mute {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #36454f;
    opacity: 0;
    transform: scale(0) rotate(-90deg);
    transition: var(--transition);
  }

  .sound-switch__mute-icon {
    width: 1.3em;
    height: 1.3em;
  }

  .sound-switch__waves {
    position: absolute;
    right: 0.9em;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    gap: 0.25em;
    opacity: 1;
    transition: var(--transition);
  }

  .sound-switch__wave {
    width: 0.25em;
    background-color: var(--wave-color);
    border-radius: 0.125em;
    animation: wave 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .sound-switch__wave--1 {
    height: 0.75em;
    animation-delay: 0s;
  }

  .sound-switch__wave--2 {
    height: 1.25em;
    animation-delay: 0.2s;
  }

  .sound-switch__wave--3 {
    height: 1em;
    animation-delay: 0.4s;
  }

  @keyframes wave {
    0%,
    100% {
      transform: scaleY(0.6);
      opacity: 0.8;
    }
    50% {
      transform: scaleY(1);
      opacity: 1;
    }
  }

  /* Muted State */
  .sound-switch__checkbox:not(:checked) + .sound-switch__container {
    background-color: var(--container-mute-bg);
  }

  .sound-switch__checkbox:not(:checked)
    + .sound-switch__container
    .sound-switch__circle-container {
    left: calc(100% - var(--circle-offset) - var(--circle-container-diameter));
  }

  .sound-switch__checkbox:not(:checked)
    + .sound-switch__container
    .sound-switch__waves {
    opacity: 0;
    transform: translateY(-50%) translateX(1em);
  }

  .sound-switch__checkbox:not(:checked)
    + .sound-switch__container
    .sound-switch__mute {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }

  .sound-switch__checkbox:not(:checked)
    + .sound-switch__container
    .sound-switch__speaker {
    opacity: 0;
    transform: scale(0);
  }

  /* Hover Effects */
  .sound-switch__circle-container:hover {
    left: calc(var(--circle-offset) + 0.187em);
  }

  .sound-switch__checkbox:not(:checked)
    + .sound-switch__container
    .sound-switch__circle-container:hover {
    left: calc(
      100% - var(--circle-offset) - var(--circle-container-diameter) - 0.187em
    );
  }
`;

export default SoundToggle;
