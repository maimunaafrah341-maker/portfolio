/**
 * Living Sketchbook style: editorial artist-book layout with warm paper, ink rules,
 * Butterfly Teal accents, and original artwork always given visual priority.
 */
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  Code2,
  Github,
  Instagram,
  Linkedin,
  Info,
  Lock,
  Mail,
  Menu,
  MoveUpRight,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { revealChild, revealStagger, revealUp, viewportOnce } from "@/lib/motion";

type ArtCategory = "all" | "watercolour" | "islamic" | "fanart" | "pencil" | "ink";

type Artwork = {
  title: string;
  category: Exclude<ArtCategory, "all">;
  medium: string;
  image: string;
  alt: string;
  span?: "wide" | "tall";
};

const featuredStories = [
  {
    number: "01",
    title: "Green Beauty",
    description:
      "A HashtagKalakar feature on art as a language for small, patient forms of wonder.",
    image: "/images/green-beauty-feature.jpeg",
    alt: "HashtagKalakar magazine feature page titled Green Beauty by Maimuna Afrah",
    palette: "teal",
  },
  {
    number: "02",
    title: "Nostalgia",
    description:
      "A playful illustrated moment published in HashtagKalakar — memory, humour, and pop culture in one frame.",
    image: "/images/nostalgia-feature.jpeg",
    alt: "HashtagKalakar magazine page showing Maimuna Afrah's Nostalgia artwork",
    palette: "blue",
  },
  {
    number: "03",
    title: "Beauty in Death",
    description:
      "An editorial feature where delicate linework finds tenderness in the unexpected.",
    image: "/images/beauty-in-death-feature.jpeg",
    alt: "HashtagKalakar magazine page with Beauty in Death artwork by Maimuna Afrah",
    palette: "gold",
  },
];

const artwork: Artwork[] = [
  {
    title: "Modesty Is the Best Jewel",
    category: "islamic",
    medium: "Ink & colour pencil",
    image: "/images/modesty-butterflies.jpeg",
    alt: "Illustration of a veiled woman with hand-drawn butterflies and the phrase modesty is the best jewel of a woman",
    span: "tall",
  },
  {
    title: "The Kaaba, Observed",
    category: "islamic",
    medium: "Fine-line ink study",
    image: "/images/kaaba-linework.jpeg",
    alt: "Fine-line ink drawing of the Kaaba and worshippers",
  },
  {
    title: "Dome of the Rock",
    category: "islamic",
    medium: "Acrylic on canvas",
    image: "/images/dome-of-rock-acrylic.jpeg",
    alt: "Acrylic painting of the Dome of the Rock against a blue sky",
  },
  {
    title: "C’est la vie",
    category: "watercolour",
    medium: "Coffee wash & ink",
    image: "/images/cest-la-vie-watercolor.jpeg",
    alt: "Warm coffee wash illustration with ink figure and the phrase C'est la vie",
    span: "wide",
  },
  {
    title: "Beauty in Tears",
    category: "watercolour",
    medium: "Watercolour & ink",
    image: "/images/beauty-in-tears-watercolor.jpeg",
    alt: "Expressive ink portrait surrounded by a coffee coloured wash",
  },
  {
    title: "Sunflower Study",
    category: "watercolour",
    medium: "Watercolour & pen",
    image: "/images/sunflower-watercolor.jpeg",
    alt: "Illustration of a person holding yellow sunflowers in a garden",
  },
  {
    // The original artwork behind the Green Beauty magazine feature. It was
    // already in the archive, but showing under the Sunflower Study title.
    title: "Green Beauty",
    category: "watercolour",
    medium: "Watercolour & ink",
    image: "/images/green-beauty-original.jpeg",
    alt: "Watercolour study of green eyes framed by teal hair, with small green butterflies resting across the face",
  },
  {
    title: "The Cut that Always Bleeds",
    category: "ink",
    medium: "Ink & red marker",
    image: "/images/the-cut-that-always-bleeds.jpeg",
    alt: "Black and red ink artwork titled The Cut that Always Bleeds",
  },
  {
    // PLACEHOLDER TITLE. This card said "Tokyo Ghoul" but pointed at the Jab We
    // Met drawing, and there is no Tokyo Ghoul piece in the archive. It now
    // holds the watercolour you filed as "watercolour boy - heart". Rename it.
    // (span: "wide" was dropped -- that crop is 1.55:1 and this image is portrait.)
    title: "Heart in Hand",
    category: "fanart",
    medium: "Watercolour & ink",
    image: "/images/watercolour-heart.jpeg",
    alt: "Watercolour drawing of a figure seen from behind, hands raised to form a heart",
  },
  {
    title: "Jab We Met",
    category: "fanart",
    medium: "Marker & ink fan art",
    image: "/images/jab-we-met-fanart.jpeg",
    alt: "Colourful hand-drawn fan art inspired by Jab We Met",
  },
  {
    title: "When I Fly Towards You",
    category: "fanart",
    medium: "Watercolour, pen & collage",
    image: "/images/blue-song-illustration.jpeg",
    alt: "Hand-drawn fan art with blue seaside imagery and music player motif",
  },
  {
    title: "Gallery of Memories",
    category: "pencil",
    medium: "Graphite & muted marker",
    image: "/images/gallery-flowers.jpeg",
    alt: "Graphite illustration of a person viewing a wall of framed images and flowers",
    span: "tall",
  },
  {
    title: "Warrior Study",
    category: "pencil",
    medium: "Graphite study",
    image: "/images/warrior-pencil.jpeg",
    alt: "Detailed graphite drawing of a warrior holding a sword",
  },
];

