import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 font-semibold text-xl hover:opacity-80 transition-opacity">
              <img src="/logo.svg" alt="Polysia Logo" className="w-8 h-8" />
              <span className="text-foreground">Polysia</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
                Home
              </Link>
              <Link to="/features" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
                Features
              </Link>
              <Link to="/pricing" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
                Pricing
              </Link>
            </nav>

            {/* CTA Button (Desktop) */}
            <div className="hidden md:flex items-center gap-4">
              <Link to="/signup">
                <Button variant="default" className="bg-primary hover:bg-primary/90">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-foreground"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden pb-4 border-t border-border">
              <div className="flex flex-col gap-3 pt-4">
                <Link to="/" className="text-sm font-medium text-foreground/70 hover:text-foreground py-2">
                  Home
                </Link>
                <Link to="/features" className="text-sm font-medium text-foreground/70 hover:text-foreground py-2">
                  Features
                </Link>
                <Link to="/pricing" className="text-sm font-medium text-foreground/70 hover:text-foreground py-2">
                  Pricing
                </Link>
                <Link to="/signup">
                  <Button variant="default" className="bg-primary hover:bg-primary/90 w-full mt-2">
                    Get Started
                  </Button>
                </Link>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 mt-20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 font-semibold text-lg mb-4">
                <img src="/logo.svg" alt="Polysia Logo" className="w-8 h-8" />
                <span className="text-foreground">Polysia</span>
              </div>
              <p className="text-sm text-foreground/60">
                Master Mandarin through conversational AI-powered learning.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-sm mb-4 text-foreground">Product</h4>
              <div className="flex flex-col gap-2">
                <Link to="/learn" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                  Learn
                </Link>
                <Link to="/features" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                  Features
                </Link>
                <Link to="/pricing" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-sm mb-4 text-foreground">Company</h4>
              <div className="flex flex-col gap-2">
                <Link to="/about" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                  About
                </Link>
                <Link to="/blog" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                  Blog
                </Link>
                <Link to="/contact" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                  Contact
                </Link>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-sm mb-4 text-foreground">Legal</h4>
              <div className="flex flex-col gap-2">
                <Link to="/privacy" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                  Privacy
                </Link>
                <Link to="/terms" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                  Terms
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-foreground/60">
              © {new Date().getFullYear()} Polysia. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                Twitter
              </a>
              <a href="#" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                LinkedIn
              </a>
              <a href="#" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function SimpleLayout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 mt-20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 font-semibold text-lg mb-4">
                <img src="/logo.svg" alt="Polysia Logo" className="w-8 h-8" />
                <span className="text-foreground">Polysia</span>
              </div>
              <p className="text-sm text-foreground/60">
                Master Mandarin through conversational AI-powered learning.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-sm mb-4 text-foreground">Product</h4>
              <div className="flex flex-col gap-2">
                <Link to="/learn" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                  Learn
                </Link>
                <Link to="/features" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                  Features
                </Link>
                <Link to="/pricing" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-sm mb-4 text-foreground">Company</h4>
              <div className="flex flex-col gap-2">
                <Link to="/about" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                  About
                </Link>
                <Link to="/blog" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                  Blog
                </Link>
                <Link to="/contact" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                  Contact
                </Link>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-sm mb-4 text-foreground">Legal</h4>
              <div className="flex flex-col gap-2">
                <Link to="/privacy" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                  Privacy
                </Link>
                <Link to="/terms" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                  Terms
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-foreground/60">
              © {new Date().getFullYear()} Polysia. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                Twitter
              </a>
              <a href="#" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                LinkedIn
              </a>
              <a href="#" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
