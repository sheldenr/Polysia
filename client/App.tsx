import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Learn from "./pages/Learn";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import { Layout } from "./components/Layout";
import { PlaceholderPage } from "./components/PlaceholderPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/learn" element={<Learn />} />

          {/* Placeholder routes */}
          <Route path="/features" element={<Layout><PlaceholderPage title="Features" description="Explore all the powerful features that make Polysia the best way to learn Mandarin." /></Layout>} />
          <Route path="/pricing" element={<Layout><PlaceholderPage title="Pricing" description="Flexible plans designed for every learner, from beginners to advanced professionals." /></Layout>} />
          <Route path="/about" element={<Layout><PlaceholderPage title="About Us" description="Learn the story behind Polysia and our mission to revolutionize language learning." /></Layout>} />
          <Route path="/blog" element={<Layout><PlaceholderPage title="Blog" description="Tips, insights, and stories from the Polysia learning community." /></Layout>} />
          <Route path="/contact" element={<Layout><PlaceholderPage title="Contact Us" description="Get in touch with our team. We'd love to hear from you!" /></Layout>} />
          <Route path="/privacy" element={<Layout><PlaceholderPage title="Privacy Policy" description="Your privacy is important to us. Here's how we protect your data." /></Layout>} />
          <Route path="/terms" element={<Layout><PlaceholderPage title="Terms of Service" description="Please read our terms carefully before using Polysia." /></Layout>} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
