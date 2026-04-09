import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase, supabaseConfigError } from "@/lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const completeGoogleSignIn = async () => {
      if (!supabase) {
        toast({
          variant: "destructive",
          title: "Google sign-in unavailable",
          description: supabaseConfigError ?? "Supabase is not configured",
        });
        navigate("/login", { replace: true });
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const providerError = params.get("error_description") ?? params.get("error");

      if (providerError) {
        toast({
          variant: "destructive",
          title: "Google sign-in failed",
          description: providerError,
        });
        navigate("/login", { replace: true });
        return;
      }

      const initial = await supabase.auth.getSession();
      if (initial.data.session) {
        navigate("/learning-hub", { replace: true });
        return;
      }

      const code = params.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          toast({
            variant: "destructive",
            title: "Google sign-in failed",
            description: error.message,
          });
          navigate("/login", { replace: true });
          return;
        }
      }

      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        toast({
          variant: "destructive",
          title: "Google sign-in failed",
          description: error?.message ?? "No active session was created",
        });
        navigate("/login", { replace: true });
        return;
      }

      navigate("/learning-hub", { replace: true });
    };

    void completeGoogleSignIn();
  }, [navigate, toast]);

  return (
    <section className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      <div className="mx-auto flex min-h-[80vh] max-w-7xl items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold tracking-tight text-foreground">
            Finishing sign in...
          </h1>
          <p className="mt-2 text-muted-foreground">Please wait while we complete Google authentication.</p>
        </div>
      </div>
    </section>
  );
}
