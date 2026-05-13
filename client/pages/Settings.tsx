import { useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import SettingsPanel from "@/components/SettingsPanel";

export default function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/");
  }, [logout, navigate]);

  return (
    <Layout>
      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6 space-y-2">
          <Button variant="ghost" asChild className="-ml-3 gap-2 text-muted-foreground">
            <Link to="/learning-hub">
              <ArrowLeft className="h-4 w-4" />
              Back to learning hub
            </Link>
          </Button>
          <h1 className="font-heading text-3xl tracking-tight sm:text-4xl">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your profile, learning preferences, and appearance.
          </p>
        </div>
        <SettingsPanel onLogout={handleLogout} />
      </section>
    </Layout>
  );
}
