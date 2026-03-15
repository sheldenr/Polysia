import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";

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
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="font-serif text-6xl sm:text-7xl font-bold mb-4 text-black">
            404
          </h1>
          <p className="text-2xl text-gray-700 mb-8">Page not found</p>
          <Link
            to="/"
            className="inline-block px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors font-semibold"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
