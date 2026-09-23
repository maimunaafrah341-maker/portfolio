/**
 * Living Sketchbook style: motion is a whisper, not a performance.
 *
 * Every scroll-in on the site shares these three variants so the whole page
 * moves with one hand. Import them instead of writing inline `animate` objects
 * -- that keeps the timing consistent and makes it a one-file change if the
 * pacing ever feels wrong.
 *
 * Reduced-motion is handled globally by <MotionConfig reducedMotion="user"> in
 * App.tsx, so nothing here needs to check the media query itself.
 */
import type { Transition, Variants } from "framer-motion";

/**
 * The same easing curve index.css already uses for its CSS transitions
 * (cubic-bezier(.23, 1, .32, 1)) -- a quick start that settles gently.
 */
const sketchbookEase: Transition = {
  duration: 0.55,
  ease: [0.23, 1, 0.32, 1],
};

/** Fade + a short lift. The default for a block arriving on scroll. */
export const revealUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: sketchbookEase },
};

/**
 * Put this on a list. It animates nothing itself -- it only tells the children
 * marked with `revealChild` to arrive one after another rather than at once.
 */
export const revealStagger: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.05, staggerChildren: 0.08 } },
};

/** A child of `revealStagger`. The parent owns the timing; this owns the look. */
export const revealChild: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: sketchbookEase },
};

/**
 * Shared `viewport` prop for `whileInView`.
 *
 * `once: true` matters for performance: the IntersectionObserver is torn down
 * after the first trigger, so scrolling back up costs nothing and sections
 * never re-animate in the reader's face.
 *
 * `amount: 0.2` waits until a fifth of the block is on screen before starting,
 * which stops things firing while they are still below the fold.
 */
export const viewportOnce = { once: true, amount: 0.2 } as const;
