import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-lg bg-muted mx-auto mb-6 flex items-center justify-center">
          <div className="w-8 h-8 rounded bg-primary/20"></div>
        </div>
        
        <h1 className="mb-4">{title}</h1>
        
        <p className="text-foreground/60 mb-8 leading-relaxed">
          {description || "This page is coming soon. Keep an eye out for updates as we continue building Polysia!"}
        </p>

        <div className="flex gap-4 justify-center">
          <Link to="/">
            <Button variant="outline">
              Back to Home
            </Button>
          </Link>
          <Link to="/learn">
            <Button className="bg-primary hover:bg-primary/90">
              Start Learning
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
