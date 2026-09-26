/**
 * Integrity tests.
 *
 * These are not unit tests of behaviour — they assert the things that have
 * actually broken this site, each of which shipped silently because a build
 * and a typecheck both pass happily while a page is quietly wrong:
 *
 *   - image files referenced by name that did not exist on disk
 *   - a route that worked when clicked but 404'd when the link was shared
 *   - a contact address with a typo in the TLD
 *   - an anchor link that scrolled to the wrong place
 *
 * They read the source as text on purpose. Importing the page modules would
 * drag in React, framer-motion and lucide just to read a few arrays, and would
 * fail for reasons that have nothing to do with what is being checked.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../../.."); // client/src/__tests__ -> repo root

const read = (p: string) => readFileSync(resolve(REPO, p), "utf-8");

const HOME = read("client/src/pages/Home.tsx");
const BLOG = read("client/src/pages/Blog.tsx");
const NOTFOUND = read("client/src/pages/NotFound.tsx");
const APP = read("client/src/App.tsx");
const INDEX_HTML = read("client/index.html");
const POSTS = read("client/src/content/posts.ts");
const ABOUT = read("client/src/pages/About.tsx");
const CSS_FILE = read("client/src/index.css");

/**
 * Drop comments before asserting on source. Comments legitimately contain the
 * very words these tests look for — an entry explaining why it has no `href`,
 * a doc comment mentioning `<time dateTime>` — and matching those is a false
 * positive every time.
 */
function section(source: string, from: string, to: string): string {
  const start = source.indexOf(from);
  const end = source.indexOf(to, start + from.length);
  if (start < 0) throw new Error(`section start not found: ${from}`);
  if (end < 0) throw new Error(`section end not found after start: ${to}`);
  return source.slice(start, end);
}

