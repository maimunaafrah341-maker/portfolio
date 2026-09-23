/**
 * Living Sketchbook style: this page used to be the generic scaffold — slate
 * gradients, a blue button, a pulsing red circle — which read as a different
 * website entirely. It now uses the same paper, type and buttons as the rest
 * of the site.
 *
 * It also matters more than it used to: before vercel.json added the SPA
 * rewrite, Vercel served its own 404 and this component was nearly
 * unreachable. Now every unknown path lands here.
 */
import { ArrowUpRight } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <main className="site-shell">
      <section className="notfound-section">
        <div className="notfound-inner">
          <div className="section-marker">
            <span>?</span>
            <i>Error 404</i>
          </div>
          <p className="eyebrow">
            <span />
            Page not found
          </p>
          <h1>
            This page slipped out of the <em>sketchbook.</em>
          </h1>
          <p className="notfound-copy">
            The link may be old, or the page may have been renamed since it was
            shared. Everything is still here — start from the portfolio, or read
            the journal.
          </p>
          <div className="notfound-actions">
            <Link href="/" className="ink-button">
              Back to the portfolio <ArrowUpRight aria-hidden="true" />
            </Link>
            <Link href="/blog" className="ink-button ghost-button">
              Read the journal <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
          <img
            className="notfound-mark"
            src="/images/butterfly-mark.png"
            alt=""
            aria-hidden="true"
          />
        </div>
      </section>
    </main>
  );
}
