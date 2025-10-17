"use client";

import { useEffect, useRef } from "react";

type DonutBackgroundProps = {
  children?: React.ReactNode;
  width?: number;
  height?: number;
  speed?: number;
};

export function DonutBackground({
  children,
  width = 80,
  height = 30,
  speed = 1.0,
}: DonutBackgroundProps) {
  return (
    <div
      style={{
        position: "relative",
        display: "grid",
        placeItems: "center",
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "#eaeaea",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          opacity: 0.3,
          pointerEvents: "none",
        }}
      >
        <Donut width={width} height={height} speed={speed} />
      </div>
      <div style={{ position: "relative", zIndex: 10 }}>{children}</div>
    </div>
  );
}

type DonutProps = {
  width?: number;
  height?: number;
  speed?: number;
};

function Donut({ width = 80, height = 30, speed = 1.0 }: DonutProps) {
  const preRef = useRef<HTMLPreElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const ARef = useRef(0);
  const BRef = useRef(0);

  useEffect(() => {
    const pre = preRef.current!;
    const chars = ".,-~:;=!*#$@";
    const R1 = 1;
    const R2 = 2;
    const K2 = 5;
    const K1 = (width * K2 * 3) / (8 * (R1 + R2));

    let last = performance.now();

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000) * speed;
      last = now;

      ARef.current += 0.7 * dt;
      BRef.current += 1.0 * dt;

      const A = ARef.current;
      const B = BRef.current;

      const zbuf = new Float32Array(width * height).fill(0);
      const output = Array.from({ length: width * height }, () => " ");

      const cA = Math.cos(A),
        sA = Math.sin(A);
      const cB = Math.cos(B),
        sB = Math.sin(B);

      const thetaStep = 0.07;
      const phiStep = 0.02;

      for (let theta = 0; theta < 2 * Math.PI; theta += thetaStep) {
        const ct = Math.cos(theta),
          st = Math.sin(theta);
        for (let phi = 0; phi < 2 * Math.PI; phi += phiStep) {
          const cp = Math.cos(phi),
            sp = Math.sin(phi);

          const circleX = R2 + R1 * ct;
          const circleY = R1 * st;

          const x = circleX * (cB * cp + sA * sB * sp) - circleY * cA * sB;
          const y = circleX * (sB * cp - sA * cB * sp) + circleY * cA * cB;
          const z = K2 + cA * circleX * sp + circleY * sA;
          const ooz = 1 / z;

          const xp = Math.floor(width / 2 + K1 * ooz * x);
          const yp = Math.floor(height / 2 - K1 * ooz * y * 0.5);

          if (xp < 0 || xp >= width || yp < 0 || yp >= height) continue;

          const L =
            cp * ct * sB -
            cA * ct * sp -
            sA * st +
            cB * (cA * st - ct * sA * sp);

          if (L > 0) {
            const idx = xp + yp * width;
            if (ooz > zbuf[idx]) {
              zbuf[idx] = ooz;
              const luminanceIndex = Math.min(
                chars.length - 1,
                Math.floor(L * 8),
              );
              output[idx] = chars[luminanceIndex];
            }
          }
        }
      }

      let frameStr = "";
      for (let r = 0; r < height; r++) {
        frameStr += output.slice(r * width, (r + 1) * width).join("") + "\n";
      }
      pre.textContent = frameStr;

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [width, height, speed]);

  return (
    <pre
      ref={preRef}
      aria-label="ASCII spinning donut background animation"
      style={{
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
        lineHeight: 1,
        letterSpacing: 0,
        margin: 0,
        padding: "12px",
        userSelect: "none",
        whiteSpace: "pre",
        color: "#00ff41",
      }}
    />
  );
}