type Project = {
  kind: string;
  title: string;
  summary: string;
  technologies: string[];
  /**
   * Left off for work that is not public yet. The row then renders as plain
   * text rather than a link, and `note` explains why.
   */
  href?: string;
  linkLabel?: string;
  /** Small caveat under the link -- a free-tier cold start, a private repo. */
  note?: string;
  featured?: boolean;
};

const projects: Project[] = [
  {
    kind: "Active build",
    title: "Athena",
    summary:
      "A multilingual retrieval and safety assistant shaped around careful understanding, risk signals, and human-centred response.",
    technologies: ["Python", "Multilingual RAG", "HTML / CSS / JS"],
    // Deliberately no href: still in development for Smart India Hackathon, so
    // the repo stays private. Add href + linkLabel back when it is ready.
    note: "Kept private while it is still in development for Smart India Hackathon.",
    featured: true,
  },
  {
    kind: "AI copilot",
    title: "RoleFit",
    summary:
      "An application copilot that grounds every skill match in a verbatim quote from your own resume, then turns the gaps it finds into a seven-day plan.",
    technologies: ["Flask", "Gemini", "Firebase"],
    href: "https://rolefit-wo3mn26o2a-el.a.run.app",
    linkLabel: "Open live demo",
  },
  {
    // The repo is still named "hummingbird" -- that was the working name during
    // Hackwave. The link is correct even though the title no longer matches it.
    kind: "Hackathon build",
    title: "HazardWatch OS",
    summary:
      "An industrial safety console that opens an incident the moment a camera sees a hazard and speaks the warning in the bystander's language, built at Hackwave 3.0 and placed top 20 of 126 teams.",
    technologies: ["Python", "FastAPI", "YOLO"],
    href: "https://github.com/maimunaafrah341-maker/hummingbird",
    linkLabel: "View source",
  },
  {
    kind: "AI agent",
    title: "Hire-scope",
    summary:
      "An AI agent that surfaces hiring risks and blind spots from LinkedIn profiles, built at Forge Inspira 2026.",
    technologies: ["Python", "AI systems"],
    href: "https://github.com/maimunaafrah341-maker/Hire-scope",
    linkLabel: "View source",
  },
  {
    kind: "Automation",
    title: "FF-01-S5",
    summary:
      "An automated invoice generator for small businesses built with a practical, document-first workflow.",
    technologies: ["Flask", "ReportLab", "SQLite"],
    href: "https://ff-01-s5.onrender.com/",
    linkLabel: "Open live demo",
    note: "Hosted on Render's free tier, so the first visit can take up to a minute while the server wakes up.",
  },
  {
    kind: "Learning tool",
    title: "Study with Mimi",
    summary:
      "An AI-powered study companion for understanding, practice, and revision in one focused workspace.",
    technologies: ["JavaScript", "AI learning"],
    href: "https://study-with-mimi.onrender.com/",
    linkLabel: "Open live demo",
    note: "Hosted on Render's free tier, so the first visit can take up to a minute while the server wakes up.",
  },
];

