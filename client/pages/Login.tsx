import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { useState, FormEvent, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { GoogleLogin } from "@react-oauth/google";

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithGoogleToken, signInWithGoogle, isAuthenticated, onboardingComplete } = useAuth();
  const { toast } = useToast();
  const hasGoogleClientId = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      if (onboardingComplete) {
        navigate("/learning-hub");
      } else {
        navigate("/onboarding");
      }
    }
  }, [isAuthenticated, onboardingComplete, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        if (onboardingComplete) {
          navigate("/learning-hub");
        } else {
          navigate("/onboarding");
        }
      } else {
        toast({
          variant: "blackDisclaimer",
          title: "Login failed",
          description: result.error || "Invalid credentials",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;
    
    setIsLoading(true);
    try {
      const result = await loginWithGoogleToken(credentialResponse.credential);
      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        variant: "blackDisclaimer",
        title: "Login failed",
        description: "Could not sign in with Google",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      toast({
        variant: "blackDisclaimer",
        title: "Google sign-in failed",
        description: error instanceof Error ? error.message : "Could not initialize Google sign-in",
      });
    }
  };

  return (
    <section className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto mb-8">
        <Button variant="ghost" asChild className="-ml-4 gap-2">
          <Link to="/">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-full max-w-[400px] space-y-8">
          <div className="flex flex-col items-center text-center space-y-2">
            <Link to="/" className="mb-4">
              <img
                src="/logo only.svg"
                alt="Polysia logo"
                className="w-16 h-16"
              />
            </Link>
            <h1 className="text-4xl font-heading tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="text-muted-foreground">
              Continue your language learning journey
            </p>
          </div>

          <div className="grid gap-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Input
                  id="login-email"
                  type="email"
                  placeholder="name@example.com"
                  className="h-12 px-4 rounded-xl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Password"
                  className="h-12 px-4 rounded-xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-semibold shadow-lg hover:shadow-primary/20 transition-all"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="flex justify-center w-full">
              {hasGoogleClientId ? (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    toast({
                      variant: "blackDisclaimer",
                      title: "Login failed",
                      description: "Google sign-in failed",
                    });
                  }}
                  useOneTap
                  theme="outline"
                  shape="pill"
                  width="400"
                />
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-10 rounded-[0.75rem] flex items-center justify-center gap-2 border-slate-300 hover:bg-slate-50 transition-colors"
                  onClick={handleManualGoogleSignIn}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Login with Google
                </Button>
              )}
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-primary hover:underline underline-offset-4"
            >
              Sign up
            </Link>
          </p>

          <p className="px-8 text-center text-xs leading-relaxed text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link
              to="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
