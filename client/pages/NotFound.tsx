import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-lg bg-red-100 mx-auto mb-6 flex items-center justify-center text-4xl font-bold text-red-600">
            404
          </div>
          
          <h1 className="mb-4">Page Not Found</h1>
          
          <p className="text-foreground/60 mb-8 leading-relaxed">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist yet.
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
    </Layout>
  );
};

export default NotFound;
