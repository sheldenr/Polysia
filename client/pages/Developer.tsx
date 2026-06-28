import Layout from "@/components/Layout";

export default function Developer() {
  return (
    <Layout>
      <section className="bg-white dark:bg-background px-6 py-20 sm:py-24 transition-colors duration-300">
        <article className="max-w-2xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-heading font-semibold tracking-tight text-foreground">
              Developer Note
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-xl">
              A quick note from Shelden, the creator of Polysia, about why this project exists.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/50">
              Built for better learning
            </div>
          </div>

          <div className="space-y-8 border-t border-border pt-12">
            <section className="space-y-3">
              <h2 className="text-xl font-heading font-semibold text-foreground">
                The Inspiration
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                I built Polysia because I wanted a language learning tool that actually feels practical. 
                I realized somewhere along my 1000+ Duolingo streak that traditional language 
                learning apps are just not doing it right. They feel more like games than growth tools.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-heading font-semibold text-foreground">
                The Problem
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                It really does seem like the only way to learn is to have a friend, or a tutor, 
                or surround yourself in the environment. I wanted to bridge that gap for 
                people who study online like myself and want to learn a language to their 
                own needs that adapts to them.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-heading font-semibold text-foreground">
                The Project
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Polysia is a solo hobby project, and I’m shaping it with your feedback 
                as I go to make improvements. Every feature—from the interactive reader 
                to the AI roleplays—is designed to help you reach your goals faster.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-heading font-semibold text-foreground">
                The Future
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We're just getting started. I have a long roadmap of features planned, 
                including more immersion tools, community features, and advanced 
                analytics to help you track your mastery journey.
              </p>
            </section>

            <section className="space-y-3 border-t border-border pt-8">
              <h2 className="text-xl font-heading font-semibold text-foreground">
                Let's connect
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Please do reach out to me with any thoughts or suggestions—it truly 
                does mean a lot. You can reach me directly at{" "}
                <a
                  className="text-primary hover:underline font-medium"
                  href="mailto:hello@polysia.app"
                >
                  hello@polysia.app
                </a>
                .
              </p>
            </section>
          </div>
        </article>
      </section>
    </Layout>
  );
}