function stripComments(source: string): string {
  return source
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

/** Image paths as they appear in JSX, minus anything inside a comment. */
function imageRefs(source: string): string[] {
  return [...new Set(stripComments(source).match(/\/images\/[A-Za-z0-9_.-]+/g) ?? [])];
}

describe("image references", () => {
  const refs = [
    ...new Set([...imageRefs(HOME), ...imageRefs(BLOG), ...imageRefs(NOTFOUND)]),
  ];

  it("finds image references to check", () => {
    expect(refs.length).toBeGreaterThan(15);
  });

  it.each(refs)("%s exists in client/public", ref => {
    expect(existsSync(resolve(REPO, "client/public" + ref))).toBe(true);
  });

  it("has no leftover Manus hash-suffixed filenames", () => {
    // e.g. sunflower-watercolor_4e02bed1.jpeg — these never existed as files.
    const hashed = refs.filter(r => /_[0-9a-f]{8}\.(jpe?g|png)$/i.test(r));
    expect(hashed).toEqual([]);
  });

  it("ships no unused images", () => {
    const onDisk = readdirSync(resolve(REPO, "client/public/images")).filter(f =>
      /\.(jpe?g|png)$/i.test(f)
    );
    const unused = onDisk.filter(f => !refs.includes("/images/" + f));
    expect(unused).toEqual([]);
  });
});

describe("projects", () => {
  const block = HOME.slice(
    HOME.indexOf("const projects: Project[] = ["),
    HOME.indexOf("const filters:")
  );

  it("was located in the source", () => {
    expect(block.length).toBeGreaterThan(500);
  });

  it("gives every project an https link or an explanation for not having one", () => {
    // Athena is deliberately unlinked while it is private for SIH. Anything
    // unlinked must say why, or it just looks broken to a reader.
    const entries = block.split(/\n  \{\n/).slice(1);
    expect(entries.length).toBeGreaterThanOrEqual(6);
    for (const entry of entries) {
      const title = entry.match(/title: "([^"]+)"/)?.[1] ?? "(untitled)";
      const href = entry.match(/href: "([^"]+)"/)?.[1];
      if (href) {
        expect(href, `${title} href`).toMatch(/^https:\/\//);
        expect(() => new URL(href), `${title} href parses`).not.toThrow();
        expect(entry, `${title} needs a linkLabel`).toMatch(/linkLabel: "/);
      } else {
        expect(entry, `${title} has no href so it needs a note`).toMatch(/note: "/);
      }
    }
  });

  it("keeps Athena private", () => {
    const athena = block.slice(block.indexOf('title: "Athena"'));
    const entry = athena.slice(0, athena.indexOf("},"));
    // Strip comment lines first: the entry explains *why* it has no href, and
    // that explanation contains the word "href".
    const code = stripComments(entry);
    expect(code).not.toMatch(/^\s*href:/m);
    expect(code).toMatch(/note: "/);
  });

  it("warns about Render cold starts on every Render-hosted demo", () => {
    for (const entry of block.split(/\n  \{\n/).slice(1)) {
      if (entry.includes("onrender.com")) {
        expect(entry, "render project needs a cold-start note").toMatch(/note: "[^"]*wake/i);
      }
    }
  });
});

describe("contact details", () => {
  it("uses a well-formed email address", () => {
    // A ".con" typo lived here for a long time and silently ate every message.
    const email = HOME.match(/const contactEmail = "([^"]+)"/)?.[1];
    expect(email).toBeDefined();
    expect(email).toMatch(/^[^@\s]+@[^@\s]+\.(com|org|net|io|dev|in)$/);
  });

  it("never renders the personal address on the page", () => {
    // It used to print in full, where any harvester could take it. The form
    // delivers instead, so the address only has to exist for the mailto
    // fallback -- never in the markup.
    const contact = HOME.slice(HOME.indexOf('id="contact"'));
    expect(contact, "the address must not be printed as text").not.toMatch(
      /\{contactEmail\}/
    );
    expect(contact, "no visible mailto link either").not.toMatch(
      /href=\{`mailto:/
    );
  });

  it("offers LinkedIn and Instagram in the contact section", () => {
    const contact = HOME.slice(HOME.indexOf('id="contact"'));
    expect(contact).toMatch(/linkedin\.com/);
    expect(contact).toMatch(/instagram\.com/);
    expect(contact).toMatch(/pinterest\.com/);
  });
});

describe("contact form", () => {
  const handler = section(HOME, "const handleContact", "const navigateTo");

  it("posts to an endpoint rather than only opening a mail app", () => {
    // mailto silently does nothing for a visitor with no mail client, and the
    // sender never finds out the message was lost.
    expect(handler).toMatch(/await fetch\(CONTACT_FORM_ENDPOINT/);
    expect(handler).toMatch(/method: "POST"/);
  });

  it("still works before the endpoint is configured", () => {
    // CONTACT_FORM_ENDPOINT ships empty, so the old mailto path has to remain
    // as the fallback rather than the form doing nothing at all.
    expect(handler).toMatch(/if \(!CONTACT_FORM_ENDPOINT\)/);
    expect(handler).toMatch(/mailto:\$\{contactEmail\}/);
  });

  it("never swallows a send failure", () => {
    // The one outcome that must never be silent.
    expect(handler).toMatch(/setSendState\("error"\)/);
    expect(handler).toMatch(/if \(!response\.ok\) throw/);

    // and the error state has to give the visitor somewhere else to go
    const form = section(HOME, 'className="form-status"', "</motion.form>");
    expect(form).toMatch(/is-error/);
    expect(form).toMatch(/linkedin\.com/);
    expect(form).toMatch(/instagram\.com/);
  });

  it("reports sending, and cannot be double-submitted", () => {
    const form = section(HOME, "<motion.form", "</motion.form>");
    expect(form).toMatch(/disabled=\{sendState === "sending"\}/);
    expect(form).toMatch(/sendState === "sending" \? "Sending/);
    expect(form).toMatch(/aria-live="polite"/);
  });

  it("carries a honeypot that real people cannot fill", () => {
    const form = section(HOME, "<motion.form", "</motion.form>");
    expect(form).toMatch(/name="company"/);
    expect(form).toMatch(/tabIndex=\{-1\}/);
    expect(handler).toMatch(/values\.get\("company"\)/);

    // off-screen, not display:none, which some bots skip
    const rule = CSS_FILE.match(/\.form-honeypot \{[^}]*\}/)?.[0] ?? "";
    expect(rule).toMatch(/left: -9999px/);
    expect(rule).not.toMatch(/display:\s*none/);
  });
});

describe("routing", () => {
  it("registers the /blog and /about routes", () => {
    expect(APP).toMatch(/path="\/blog"/);
    expect(APP).toMatch(/import Blog from/);
    expect(APP).toMatch(/path="\/about"/);
    expect(APP).toMatch(/import About from/);
  });

  it("has a Vercel rewrite so deep links do not 404", () => {
    // /blog worked when clicked but returned 404 when opened directly, because
    // only / is a real file on the host.
    const cfg = JSON.parse(read("vercel.json"));
    const rule = cfg.rewrites?.[0];
    expect(rule?.destination).toBe("/index.html");

    const re = new RegExp("^" + rule.source + "$");
    expect(re.test("/blog"), "/blog should be rewritten to the app").toBe(true);
    expect(re.test("/assets/index-abc.js"), "assets must be served from disk").toBe(false);
    expect(re.test("/images/butterfly-mark.png"), "images must be served from disk").toBe(false);
  });
});

describe("journal", () => {
  it("gives every post a unique slug", () => {
    const slugs = [...POSTS.matchAll(/^\s{4}slug: "([^"]+)"/gm)].map(m => m[1]);
    expect(slugs.length).toBeGreaterThan(0);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("anchors each post so a single post can be linked to", () => {
    expect(BLOG).toMatch(/id=\{post\.slug\}/);
    // and the mount effect must not stomp on that hash
    expect(BLOG).toMatch(/window\.location\.hash/);
  });

  it("keeps developer instructions off the public page", () => {
    // A note reading "edit the posts array in client/src/pages/Blog.tsx" was
    // rendering to every visitor. Source paths belong in comments, not JSX.
    const visible = stripComments(BLOG.slice(BLOG.indexOf("return (")))
      .replace(/className="[^"]*"/g, "")
      .replace(/(?:href|src|id|alt|aria-label)=\{?"[^"]*"\}?/g, "");
    expect(visible).not.toMatch(/client\/src/);
    expect(visible).not.toMatch(/\.tsx/);
  });

  it("keeps posts in a data file with no JSX in it", () => {
    // Adding a post should not mean editing a component.
    expect(POSTS).toMatch(/export const posts: BlogPost\[\] = \[/);
    expect(stripComments(POSTS)).not.toMatch(/<[A-Za-z]/);
    expect(BLOG).toMatch(/import \{ posts \} from "@\/content\/posts"/);
  });

  it("gives every post an ISO date", () => {
    for (const [, d] of POSTS.matchAll(/^\s{4}date: "([^"]+)"/gm)) {
      expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(d))).toBe(false);
    }
  });
});

describe("prose", () => {
  it("uses no em dashes in anything a visitor reads", () => {
    // A stated preference. Comments and internal docs are left alone; this is
    // about the rendered page, the tab title and the link-preview text.
    const EM_DASH = "\u2014";
    for (const [name, source] of [
      ["Home", stripComments(HOME)],
      ["Blog", stripComments(BLOG)],
      ["NotFound", stripComments(NOTFOUND)],
      ["About", stripComments(ABOUT)],
      ["posts", stripComments(POSTS)],
      ["index.html", INDEX_HTML.replace(/<!--[\s\S]*?-->/g, "")],
    ] as const) {
      expect(source, `${name} should contain no em dash`).not.toContain(EM_DASH);
    }
  });

  it("numbers each page's sections in order with no gaps", () => {
    // Moving About and the essay to /about renumbered what was left behind.
    const numbering = (source: string) =>
      [...source.matchAll(/<span>(\d{2})<\/span><i>/g)].map(m => Number(m[1]));

    for (const [name, source, least] of [
      ["Home", HOME, 4],
      ["About", ABOUT, 2],
    ] as const) {
      const numbers = numbering(source);
      expect(numbers.length, `${name} section count`).toBeGreaterThanOrEqual(least);
      expect(numbers, `${name} numbering`).toEqual(numbers.map((_, i) => i + 1));
    }
  });

  it("keeps the butterfly piece, now on /about", () => {
    // The one piece of writing on the site that is hers rather than drafted
    // for her. It moved off the home page so a visitor reaches the work first.
    expect(ABOUT).toMatch(/id="butterflies"/);
    expect(ABOUT).toMatch(/Freedom has always been symbolised by a bird/);
    expect(ABOUT).toMatch(/in the process of becoming free/);
    expect(HOME, "the essay should no longer be on the home page").not.toMatch(
      /Freedom has always been symbolised by a bird/
    );
  });

  it("states credentials without inflating them", () => {
    // Every one of these came off a certificate. Participation must not be
    // written up as a placing.
    const block = section(HOME, "const credentials = [", "const projects");
    expect(block).toMatch(/Tata, via Forage/);
    expect(block).toMatch(/Wadhwani Foundation/);
    expect(block).toMatch(/Forge Alumnus Services/);
    expect(block).toMatch(/IIT Hyderabad/);
    // the blank Design-a-thon template and the one-hour workshop stay out
    expect(block).not.toMatch(/Design-a-thon/i);
    expect(block).not.toMatch(/Canva/i);
  });

  it("puts recognition first on the home page", () => {
    // The whole reason About moved: accomplishments should not sit behind two
    // long prose sections.
    const recognition = HOME.indexOf('id="recognition"');
    const art = HOME.indexOf('id="art"');
    const projects = HOME.indexOf('id="projects"');
    expect(recognition).toBeGreaterThan(-1);
    expect(recognition).toBeLessThan(art);
    expect(art).toBeLessThan(projects);
  });
});

describe("page transition", () => {
  const TURN = read("client/src/components/PageTransition.tsx");
  const CSS = read("client/src/index.css");

  it("covers the screen, swaps the route, then uncovers", () => {
    // The whole point: the new page must not be visible arriving. An earlier
    // version flew butterflies over a page that had already loaded, which is
    // a decoration rather than a transition.
    const navigate = section(TURN, "const navigate = useCallback", "/** Screen is fully covered");
    const covered = section(TURN, "const handleCovered", "<NavigateContext.Provider");

    // Clicking a link starts the sweep; it does not navigate.
    expect(navigate).toMatch(/setPhase\("covering"\)/);
    // ...except when motion is reduced, where it goes straight there.
    expect(navigate).toMatch(/if \(reduceMotion\) \{[\s\S]*?setLocation\(href\);/);

    // The route changes only once the paper has the screen covered.
    expect(covered).toMatch(/setLocation\(href\)/);
    expect(covered).toMatch(/setPhase\("revealing"\)/);
  });

  it("moves slowly enough to read as a page being turned", () => {
    // Encoded from direct feedback: the first version glided across too fast.
    const seconds = (name: string) =>
      Number(TURN.match(new RegExp("const " + name + " = ([0-9.]+);"))?.[1]);
    expect(seconds("COVER_SECONDS")).toBeGreaterThanOrEqual(0.9);
    expect(seconds("REVEAL_SECONDS")).toBeGreaterThanOrEqual(0.9);
  });

  it("draws butterflies big enough to see", () => {
    // Also from feedback: the first flock was too small.
    const sizes = [...TURN.matchAll(/size: (\d+)/g)].map(m => Number(m[1]));
    expect(sizes.length).toBeGreaterThan(5);
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(36);
    expect(Math.max(...sizes)).toBeGreaterThanOrEqual(60);
  });

  it("is skipped entirely under prefers-reduced-motion", () => {
    // MotionConfig reducedMotion="user" only strips transforms; a two-second
    // covered sweep has to not happen at all.
    expect(TURN).toMatch(/useReducedMotion/);
    expect(TURN).toMatch(/if \(reduceMotion\)/);
  });

  it("leaves new-tab clicks alone", () => {
    // Hijacking cmd/ctrl-click would be worse than having no animation.
    const handler = section(TURN, "const handleClick", "return (");
    for (const key of ["metaKey", "ctrlKey", "shiftKey", "altKey"]) {
      expect(handler, `handleClick should bail on ${key}`).toContain(key);
    }
    expect(handler).toMatch(/event\.button !== 0/);
  });

  it("covers everything, including the artwork lightbox", () => {
    // Slice the rule out by hand rather than building a regex from a string:
    // the escaping needed to survive a selector inside a RegExp constructor is
    // exactly the kind that silently degrades into a pattern matching nothing.
    const zIndexOf = (selector: string) => {
      const start = CSS.indexOf(selector + " {");
      expect(start, `${selector} rule not found`).toBeGreaterThan(-1);
      const rule = CSS.slice(start, CSS.indexOf("}", start));
      const value = rule.match(/z-index:\s*(\d+)/)?.[1];
      expect(value, `${selector} has no z-index`).toBeDefined();
      return Number(value);
    };

    expect(zIndexOf(".page-turn")).toBeGreaterThan(zIndexOf(".site-header"));
    expect(zIndexOf(".page-turn")).toBeGreaterThan(zIndexOf(".art-dialog-backdrop"));
  });

  it("is mounted once, wrapping the whole app", () => {
    expect(APP).toMatch(/<PageTransitionProvider>/);
    expect(APP).toMatch(/import \{ PageTransitionProvider \}/);
  });

  it("routes every internal link through it", () => {
    // Each page aliases ButterflyLink as Link, so no page should still be
    // importing wouter's Link and navigating instantly.
    for (const [name, source] of [["Home", HOME], ["Blog", BLOG], ["NotFound", NOTFOUND]] as const) {
      expect(source, `${name} should not import wouter's Link`).not.toMatch(
        /import \{ Link \} from "wouter"/
      );
      expect(source, `${name} should use ButterflyLink`).toMatch(
        /import \{ ButterflyLink as Link \}/
      );
    }
    expect(ABOUT).toMatch(/import \{ ButterflyLink as Link \}/);
    {
    }
  });
});

describe("link previews", () => {
  it("declares the tags a shared link needs", () => {
    for (const tag of [
      'property="og:title"',
      'property="og:description"',
      'property="og:image"',
      'property="og:url"',
      'name="twitter:card"',
      'rel="canonical"',
    ]) {
      expect(INDEX_HTML, `index.html missing ${tag}`).toContain(tag);
    }
  });

  it("points og:image at a file that exists and is absolute", () => {
    const src = INDEX_HTML.match(/property="og:image" content="([^"]+)"/)?.[1];
    expect(src).toMatch(/^https:\/\//); // relative og:image is ignored by crawlers
    const file = src!.replace(/^https:\/\/[^/]+/, "");
    expect(existsSync(resolve(REPO, "client/public" + file))).toBe(true);
  });

  it("ships every favicon it references", () => {
    const hrefs = [...INDEX_HTML.matchAll(/rel="(?:icon|apple-touch-icon)"[^>]*href="([^"]+)"/g)]
      .map(m => m[1]);
    expect(hrefs.length).toBeGreaterThanOrEqual(2);
    for (const h of hrefs) {
      expect(existsSync(resolve(REPO, "client/public" + h)), `${h} missing`).toBe(true);
    }
  });
});
