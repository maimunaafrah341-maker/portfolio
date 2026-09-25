/** Living Sketchbook style: the global shell keeps the portfolio in its warm light-paper theme. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { MotionConfig } from "framer-motion";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PageTransitionProvider } from "./components/PageTransition";
import Blog from "./pages/Blog";
import Home from "./pages/Home";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/blog" component={Blog} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        {/* reducedMotion="user" makes every framer-motion transform animation on
            the site honour the reader's OS "reduce motion" setting -- opacity
            still cross-fades, nothing slides. index.css already does the same
            for its CSS animations. One place, whole app. */}
        <MotionConfig reducedMotion="user">
          {/* Owns navigation for internal links: the route changes only once
              the butterflies have the screen covered. */}
          <PageTransitionProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </PageTransitionProvider>
        </MotionConfig>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
