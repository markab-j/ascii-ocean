"use client";

import { useEffect, useRef } from "react";
import { OceanEngine } from "./engine";
import type { CreatureSpec, SharkSpec } from "./world";
import type { OceanOptions } from "./options";

/** Glyphs come from the canvas's font-family, so give it (or a parent) a monospace font. */
export function AsciiOcean({ className, sharks, creatures, options }: { className?: string; sharks?: SharkSpec[]; creatures?: CreatureSpec[]; options?: OceanOptions }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<OceanEngine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new OceanEngine(canvas, creatures ?? sharks, options);
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
    // Live roster and appearance updates are handled by their effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    engineRef.current?.setCreatures(creatures ?? sharks);
  }, [creatures, sharks]);

  useEffect(() => {
    engineRef.current?.setOptions({ theme: "dark", glyphs: "ascii", neon: false, ...options, waves: { style: "calm", direction: 90, plankton: false, ...options?.waves } });
  }, [options]);

  return <canvas ref={canvasRef} aria-hidden="true" className={`ascii-ocean ${className ?? ""}`} />;
}
