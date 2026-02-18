import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Users, Brain, MessageSquare, BarChart3, Globe, Play } from "lucide-react";

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Learning</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
              Speak Fluently <span className="text-primary">Faster.</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">
              Go beyond flashcards. Learn Mandarin through natural, AI-powered conversations that build real fluency and confidence.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Learn More
                </Button>
              </a>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row gap-8 justify-center pt-8 text-sm text-foreground/60">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center">✓</div>
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center">✓</div>
                Join 10,000+ learners
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center">✓</div>
                100% HSK certified
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="mt-16 md:mt-24 rounded-2xl border border-primary/30 p-8 md:p-12 overflow-hidden relative">
            <img src="https://cdn.discordapp.com/attachments/751118567486783589/1473526455450468626/IMG_2251.jpg?ex=699687f3&is=69953673&hm=d268305a3b803e95e45042c458b5b0aaffecd440ae54f1fb342fc64c4c3b7587&" alt="Interactive Learning Dashboard" className="w-full h-auto rounded-lg" />
            <button className="absolute inset-0 flex items-center justify-center group">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center group-hover:bg-primary/90 transition-colors">
                <Play className="w-8 h-8 text-white fill-white" />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 px-4">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Why Choose Polysia?
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Modern language learning built for the way you actually learn.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-6">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Real Conversations
              </h3>
              <p className="text-foreground/70 leading-relaxed">
                Practice authentic Mandarin through AI-powered dialogues that adapt to your level and learning goals.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Intelligent Feedback
              </h3>
              <p className="text-foreground/70 leading-relaxed">
                Get instant feedback on pronunciation, grammar, and tone with AI analysis powered by native speakers.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Track Progress
              </h3>
              <p className="text-foreground/70 leading-relaxed">
                Visualize your learning journey with detailed analytics that show proficiency gains across all skills.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Cultural Context
              </h3>
              <p className="text-foreground/70 leading-relaxed">
                Learn more than just words—understand the culture and context behind authentic Mandarin communication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              How It Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg mx-auto mb-6">
                1
              </div>
              <h4 className="text-lg font-bold text-foreground mb-3">Start Conversations</h4>
              <p className="text-foreground/70">
                Engage in interactive dialogue with our AI tutor tailored to your proficiency level.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg mx-auto mb-6">
                2
              </div>
              <h4 className="text-lg font-bold text-foreground mb-3">Receive Feedback</h4>
              <p className="text-foreground/70">
                Get detailed, actionable insights on your pronunciation, grammar, and speaking fluency.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg mx-auto mb-6">
                3
              </div>
              <h4 className="text-lg font-bold text-foreground mb-3">Master Fluency</h4>
              <p className="text-foreground/70">
                Progress naturally through consistent practice and watch your fluency level improve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 md:py-32 px-4">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Loved by Learners
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="p-8 rounded-2xl border border-border bg-card">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-foreground/80 mb-4">
                "Polysia completely changed my Mandarin learning. I went from struggling with tones to having real conversations in just 3 months!"
              </p>
              <p className="font-semibold text-foreground">Learner 1</p>
              <p className="text-sm text-foreground/60">Intermediate Learner</p>
            </div>

            {/* Testimonial 2 */}
            <div className="p-8 rounded-2xl border border-border bg-card">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-foreground/80 mb-4">
                "The AI feedback is incredibly detailed and personalized. It feels like having a native speaker coaching me 24/7."
              </p>
              <p className="font-semibold text-foreground">Learner 2</p>
              <p className="text-sm text-foreground/60">Business Professional</p>
            </div>

            {/* Testimonial 3 */}
            <div className="p-8 rounded-2xl border border-border bg-card">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-foreground/80 mb-4">
                "Finally, a learning app that feels modern and doesn't waste my time with boring exercises. Highly recommended!"
              </p>
              <p className="font-semibold text-foreground">Learner 3</p>
              <p className="text-sm text-foreground/60">Advanced Learner</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Ready to Master Mandarin?
          </h2>
          <p className="text-lg text-foreground/70">
            Start your journey to fluency today. No credit card required—just pure, effective learning.
          </p>
          <div className="pt-6">
            <Link to="/signup">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
