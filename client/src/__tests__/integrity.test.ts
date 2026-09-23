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

/** Image paths as they appear in JSX, minus anything inside a comment. */
function imageRefs(source: string): string[] {
  const withoutComments = source
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  return [...new Set(withoutComments.match(/\/images\/[A-Za-z0-9_.-]+/g) ?? [])];
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
    const code = entry.replace(/^\s*\/\/.*$/gm, "");
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

  it("offers LinkedIn and Instagram in the contact section", () => {
    const contact = HOME.slice(HOME.indexOf('id="contact"'));
    expect(contact).toMatch(/linkedin\.com/);
    expect(contact).toMatch(/instagram\.com/);
  });
});

describe("routing", () => {
  it("registers the /blog route", () => {
    expect(APP).toMatch(/path="\/blog"/);
    expect(APP).toMatch(/import Blog from/);
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
    const slugs = [...BLOG.matchAll(/^\s{4}slug: "([^"]+)"/gm)].map(m => m[1]);
    expect(slugs.length).toBeGreaterThan(0);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("anchors each post so a single post can be linked to", () => {
    expect(BLOG).toMatch(/id=\{post\.slug\}/);
    // and the mount effect must not stomp on that hash
    expect(BLOG).toMatch(/window\.location\.hash/);
  });

  it("gives every post an ISO date", () => {
    for (const [, d] of BLOG.matchAll(/^\s{4}date: "([^"]+)"/gm)) {
      expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(d))).toBe(false);
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
