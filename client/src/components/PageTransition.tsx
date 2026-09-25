/**
 * Living Sketchbook style: butterflies carry the page open.
 *
 * Pressing an internal link does not navigate straight away. A sheet of paper
 * sweeps in from the left with a flock of green butterflies riding its leading
 * edge; once the screen is covered the route actually changes underneath, and
 * the sheet keeps travelling off to the right, uncovering the new page.
 *
 * So the order is: cover -> swap -> reveal. The swap is never seen, which is
 * the whole point — the butterflies are what opens the new page, rather than a
 * decoration flying over one that already loaded.
 *
 * Navigation goes through `ButterflyLink`, which is a drop-in for wouter's
 * `Link`. Pages import it aliased as `Link`, so every internal link picks this
 * up without any other change.
 */
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocation } from "wouter";

/** Slow on purpose. The sweep should feel like a page being turned by hand. */
const COVER_SECONDS = 1.05;
const REVEAL_SECONDS = 1.0;
/** A beat at full cover, so the sheet settles before it draws back. */
const HOLD_SECONDS = 0.18;

/** Deliberate, not bouncy — this is paper moving, not a spring. */
const PAPER_EASE = [0.42, 0, 0.22, 1] as const;

type Phase = "idle" | "covering" | "revealing";

type Flyer = {
  /** Vertical position across the sheet. */
  top: string;
  /** Horizontal position relative to the sheet's leading (right) edge. Over
   *  100% means the butterfly flies ahead of the paper. */
  left: string;
  size: number;
  /** How far it bobs up and down while travelling, in px. */
  bob: number;
  /** Seconds per bob and per wing-beat. */
  bobSeconds: number;
  flapSeconds: number;
  tilt: number;
  deep: string;
  light: string;
  spot: string;
};

const TEAL = "#1f7a63";
const TEAL_DEEP = "#0d6b67";
const MOSS = "#2f5d4a";
const PALE = "#a7ddd2";
const MIST = "#cfe0d9";
const GOLD = "#c88f1f";

/**
 * Hand-placed rather than random: a random flock re-rolls every render and can
 * deal itself all of them in one band.
 */
const FLOCK: Flyer[] = [
  { top: "12%", left: "97%", size: 64, bob: 26, bobSeconds: 1.9, flapSeconds: 1.05, tilt: -9, deep: TEAL_DEEP, light: PALE, spot: GOLD },
  { top: "27%", left: "103%", size: 46, bob: 20, bobSeconds: 1.5, flapSeconds: 0.92, tilt: 7, deep: TEAL, light: MIST, spot: PALE },
  { top: "41%", left: "93%", size: 72, bob: 32, bobSeconds: 2.2, flapSeconds: 1.2, tilt: -5, deep: MOSS, light: PALE, spot: GOLD },
  { top: "56%", left: "105%", size: 52, bob: 22, bobSeconds: 1.7, flapSeconds: 0.98, tilt: 10, deep: TEAL_DEEP, light: MIST, spot: PALE },
  { top: "70%", left: "95%", size: 60, bob: 28, bobSeconds: 2.0, flapSeconds: 1.12, tilt: -7, deep: TEAL, light: PALE, spot: GOLD },
  { top: "85%", left: "101%", size: 44, bob: 18, bobSeconds: 1.6, flapSeconds: 0.88, tilt: 6, deep: MOSS, light: MIST, spot: PALE },
  { top: "19%", left: "89%", size: 38, bob: 16, bobSeconds: 1.4, flapSeconds: 0.84, tilt: 12, deep: TEAL, light: PALE, spot: GOLD },
  { top: "63%", left: "88%", size: 41, bob: 19, bobSeconds: 1.8, flapSeconds: 1.0, tilt: -11, deep: TEAL_DEEP, light: MIST, spot: PALE },
  { top: "34%", left: "108%", size: 40, bob: 24, bobSeconds: 1.55, flapSeconds: 0.9, tilt: 4, deep: MOSS, light: PALE, spot: GOLD },
];

function Wing({ deep, light, spot }: { deep: string; light: string; spot: string }) {
  return (
    <g stroke="#182722" strokeWidth="1.2" strokeLinejoin="round">
      {/* lower wing sits behind, so it is drawn first */}
      <path d="M31 30 C25 37 15 48 9 42 C4 36 16 31 31 30 Z" fill={deep} fillOpacity="0.55" />
      <path d="M31 26 C24 6 8 0 4 11 C0 21 12 28 31 30 Z" fill={deep} />
      <path d="M31 27 C26 14 16 8 12 14 C9 20 18 26 31 29 Z" fill={light} fillOpacity="0.85" stroke="none" />
      <circle cx="13" cy="12" r="2.6" fill={light} />
      <circle cx="20" cy="19" r="1.7" fill="none" />
      <circle cx="14" cy="38" r="2" fill={spot} />
    </g>
  );
}

