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

  const handleReset = useCallback(() => {
    navigate("/learning-hub");
  }, [navigate]);

  return (
    <Layout hideFooter={true}>
      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="relative overflow-hidden rounded-[2rem] border bg-card/70 p-5 sm:p-8 shadow-sm backdrop-blur-sm">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-28 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-secondary/40 blur-3xl"
          />

          <div className="relative mb-6 space-y-2">
            <Button
              variant="ghost"
              asChild
              className="-ml-3 gap-2 rounded-xl text-muted-foreground hover:bg-secondary/60"
            >
              <Link to="/learning-hub">
                <ArrowLeft className="h-4 w-4" />
                Back to learning hub
              </Link>
            </Button>
            <h1 className="font-heading text-3xl tracking-tight sm:text-4xl">Settings</h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Manage your profile, learning preferences, and appearance.
            </p>
          </div>

          <SettingsPanel onLogout={handleLogout} onReset={handleReset} />
        </div>
      </section>
    </Layout>
  );
}
