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
      <section className="mx-auto w-full max-w-6xl px-6 py-10 sm:py-14">
        <div className="mb-6 space-y-2">
          <Button variant="ghost" asChild className="-ml-4 gap-2 text-muted-foreground">
            <Link to="/learning-hub">
              <ArrowLeft className="h-4 w-4" />
              Back to learning hub
            </Link>
          </Button>
          <h1 className="text-3xl font-heading tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your profile, sign out, and switch your theme.
          </p>
        </div>
        <div className="rounded-3xl border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur-sm sm:p-10 lg:p-12">
          <SettingsPanel onLogout={handleLogout} />
        </div>
      </section>
    </Layout>
  );
}
