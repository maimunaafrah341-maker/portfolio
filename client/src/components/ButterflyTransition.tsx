/**
 * Living Sketchbook style: a flock crosses the paper whenever the route
 * changes, so pressing "Journal" or "Go to projects" sends green butterflies
 * across the page and the new one is waiting behind them.
 *
 * Two deliberate decisions:
 *
 * 1. It listens for the route change rather than being wired into each link.
 *    That means every route change gets it -- nav, footer, the 404 buttons,
 *    browser back/forward -- and no link has to know this component exists.
 *
 * 2. It never blocks navigation. The page has already swapped by the time the
 *    first wing appears; the flock is a flourish over the top, not a gate in
 *    front. A transition you have to wait for stops being charming on the
 *    third click.
 *
 * The butterflies are inline SVG rather than an image: a few hundred bytes,
 * no network request, and they scale cleanly at any size.
 */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocation } from "wouter";

/** Greens pulled from the site's palette and from the Green Beauty artwork. */
const GREENS = ["#0d6b67", "#2f5d4a", "#4f8f74", "#a7ddd2", "#1f7a63"];

type Flyer = {
  top: string;
  size: number;
  delay: number;
  duration: number;
  /** Vertical drift across the flight, in px. Negative rises. */
  drift: number;
  tilt: number;
  flap: number;
  colour: string;
  opacity: number;
};

/**
 * Fixed rather than random: a random flock re-rolls on every render and can
 * deal itself a bad hand (all nine in one band). These are spread by hand.
 */
const FLOCK: Flyer[] = [
  { top: "14%", size: 26, delay: 0.0, duration: 1.05, drift: -48, tilt: -8, flap: 0.3, colour: GREENS[0], opacity: 1 },
  { top: "29%", size: 19, delay: 0.09, duration: 1.15, drift: -30, tilt: 6, flap: 0.36, colour: GREENS[3], opacity: 0.85 },
  { top: "47%", size: 33, delay: 0.04, duration: 0.92, drift: -62, tilt: -12, flap: 0.27, colour: GREENS[1], opacity: 1 },
  { top: "62%", size: 22, delay: 0.16, duration: 1.1, drift: -38, tilt: 9, flap: 0.33, colour: GREENS[2], opacity: 0.95 },
  { top: "78%", size: 29, delay: 0.02, duration: 0.98, drift: -70, tilt: -6, flap: 0.29, colour: GREENS[4], opacity: 1 },
  { top: "8%", size: 17, delay: 0.22, duration: 1.2, drift: -22, tilt: 11, flap: 0.38, colour: GREENS[3], opacity: 0.8 },
  { top: "38%", size: 15, delay: 0.25, duration: 1.12, drift: -18, tilt: -10, flap: 0.41, colour: GREENS[2], opacity: 0.75 },
  { top: "55%", size: 24, delay: 0.12, duration: 1.0, drift: -52, tilt: 4, flap: 0.31, colour: GREENS[0], opacity: 0.95 },
  { top: "70%", size: 18, delay: 0.2, duration: 1.18, drift: -26, tilt: -7, flap: 0.35, colour: GREENS[1], opacity: 0.85 },
  { top: "88%", size: 21, delay: 0.14, duration: 1.06, drift: -44, tilt: 8, flap: 0.32, colour: GREENS[4], opacity: 0.9 },
  { top: "21%", size: 31, delay: 0.18, duration: 0.95, drift: -58, tilt: -4, flap: 0.28, colour: GREENS[1], opacity: 1 },
];

/** Longest delay + longest flight, plus a little slack before unmounting. */
const FLIGHT_MS = 1500;

function Butterfly({ size, colour }: { size: number; colour: string }) {
  return (
    <svg
      width={size}
      height={size * 0.82}
      viewBox="0 0 44 36"
      fill="none"
      aria-hidden="true"
    >
      <g stroke="#182722" strokeWidth="1.1" strokeLinejoin="round">
        <path d="M22 20 C16 4 4 2 3 11 C2 18 12 21 22 20 Z" fill={colour} fillOpacity="0.85" />
        <path d="M22 20 C28 4 40 2 41 11 C42 18 32 21 22 20 Z" fill={colour} fillOpacity="0.85" />
        <path d="M22 20 C18 28 10 33 7 27 C5 22 14 20 22 20 Z" fill={colour} fillOpacity="0.6" />
        <path d="M22 20 C26 28 34 33 37 27 C39 22 30 20 22 20 Z" fill={colour} fillOpacity="0.6" />
      </g>
      <ellipse cx="22" cy="20" rx="1.4" ry="6.5" fill="#182722" />
      <path d="M21.2 13.6 C19.4 9 16.6 7 15.4 6.2" stroke="#182722" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M22.8 13.6 C24.6 9 27.4 7 28.6 6.2" stroke="#182722" strokeWidth="0.9" strokeLinecap="round" />
    </svg>
  );
}

export default function ButterflyTransition() {
  const [location] = useLocation();
  const reduceMotion = useReducedMotion();
  const [flightId, setFlightId] = useState(0);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Don't fly on first paint -- that is an arrival, not a transition.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // A flock sweeping the viewport is exactly what "reduce motion" is for.
    // MotionConfig's reducedMotion="user" only strips transforms; this needs
    // to not happen at all.
    if (reduceMotion) return;

    setFlightId(id => id + 1);
  }, [location, reduceMotion]);

  useEffect(() => {
    if (flightId === 0) return;
    const timer = setTimeout(() => setFlightId(0), FLIGHT_MS);
    return () => clearTimeout(timer);
  }, [flightId]);

  return (
    <AnimatePresence>
      {flightId > 0 && (
        <div className="butterfly-flight" key={flightId} aria-hidden="true">
          {FLOCK.map((b, i) => (
            <motion.span
              key={i}
              style={{ top: b.top }}
              initial={{ x: "-14vw", y: 0, rotate: b.tilt, opacity: 0 }}
              animate={{
                x: "116vw",
                y: b.drift,
                rotate: b.tilt * -1,
                opacity: [0, b.opacity, b.opacity, 0],
              }}
              transition={{
                duration: b.duration,
                delay: b.delay,
                ease: "easeInOut",
                // Fade in and out at the edges so nothing pops at the margins.
                opacity: {
                  duration: b.duration,
                  delay: b.delay,
                  times: [0, 0.14, 0.8, 1],
                },
              }}
            >
              {/* Squashing the whole sprite horizontally reads as wing-flap at
                  this size, and keeps the flight path on the parent so the two
                  transforms never fight. */}
              <motion.span
                style={{ display: "block" }}
                animate={{ scaleX: [1, 0.3, 1] }}
                transition={{ duration: b.flap, repeat: Infinity, ease: "easeInOut" }}
              >
                <Butterfly size={b.size} colour={b.colour} />
              </motion.span>
            </motion.span>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
