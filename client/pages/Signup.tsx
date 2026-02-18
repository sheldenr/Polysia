import { SimpleLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { FormEvent, useState } from "react";
import { ArrowRight } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Placeholder: navigate to learn page regardless of input
    navigate("/learn");
  };

  return (
    <SimpleLayout>
      <section className="py-20 md:py-32 px-4 bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="container max-w-md mx-auto">
          <div className="bg-card border border-border rounded-lg shadow-lg p-8 space-y-6">
            {/* Heading */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Get Started</h1>
              <p className="text-foreground/60">Begin your Mandarin learning journey today</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-white"
              >
                Sign In
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>

            {/* Trust indicator */}
            <div className="text-center text-sm text-foreground/60">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs">✓</div>
                No credit card required
              </div>
            </div>
          </div>
        </div>
      </section>
    </SimpleLayout>
  );
}

