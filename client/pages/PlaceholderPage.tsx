import { Link } from "react-router-dom";
import Layout from "@/components/Layout";

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
      <div className="min-h-[60vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl">
          <div className="inline-block mb-6 p-4 bg-teal-100 rounded-lg">
            <span className="text-4xl">🚀</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-4">
            {title}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {description ||
              "This page is coming soon! We're working on bringing you amazing content here."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-block bg-black text-white font-semibold py-3 px-8 rounded-full hover:bg-gray-800 transition-colors"
            >
              Back to Home
            </Link>
            <a
              href="mailto:hello@polysia.app"
              className="inline-block border-2 border-black text-black font-semibold py-3 px-8 rounded-full hover:bg-black hover:text-white transition-colors"
            >
              Get Updates
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
