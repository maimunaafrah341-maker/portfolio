/**
 * Journal posts — data only.
 *
 * There is no layout or JSX in this file, so adding a post cannot break the
 * page. Copy the commented template at the bottom, fill it in, save.
 *
 * Order matters: the array is rendered top to bottom, so the newest note goes
 * first and is numbered 01.
 */

export type BlogPost = {
  /** Stable id. Doubles as the in-page anchor, e.g. /blog#hackwave-3-top-20 */
  slug: string;
  /** The small teal chip: "Hackathon", "Project launch", "Feature", ... */
  kind: string;
  title: string;
  /** ISO 8601 -- machine readable, used by <time dateTime>. */
  date: string;
  /** What the reader actually sees. */
  dateLabel: string;
  /** One-line standfirst, set slightly larger than the body. */
  summary: string;
  /** One string per paragraph. */
  body: string[];
  tags: string[];
  /** Usually the LinkedIn post this note is expanding on. Optional. */
  href?: string;
  linkLabel?: string;
};

export const posts: BlogPost[] = [
  // ---------------------------------------------------------------------
  // SAMPLE POST -- the shape to copy. The dates are yours; the prose is still a
  // placeholder written in your voice, so rewrite it before this goes anywhere.
  // ---------------------------------------------------------------------
  {
    slug: "hackwave-3-top-20",
    kind: "Hackathon",
    date: "2026-09-04",
    dateLabel: "4–5 September 2026",
    title: "HazardWatch OS finished top 20 of 126 at Hackwave 3.0",
    summary:
      "Two days spent learning that the hard part of an alarm is deciding when not to ring it.",
    body: [
      "A camera watches a bay. Somebody walks in without a hardhat. Nobody presses anything. A few seconds later there is an open incident, a spoken warning in the language of the person actually standing there, and a record an inspector could sign. That was the whole pitch for HazardWatch OS, and we had two days to make it true.",
      "The detection was the part we expected to be difficult. It wasn't. Restraint was. A system that shouts at every flicker is a system people switch off in a week, so a detection now has to hold across three of eight frames before anything happens at all. The safety protocols are fixed text chosen by chemical and event type, never written by a model, because an evacuation instruction is not a place for a plausible guess.",
      "The multilingual part ships as pre-translated phrase tables rather than live translation, for the same reason. Hindi, Telugu, Bengali. A warning that arrives late and fluent is worse than one that arrives instantly and plain.",
      "We placed in the top 20 out of 126 teams. What stayed with me was less the ranking than the shape of the problem: almost all the real work was in the decision not to act.",
    ],
    tags: ["Python", "FastAPI", "YOLO", "Hackwave 3.0"],
    href: "https://www.linkedin.com/in/maimuna-afrah-2b41b63a0",
    linkLabel: "Read the LinkedIn post",
  },

  // Copy this block for the next note:
  // {
  //   slug: "unique-kebab-case-id",
  //   kind: "Project launch",
  //   date: "2026-01-15",
  //   dateLabel: "January 2026",
  //   title: "Something you shipped",
  //   summary: "One sentence that makes a reader want the rest.",
  //   body: ["First paragraph.", "Second paragraph."],
  //   tags: ["Tag", "Tag"],
  //   href: "https://www.linkedin.com/posts/...",
  //   linkLabel: "Read the LinkedIn post",
  // },
];
