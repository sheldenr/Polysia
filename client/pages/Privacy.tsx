import Layout from "@/components/Layout";

export default function Privacy() {
  return (
    <Layout>
      <section className="px-6 py-20 sm:py-24 transition-colors duration-300">
        <article className="max-w-3xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-heading font-semibold tracking-tight text-foreground">
              Privacy Policy
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-xl">
              How we handle your data at Polysia. We believe in transparency and keeping your learning journey private.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/50">
              <div className="size-1.5 rounded-full bg-primary" />
              Last updated: March 2026
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16 border-t border-border pt-12">
            <div>
              <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
                What we collect
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                When you create an account, we collect your email address and
                any profile information you choose to provide. As you use
                Polysia, we store your learning progress, session history, and
                preferences so we can personalize your experience.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
                How we use it
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Your data is used solely to operate and improve the service,
                powering spaced-repetition schedules, remembering
                your settings, and diagnosing bugs. We may use anonymized,
                aggregated metrics to understand how people learn.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
                What we never do
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We do not sell, rent, or trade your personal data to third
                parties. We do not use your data to serve you ads. Your learning
                history stays yours, and we intend to keep it that way.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
                Data retention
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your data for as long as your account is active. If
                you delete your account, your personal data is removed from our
                systems within 30 days, except where retention is required by
                law.
              </p>
            </div>

            <div className="md:col-span-2 p-8 rounded-3xl bg-muted/30 border border-border">
              <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
                Your rights & Questions
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                You can request a copy of your data, ask us to correct
                inaccuracies, or request deletion at any time by emailing{" "}
                <a
                  className="text-primary hover:underline font-medium"
                  href="mailto:hello@polysia.app"
                >
                  hello@polysia.app
                </a>
                . If you have any privacy-related questions or concerns, reach out
                anytime. We aim to respond to all inquiries within 48 hours.
              </p>
            </div>
          </div>
        </article>
      </section>
    </Layout>
  );
}
