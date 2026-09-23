/**
 * Living Sketchbook style: the journal is the same paper as the portfolio, just
 * turned to a page with writing on it. It deliberately reuses the classes the
 * home page already defines -- .section-anchor, .eyebrow, .section-marker,
 * .text-action, .tech-list, .art-footnote, .site-footer -- so it inherits every
 * future tweak to the visual language for free.
 *
 * The posts themselves live in client/src/content/posts.ts — this file is
 * only how they are laid out.
 */
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, PenLine, X } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { revealChild, revealStagger, revealUp, viewportOnce } from "@/lib/motion";
import { posts } from "@/content/posts";

export default function Blog() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // index.css sets `html { scroll-behavior: smooth }`, which would turn either
    // jump below into a long visible whoosh -- switch it off for this one frame.
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";

    // Every entry carries id={post.slug}, so /blog#hackwave-3-top-20 is meant to
    // land on that post. React has only just painted, so the browser's own
    // jump-to-hash had nothing to aim at. Honour it here, and only fall back to
    // the top-of-page reset when there is no hash -- wouter does not reset
    // scroll between routes, so without that fallback, arriving from the home
    // page drops you halfway down the journal.
    const slug = window.location.hash.slice(1);
    const target = slug ? document.getElementById(slug) : null;
    if (target) {
      target.scrollIntoView({ block: "start" });
    } else {
      window.scrollTo(0, 0);
    }

    root.style.scrollBehavior = previous;
  }, []);

  useEffect(() => {
    // Same 28px threshold as the home page, so the header behaves identically.
    const onScroll = () => setIsScrolled(window.scrollY > 28);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="site-shell">
      <header className={`site-header ${isScrolled ? "is-scrolled" : ""}`}>
        <Link href="/" className="brand-lockup" aria-label="Back to the portfolio">
          <img src="/images/butterfly-mark.png" alt="Butterfly pen-nib logo" />
          <span>
            <strong>Maimuna Afrah</strong>
            <em>art × technology</em>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <Link href="/">Portfolio</Link>
          <Link href="/blog" aria-current="page" className="is-current">Journal</Link>
        </nav>

        <Link href="/#contact" className="header-contact">
          Let’s connect <ArrowUpRight aria-hidden="true" />
        </Link>

        <button
          className="menu-toggle"
          type="button"
          aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(open => !open)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>

        <div className={`mobile-menu ${mobileMenuOpen ? "is-open" : ""}`}>
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>Portfolio</Link>
          <Link href="/#art" onClick={() => setMobileMenuOpen(false)}>Artwork archive</Link>
          <Link href="/#projects" onClick={() => setMobileMenuOpen(false)}>Project notebook</Link>
          <Link href="/#contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
        </div>
      </header>

      <section className="journal-hero section-anchor" id="top">
        <motion.div initial="hidden" animate="visible" variants={revealUp}>
          <div className="section-marker"><span>✦</span><i>Field journal</i></div>
          <p className="eyebrow"><span />Notes, launches & small wins</p>
          <h1>
            The posts behind the <em>portfolio.</em>
          </h1>
          <p className="journal-intro">
            Hackathon weekends, things that finally shipped, and the occasional
            idea that needed more than a LinkedIn caption. Written down here so
            they outlast the feed.
          </p>
        </motion.div>
      </section>

      <section className="journal-section section-anchor" id="notes">
        <motion.div
          className="journal-list"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={revealStagger}
        >
          {posts.map((post, index) => (
            <motion.article
              className="journal-entry"
              key={post.slug}
              id={post.slug}
              variants={revealChild}
            >
              <div className="journal-meta">
                <div className="section-marker">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <i>{post.kind}</i>
                </div>
                <time className="journal-date" dateTime={post.date}>
                  {post.dateLabel}
                </time>
              </div>

              <div className="journal-body">
                <h2>{post.title}</h2>
                <p className="journal-summary">{post.summary}</p>
                {post.body.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
                <span className="tech-list">
                  {post.tags.map(tag => (
                    <em key={tag}>{tag}</em>
                  ))}
                </span>
                {post.href && (
                  <a className="text-action" href={post.href} target="_blank" rel="noreferrer">
                    {post.linkLabel ?? "Read the post"} <ArrowUpRight aria-hidden="true" />
                  </a>
                )}
              </div>
            </motion.article>
          ))}
        </motion.div>

        {posts.length === 0 && (
          <p className="art-footnote">
            <PenLine aria-hidden="true" />
            <span>The first note is still being written.</span>
          </p>
        )}

        <Link href="/#projects" className="text-action journal-back">
          See the projects these notes are about <ArrowUpRight aria-hidden="true" />
        </Link>
      </section>

      <footer className="site-footer">
        <div className="footer-brand">
          <img src="/images/butterfly-mark.png" alt="" aria-hidden="true" />
          <span>Maimuna Afrah <em>— creative technology portfolio</em></span>
        </div>
        <div className="footer-links">
          <Link href="/">Portfolio</Link>
          <a href="https://github.com/maimunaafrah341-maker" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/in/maimuna-afrah-2b41b63a0" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="https://www.instagram.com/just_m.trying/" target="_blank" rel="noreferrer">Instagram</a>
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            Back to top ↑
          </button>
        </div>
      </footer>
    </main>
  );
}
