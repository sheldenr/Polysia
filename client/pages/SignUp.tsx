import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { useState, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";

export default function SignUp() {
  const navigate = useNavigate();
  const { signup, signInWithGoogle, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate("/learning-hub");
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const result = await signup(email, password);

      if (result.success) {
        toast({
          title: "Check your email!",
          description: "We sent you a confirmation link to verify your account.",
        });
        // Don't navigate - user needs to verify email first
      } else {
        toast({
          variant: "destructive",
          title: "Sign up failed",
          description: result.error || "Could not create account",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: "Could not sign up with Google",
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
            <h1 className="text-4xl font-heading font-bold tracking-tight text-foreground">
              Create account
            </h1>
            <p className="text-muted-foreground">
              Start your language learning journey today
            </p>
          </div>

          <div className="grid gap-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Input
                  id="signup-email"
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
                  id="signup-password"
                  type="password"
                  placeholder="Create a password"
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
                {isLoading ? "Creating account..." : "Sign up"}
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

            <Button
              variant="outline"
              className="w-full h-12 rounded-xl gap-2 font-medium"
              disabled={isLoading}
              onClick={handleGoogleSignup}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
                <path
                  fill="currentColor"
                  d="M12 10.2v3.9h5.5c-.2 1.2-1.4 3.5-5.5 3.5-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 2.9 14.6 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.3-.2-2H12z"
                />
              </svg>
              Google
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary hover:underline underline-offset-4"
            >
              Login
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
