import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export default function PlaceholderPage({
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center px-6 py-24 transition-colors duration-300">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-8 rounded-3xl bg-primary/10 text-primary">
            <span className="text-5xl">🚀</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-heading mb-6 tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-12 leading-relaxed">
            {description ||
              "This page is coming soon! We're working on bringing you amazing content here."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              asChild
              className="rounded-full px-8 h-12 text-base shadow-lg hover:shadow-primary/20"
            >
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="rounded-full px-8 h-12 text-base"
            >
              <a href="mailto:hello@polysia.app">
                <Mail className="mr-2 h-4 w-4" />
                Get Updates
              </a>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