const filters: Array<{ id: ArtCategory; label: string }> = [
  { id: "all", label: "All work" },
  { id: "watercolour", label: "Watercolour" },
  { id: "islamic", label: "Islamic & reflective" },
  { id: "fanart", label: "Fan art" },
  { id: "pencil", label: "Pencil studies" },
  { id: "ink", label: "Ink & marker" },
];

const contactEmail = "just.m.trying@gmail.com";

function scrollToSection(sectionId: string) {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ArtCategory>("all");
  const [preview, setPreview] = useState<Artwork | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Arriving from the journal via an anchor such as "/#contact": React has only
  // just painted, so the browser's own jump-to-hash had nothing to aim at yet.
  useEffect(() => {
    const target = window.location.hash.slice(1);
    if (target) scrollToSection(target);
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 28);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreview(null);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const handleContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const name = String(values.get("name") ?? "");
    const senderEmail = String(values.get("email") ?? "");
    const message = String(values.get("message") ?? "");
    const subject = `Portfolio enquiry from ${name}`;
    const body = `Hello Maimuna,\n\n${message}\n\nFrom: ${name}\nReply to: ${senderEmail}`;

    window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setNotice("Your email app should now open with this note addressed to Maimuna.");
    form.reset();
  };

  const navigateTo = (id: string) => {
    setMobileMenuOpen(false);
    scrollToSection(id);
  };

  const filteredArt = selectedCategory === "all" ? artwork : artwork.filter((piece) => piece.category === selectedCategory);

  return (
    <main className="site-shell">
      <header className={`site-header ${isScrolled ? "is-scrolled" : ""}`}>
        <button className="brand-lockup" onClick={() => navigateTo("top")} aria-label="Back to top">
          <img src="/images/butterfly-mark.png" alt="Butterfly pen-nib logo" />
          <span>
            <strong>Maimuna Afrah</strong>
            <em>art × technology</em>
          </span>
        </button>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <button onClick={() => navigateTo("about")}>About</button>
          <button onClick={() => navigateTo("features")}>Features</button>
          <button onClick={() => navigateTo("art")}>Artwork</button>
          <button onClick={() => navigateTo("projects")}>Projects</button>
          <Link href="/blog">Journal</Link>
        </nav>

        <button className="header-contact" onClick={() => navigateTo("contact")}>
          Let’s connect <ArrowUpRight aria-hidden="true" />
        </button>

        <button
          className="menu-toggle"
          type="button"
          aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>

        <div className={`mobile-menu ${mobileMenuOpen ? "is-open" : ""}`}>
          <button onClick={() => navigateTo("about")}>About me</button>
          <button onClick={() => navigateTo("features")}>Magazine features</button>
          <button onClick={() => navigateTo("art")}>Artwork archive</button>
          <button onClick={() => navigateTo("projects")}>Project notebook</button>
          <Link href="/blog" onClick={() => setMobileMenuOpen(false)}>Journal</Link>
          <button onClick={() => navigateTo("contact")}>Contact</button>
        </div>
      </header>

      <section className="hero section-anchor" id="top">
        <div className="hero-paper-noise" aria-hidden="true" />
        <motion.div className="hero-copy" initial="hidden" animate="visible" variants={revealUp}>
          <p className="eyebrow"><span />Creative technologist & visual artist</p>
          <h1>
            <span>Ink, intuition,</span>
            <i>and interfaces</i>
            <span>in the same sketchbook.</span>
          </h1>
          <p className="hero-intro">
            I am <strong>Maimuna Afrah</strong> — an artist and AI & ML student exploring what happens when handmade feeling meets thoughtful technology.
          </p>
          <div className="hero-actions">
            <button className="ink-button" onClick={() => navigateTo("features")}>
              Enter the archive <ArrowDownRight aria-hidden="true" />
            </button>
            {/* Same button family as "Enter the archive" -- same size, type and
                offset shadow -- but outlined rather than solid, so the hero has
                one clear primary action instead of two competing ones. Delete
                "ghost-button" from the className to make them identical. */}
            <button className="ink-button ghost-button" onClick={() => navigateTo("projects")}>
              Go to projects <ArrowDownRight aria-hidden="true" />
            </button>
            <a className="quiet-link" href="https://github.com/maimunaafrah341-maker" target="_blank" rel="noreferrer">
              <Github aria-hidden="true" /> Explore GitHub
            </a>
            <a className="quiet-link" href="https://www.linkedin.com/in/maimuna-afrah-2b41b63a0" target="_blank" rel="noreferrer">
              <Linkedin aria-hidden="true" /> View LinkedIn
            </a>
          </div>
        </motion.div>
        {/* Opacity only: .hero-visual carries a CSS rotate(1.1deg), and animating
            any transform value here would make framer-motion overwrite it. */}
        <motion.div
          className="hero-visual"
          aria-label="Ink-and-watercolour creative technology artwork"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
        >
          <img src="/images/hero-creative-field.jpg" alt="Abstract hand-drawn scene where ink, butterflies, paper and technology mingle" />
          <div className="hero-caption">
            <span>FIELD NOTES</span>
            <strong>art / code / curiosity</strong>
          </div>
        </motion.div>
        <button className="hero-scroll-cue" onClick={() => navigateTo("features")} aria-label="Scroll to featured work">
          <span>scroll to wander</span>
          <ArrowDownRight aria-hidden="true" />
        </button>
      </section>

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

      <section className="feature-section section-anchor" id="features">
        <motion.div
          className="feature-intro"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={revealUp}
        >
          <div className="section-marker"><span>02</span><i>Selected press</i></div>
          <p className="eyebrow">As seen in HashtagKalakar</p>
          <h2>Three pages from a growing <em>visual voice.</em></h2>
          <p>
            Recent magazine features that carried my work beyond the sketchbook. Each one is a small record of experimentation, emotion, and line.
          </p>
        </motion.div>
        <motion.div
          className="feature-list"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={revealStagger}
        >
          {featuredStories.map((story) => (
            <motion.article className={`feature-story ${story.palette}`} key={story.title} variants={revealChild}>
              <div className="feature-number">{story.number}</div>
              <div className="feature-image-wrap">
                <img src={story.image} alt={story.alt} loading="lazy" />
                <div className="feature-image-note">HashtagKalakar feature</div>
              </div>
              <div className="feature-copy">
                <p>FEATURE {story.number}</p>
                <h3>{story.title}</h3>
                <span>{story.description}</span>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </section>

      <section className="art-section section-anchor" id="art">
        <motion.div
          className="art-intro"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={revealUp}
        >
          <div>
            <div className="section-marker"><span>03</span><i>Artwork archive</i></div>
            <p className="eyebrow">Original works</p>
            <h2>Small worlds, <em>drawn close.</em></h2>
          </div>
          <p>
            From quiet devotional linework to favourite stories and coffee-stained experiments, this is the part of the archive that keeps changing.
          </p>
        </motion.div>

        <div className="archive-toolbar" aria-label="Artwork filters">
          {filters.map((filter) => (
            <button
              key={filter.id}
              className={selectedCategory === filter.id ? "is-active" : ""}
              onClick={() => setSelectedCategory(filter.id)}
              aria-pressed={selectedCategory === filter.id}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="art-grid">
          {filteredArt.map((piece, index) => (
            <button
              type="button"
              className={`art-piece ${piece.span ?? ""}`}
              key={piece.title}
              onClick={() => setPreview(piece)}
              style={{ "--item-index": index } as React.CSSProperties}
            >
              <span className="art-image-frame">
                <img src={piece.image} alt={piece.alt} loading="lazy" />
              </span>
              <span className="art-label">
                <span><strong>{piece.title}</strong><em>{piece.medium}</em></span>
                <MoveUpRight aria-hidden="true" />
              </span>
            </button>
          ))}
        </div>
        <div className="art-footnote"><Sparkles aria-hidden="true" />Click any work to take a closer look.</div>
      </section>

      <section className="projects-section section-anchor" id="projects">
        <div className="projects-visual">
          <img src="/images/tech-sketchbook.jpg" alt="Sketchbook with hand-drawn technology and art study motifs" />
          <div className="projects-stamp"><Code2 aria-hidden="true" /><span>BUILDING<br />WITH CARE</span></div>
        </div>
        <motion.div
          className="projects-content"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={revealUp}
        >
          <div className="section-marker"><span>04</span><i>Project notebook</i></div>
          <p className="eyebrow">Creative technology</p>
          <h2>Ideas that want to become <em>useful.</em></h2>
          <p className="projects-intro">
            I approach code like a research sketch: prototype clearly, listen for what matters, then keep refining the experience.
          </p>
          {/* The list inherits "visible" from .projects-content above, so it needs
              no viewport of its own -- it only adds the stagger between rows. */}
          <motion.div className="project-list" variants={revealStagger}>
            {projects.map((project, index) => {
              const body = (
                <>
                  <span className="project-index">0{index + 1}</span>
                  <span className="project-body">
                    <small>{project.kind}</small>
                    <strong>{project.title}</strong>
                    <span>{project.summary}</span>
                    <span className="tech-list">{project.technologies.map((tech) => <em key={tech}>{tech}</em>)}</span>
                    {/* Show the address itself for hosted demos. Skipped for GitHub
                        links, where "github.com" adds nothing to "View source". */}
                    {project.href && !project.href.includes("github.com") && (
                      <span className="project-url">{new URL(project.href).host}</span>
                    )}
                    {project.href && (
                      <span className="project-link-label">{project.linkLabel} <ArrowUpRight aria-hidden="true" /></span>
                    )}
                    {project.note && (
                      <span className="project-note"><Info aria-hidden="true" />{project.note}</span>
                    )}
                  </span>
                </>
              );

              // A project with no href must not render as an anchor: an <a> with
              // no href is not keyboard focusable and announces as plain text,
              // so it would look interactive without being so.
              return project.href ? (
                <motion.a
                  className={`project-row ${project.featured ? "featured-project" : ""}`}
                  href={project.href}
                  target="_blank"
                  rel="noreferrer"
                  key={project.title}
                  variants={revealChild}
                  whileHover={{ y: -3, transition: { type: "spring", stiffness: 380, damping: 26 } }}
                >
                  {body}
                  <ArrowUpRight aria-hidden="true" />
                </motion.a>
              ) : (
                <motion.div
                  className={`project-row is-private ${project.featured ? "featured-project" : ""}`}
                  key={project.title}
                  variants={revealChild}
                >
                  {body}
                  <Lock aria-hidden="true" />
                </motion.div>
              );
            })}
          </motion.div>
          <a className="text-action" href="https://github.com/maimunaafrah341-maker?tab=repositories" target="_blank" rel="noreferrer">
            Read the full project index <ChevronRight aria-hidden="true" />
          </a>
        </motion.div>
      </section>

      <section className="contact-section section-anchor" id="contact">
        <motion.div
          className="contact-copy"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={revealUp}
        >
          <div className="section-marker"><span>05</span><i>Start a conversation</i></div>
          <p className="eyebrow">Let’s make something attentive</p>
          <h2>Have a thought worth <em>drawing out?</em></h2>
          <p>
            I am always glad to hear about creative collaborations, thoughtful technology, artwork, and ideas still looking for their first form.
          </p>
          {/* LinkedIn and Instagram were previously small underlined text that
              read as footnotes. They are the two channels most people actually
              use, so they now get cards with a visible edge and hover lift. */}
          <div className="contact-social">
            <a className="social-card" href="https://www.linkedin.com/in/maimuna-afrah-2b41b63a0" target="_blank" rel="noreferrer">
              <Linkedin aria-hidden="true" />
              <span>
                <strong>Message me on LinkedIn</strong>
                <em>in/maimuna-afrah</em>
              </span>
              <ArrowUpRight aria-hidden="true" />
            </a>
            <a className="social-card" href="https://www.instagram.com/just_m.trying/" target="_blank" rel="noreferrer">
              <Instagram aria-hidden="true" />
              <span>
                <strong>See the sketches on Instagram</strong>
                <em>@just_m.trying</em>
              </span>
              <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
          <div className="contact-links">
            <a className="contact-email" href={`mailto:${contactEmail}`}>
              <Mail aria-hidden="true" /> {contactEmail} <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
          <img className="contact-art" src="/images/contact-stamp.jpg" alt="Ink-drawn envelope opening into a butterfly" />
        </motion.div>
        <motion.form
          className="contact-form"
          onSubmit={handleContact}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={revealUp}
        >
          <label>
            <span>Your name</span>
            <input required name="name" autoComplete="name" placeholder="How should I address you?" />
          </label>
          <label>
            <span>Email address</span>
            <input required name="email" type="email" autoComplete="email" placeholder="Where can I reply?" />
          </label>
          <label>
            <span>Your message</span>
            <textarea required name="message" rows={5} placeholder="Tell me about the idea, question, or collaboration…" />
          </label>
          <button className="ink-button form-button" type="submit">Leave a note <Send aria-hidden="true" /></button>
          <p className="form-caption"><Mail aria-hidden="true" />Submitting opens your email app with a prefilled note addressed to Maimuna.</p>
          {notice && <p className="form-notice" role="status">{notice}</p>}
        </motion.form>
      </section>

      <footer className="site-footer">
        <div className="footer-brand">
          <img src="/images/butterfly-mark.png" alt="" aria-hidden="true" />
          <span>Maimuna Afrah <em>— creative technology portfolio</em></span>
        </div>
        <div className="footer-links">
          <a href="https://github.com/maimunaafrah341-maker" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/in/maimuna-afrah-2b41b63a0" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="https://www.instagram.com/just_m.trying/" target="_blank" rel="noreferrer">Instagram</a>
          <Link href="/blog">Journal</Link>
          <button onClick={() => navigateTo("top")}>Back to top ↑</button>
        </div>
      </footer>

      {preview && (
        <div className="art-dialog-backdrop" role="presentation" onClick={() => setPreview(null)}>
          <div className="art-dialog" role="dialog" aria-modal="true" aria-label={`${preview.title} preview`} onClick={(event) => event.stopPropagation()}>
            <button className="dialog-close" onClick={() => setPreview(null)} aria-label="Close artwork preview"><X /></button>
            <img src={preview.image} alt={preview.alt} />
            <div>
              <p>{preview.category}</p>
              <h3>{preview.title}</h3>
              <span>{preview.medium}</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
