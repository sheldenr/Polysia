import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 py-24 transition-colors duration-300">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-8xl sm:text-9xl font-heading font-bold mb-6 tracking-tighter text-primary/20 select-none">
            404
          </h1>
          <h2 className="text-3xl font-heading font-bold mb-4 tracking-tight text-foreground">
            Page not found
          </h2>
          <p className="text-muted-foreground mb-12 text-lg">
            Sorry, we couldn't find the page you're looking for. It might have
            been moved or deleted.
          </p>
          <Button
            size="lg"
            asChild
            className="rounded-full px-8 h-12 text-base shadow-lg hover:shadow-primary/20 transition-all"
          >
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
