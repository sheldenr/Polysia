import Layout from "@/components/Layout";

export default function Terms() {
  return (
    <Layout>
      <section className="bg-white dark:bg-background px-6 py-20 sm:py-24 transition-colors duration-300">
        <article className="max-w-3xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-heading font-semibold tracking-tight text-foreground">
              Terms of Service
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-xl">
              The basic terms for using Polysia. Please read them carefully to understand your rights and responsibilities.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/50">
              Last updated: March 2026
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16 border-t border-border pt-12">
            <div>
              <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
                Acceptance
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using Polysia, you agree to be bound by these
                Terms of Service. If you do not agree, please do not use the
                service.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
                Use of the service
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Polysia is provided for personal, non-commercial language
                learning. You agree not to attempt to reverse-engineer, 
                scrape, or otherwise misuse any part of the service.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
                Intellectual property
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                All content, UI, and branding within Polysia are the property of
                Polysia and its contributors. Your personal learning data
                remains yours at all times.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
                Limitation of liability
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Polysia is provided as-is. We are not liable for any indirect
                damages arising from your use of the service. As an alpha-stage
                project, downtime or data loss may occur.
              </p>
            </div>

            <div className="md:col-span-2 p-8 rounded-3xl bg-muted/30 border border-border">
              <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
                Account responsibilities & Contact
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                You are responsible for keeping your login credentials
                confidential. Notify us immediately if you suspect unauthorized access.
                Questions about these terms? Reach out to us at{" "}
                <a
                  className="text-primary hover:underline font-medium"
                  href="mailto:hello@polysia.app"
                >
                  hello@polysia.app
                </a>
                .
              </p>
            </div>
          </div>
        </article>
      </section>
    </Layout>
  );
}
