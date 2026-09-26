/**
 * Living Sketchbook style: the long-form half of the site.
 *
 * About and the butterfly piece used to open the home page. They sat between
 * the hero and any evidence of the technical work, so a visitor met a poem
 * before an accomplishment. They live here now, one click away, with the home
 * page free to lead on recognition and projects.
 */
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
// Aliased so every internal link on the page routes through the butterfly
// page-turn instead of navigating instantly.
import { ButterflyLink as Link } from "@/components/PageTransition";
import { motion } from "framer-motion";
import { revealChild, revealStagger, revealUp, viewportOnce } from "@/lib/motion";

export default function About() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Same 28px threshold as the other pages, so the header behaves identically.
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
          <Link href="/about" aria-current="page" className="is-current">About</Link>
          <Link href="/blog">Journal</Link>
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
          <Link href="/blog" onClick={() => setMobileMenuOpen(false)}>Journal</Link>
          <Link href="/#contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
        </div>
      </header>

      <div className="about-page-top" />

      <section className="about-section section-anchor" id="about">
        <div className="section-marker"><span>01</span><i>About the maker</i></div>
        <motion.div
          className="about-grid"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={revealStagger}
        >
          <motion.div className="about-title" variants={revealChild}>
            <p className="eyebrow">A practice in two languages</p>
            <h2>Making room for <em>feeling</em> in the systems we build.</h2>
          </motion.div>
          <motion.div className="about-copy" variants={revealChild}>
            <p>
              I am a B.Tech AI &amp; ML student at SCETW, Hyderabad, working at the meeting point of visual storytelling and emerging technology. My art is where I listen closely; my code is where I turn that attention into tools and experiences.
            </p>
            <p>
              From watercolour and graphite to multilingual AI and small creative interfaces, I am building a practice that is both curious and human.
            </p>
            <a className="text-action" href="https://www.instagram.com/just_m.trying/" target="_blank" rel="noreferrer">
              Find the everyday sketches <ArrowUpRight aria-hidden="true" />
            </a>
          </motion.div>
        </motion.div>
        {/* The ink-constellation background art was never exported from Manus and
            is not on disk anywhere. Restore this line once the file exists at
            client/public/images/ink-constellation.jpg -- it is purely decorative
            (13% opacity, aria-hidden), so the section reads fine without it. */}
        {/* <img className="about-constellation" src="/images/ink-constellation.jpg" alt="" aria-hidden="true" /> */}
      </section>

      <section className="essay-section section-anchor" id="butterflies">
        <motion.div
          className="essay-inner"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={revealUp}
        >
          <div className="section-marker"><span>02</span><i>Why butterflies</i></div>
          <h2>Why a <em>butterfly.</em></h2>
          <div className="essay-body">
            <p>
              As a child, I have always associated myself with butterflies, finding
              them rather captivating and interesting. I love to draw them spreading
              their wings as high as they can.
            </p>
            <p>
              The question arises: why? Why do I love them? Why do I associate myself
              with them?
            </p>
            <p>
              Freedom has always been symbolised by a bird. For me, it was this tiny
              insect.
            </p>
            <p>
              The answer to those whys was simple. Their lives before were so simple,
              yet devoid of colour: no freedom to spread their wings, no freedom from
              the sickness of discrimination and societal standards.
            </p>
            <p>
              Yet when the worm finally got to rest, and finally became indifferent to
              its surroundings, it shone brighter than ever.{" "}
              <em>Because it was in the process of becoming free.</em>
            </p>
          </div>
        </motion.div>
        <img className="essay-mark" src="/images/butterfly-mark.png" alt="" aria-hidden="true" />
      </section>

      <footer className="site-footer">
        <div className="footer-brand">
          <img src="/images/butterfly-mark.png" alt="" aria-hidden="true" />
          <span>Maimuna Afrah <em>· creative technology portfolio</em></span>
        </div>
        <div className="footer-links">
          <Link href="/">Portfolio</Link>
          <Link href="/blog">Journal</Link>
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