function Butterfly({ size, deep, light, spot }: { size: number; deep: string; light: string; spot: string }) {
  return (
    <svg width={size} height={size * (56 / 64)} viewBox="0 0 64 56" fill="none" aria-hidden="true">
      <Wing deep={deep} light={light} spot={spot} />
      {/* the same wing mirrored: x maps to 64 - x */}
      <g transform="translate(64,0) scale(-1,1)">
        <Wing deep={deep} light={light} spot={spot} />
      </g>
      <ellipse cx="32" cy="30" rx="2.1" ry="11" fill="#182722" />
      <circle cx="32" cy="19" r="2.6" fill="#182722" />
      <g stroke="#182722" strokeWidth="1" strokeLinecap="round" fill="none">
        <path d="M30.6 17.5 C27 10 22 7 19.5 5.6" />
        <path d="M33.4 17.5 C37 10 42 7 44.5 5.6" />
      </g>
      <circle cx="19.5" cy="5.6" r="1.5" fill="#182722" />
      <circle cx="44.5" cy="5.6" r="1.5" fill="#182722" />
    </svg>
  );
}

const NavigateContext = createContext<(href: string) => void>(() => {});

/**
 * Drop-in for wouter's `Link`. Pages import it as `Link`, so swapping the
 * import is the only change a page needs.
 */
export function ButterflyLink({
  href,
  children,
  onClick,
  ...rest
}: { href: string; children: ReactNode } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const navigate = useContext(NavigateContext);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    // Leave cmd/ctrl/shift-click and middle-click alone: those mean "open in a
    // new tab", and hijacking them would be worse than having no animation.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (event.button !== 0) return;

    event.preventDefault();
    navigate(href);
  };

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const pending = useRef<string | null>(null);
  const phaseRef = useRef<Phase>("idle");
  phaseRef.current = phase;

  const navigate = useCallback(
    (href: string) => {
      // A two-second covered sweep is exactly what "reduce motion" is for.
      if (reduceMotion) {
        setLocation(href);
        return;
      }
      // Already mid-sweep, or already here.
      if (phaseRef.current !== "idle") return;
      if (href === location) return;

      pending.current = href;
      setPhase("covering");
    },
    [location, reduceMotion, setLocation]
  );

  /** Screen is fully covered: swap the route where nobody can see it happen. */
  const handleCovered = () => {
    const href = pending.current;
    pending.current = null;

    if (href) {
      setLocation(href);

      // Start the new page at the top unless it was asked for by anchor.
      // index.css sets `html { scroll-behavior: smooth }`, which would still be
      // gliding when the sheet draws back.
      if (!href.includes("#")) {
        const root = document.documentElement;
        const previous = root.style.scrollBehavior;
        root.style.scrollBehavior = "auto";
        window.scrollTo(0, 0);
        root.style.scrollBehavior = previous;
      }
    }

    setPhase("revealing");
  };

  return (
    <NavigateContext.Provider value={navigate}>
      {children}

      <AnimatePresence>
        {phase !== "idle" && (
          <motion.div
            className="page-turn"
            aria-hidden="true"
            initial={{ x: "-102%" }}
            animate={{ x: phase === "covering" ? "0%" : "102%" }}
            transition={{
              duration: phase === "covering" ? COVER_SECONDS : REVEAL_SECONDS,
              delay: phase === "covering" ? 0 : HOLD_SECONDS,
              ease: PAPER_EASE,
            }}
            onAnimationComplete={() => {
              if (phaseRef.current === "covering") handleCovered();
              else setPhase("idle");
            }}
          >
            <div className="page-turn-sheet" />

            {FLOCK.map((flyer, i) => (
              <motion.span
                key={i}
                className="page-turn-flyer"
                style={{ top: flyer.top, left: flyer.left }}
                animate={{ y: [0, -flyer.bob, 0, flyer.bob * 0.6, 0] }}
                transition={{
                  duration: flyer.bobSeconds,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {/* Squashing the sprite horizontally reads as a wing-beat, and
                    keeps the flap off the element that carries the drift, so
                    the two transforms never overwrite each other. */}
                <motion.span
                  style={{ display: "block", rotate: flyer.tilt }}
                  animate={{ scaleX: [1, 0.62, 1] }}
                  transition={{
                    duration: flyer.flapSeconds,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Butterfly
                    size={flyer.size}
                    deep={flyer.deep}
                    light={flyer.light}
                    spot={flyer.spot}
                  />
                </motion.span>
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </NavigateContext.Provider>
  );
}
